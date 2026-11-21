import Link from 'next/link';
import { publicStats } from '@/lib/stats';
import { MATCH_COST, SIZE_CLASSES, WELCOME_CREDITS, WELCOME_LIMIT, eur, matchPriceEx } from '@/lib/config';
import { welcomeLeft } from '@/lib/stats';
import { Icon } from '../components/Icon';
import { Pricing } from '../components/Pricing';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const [stats, left] = await Promise.all([publicStats(), welcomeLeft()]);
  return (
    <>
      <section className="hero">
        <div className="container" style={{ padding: '60px 24px' }}>
          <span className="badge badge-orange">Voor schilders</span>
          <h1 style={{ marginTop: 14, fontSize: 'clamp(2rem,4vw,2.9rem)' }}>
            Reageer gratis.<br />Betaal alleen als de klant <span className="accent">jou kiest</span>.
          </h1>
          <p className="lead" style={{ maxWidth: 640, opacity: 0.9 }}>
            Geen abonnement, geen vaste maandlasten en geen dure leads die nergens op uitlopen. Nu {stats.openJobs} open
            opdrachten in Nederland.
          </p>
          <div className="row" style={{ marginTop: 22 }}>
            <Link href="/registreren?rol=schilder" className="btn btn-lg">Gratis aanmelden</Link>
            <Link href="/opdrachten" className="btn btn-lg btn-outline-light">Bekijk aantallen opdrachten</Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="grid grid-4">
            {[
              ['user', 'Aanmelden', 'Account aanmaken en je bedrijfsgegevens invullen: KvK, verzekering, werkgebied.'],
              ['shield', 'Wij screenen', `Binnen 2 werkdagen gecontroleerd. De eerste ${WELCOME_LIMIT} schilders krijgen ${WELCOME_CREDITS} gratis credits, genoeg voor een eerste match (nog ${left} plekken).`],
              ['chat', 'Gratis reageren', 'Reageer op opdrachten met een bericht en prijsindicatie. Zoveel als je wilt.'],
              ['handshake', 'Match', 'Kiest de klant jou? Dan gaan er credits af en krijg je direct zijn contactgegevens.'],
            ].map(([icon, title, text], i) => (
              <div key={title} className="card">
                <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                  <span className="step-num" style={{ margin: 0 }}>{i + 1}</span>
                  <span style={{ color: 'var(--orange)' }}><Icon name={icon} size={26} /></span>
                </div>
                <h3>{title}</h3>
                <p className="muted small" style={{ margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section band">
        <div className="container">
          <h2 className="center">Wat kost een match?</h2>
          <p className="center muted" style={{ maxWidth: 680, margin: '0 auto 28px' }}>
            De klant betaalt niets en bepaalt de prijs niet. Wij bepalen de klusgrootte op basis van de opdracht zelf: soort werk,
            aantal m², binnen of buiten, staat van het werk en steiger. Geeft de klant een hoger budget op, dan telt dat. De matchprijs
            zie je bij elke opdracht vóórdat je reageert, in credits én in euro's, met de uitleg erbij.
          </p>
          <div className="grid grid-4" style={{ maxWidth: 1100, margin: '0 auto 36px' }}>
            {SIZE_CLASSES.map((c) => [c.name, c.range, MATCH_COST[c.id]]).map(([name, range, cost]) => (
              <div key={name as string} className="card center">
                <div className="muted small">{name} · {range}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{cost} credits</div>
                <div className="muted small">= {eur(matchPriceEx(cost as number))} excl. btw per match</div>
              </div>
            ))}
          </div>
          <Pricing welcomeLeft={left} />
          <p className="small muted center" style={{ marginTop: 16 }}>
            Een match betekent dat je de contactgegevens van de klant krijgt. Of je de opdracht krijgt, hangt af van jouw offerte en het
            gesprek met de klant; dat kan SchildersConnect niet garanderen. Credits krijg je terug als de klant nep of onbereikbaar
            blijkt, of als de opdracht duidelijk niet klopt met het opgegeven budget.
          </p>
        </div>
      </section>
    </>
  );
}
