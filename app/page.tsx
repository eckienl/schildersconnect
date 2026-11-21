import Link from 'next/link';
import { isConfigured } from '@/lib/env';
import { db } from '@/lib/supabase/admin';
import { BUNDLES, MATCH_COST, WELCOME_CREDITS } from '@/lib/config';
import { euro } from '@/lib/estimate';

export const dynamic = 'force-dynamic';

async function recentJobs() {
  if (!isConfigured) return [];
  const { data } = await db()
    .from('jobs')
    .select('id, title, job_type, city, location_type, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(4);
  return data ?? [];
}

export default async function Home() {
  const jobs = await recentJobs();
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              Vind de juiste schilder voor <span className="accent">jouw schilderwerk</span>
            </h1>
            <p className="lead">
              Plaats je klus gratis met maten en foto&apos;s. Gescreende schilders uit je regio reageren, en jij kiest zelf
              met wie je in contact komt. Maximaal drie, dus nooit platgebeld.
            </p>
            <div className="hero-cta">
              <Link href="/klus-plaatsen" className="btn btn-lg">
                Ik zoek een schilder
                <small>Plaats gratis je klus →</small>
              </Link>
              <Link href="/registreren?rol=schilder" className="btn btn-lg btn-outline">
                Ik ben schilder
                <small>Reageer gratis op klussen →</small>
              </Link>
            </div>
            <ul className="checks">
              <li>Alleen gescreende schilders</li>
              <li>Direct een richtprijs</li>
              <li>Echte reviews</li>
              <li>Gestart in Utrecht</li>
            </ul>
          </div>
          <div className="hero-card" aria-hidden="true">
            <div className="row between">
              <strong>Kozijnen en deuren schilderen</strong>
              <span className="badge badge-green">3 reacties</span>
            </div>
            <div className="meta" style={{ marginTop: 6 }}>
              <span>Houten</span>
              <span>Buiten</span>
              <span>ca. 40 m²</span>
            </div>
            <div className="estimate" style={{ marginTop: 16 }}>
              <div className="small muted">Richtprijs</div>
              <div className="big">€ 1.400 – € 1.600</div>
            </div>
            <div style={{ marginTop: 16 }} className="stack">
              {['Schildersbedrijf De Kwast', 'Van Dijk Schilderwerken', 'Utrechtse Afbouw'].map((n, i) => (
                <div key={n} className="row between card-flat" style={{ padding: 12 }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>{n}</strong>
                    <div className="small muted">★ 4,{8 - i} · geverifieerd</div>
                  </div>
                  <span className="btn btn-sm">{i === 0 ? 'Gekozen' : 'Kies'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container section grid grid-4" style={{ paddingTop: 36, paddingBottom: 36 }}>
          {[
            ['⌂', 'Alleen schilderwerk', 'Geen klusjesmannen: alleen schilders, gespecialiseerd in binnen- en buitenwerk.'],
            ['✓', 'Handmatig gescreend', 'We controleren KvK, verzekering en portfolio voordat een schilder je klus ziet.'],
            ['€', 'Direct een richtprijs', 'Op basis van je maten zie je meteen wat je ongeveer kwijt bent.'],
            ['3', 'Maximaal 3 schilders', 'Jij kiest wie je gegevens krijgt. Niemand belt je ongevraagd.'],
          ].map(([icon, title, text]) => (
            <div key={title}>
              <div className="feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p className="muted small">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="hoe-werkt-het">
        <div className="container">
          <h2 className="center">Hoe werkt SchildersConnect?</h2>
          <p className="center muted" style={{ marginBottom: 32 }}>In drie stappen van klus naar schilder.</p>
          <div className="grid grid-3">
            {[
              ['Plaats je klus', 'Vertel wat er geschilderd moet worden: binnen of buiten, hoeveel m², welke ondergrond. Voeg foto’s toe.'],
              ['Ontvang reacties', 'Gescreende schilders uit je regio reageren met een bericht en een prijsindicatie. Jouw gegevens blijven verborgen.'],
              ['Kies je schilder', 'Vergelijk profielen en reviews en kies er maximaal drie. Pas dan wisselen jullie contactgegevens uit.'],
            ].map(([title, text], i) => (
              <div key={title} className="card">
                <div className="step-num">{i + 1}</div>
                <h3>{title}</h3>
                <p className="muted">{text}</p>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 28 }}>
            <Link href="/klus-plaatsen" className="btn btn-lg">Plaats gratis je klus</Link>
          </div>
        </div>
      </section>

      {jobs.length > 0 && (
        <section className="section band">
          <div className="container">
            <h2>Recente schilderklussen</h2>
            <div className="grid grid-4" style={{ marginTop: 20 }}>
              {jobs.map((j: any) => (
                <div key={j.id} className="card-flat">
                  <span className="badge">{j.job_type}</span>
                  <h3 style={{ marginTop: 10 }}>{j.title}</h3>
                  <div className="meta">
                    <span>{j.city}</span>
                    <span>{j.location_type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section dark-band" id="voor-schilders">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: 40 }}>
            <div>
              <span className="badge badge-orange">Voor schilders</span>
              <h2 style={{ marginTop: 12 }}>Reageer gratis. Betaal alleen als de klant jou kiest.</h2>
              <ul className="checks" style={{ flexDirection: 'column', gap: 10, marginTop: 18, fontSize: '1rem' }}>
                <li>Geen abonnement en geen vaste maandlasten</li>
                <li>Credits vervallen nooit; stel zelf een weeklimiet in</li>
                <li>Aanvragen met maten, ondergrond en foto&apos;s</li>
                <li>Credits terug bij een nep- of onbereikbare klant</li>
                <li>{WELCOME_CREDITS} welkomstcredits na goedkeuring</li>
              </ul>
              <div className="row" style={{ marginTop: 24 }}>
                <Link href="/registreren?rol=schilder" className="btn btn-lg">Aanmelden als schilder</Link>
              </div>
            </div>
            <div className="card">
              <h3>Wat kost een match?</h3>
              <p className="small muted">1 credit = € 1. Een match kost afhankelijk van de klusgrootte:</p>
              <table className="table" style={{ marginBottom: 16 }}>
                <tbody>
                  <tr><td>Kleine klus (tot ca. € 1.000)</td><td><strong>{MATCH_COST.klein} credits</strong></td></tr>
                  <tr><td>Middelgrote klus (€ 1.000–5.000)</td><td><strong>{MATCH_COST.middel} credits</strong></td></tr>
                  <tr><td>Grote klus (boven € 5.000)</td><td><strong>{MATCH_COST.groot} credits</strong></td></tr>
                </tbody>
              </table>
              <div className="grid grid-3" style={{ gap: 10 }}>
                {BUNDLES.map((b) => (
                  <div key={b.id} className="card-flat center" style={{ padding: 12 }}>
                    <div className="small muted">{b.name}</div>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{euro(b.priceEur)}</div>
                    <div className="small">{b.credits} credits</div>
                    {b.bonus && <span className="badge badge-orange" style={{ marginTop: 6 }}>{b.bonus}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
