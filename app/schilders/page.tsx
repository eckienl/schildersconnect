import Link from 'next/link';
import { PROVINCES, slugify } from '@/lib/places';

export const metadata = {
  title: 'Schilders in heel Nederland – SchildersConnect',
  description: 'Vind een gescreende schilder in jouw plaats. Plaats gratis je schilderopdracht en ontvang reacties van schilders uit de buurt.',
};

export default function Page() {
  return (
    <>
      <section className="hero">
        <div className="container" style={{ padding: '56px 24px' }}>
          <h1 style={{ fontSize: 'clamp(1.9rem,3.6vw,2.6rem)' }}>Schilders in <span className="accent">heel Nederland</span></h1>
          <p className="lead" style={{ maxWidth: 640, opacity: 0.9 }}>Kies je provincie of plaats. Plaats gratis je opdracht en ontvang reacties van gescreende schilders uit de buurt.</p>
          <Link href="/klus-plaatsen" className="btn btn-lg" style={{ marginTop: 16 }}>Plaats gratis je opdracht</Link>
        </div>
      </section>
      <section className="section">
        <div className="container grid grid-3">
          {PROVINCES.map((p) => (
            <div key={p.slug} className="card">
              <h2 style={{ fontSize: '1.2rem' }}><Link href={`/schilders/${p.slug}`} style={{ textDecoration: 'none' }}>Schilder in {p.name}</Link></h2>
              <div className="chips">
                {p.cities.map((c) => <Link key={c} href={`/schilders/${slugify(c)}`} className="chip" style={{ textDecoration: 'none' }}>{c}</Link>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
