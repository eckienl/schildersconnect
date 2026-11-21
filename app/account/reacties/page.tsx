import Link from 'next/link';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { customerMenu } from '@/lib/menus';
import { DashShell } from '../../components/DashShell';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { profile } = await requireProfile('/account/reacties', 'particulier');
  const client = db();
  const { data: jobs } = await client.from('jobs').select('id, title').eq('customer_id', profile.id).neq('status', 'removed');
  const ids = (jobs ?? []).map((j: any) => j.id);
  const titles = new Map((jobs ?? []).map((j: any) => [j.id, j.title]));
  const { data: responses } = ids.length
    ? await client.from('responses').select('id, job_id, status, price_indication, created_at, painters(company_name, city)').in('job_id', ids).order('created_at', { ascending: false })
    : { data: [] as any[] };

  return (
    <DashShell title="Mijn account" icon="user" menu={await customerMenu(profile)} active="/account/reacties">
      <div className="dash-head"><h1>Ontvangen reacties</h1></div>
      {!responses || responses.length === 0 ? (
        <div className="empty">Nog geen reacties. Zodra een schilder reageert, zie je het hier.</div>
      ) : (
        <div className="list">
          {responses.map((r: any) => (
            <Link key={r.id} href={`/account/klus/${r.job_id}`} className="item">
              <div>
                <h3>{r.painters?.company_name}</h3>
                <div className="meta">
                  <span>{r.painters?.city}</span>
                  <span>Op: {titles.get(r.job_id)}</span>
                  {r.price_indication && <span>Indicatie: {r.price_indication}</span>}
                </div>
              </div>
              {r.status === 'chosen' ? <span className="badge badge-green">Gekozen</span> : r.status === 'refunded' ? <span className="badge">Vervallen</span> : <span className="badge badge-orange">Nieuw</span>}
            </Link>
          ))}
        </div>
      )}
    </DashShell>
  );
}
