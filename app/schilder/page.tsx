import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { euro } from '@/lib/budget';
import { painterMenu } from '@/lib/menus';
import { Flash } from '@/app/components/Flash';
import { DashShell } from '@/app/components/DashShell';
import { Icon } from '@/app/components/Icon';
import { JobRow } from './JobRow';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const sp = await searchParams;
  const { profile, painter } = await requireProfile('/schilder', 'schilder');
  if (profile.role === 'admin' && !painter) redirect('/admin');
  if (!painter) redirect('/schilder/aanmelden');
  const menu = await painterMenu(painter);

  if (painter.status !== 'approved') {
    const steps: [string, boolean][] = [
      ['Account aangemaakt', true],
      ['Bedrijfsgegevens ingevuld', true],
      ['Controle door SchildersConnect', false],
      ['Toegang tot opdrachten + 25 welkomstcredits', false],
    ];
    return (
      <DashShell title="Schildersaccount" icon="roller" menu={menu} active="/schilder">
        <div className="stack">
          <Flash code={sp.m} />
          <div className="card">
            {painter.status === 'rejected' ? (
              <>
                <span className="badge badge-red">Afgewezen</span>
                <h1 style={{ fontSize: '1.6rem', marginTop: 10 }}>Je aanmelding is niet goedgekeurd</h1>
                <p className="muted">{painter.admin_note || 'Neem contact met ons op als je denkt dat dit niet klopt.'}</p>
              </>
            ) : painter.status === 'needs_info' ? (
              <>
                <span className="badge badge-yellow">Aanvulling nodig</span>
                <h1 style={{ fontSize: '1.6rem', marginTop: 10 }}>We hebben nog iets van je nodig</h1>
                <p>{painter.admin_note}</p>
                <Link href="/schilder/aanmelden" className="btn">Gegevens aanvullen</Link>
              </>
            ) : (
              <>
                <span className="badge badge-orange">In behandeling</span>
                <h1 style={{ fontSize: '1.6rem', marginTop: 10 }}>Je aanmelding is in behandeling</h1>
                <p className="muted">
                  We controleren de gegevens van {painter.company_name}, meestal binnen 2 werkdagen. Je krijgt bericht zodra je
                  opdrachten kunt bekijken.
                </p>
                <ol style={{ paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                  {steps.map(([label, done], i) => (
                    <li key={label} className="row" style={{ gap: 10 }}>
                      <span className="step-num" style={{ margin: 0, width: 30, height: 30, fontSize: '0.9rem', background: done ? 'var(--green)' : 'var(--line)', color: done ? '#fff' : 'var(--muted)' }}>
                        {done ? <Icon name="check" size={16} strokeWidth={3} /> : i + 1}
                      </span>
                      <span style={{ fontWeight: done ? 700 : 500 }}>{label}</span>
                    </li>
                  ))}
                </ol>
                <Link href="/schilder/aanmelden" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>Gegevens bekijken of wijzigen</Link>
              </>
            )}
          </div>
        </div>
      </DashShell>
    );
  }

  const client = db();
  const [{ data: mine }, { data: jobs }] = await Promise.all([
    client.from('responses').select('job_id, status').eq('painter_id', painter.id),
    client.from('jobs').select('id, title, job_type, city, postcode, location_type, surface_m2, estimate_low, estimate_high, match_cost, timing, photos, created_at, responses(count)').eq('status', 'open').order('created_at', { ascending: false }).limit(30),
  ]);
  const responded = new Set((mine ?? []).map((r: any) => r.job_id));
  const fresh = (jobs ?? []).filter((j: any) => !responded.has(j.id));
  const matches = (mine ?? []).filter((r: any) => r.status === 'chosen').length;

  return (
    <DashShell title="Schildersaccount" icon="roller" menu={menu} active="/schilder">
      <div className="dash-head">
        <div>
          <div className="muted small">Dashboard</div>
          <h1>{painter.company_name}</h1>
        </div>
        <Link href="/schilder/credits" className="btn btn-sm"><Icon name="coins" size={16} /> Credits kopen</Link>
      </div>
      <div className="stack">
        <Flash code={sp.m} />
        <div className="grid grid-3">
          <div className="stat"><div className="num">{painter.credits}</div><div className="lbl">Credits (= {euro(painter.credits)})</div></div>
          <div className="stat"><div className="num">{mine?.length ?? 0}</div><div className="lbl">Reacties verstuurd (gratis)</div></div>
          <div className="stat"><div className="num">{matches}</div><div className="lbl">Matches: klanten die jou kozen</div></div>
        </div>
        <div className="row between" style={{ marginTop: 18 }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Nieuwste opdrachten</h2>
          <Link href="/schilder/opdrachten" className="link-arrow">Alle {fresh.length} opdrachten <Icon name="arrow" size={16} /></Link>
        </div>
        {fresh.length === 0 ? (
          <div className="empty">Er staan op dit moment geen nieuwe opdrachten voor je klaar. Je credits blijven gewoon staan.</div>
        ) : (
          <div className="list">{fresh.slice(0, 5).map((j: any) => <JobRow key={j.id} job={j} />)}</div>
        )}
      </div>
    </DashShell>
  );
}
