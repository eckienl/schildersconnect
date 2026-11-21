'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';
import { clean } from '@/lib/sanitize';
import { MATCH_COST, WELCOME_CREDITS, WELCOME_LIMIT } from '@/lib/config';
import { sendMail } from '@/lib/mail';
import { siteUrl } from '@/lib/site';
import { mailPaid } from '@/lib/notify';

async function painterContact(id: string) {
  const { data } = await db().from('painters').select('company_name, profiles(email, full_name)').eq('id', id).maybeSingle();
  const p: any = data;
  return { email: p?.profiles?.email as string | undefined, company: p?.company_name as string | undefined };
}

async function requireAdmin() {
  const { profile } = await getSession();
  if (!profile || profile.role !== 'admin') redirect('/');
}

export async function approvePainter(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get('id'), 64);
  const client = db();
  // Welcome credits only for the first WELCOME_LIMIT painters (demo accounts excluded).
  const { count } = await client.from('credit_transactions').select('id', { count: 'exact', head: true }).eq('reason', 'welkom').neq('note', 'Demo');
  const welcome = (count ?? 0) < WELCOME_LIMIT;
  if (welcome) {
    await client.rpc('approve_painter', { p_painter: id }); // grants WELCOME_CREDITS once
  } else {
    await client.from('painters').update({ status: 'approved', approved_at: new Date().toISOString(), admin_note: '' }).eq('id', id);
  }
  const c = await painterContact(id);
  await sendMail(c.email, 'Je aanmelding is goedgekeurd', `Welkom bij SchildersConnect, ${c.company ?? ''}!`,
    `<p>Je aanmelding is goedgekeurd. Je kunt nu opdrachten bekijken en er gratis op reageren.${welcome ? ` Als een van de eerste 50 schilders hebben we ${WELCOME_CREDITS} gratis credits op je account gezet.` : ''}</p>`,
    { label: 'Bekijk opdrachten', url: `${await siteUrl()}/schilder/opdrachten` });
  redirect(welcome ? '/admin?m=goedgekeurd' : '/admin?m=goedgekeurd_zonder_welkom');
}
void WELCOME_CREDITS;

export async function setPainterStatus(formData: FormData) {
  await requireAdmin();
  const status = clean(formData.get('status'), 20);
  if (!['needs_info', 'rejected', 'pending'].includes(status)) redirect('/admin?m=fout');
  const id = clean(formData.get('id'), 64);
  const note = clean(formData.get('note'), 500);
  await db().from('painters').update({ status, admin_note: note }).eq('id', id);
  const c = await painterContact(id);
  if (status === 'needs_info') {
    await sendMail(c.email, 'We hebben nog iets van je nodig', 'Je aanmelding is bijna klaar',
      `<p>Om je aanmelding af te ronden hebben we nog het volgende nodig:</p><p><strong>${note || 'Neem contact met ons op.'}</strong></p>`,
      { label: 'Gegevens aanvullen', url: `${await siteUrl()}/schilder/aanmelden` });
  } else if (status === 'rejected') {
    await sendMail(c.email, 'Je aanmelding bij SchildersConnect', 'Je aanmelding is niet goedgekeurd', `<p>${note || 'Neem contact met ons op als je denkt dat dit niet klopt.'}</p>`);
  }
  redirect('/admin?m=opgeslagen');
}

export async function removeJob(formData: FormData) {
  await requireAdmin();
  await db().from('jobs').update({ status: 'removed' }).eq('id', clean(formData.get('id'), 64));
  redirect('/admin?tab=klussen&m=opgeslagen');
}

export async function confirmPurchase(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get('id'), 64);
  const { data } = await db().rpc('confirm_purchase', { p_purchase: id });
  if (data === 'ok') await mailPaid(id);
  redirect(`/admin?tab=aankopen&m=${data === 'ok' ? 'betaald' : 'fout'}`);
}

export async function cancelPurchase(formData: FormData) {
  await requireAdmin();
  await db().from('purchases').update({ status: 'cancelled' }).eq('id', clean(formData.get('id'), 64)).eq('status', 'open');
  redirect('/admin?tab=aankopen&m=opgeslagen');
}

export async function refundMatch(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get('id'), 64);
  const client = db();
  const { data } = await client.rpc('refund_response', { p_response: id });
  if (data === 'ok') {
    await client.from('responses').update({ report_status: 'teruggeboekt' }).eq('id', id).neq('report_status', '');
    const { data: r } = await client.from('responses').select('painter_id, credits_charged, jobs(title)').eq('id', id).maybeSingle();
    const x: any = r;
    if (x) {
      const c = await painterContact(x.painter_id);
      await sendMail(c.email, 'Credits teruggeboekt', 'We hebben je credits teruggeboekt',
        `<p>Voor de match op "${x.jobs?.title}" hebben we ${x.credits_charged} credits teruggezet op je account.</p>`);
    }
  }
  redirect(`/admin?tab=matches&m=${data === 'ok' ? 'teruggeboekt' : 'fout'}`);
}

export async function rejectReport(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get('id'), 64);
  const client = db();
  await client.from('responses').update({ report_status: 'afgewezen' }).eq('id', id);
  const { data: r } = await client.from('responses').select('painter_id, jobs(title)').eq('id', id).maybeSingle();
  const x: any = r;
  if (x) {
    const c = await painterContact(x.painter_id);
    await sendMail(c.email, 'Je melding is beoordeeld', 'Je melding is niet toegekend',
      `<p>We hebben je melding over "${x.jobs?.title}" bekeken, maar zien geen reden om de credits terug te boeken. ${clean(formData.get('note'), 300)}</p>`);
  }
  redirect('/admin?tab=matches&m=opgeslagen');
}

export async function setMatchCost(formData: FormData) {
  await requireAdmin();
  const size = clean(formData.get('size'), 10);
  const costs: Record<string, number> = { ...MATCH_COST };
  if (!(size in costs)) redirect('/admin?tab=klussen&m=fout');
  await db().from('jobs').update({ size_class: size, match_cost: costs[size] }).eq('id', clean(formData.get('id'), 64));
  redirect('/admin?tab=klussen&m=prijs_aangepast');
}

