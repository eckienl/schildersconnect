'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';
import { clean } from '@/lib/sanitize';

async function requireAdmin() {
  const { profile } = await getSession();
  if (!profile || profile.role !== 'admin') redirect('/');
}

export async function approvePainter(formData: FormData) {
  await requireAdmin();
  const { data } = await db().rpc('approve_painter', { p_painter: clean(formData.get('id'), 64) });
  redirect(`/admin?m=${data === 'ok' ? 'goedgekeurd' : 'fout'}`);
}

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
