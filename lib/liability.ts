import 'server-only';
import { db } from './supabase/admin';
import { VAT } from './config';
import { demoIds } from './stats';

/**
 * Bought credits that painters have not used yet, valued at what they paid for them.
 * This is the most SchildersConnect would ever have to refund if it stopped (see the terms).
 * Welcome credits are assumed to be used first, so the figure is on the safe (high) side.
 */
export async function outstandingPaidCredits() {
  const client = db();
  const [demo, { data: painters }, { data: bought }, { data: paid }] = await Promise.all([
    demoIds(),
    client.from('painters').select('id, credits').gt('credits', 0).limit(10000),
    client.from('credit_transactions').select('painter_id, amount').eq('reason', 'aankoop').limit(50000),
    client.from('purchases').select('painter_id, price_eur, credits').eq('status', 'paid').limit(50000),
  ]);

  const boughtBy = new Map<string, number>();
  for (const t of bought ?? []) boughtBy.set(t.painter_id, (boughtBy.get(t.painter_id) ?? 0) + t.amount);
  const spent = new Map<string, { cents: number; credits: number }>();
  for (const p of paid ?? []) {
    const s = spent.get(p.painter_id) ?? { cents: 0, credits: 0 };
    s.cents += p.price_eur; // cents excl. VAT (legacy column name)
    s.credits += p.credits;
    spent.set(p.painter_id, s);
  }

  let credits = 0;
  let cents = 0;
  let painterCount = 0;
  for (const p of painters ?? []) {
    if (demo.has(p.id)) continue;
    const left = Math.max(0, Math.min(p.credits, boughtBy.get(p.id) ?? 0));
    if (left === 0) continue;
    const s = spent.get(p.id);
    const perCredit = s && s.credits > 0 ? s.cents / s.credits : 0;
    credits += left;
    cents += left * perCredit;
    painterCount += 1;
  }
  const exVat = Math.round(cents) / 100;
  return { credits, painters: painterCount, exVat, inclVat: Math.round(cents * (1 + VAT)) / 100 };
}
