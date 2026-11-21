import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { euro } from '@/lib/estimate';
import { shortPostcode } from '@/lib/sanitize';
import { Flash } from '@/app/components/Flash';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ m?: string; tab?: string; regio?: string }> }) {
  const sp = await searchParams;
  const { profile, painter } = await requireProfile('/schilder', 'schilder');
  if (profile.role === 'admin' && !painter) redirect('/admin');
  if (!painter) redirect('/schilder/aanmelden');

  if (painter.status !== 'approved') {
    const steps = [
      ['Account aangemaakt', true],
      ['Bedrijfsgegevens ingevuld', true],
      ['Controle door SchildersConnect', false],
      ['Toegang tot klussen + 25 welkomstcredits', false],
    ] as const;
    return (
      <div className="dash">
        <div className="container" style={{ maxWidth: 720 }}>
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
                    We controleren de gegevens van {painter.company_name}. Meestal binnen 2 werkdagen. Je krijgt bericht
                    zodra je klussen kunt bekijken.
                  </p>
                  <ol style={{ paddingLeft: 20 }}>
                    {steps.map(([label, done]) => (
                      <li key={label} style={{ margin: '6px 0', color: done ? 'var(--green)' : undefined }}>
                        {done ? '✓ ' : ''}{label}
                      </li>
                    ))}
                  </ol>
                  <Link href="/schilder/aanmelden" className="btn btn-ghost btn-sm">Gegevens bekijken of wijzigen</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const client = db();
  const tab = sp.tab === 'reacties' ? 'reacties' : 'klussen';
  const { data: myResponses } = await client
    .from('responses')
    .select('id, job_id, status, created_at, credits_charged, jobs(id, title, city, match_cost, status)')
    .eq('painter_id', painter.id)
    .order('created_at', { ascending: false });
  const respondedIds = new Set((myResponses ?? []).map((r: any) => r.job_id));
  const matches = (myResponses ?? []).filter((r: any) => r.status === 'chosen').length;

  let jobs: any[] = [];
  if (tab === 'klussen') {
    const { data } = await client
      .from('jobs')
      .select('id, title, job_type, city, postcode, location_type, surface_m2, estimate_low, estimate_high, match_cost, timing, photos, created_at, responses(count)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(60);
    jobs = (data ?? []).filter((j: any) => !respondedIds.has(j.id));
    if (sp.regio === '1') {
      const prefix = painter.postcode.slice(0, 2);
      jobs = jobs.filter((j: any) => j.postcode.startsWith(prefix));
    }
  }

  return (
    <div className="dash">
      <div className="container">
        <div className="dash-head">
          <div>
            <div className="muted small">Schildersdashboard</div>
            <h1>{painter.company_name}</h1>
          </div>
          <div className="row">
            <Link href="/schilder/aanmelden" className="btn btn-ghost btn-sm">Bedrijfsprofiel</Link>
            <Link href="/schilder/credits" className="btn btn-sm">Credits kopen</Link>
          </div>
        </div>
        <div className="stack">
          <Flash code={sp.m} />
          <div className="grid grid-3">
            <div className="stat"><div className="num">{painter.credits}</div><div className="lbl">Credits (= {euro(painter.credits)})</div></div>
            <div className="stat"><div className="num">{myResponses?.length ?? 0}</div><div className="lbl">Reacties verstuurd (gratis)</div></div>
            <div className="stat"><div className="num">{matches}</div><div className="lbl">Matches: klanten die jou kozen</div></div>
          </div>

          <div className="tabs" style={{ marginTop: 16 }}>
            <Link href="/schilder" className={tab === 'klussen' ? 'active' : ''}>Beschikbare klussen</Link>
            <Link href="/schilder?tab=reacties" className={tab === 'reacties' ? 'active' : ''}>Mijn reacties</Link>
          </div>

          {tab === 'klussen' ? (
            <>
              <div className="row between">
                <p className="small muted" style={{ margin: 0 }}>Reageren is gratis. Je betaalt de matchprijs pas als de klant jou kiest.</p>
                {sp.regio === '1' ? (
                  <Link href="/schilder" className="small">Toon alle klussen</Link>
                ) : (
                  <Link href="/schilder?regio=1" className="small">Alleen mijn regio ({painter.postcode.slice(0, 2)}..)</Link>
                )}
              </div>
              {jobs.length === 0 ? (
                <div className="empty">Er staan op dit moment geen nieuwe klussen voor je klaar. Je credits blijven gewoon staan.</div>
              ) : (
                <div className="list">
                  {jobs.map((j: any) => (
                    <Link key={j.id} href={`/schilder/klus/${j.id}`} className="item">
                      <div>
                        <h3>{j.title}</h3>
                        <div className="meta">
                          <span>{shortPostcode(j.postcode)}.. {j.city}</span>
                          <span>{j.job_type}</span>
                          <span>{j.location_type}</span>
                          <span>ca. {j.surface_m2} m²</span>
                          <span>{j.timing}</span>
                          {j.photos?.length > 0 && <span>{j.photos.length} foto&apos;s</span>}
                        </div>
                      </div>
                      <div className="row">
                        <span className="badge">{j.responses?.[0]?.count ?? 0} reacties</span>
                        <span className="badge">{euro(j.estimate_low)} – {euro(j.estimate_high)}</span>
                        <span className="badge badge-orange">Match: {j.match_cost} credits</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : !myResponses || myResponses.length === 0 ? (
            <div className="empty">Je hebt nog niet gereageerd. Bekijk de beschikbare klussen.</div>
          ) : (
            <div className="list">
              {myResponses.map((r: any) => (
                <Link key={r.id} href={`/schilder/klus/${r.job_id}`} className="item">
                  <div>
                    <h3>{r.jobs?.title}</h3>
                    <div className="meta"><span>{r.jobs?.city}</span><span>Gereageerd {new Date(r.created_at).toLocaleDateString('nl-NL')}</span></div>
                  </div>
                  {r.status === 'chosen' ? (
                    <span className="badge badge-green">Gekozen · {r.credits_charged} credits</span>
                  ) : r.status === 'refunded' ? (
                    <span className="badge">Teruggeboekt</span>
                  ) : r.jobs?.status !== 'open' ? (
                    <span className="badge">Klus gesloten</span>
                  ) : (
                    <span className="badge badge-yellow">Wacht op klant</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
