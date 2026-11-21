import 'server-only';
import { db } from './supabase/admin';
import { isConfigured } from './env';

/** Open jobs and approved painters for a set of place names (counts only, never job details). */
export async function placeCounts(names: string[]) {
  if (!isConfigured) return { jobs: 0, painters: 0 };
  const lower = names.map((n) => n.toLowerCase());
  const client = db();
  const [{ data: jobs }, { data: painters }] = await Promise.all([
    client.from('jobs').select('city').eq('status', 'open').limit(5000),
    client.from('painters').select('city').eq('status', 'approved').limit(5000),
  ]);
  const match = (c: string) => lower.includes((c || '').trim().toLowerCase());
  return { jobs: (jobs ?? []).filter((j) => match(j.city)).length, painters: (painters ?? []).filter((p) => match(p.city)).length };
}
