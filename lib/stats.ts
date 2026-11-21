import 'server-only';
import { db } from './supabase/admin';
import { isConfigured } from './env';
import { WELCOME_LIMIT } from './config';

/** Public numbers only: never titles, addresses or descriptions of jobs. */
export async function publicStats() {
  if (!isConfigured) return { openJobs: 0, painters: 0, cities: 0, byType: [] as [string, number][], byCity: [] as [string, number][] };
  const client = db();
  const demo = await demoIds();
  const [{ data: allJobs }, { data: approved }] = await Promise.all([
    client.from('jobs').select('job_type, city, customer_id').eq('status', 'open').limit(5000),
    client.from('painters').select('id').eq('status', 'approved').limit(10000),
  ]);
  // Demo accounts and their example jobs never count: the public numbers must be real.
  const jobs = (allJobs ?? []).filter((j) => !demo.has(j.customer_id));
  const painters = (approved ?? []).filter((p) => !demo.has(p.id)).length;
  const byType = new Map<string, number>();
  const byCity = new Map<string, number>();
  for (const j of jobs) {
    byType.set(j.job_type, (byType.get(j.job_type) ?? 0) + 1);
    const c = (j.city || '').trim();
    if (c) byCity.set(c, (byCity.get(c) ?? 0) + 1);
  }
  const sort = (m: Map<string, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]);
  return { openJobs: jobs.length, painters: painters ?? 0, cities: byCity.size, byType: sort(byType), byCity: sort(byCity).slice(0, 12) };
}

/** How many of the first WELCOME_LIMIT painters can still get welcome credits. */
export async function welcomeLeft() {
  if (!isConfigured) return WELCOME_LIMIT;
  const { count } = await db().from('credit_transactions').select('id', { count: 'exact', head: true }).eq('reason', 'welkom').neq('note', 'Demo');
  return Math.max(0, WELCOME_LIMIT - (count ?? 0));
}

/** Ids of the demo accounts (customer, painters, admin), so they can be left out of public numbers. */
export async function demoIds() {
  const { data } = await db().from('profiles').select('id').like('email', 'demo-%@schildersconnect.nl');
  return new Set((data ?? []).map((p) => p.id as string));
}
