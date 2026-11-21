import Link from 'next/link';
import { publicStats } from '@/lib/stats';
import { getSession } from '@/lib/session';
import { Icon } from '../components/Icon';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [stats, { painter }] = await Promise.all([publicStats(), getSession()]);
  const approved = painter?.status === 'approved';
  return (
    <>
      <section className="hero">
        <div className="container" style={{ padding: '56px 24px' }}>
          <h1 style={{ fontSize: 'clamp(1.9rem,3.6vw,2.6rem)' }}>
            Er staan nu <span className="accent">{stats.openJobs} schilderopdrachten</span> open
          </h1>
          <p className="lead" style={{ maxWidth: 680, opacity: 0.9 }}>
            Om de privacy van opdrachtgevers te beschermen tonen we hier alleen aantallen. De opdrachten zelf zie je als
            gescreende schilder in je dashboard, met maten, ondergrond en foto&apos;s.
          </p>
          <div className="row" style={{ marginTop: 20 }}>
            {approved ? (
              <Link href="/schilder/opdrachten" className="btn btn-lg">Naar beschikbare opdrachten</Link>
            ) : (
              <>
                <Link href="/registreren?rol=schilder" className="btn btn-lg">Aanmelden als schilder</Link>
                <Link href="/klus-plaatsen" className="btn btn-lg btn-outline-light">Zelf een opdracht plaatsen</Link>
              </>
            )}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container grid grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <h3 className="row" style={{ gap: 8 }}><Icon name="roller" size={20} /> Per soort werk</h3>
            {stats.byType.length === 0 ? <p className="muted">Nog geen open opdrachten.</p> : (
              <table className="table" style={{ border: 0 }}>
                <tbody>
                  {stats.byType.map(([t, n]) => (
                    <tr key={t}><td>{t}</td><td style={{ textAlign: 'right' }}><strong>{n}</strong></td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="card">
            <h3 className="row" style={{ gap: 8 }}><Icon name="pin" size={20} /> Per plaats</h3>
            {stats.byCity.length === 0 ? <p className="muted">Nog geen open opdrachten.</p> : (
              <table className="table" style={{ border: 0 }}>
                <tbody>
                  {stats.byCity.map(([c, n]) => (
                    <tr key={c}><td>{c}</td><td style={{ textAlign: 'right' }}><strong>{n}</strong></td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
