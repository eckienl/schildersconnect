import 'server-only';
import { db } from './supabase/admin';
import { getPayment, MOLLIE_ENABLED } from './mollie';
import { mailPaid } from './notify';

/**
 * Brings a purchase in line with its payment status at Mollie. Used by the webhook and when the painter returns
 * from the payment page, so credits arrive immediately even if the webhook is a few seconds late.
 * Safe to call more than once: confirm_purchase only processes an open purchase.
 */
export async function syncMolliePayment(paymentId: string): Promise<'paid' | 'cancelled' | 'open' | 'unknown'> {
  if (!MOLLIE_ENABLED || !paymentId.startsWith('tr_')) return 'unknown';
  const payment = await getPayment(paymentId);
  const client = db();
  const { data: purchase } = await client.from('purchases').select('id, status').eq('mollie_payment_id', payment.id).maybeSingle();
  if (!purchase) return 'unknown';
  if (payment.status === 'paid') {
    if (purchase.status === 'open') {
      const { data } = await client.rpc('confirm_purchase', { p_purchase: purchase.id });
      if (data === 'ok') await mailPaid(purchase.id);
    }
    return 'paid';
  }
  if (['failed', 'canceled', 'expired'].includes(payment.status)) {
    if (purchase.status === 'open') await client.from('purchases').update({ status: 'cancelled' }).eq('id', purchase.id);
    return 'cancelled';
  }
  return 'open';
}
