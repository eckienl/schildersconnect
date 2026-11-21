import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/lib/supabase/admin';
import { getPayment, MOLLIE_ENABLED } from '@/lib/mollie';
import { mailPaid } from '@/lib/notify';

/**
 * Mollie calls this URL with the payment id whenever a payment changes status.
 * We never trust the request body: the status is always fetched from Mollie itself.
 */
export async function POST(request: NextRequest) {
  if (!MOLLIE_ENABLED) return new NextResponse('disabled', { status: 200 });
  const form = await request.formData().catch(() => null);
  const id = String(form?.get('id') ?? '');
  if (!id.startsWith('tr_')) return new NextResponse('ok', { status: 200 });
  try {
    const payment = await getPayment(id);
    const client = db();
    const { data: purchase } = await client.from('purchases').select('id, status').eq('mollie_payment_id', payment.id).maybeSingle();
    if (!purchase) return new NextResponse('ok', { status: 200 });
    if (payment.status === 'paid' && purchase.status === 'open') {
      const { data } = await client.rpc('confirm_purchase', { p_purchase: purchase.id });
      if (data === 'ok') await mailPaid(purchase.id);
    } else if (['failed', 'canceled', 'expired'].includes(payment.status) && purchase.status === 'open') {
      await client.from('purchases').update({ status: 'cancelled' }).eq('id', purchase.id);
    }
  } catch (e) {
    console.error('[mollie webhook]', e);
    return new NextResponse('error', { status: 500 }); // Mollie retries later
  }
  return new NextResponse('ok', { status: 200 });
}
