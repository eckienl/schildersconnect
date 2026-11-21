'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';
import { clean, stripContact } from '@/lib/sanitize';
import { BUNDLES, MAX_RESPONSES_PER_JOB, SPECIALTIES, VAT } from '@/lib/config';
import { MOLLIE_ENABLED, createPayment } from '@/lib/mollie';
import { ADMIN_EMAIL, sendMail } from '@/lib/mail';
import { siteUrl } from '@/lib/site';

async function requirePainterProfile() {
  const s = await getSession();
  if (!s.profile) redirect('/inloggen?next=/schilder');
  if (s.profile.role !== 'schilder') redirect('/account');
  return s;
}

export async function savePainter(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const { profile, painter } = await requirePainterProfile();
  const company_name = clean(formData.get('company_name'), 120);
  const kvk = clean(formData.get('kvk'), 12).replace(/\s/g, '');
  const postcode = clean(formData.get('postcode'), 10).toUpperCase();
  const city = clean(formData.get('city'), 60);
  const radius_km = Math.min(150, Math.max(5, Number(formData.get('radius_km')) || 25));
  const specialties = formData.getAll('specialties').map(String).filter((s) => SPECIALTIES.includes(s as any));
  let website = clean(formData.get('website'), 200);
  if (website && !/^https?:\/\//.test(website)) website = 'https://' + website;

  if (!company_name || !city) return { error: 'Vul je bedrijfsnaam en plaats in.' };
  if (!/^\d{8}$/.test(kvk)) return { error: 'Vul een geldig KvK-nummer van 8 cijfers in.' };
  if (!/^\d{4}\s?[A-Z]{2}$/.test(postcode)) return { error: 'Vul een geldige postcode in.' };
  if (formData.get('truth') !== 'on') return { error: 'Bevestig dat je gegevens kloppen.' };

  const row = {
    id: profile.id,
    company_name,
    kvk,
    postcode,
    city,
    radius_km,
    insured: formData.get('insured') === 'on',
    website,
    description: clean(formData.get('description'), 2000),
    specialties,
    // Re-submitting after "needs_info" puts the painter back in the queue.
    status: painter?.status === 'approved' ? 'approved' : 'pending',
  };
  const { error } = await db().from('painters').upsert(row);
  if (error) return { error: 'Opslaan lukte niet. Probeer het opnieuw.' };
  if (painter?.status !== 'approved') {
    await sendMail(ADMIN_EMAIL, `Nieuwe aanmelding: ${company_name}`, 'Nieuwe schilder wacht op controle',
      `<p><strong>${company_name}</strong> (${city}, KvK ${kvk}) heeft zich aangemeld.</p>`, { label: 'Naar beheer', url: `${await siteUrl()}/admin` });
  }
  redirect(painter?.status === 'approved' ? '/schilder?m=opgeslagen' : '/schilder?m=aangemeld');
}

export async function respond(formData: FormData) {
  const { painter } = await requirePainterProfile();
  const jobId = clean(formData.get('job_id'), 64);
  if (!painter || painter.status !== 'approved') redirect('/schilder');
  const client = db();

  const { data: job } = await client.from('jobs').select('id, status, match_cost').eq('id', jobId).maybeSingle();
  if (!job || job.status !== 'open') redirect(`/schilder/klus/${jobId}?m=klus_gesloten`);
  if (painter.credits < job.match_cost) redirect(`/schilder/klus/${jobId}?m=te_weinig_credits`);

  const { count } = await client.from('responses').select('id', { count: 'exact', head: true }).eq('job_id', jobId);
  if ((count ?? 0) >= MAX_RESPONSES_PER_JOB) redirect(`/schilder/klus/${jobId}?m=vol`);

  const message = stripContact(clean(formData.get('message'), 1500));
  const price_indication = stripContact(clean(formData.get('price_indication'), 60));
  if (message.length < 20) redirect(`/schilder/klus/${jobId}?m=${encodeURIComponent('Schrijf een bericht van minimaal 20 tekens.')}`);

  const { error } = await client.from('responses').insert({ job_id: jobId, painter_id: painter.id, message, price_indication });
  if (error) redirect(`/schilder/klus/${jobId}?m=${error.code === '23505' ? 'al_gereageerd' : 'fout'}`);
  const { data: owner } = await client.from('jobs').select('title, profiles(email, full_name)').eq('id', jobId).maybeSingle();
  const o: any = owner;
  await sendMail(o?.profiles?.email, `Nieuwe reactie op "${o?.title}"`, 'Er is een schilder die je wil helpen',
    `<p>Hallo ${o?.profiles?.full_name?.split(' ')[0] ?? ''},</p><p><strong>${painter.company_name}</strong> heeft gereageerd op je opdracht "${o?.title}". Bekijk de reactie en kies of je met deze schilder in contact wilt komen.</p>`,
    { label: 'Bekijk de reactie', url: `${await siteUrl()}/account/klus/${jobId}` });
  redirect(`/schilder/klus/${jobId}?m=gereageerd`);
}

export async function requestBundle(formData: FormData) {
  const { painter } = await requirePainterProfile();
  if (!painter || painter.status !== 'approved') redirect('/schilder');
  const bundle = BUNDLES.find((b) => b.id === formData.get('bundle'));
  if (!bundle) redirect('/schilder/credits?m=fout');
  const client = db();
  const { data: purchase } = await client
    .from('purchases')
    .insert({ painter_id: painter.id, bundle: bundle.name, price_eur: bundle.priceCents /* cents excl. btw */, credits: bundle.credits, method: MOLLIE_ENABLED ? 'ideal' : 'handmatig' })
    .select('id')
    .single();
  if (!purchase) redirect('/schilder/credits?m=fout');
  if (!MOLLIE_ENABLED) {
    await sendMail(ADMIN_EMAIL, `Aankoop ${bundle.name} door ${painter.company_name}`, 'Nieuwe aankoop, stuur een betaalverzoek',
      `<p>${painter.company_name} wil de bundel ${bundle.name} (${bundle.credits} credits). Stuur een betaalverzoek en bevestig de betaling in beheer.</p>`,
      { label: 'Naar aankopen', url: `${await siteUrl()}/admin?tab=aankopen` });
    redirect('/schilder/credits?m=aankoop_aangevraagd');
  }
  const site = await siteUrl();
  let checkout = '';
  try {
    const payment = await createPayment({
      amountCents: Math.round(bundle.priceCents * (1 + VAT)),
      description: `SchildersConnect ${bundle.name} – ${bundle.credits} credits`,
      redirectUrl: `${site}/schilder/credits?betaling=${purchase.id}`,
      webhookUrl: `${site}/api/mollie/webhook`,
      purchaseId: purchase.id,
    });
    await client.from('purchases').update({ mollie_payment_id: payment.id }).eq('id', purchase.id);
    checkout = payment._links.checkout?.href ?? '';
  } catch (e) {
    console.error(e);
  }
  if (!checkout) {
    await client.from('purchases').update({ status: 'cancelled' }).eq('id', purchase.id);
    redirect('/schilder/credits?m=betaling_fout');
  }
  redirect(checkout);
}

export async function saveWeeklyLimit(formData: FormData) {
  const { painter } = await requirePainterProfile();
  if (!painter) redirect('/schilder');
  const raw = clean(formData.get('weekly_limit'), 6);
  const value = raw === '' ? null : Math.max(0, Math.round(Number(raw)) || 0);
  await db().from('painters').update({ weekly_limit: value }).eq('id', painter.id);
  redirect('/schilder/credits?m=opgeslagen');
}

export async function reportMatch(formData: FormData) {
  const { painter } = await requirePainterProfile();
  if (!painter) redirect('/schilder');
  const responseId = clean(formData.get('response_id'), 64);
  const jobId = clean(formData.get('job_id'), 64);
  const reason = clean(formData.get('reason'), 60);
  const note = clean(formData.get('note'), 1000);
  const client = db();
  const { data: r } = await client.from('responses').select('id, status, report_status').eq('id', responseId).eq('painter_id', painter.id).maybeSingle();
  if (!r || r.status !== 'chosen' || r.report_status) redirect(`/schilder/klus/${jobId}?m=fout`);
  await client.from('responses').update({ report_reason: reason, report_note: note, report_status: 'open' }).eq('id', responseId);
  await sendMail(ADMIN_EMAIL, `Melding over een match door ${painter.company_name}`, 'Een schilder meldt een probleem met een match',
    `<p><strong>${painter.company_name}</strong>: ${reason}</p><p>${note}</p>`, { label: 'Naar matches', url: `${await siteUrl()}/admin?tab=matches` });
  redirect(`/schilder/klus/${jobId}?m=gemeld`);
}
