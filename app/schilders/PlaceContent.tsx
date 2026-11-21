import Link from 'next/link';
import { JOB_SLUGS, slugify, type Place } from '@/lib/places';
import { RATE_PER_M2, euro } from '@/lib/budget';
import { Icon } from '@/app/components/Icon';

export function priceRange(jobType: string) {
  const r = RATE_PER_M2[jobType] ?? 20;
  return `${euro(Math.round(r * 0.85))} – ${euro(Math.round(r * 1.15))}`;
}

export function PlaceHero({ title, intro, cta }: { title: React.ReactNode; intro: string; cta: string }) {
  return (
    <section className="hero">
      <div className="container" style={{ padding: '56px 24px' }}>
        <nav className="small" style={{ opacity: 0.8, marginBottom: 10 }}><Link href="/schilders">Schilders in Nederland</Link></nav>
        <h1 style={{ fontSize: 'clamp(1.9rem,3.6vw,2.7rem)' }}>{title}</h1>
        <p className="lead" style={{ maxWidth: 680, opacity: 0.9 }}>{intro}</p>
        <div className="row" style={{ marginTop: 18 }}>
          <Link href={cta} className="btn btn-lg">Plaats gratis je opdracht</Link>
          <Link href="/voor-schilders" className="btn btn-lg btn-outline-light">Ben je schilder?</Link>
        </div>
        <ul className="checks" style={{ marginTop: 20 }}>
          <li>Gescreende schilders</li><li>Maximaal 3 schilders krijgen je gegevens</li><li>Reacties meestal binnen 24 uur</li>
        </ul>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <div className="grid grid-3">
      {[
        ['Plaats je opdracht', 'Vertel in een paar stappen wat er geschilderd moet worden, met maten en foto’s.'],
        ['Ontvang reacties', 'Schilders uit de buurt reageren met een bericht en prijsindicatie. Je gegevens blijven verborgen.'],
        ['Kies je schilder', 'Vergelijk profielen en kies er maximaal drie. Pas dan wisselen jullie contactgegevens uit.'],
      ].map(([t, d], i) => (
        <div key={t} className="card"><div className="step-num">{i + 1}</div><h3>{t}</h3><p className="muted" style={{ margin: 0 }}>{d}</p></div>
      ))}
    </div>
  );
}

export function JobLinks({ place }: { place: Place }) {
  return (
    <div className="chips">
      {Object.entries(JOB_SLUGS).map(([slug, type]) => (
        <Link key={slug} href={`/schilders/${place.slug}/${slug}`} className="chip" style={{ textDecoration: 'none' }}>
          <Icon name="roller" size={14} /> {type} in {place.name}
        </Link>
      ))}
    </div>
  );
}

export function NearbyLinks({ place }: { place: Place }) {
  return (
    <div className="chips">
      {!place.isProvince && <Link href={`/schilders/${place.provinceSlug}`} className="chip" style={{ textDecoration: 'none' }}>Provincie {place.province}</Link>}
      {place.cities.map((c) => <Link key={c} href={`/schilders/${slugify(c)}`} className="chip" style={{ textDecoration: 'none' }}>Schilder {c}</Link>)}
    </div>
  );
}
