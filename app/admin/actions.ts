'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';
import { clean } from '@/lib/sanitize';
import { MATCH_COST, WELCOME_CREDITS, WELCOME_LIMIT } from '@/lib/config';

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
  if ((count ?? 0) < WELCOME_LIMIT) {
    const { data } = await client.rpc('approve_painter', { p_painter: id }); // grants WELCOME_CREDITS once
    redirect(`/admin?m=${data === 'ok' ? 'goedgekeurd' : 'fout'}`);
  }
  await client.from('painters').update({ status: 'approved', approved_at: new Date().toISOString(), admin_note: '' }).eq('id', id);
  redirect('/admin?m=goedgekeurd_zonder_welkom');
}
void WELCOME_CREDITS;

export async function setPainterStatus(formData: FormData) {
  await requireAdmin();
  const status = clean(formData.get('status'), 20);
  if (!['needs_info', 'rejected', 'pending'].includes(status)) redirect('/admin?m=fout');
  await db()
    .from('painters')
    .update({ status, admin_note: clean(formData.get('note'), 500) })
    .eq('id', clean(formData.get('id'), 64));
  redirect('/admin?m=opgeslagen');
}

export async function removeJob(formData: FormData) {
  await requireAdmin();
  await db().from('jobs').update({ status: 'removed' }).eq('id', clean(formData.get('id'), 64));
  redirect('/admin?tab=klussen&m=opgeslagen');
}

export async function confirmPurchase(formData: FormData) {
  await requireAdmin();
  const { data } = await db().rpc('confirm_purchase', { p_purchase: clean(formData.get('id'), 64) });
  redirect(`/admin?tab=aankopen&m=${data === 'ok' ? 'betaald' : 'fout'}`);
}

export async function cancelPurchase(formData: FormData) {
  await requireAdmin();
  await db().from('purchases').update({ status: 'cancelled' }).eq('id', clean(formData.get('id'), 64)).eq('status', 'open');
  redirect('/admin?tab=aankopen&m=opgeslagen');
}

export async function refundMatch(formData: FormData) {
  await requireAdmin();
  const { data } = await db().rpc('refund_response', { p_response: clean(formData.get('id'), 64) });
  redirect(`/admin?tab=matches&m=${data === 'ok' ? 'teruggeboekt' : 'fout'}`);
}

export async function setMatchCost(formData: FormData) {
  await requireAdmin();
  const size = clean(formData.get('size'), 10);
  const costs: Record<string, number> = { ...MATCH_COST };
  if (!(size in costs)) redirect('/admin?tab=klussen&m=fout');
  await db().from('jobs').update({ size_class: size, match_cost: costs[size] }).eq('id', clean(formData.get('id'), 64));
  redirect('/admin?tab=klussen&m=prijs_aangepast');
}
