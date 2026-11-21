import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { euro } from '@/lib/estimate';
import { Flash } from '@/app/components/Flash';
import { approvePainter, cancelPurchase, confirmPurchase, refundMatch, removeJob, setPainterStatus } from './actions';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, [string, string]> = {
  pending: ['In behandeling', 'badge-orange'],
  needs_info: ['Aanvulling nodig', 'badge-yellow'],
  approved: ['Goedgekeurd', 'badge-green'],
  rejected: ['Afgewezen', 'badge-red'],
};

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string; m?: string }> }) {
  const sp = await searchParams;
  const { profile } = await getSession();
  if (!profile) redirect('/inloggen?next=/admin');
  if (profile.role !== 'admin') redirect('/');
  const tab = ['schilders', 'klussen', 'aankopen', 'matches'].includes(sp.tab ?? '') ? sp.tab : 'schilders';
  const client = db();

  const [{ count: pendingCount }, { count: openPurchases }, { count: openJobs }] = await Promise.all([
    client.from('painters').select('id', { count: 'exact', head: true }).in('status', ['pending']),
    client.from('purchases').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    client.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  let content: React.ReactNode = null;

  if (tab === 'schilders') {
    const { data } = await client.from('painters').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false });
    const order = ['pending', 'needs_info', 'approved', 'rejected'];
    const painters = (data ?? []).sort((a: any, b: any) => order.indexOf(a.status) - order.indexOf(b.status));
    content = painters.length === 0 ? <div className="empty">Nog geen schilders aangemeld.</div> : (
      <div className="list">
        {painters.map((p: any) => (
          <div key={p.id} className="card">
            <div className="row between">
              <div>
                <h3 style={{ margin: 0 }}>{p.company_name}</h3>
                <div className="meta">
                  <span>{p.profiles?.full_name}</span><span>{p.profiles?.email}</span><span>{p.profiles?.phone}</span>
                </div>
              </div>
              <span className={`badge ${STATUS[p.status]?.[1]}`}>{STATUS[p.status]?.[0]}</span>
            </div>
            <dl className="kv" style={{ marginTop: 12 }}>
              <dt>KvK</dt>
              <dd><a href={`https://www.kvk.nl/zoeken/?source=all&q=${p.kvk}`} target="_blank" rel="noreferrer">{p.kvk}</a> (controleer in het KvK-register)</dd>
              <dt>Vestiging</dt><dd>{p.postcode} {p.city} · werkgebied {p.radius_km} km</dd>
              <dt>Verzekerd</dt><dd>{p.insured ? 'Ja (opgegeven)' : 'Nee / niet opgegeven'}</dd>
              <dt>Website</dt><dd>{p.website ? <a href={p.website} target="_blank" rel="noreferrer">{p.website}</a> : '–'}</dd>
              <dt>Specialisaties</dt><dd>{p.specialties?.join(', ') || '–'}</dd>
              <dt>Credits</dt><dd>{p.credits}</dd>
              {p.description && (<><dt>Omschrijving</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{p.description}</dd></>)}
              {p.admin_note && (<><dt>Notitie</dt><dd>{p.admin_note}</dd></>)}
            </dl>
            {p.status !== 'approved' && (
              <div className="row" style={{ marginTop: 14, alignItems: 'flex-start' }}>
                <form action={approvePainter}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="btn btn-green">Goedkeuren (+25 credits)</button>
                </form>
                <form action={setPainterStatus} className="row" style={{ flex: 1, minWidth: 280 }}>
                  <input type="hidden" name="id" value={p.id} />
                  <input name="note" type="text" placeholder="Notitie voor de schilder, bijv. 'stuur bewijs van verzekering'" style={{ flex: 1, minWidth: 200 }} />
                  <button className="btn btn-ghost" name="status" value="needs_info">Aanvulling vragen</button>
                  <button className="btn btn-red" name="status" value="rejected">Afwijzen</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'klussen') {
    const { data } = await client
      .from('jobs')
      .select('*, profiles(full_name, email), responses(id, status)')
      .neq('status', 'removed')
      .order('created_at', { ascending: false })
      .limit(100);
    content = !data || data.length === 0 ? <div className="empty">Nog geen klussen.</div> : (
      <table className="table">
        <thead><tr><th>Klus</th><th>Klant</th><th>Grootte</th><th>Reacties</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {data.map((j: any) => (
            <tr key={j.id}>
              <td><strong>{j.title}</strong><div className="small muted">{j.postcode} {j.city} · {j.job_type} · {j.surface_m2} m²</div></td>
              <td>{j.profiles?.full_name}<div className="small muted">{j.profiles?.email}</div></td>
              <td>{j.size_class} · {j.match_cost} cr<div className="small muted">{euro(j.estimate_low)}–{euro(j.estimate_high)}</div></td>
              <td>{j.responses?.length ?? 0} ({j.responses?.filter((r: any) => r.status === 'chosen').length ?? 0} gekozen)</td>
              <td><span className="badge">{j.status}</span></td>
              <td>
                <form action={removeJob}>
                  <input type="hidden" name="id" value={j.id} />
                  <button className="btn btn-red btn-sm">Verwijderen</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (tab === 'aankopen') {
    const { data } = await client.from('purchases').select('*, painters(company_name, profiles(email))').order('created_at', { ascending: false }).limit(100);
    content = !data || data.length === 0 ? <div className="empty">Nog geen aankopen.</div> : (
      <>
        <p className="small muted">Stuur de schilder een betaalverzoek (bijv. via een Tikkie of factuur). Bevestig hier zodra er betaald is; de credits worden dan direct bijgeschreven.</p>
        <table className="table">
          <thead><tr><th>Datum</th><th>Schilder</th><th>Bundel</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {data.map((p: any) => (
              <tr key={p.id}>
                <td>{new Date(p.created_at).toLocaleDateString('nl-NL')}</td>
                <td>{p.painters?.company_name}<div className="small muted">{p.painters?.profiles?.email}</div></td>
                <td>{p.bundle} · {euro(p.price_eur)} · {p.credits} credits</td>
                <td><span className={`badge ${p.status === 'paid' ? 'badge-green' : p.status === 'open' ? 'badge-orange' : ''}`}>{p.status}</span></td>
                <td>
                  {p.status === 'open' && (
                    <div className="row">
                      <form action={confirmPurchase}><input type="hidden" name="id" value={p.id} /><button className="btn btn-green btn-sm">Betaald</button></form>
                      <form action={cancelPurchase}><input type="hidden" name="id" value={p.id} /><button className="btn btn-ghost btn-sm">Annuleren</button></form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  if (tab === 'matches') {
    const { data } = await client
      .from('responses')
      .select('*, painters(company_name), jobs(title, city, profiles(full_name, phone))')
      .in('status', ['chosen', 'refunded'])
      .order('chosen_at', { ascending: false })
      .limit(100);
    content = !data || data.length === 0 ? <div className="empty">Nog geen matches.</div> : (
      <>
        <p className="small muted">Meldt een schilder dat de klant nep of onbereikbaar is? Controleer het en boek de credits terug.</p>
        <table className="table">
          <thead><tr><th>Datum</th><th>Klus</th><th>Schilder</th><th>Credits</th><th></th></tr></thead>
          <tbody>
            {data.map((r: any) => (
              <tr key={r.id}>
                <td>{r.chosen_at ? new Date(r.chosen_at).toLocaleDateString('nl-NL') : '–'}</td>
                <td>{r.jobs?.title}<div className="small muted">{r.jobs?.city} · {r.jobs?.profiles?.full_name} {r.jobs?.profiles?.phone}</div></td>
                <td>{r.painters?.company_name}</td>
                <td>{r.credits_charged}</td>
                <td>
                  {r.status === 'chosen' ? (
                    <form action={refundMatch}><input type="hidden" name="id" value={r.id} /><button className="btn btn-ghost btn-sm">Terugboeken</button></form>
                  ) : <span className="badge">Teruggeboekt</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  }

  return (
    <div className="dash">
      <div className="container">
        <div className="dash-head">
          <div><div className="muted small">Beheer</div><h1>SchildersConnect admin</h1></div>
        </div>
        <div className="stack">
          <Flash code={sp.m} />
          <div className="grid grid-3">
            <div className="stat"><div className="num">{pendingCount ?? 0}</div><div className="lbl">Schilders wachten op controle</div></div>
            <div className="stat"><div className="num">{openJobs ?? 0}</div><div className="lbl">Open klussen</div></div>
            <div className="stat"><div className="num">{openPurchases ?? 0}</div><div className="lbl">Openstaande aankopen</div></div>
          </div>
          <div className="tabs" style={{ marginTop: 16 }}>
            {[['schilders', 'Schilders'], ['klussen', 'Klussen'], ['aankopen', 'Aankopen'], ['matches', 'Matches']].map(([k, label]) => (
              <Link key={k} href={`/admin?tab=${k}`} className={tab === k ? 'active' : ''}>{label}</Link>
            ))}
          </div>
          {content}
        </div>
      </div>
    </div>
  );
}
