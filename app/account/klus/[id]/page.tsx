import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { budgetLabel } from '@/lib/budget';
import { customerMenu } from '@/lib/menus';
import { DashShell } from '@/app/components/DashShell';
import { Icon } from '@/app/components/Icon';
import { MAX_CHOSEN_PER_JOB } from '@/lib/config';
import { Flash } from '@/app/components/Flash';
import { JobDetails } from '@/app/components/JobDetails';
import { chooseResponse, closeJob } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ m?: string }> }) {
  const { id } = await params;
  const { m } = await searchParams;
  const { profile } = await requireProfile(`/account/klus/${id}`, 'particulier');
  const client = db();
  const { data: job } = await client.from('jobs').select('*').eq('id', id).maybeSingle();
  if (!job || (job.customer_id !== profile.id && profile.role !== 'admin')) notFound();

  const { data: responses } = await client
    .from('responses')
    .select('*, painters(id, company_name, city, description, specialties, insured, website, profiles(full_name, phone, email))')
    .eq('job_id', id)
    .order('created_at', { ascending: true });

  const chosenCount = (responses ?? []).filter((r: any) => r.status === 'chosen').length;
  const canChoose = job.status === 'open' && chosenCount < MAX_CHOSEN_PER_JOB;

  return (
    <DashShell title="Mijn account" icon="user" menu={await customerMenu(profile)} active="/account">
        <Link href="/account" className="back"><Icon name="back" size={16} /> Mijn opdrachten</Link>
        <div className="dash-head">
          <div>
            <h1>{job.title}</h1>
            <div className="meta"><span>{job.city}</span><span>{budgetLabel(job)}</span></div>
          </div>
          {job.status === 'open' ? (
            <div className="row">
              <Link href={`/account/klus/${job.id}/bewerken`} className="btn btn-sm"><Icon name="edit" size={16} /> Bewerken</Link>
              <form action={closeJob}>
                <input type="hidden" name="job_id" value={job.id} />
                <button className="btn btn-ghost btn-sm">Opdracht sluiten</button>
              </form>
            </div>
          ) : (
            <span className="badge">Gesloten</span>
          )}
        </div>

        <div className="stack">
          <Flash code={m} />

          <h2 style={{ fontSize: '1.2rem', marginTop: 24 }}>
            Reacties van schilders <span className="muted">({responses?.length ?? 0})</span>
          </h2>
          <p className="small muted">
            Kies maximaal {MAX_CHOSEN_PER_JOB} schilders. Pas als je een schilder kiest, wisselen jullie contactgegevens uit.
            Je hebt er nu {chosenCount} gekozen.
          </p>

          {!responses || responses.length === 0 ? (
            <div className="empty">
              Nog geen reacties. Gescreende schilders in de buurt van {job.city} zien je opdracht nu. Meestal komen de eerste reacties binnen 24 uur.
            </div>
          ) : (
            responses.map((r: any) => {
              const p = r.painters;
              const chosen = r.status === 'chosen';
              return (
                <div key={r.id} className="card" style={chosen ? { borderColor: '#9fd8b6' } : undefined}>
                  <div className="row between">
                    <div>
                      <h3 style={{ margin: 0 }}>{p?.company_name}</h3>
                      <div className="meta">
                        <span>{p?.city}</span>
                        <span className="badge badge-green">Gescreend</span>
                        {p?.insured && <span className="badge">Verzekerd</span>}
                      </div>
                    </div>
                    {r.price_indication && (
                      <div style={{ textAlign: 'right' }}>
                        <div className="small muted">Prijsindicatie</div>
                        <strong>{r.price_indication}</strong>
                      </div>
                    )}
                  </div>
                  <p style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{r.message}</p>
                  {p?.specialties?.length > 0 && (
                    <div className="row" style={{ gap: 6, marginBottom: 12 }}>
                      {p.specialties.map((s: string) => <span key={s} className="badge">{s}</span>)}
                    </div>
                  )}
                  {chosen ? (
                    <div className="alert alert-success">
                      <strong>Gekozen.</strong> Contact: {p?.profiles?.full_name} · <a href={`tel:${p?.profiles?.phone}`}>{p?.profiles?.phone}</a> ·{' '}
                      <a href={`mailto:${p?.profiles?.email}`}>{p?.profiles?.email}</a>
                      {p?.website && <> · <a href={p.website} target="_blank" rel="noreferrer">website</a></>}
                    </div>
                  ) : r.status === 'refunded' ? (
                    <span className="badge">Niet meer beschikbaar</span>
                  ) : canChoose ? (
                    <form action={chooseResponse}>
                      <input type="hidden" name="response_id" value={r.id} />
                      <input type="hidden" name="job_id" value={job.id} />
                      <button className="btn">Kies deze schilder</button>
                    </form>
                  ) : null}
                </div>
              );
            })
          )}

          <div className="row between" style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Je aanvraag</h2>
            {job.status === 'open' && <Link href={`/account/klus/${job.id}/bewerken`} className="link-arrow"><Icon name="edit" size={16} /> Aanvraag bewerken</Link>}
          </div>
          <div className="card">
            <JobDetails job={job} showFullPostcode />
          </div>
        </div>
    </DashShell>
  );
}
