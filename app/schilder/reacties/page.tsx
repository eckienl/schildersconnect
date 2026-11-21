import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { painterMenu } from '@/lib/menus';
import { DashShell } from '@/app/components/DashShell';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { painter } = await requireProfile('/schilder/reacties', 'schilder');
  if (!painter || painter.status !== 'approved') redirect('/schilder');
  const { data } = await db()
    .from('responses')
    .select('id, job_id, status, created_at, credits_charged, jobs(title, city, match_cost, status)')
    .eq('painter_id', painter.id)
    .order('created_at', { ascending: false });

  return (
    <DashShell title="Schildersaccount" icon="roller" menu={await painterMenu(painter)} active="/schilder/reacties">
      <div className="dash-head"><h1>Mijn reacties</h1></div>
      {!data || data.length === 0 ? (
        <div className="empty">Je hebt nog niet gereageerd. <Link href="/schilder/opdrachten">Bekijk de beschikbare opdrachten</Link>.</div>
      ) : (
        <div className="list">
          {data.map((r: any) => (
            <Link key={r.id} href={`/schilder/klus/${r.job_id}`} className="item">
              <div>
                <h3>{r.jobs?.title}</h3>
                <div className="meta"><span>{r.jobs?.city}</span><span>Gereageerd {new Date(r.created_at).toLocaleDateString('nl-NL')}</span></div>
              </div>
              {r.status === 'chosen' ? (
                <span className="badge badge-green">Gekozen · {r.credits_charged} credits · contactgegevens beschikbaar</span>
              ) : r.status === 'refunded' ? (
                <span className="badge">Teruggeboekt</span>
              ) : r.jobs?.status !== 'open' ? (
                <span className="badge">Opdracht gesloten</span>
              ) : (
                <span className="badge badge-yellow">Wacht op klant · bij match {r.jobs?.match_cost} credits</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </DashShell>
  );
}
