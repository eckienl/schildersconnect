import Link from 'next/link';
import { publicStats } from '@/lib/stats';
import { matchCostSummary } from '@/lib/config';
import { welcomeLeft } from '@/lib/stats';
import { Pricing } from './components/Pricing';
import { Icon } from './components/Icon';
import { Flash } from './components/Flash';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const sp = await searchParams;
  const stats = await publicStats();
  return (
    <>
      {sp.demo && (
        <div className="container" style={{ paddingTop: 16 }}>
          <Flash code={sp.demo === 'reset' ? 'demo_reset' : 'demo_fout'} />
        </div>
      )}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <h1>
              Vind de juiste schilder
              <br />
              voor jouw <span className="accent">schilderwerk</span>
            </h1>
            <p className="lead">
              Dé marktplaats voor particulieren en bedrijven om eenvoudig en snel een professionele schilder te vinden.
            </p>
            <div className="hero-cta">
              <Link href="/klus-plaatsen" className="cta-big primary">
                <Icon name="user" size={30} />
                <span>
                  <strong>Ik zoek een schilder</strong>
                  <small>Plaats gratis een opdracht ›</small>
                </span>
              </Link>
              <Link href="/voor-schilders" className="cta-big secondary">
                <Icon name="roller" size={30} />
                <span>
                  <strong>Ik ben schilder</strong>
                  <small>Ontvang opdrachten ›</small>
                </span>
              </Link>
            </div>
            <ul className="checks">
              <li>Geverifieerde schilders</li>
              <li>Vergelijk reacties</li>
              <li>Echte beoordelingen</li>
              <li>Landelijke dekking</li>
            </ul>
          </div>
          <div className="hero-photo">
            <img src="/img/hero-schilder.jpg" alt="Schilder aan het werk aan een gevel" />
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container features-grid">
          {[
            ['house', 'Particulier & Zakelijk', 'Voor woning, VvE, bedrijfspand en meer'],
            ['roller', 'Alleen Schilders', 'Gespecialiseerd in schilderwerk'],
            ['pin', 'Door heel Nederland', 'Schilders in alle 12 provincies'],
            ['shield', 'Betrouwbaar', 'Gescreende bedrijven en echte reviews'],
            ['handshake', 'Snel & Eenvoudig', 'Plaats een opdracht, ontvang reacties'],
          ].map(([icon, title, text]) => (
            <div key={title} className="feature">
              <span className="ficon"><Icon name={icon} size={40} strokeWidth={1.7} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Nu op <span className="accent">SchildersConnect</span></h2>
              <p className="muted" style={{ margin: 0 }}>Opdrachten zijn alleen zichtbaar voor gescreende schilders. Dit zijn de actuele aantallen.</p>
            </div>
            <Link href="/opdrachten" className="link-arrow">Bekijk per soort en plaats <Icon name="arrow" size={18} /></Link>
          </div>
          <div className="counters">
            <div className="counter"><span className="cicon"><Icon name="list" size={26} /></span><div><div className="num">{stats.openJobs}</div><div className="lbl">open schilderopdrachten</div></div></div>
            <div className="counter"><span className="cicon"><Icon name="shield" size={26} /></span><div><div className="num">{stats.painters}</div><div className="lbl">gescreende schilders</div></div></div>
            <div className="counter"><span className="cicon"><Icon name="pin" size={26} /></span><div><div className="num">{stats.cities}</div><div className="lbl">plaatsen met opdrachten</div></div></div>
          </div>
          {stats.byType.length > 0 && (
            <div className="chips" style={{ marginTop: 20 }}>
              {stats.byType.map(([t, n]) => <span key={t} className="chip"><b>{n}</b> {t}</span>)}
            </div>
          )}
        </div>
      </section>

      <section className="section band" id="hoe-werkt-het">
        <div className="container">
          <h2 className="center">Hoe werkt SchildersConnect?</h2>
          <p className="center muted" style={{ marginBottom: 32 }}>Van klus naar schilder in drie stappen. Gratis en vrijblijvend.</p>
          <div className="grid grid-3">
            {[
              ['Plaats je opdracht', 'Vertel in een paar stappen wat er geschilderd moet worden. Voeg foto’s toe en geef je budget aan.'],
              ['Ontvang reacties', 'Gescreende schilders uit jouw regio reageren met een bericht en een prijsindicatie. Je gegevens blijven verborgen.'],
              ['Kies de juiste schilder', 'Vergelijk profielen en reviews en kies er maximaal drie. Pas dan wisselen jullie contactgegevens uit.'],
            ].map(([title, text], i) => (
              <div key={title} className="card">
                <div className="step-num">{i + 1}</div>
                <h3>{title}</h3>
                <p className="muted" style={{ margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
          <div className="center" style={{ marginTop: 30 }}>
            <Link href="/klus-plaatsen" className="btn btn-lg">Plaats gratis je opdracht</Link>
          </div>
        </div>
      </section>

      <section className="section" id="zakelijk">
        <div className="container grid grid-2" style={{ alignItems: 'center', gap: 40 }}>
          <div>
            <span className="badge badge-navy">Voor bedrijven &amp; VvE</span>
            <h2 style={{ marginTop: 12 }}>Zakelijk schilderwerk, planmatig geregeld</h2>
            <p className="muted">
              Bedrijfspand, kantoor of het meerjarig onderhoud van een VvE: plaats je opdracht en ontvang reacties van
              schildersbedrijven die gewend zijn aan grotere projecten.
            </p>
            <ul className="checks" style={{ flexDirection: 'column', gap: 10, color: 'var(--ink)' }}>
              <li>Schildersbedrijven met personeel en verzekering</li>
              <li>Reacties in één vergelijkbaar overzicht</li>
              <li>Geschikt voor onderhoudsplanning (MJOP)</li>
            </ul>
            <Link href="/klus-plaatsen" className="btn" style={{ marginTop: 20 }}>Zakelijke opdracht plaatsen</Link>
          </div>
          <div className="card">
            <div className="row" style={{ gap: 14 }}>
              <span className="side-icon" style={{ width: 48, height: 48 }}><Icon name="building" size={26} /></span>
              <div>
                <h3 style={{ margin: 0 }}>Onderhoud schilderwerk bedrijfspand</h3>
                <div className="meta"><span>Utrecht</span><span>Buiten</span><span>Budget meer dan € 5.000</span></div>
              </div>
            </div>
            <p className="muted small" style={{ margin: '16px 0 0' }}>Voorbeeld van hoe een zakelijke opdracht eruitziet voor schilders.</p>
          </div>
        </div>
      </section>

      <section className="utrecht">
        <div className="utrecht-grid">
          <div className="utrecht-photo"><img src="/img/utrecht.jpg" alt="Nederlandse huizen en een kerktoren" /></div>
          <div className="utrecht-text">
            <span style={{ color: 'var(--orange)' }}><Icon name="pin" size={44} /></span>
            <div>
              <h2>Schilders in <span className="accent">heel Nederland</span></h2>
              <p style={{ margin: '0 0 12px', opacity: 0.9 }}>Van Groningen tot Maastricht: voor particulieren, bedrijven en schilders in alle 12 provincies.</p>
              <Link href="/schilders" className="link-arrow">Vind een schilder in jouw plaats <Icon name="arrow" size={16} /></Link>
            </div>
          </div>
          <div className="utrecht-map"><div className="chips">{['Groningen','Friesland','Drenthe','Overijssel','Flevoland','Gelderland','Utrecht','Noord-Holland','Zuid-Holland','Zeeland','Noord-Brabant','Limburg'].map((p) => <span key={p} className="chip" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>{p}</span>)}</div></div>
        </div>
      </section>

      <section className="section" id="voor-schilders">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Credits voor schilders</h2>
              <p className="muted" style={{ margin: 0 }}>Geen abonnement. Reageren is gratis; je betaalt alleen als een klant jou kiest. Credits vervallen nooit.</p>
            </div>
            <Link href="/voor-schilders" className="link-arrow">Zo werkt het voor schilders <Icon name="arrow" size={18} /></Link>
          </div>
          <Pricing welcomeLeft={await welcomeLeft()} />
          <p className="small muted center" style={{ marginTop: 14 }}>
            Alle prijzen excl. btw. Een match kost {matchCostSummary().join(', ')}. Een match betekent contact met de klant, geen gegarandeerde opdracht.
          </p>
        </div>
      </section>
    </>
  );
}
