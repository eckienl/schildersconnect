import Link from 'next/link';
import { publicStats } from '@/lib/stats';
import { MATCH_COST, WELCOME_CREDITS } from '@/lib/config';
import { Icon } from '../components/Icon';
import { Pricing } from '../components/Pricing';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const stats = await publicStats();
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
            opdrachten in de regio Utrecht.
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
              ['shield', 'Wij screenen', `Binnen 2 werkdagen gecontroleerd. Na goedkeuring krijg je ${WELCOME_CREDITS} gratis credits.`],
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
            De klant geeft bij zijn opdracht een budget of richtprijs op. Daarop is de matchprijs gebaseerd. Die zie je vóórdat je
            reageert, zodat je nooit voor verrassingen staat.
          </p>
          <div className="grid grid-3" style={{ maxWidth: 900, margin: '0 auto 36px' }}>
            {[
              ['Klein', 'tot € 1.000', MATCH_COST.klein],
              ['Middel', '€ 1.000 – € 5.000', MATCH_COST.middel],
              ['Groot', 'boven € 5.000', MATCH_COST.groot],
            ].map(([name, range, cost]) => (
              <div key={name as string} className="card center">
                <div className="muted small">{name} · {range}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800 }}>{cost} credits</div>
                <div className="muted small">= € {cost} per match</div>
              </div>
            ))}
          </div>
          <Pricing />
          <p className="small muted center" style={{ marginTop: 16 }}>
            Klopt de opdracht achteraf niet met het opgegeven budget, of is de klant onbereikbaar? Meld het, dan corrigeren of
            storten we je credits terug.
          </p>
        </div>
      </section>
    </>
  );
}
