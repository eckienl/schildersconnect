import 'server-only';
import { db } from './supabase/admin';
import { isConfigured } from './env';
import { demoIds } from './stats';

/** Open jobs and approved painters for a set of place names (counts only, never job details). */
export async function placeCounts(names: string[]) {
  if (!isConfigured) return { jobs: 0, painters: 0 };
  const lower = names.map((n) => n.toLowerCase());
  const client = db();
  const [demo, { data: allJobs }, { data: allPainters }] = await Promise.all([
    demoIds(),
    client.from('jobs').select('city, customer_id').eq('status', 'open').limit(5000),
    client.from('painters').select('id, city').eq('status', 'approved').limit(5000),
  ]);
  const jobs = (allJobs ?? []).filter((j) => !demo.has(j.customer_id));
  const painters = (allPainters ?? []).filter((p) => !demo.has(p.id));
  const match = (c: string) => lower.includes((c || '').trim().toLowerCase());
  return { jobs: jobs.filter((j) => match(j.city)).length, painters: painters.filter((p) => match(p.city)).length };
}
