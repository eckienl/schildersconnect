import Link from 'next/link';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { euro } from '@/lib/estimate';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const { profile } = await requireProfile('/account', 'particulier');
  const { data: jobs } = await db()
    .from('jobs')
    .select('id, title, city, status, created_at, estimate_low, estimate_high, responses(id, status)')
    .eq('customer_id', profile.id)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });

  return (
    <div className="dash">
      <div className="container">
        <div className="dash-head">
          <div>
            <div className="muted small">Mijn account</div>
            <h1>Hallo {profile.full_name.split(' ')[0] || 'daar'}</h1>
          </div>
          <Link href="/klus-plaatsen" className="btn">+ Nieuwe klus plaatsen</Link>
        </div>

        <h2 style={{ fontSize: '1.2rem' }}>Mijn klussen</h2>
        {!jobs || jobs.length === 0 ? (
          <div className="empty">
            <p>Je hebt nog geen klussen geplaatst.</p>
            <Link href="/klus-plaatsen" className="btn">Plaats je eerste klus</Link>
          </div>
        ) : (
          <div className="list">
            {jobs.map((j: any) => {
              const total = j.responses?.length ?? 0;
              const chosen = j.responses?.filter((r: any) => r.status === 'chosen').length ?? 0;
              return (
                <Link key={j.id} href={`/account/klus/${j.id}`} className="item">
                  <div>
                    <h3>{j.title}</h3>
                    <div className="meta">
                      <span>{j.city}</span>
                      <span>Richtprijs {euro(j.estimate_low)} – {euro(j.estimate_high)}</span>
                      <span>Geplaatst {new Date(j.created_at).toLocaleDateString('nl-NL')}</span>
                    </div>
                  </div>
                  <div className="row">
                    {j.status === 'closed' && <span className="badge">Gesloten</span>}
                    {chosen > 0 && <span className="badge badge-green">{chosen} gekozen</span>}
                    <span className={`badge ${total > 0 ? 'badge-orange' : ''}`}>{total} {total === 1 ? 'reactie' : 'reacties'}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
