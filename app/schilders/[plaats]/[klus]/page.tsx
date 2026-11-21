import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JOB_SLUGS, findPlace } from '@/lib/places';
import { RATE_PER_M2, euro } from '@/lib/budget';
import { placeCounts } from '@/lib/seo';
import { HowItWorks, JobLinks, NearbyLinks, PlaceHero, priceRange } from '../../PlaceContent';

const EXAMPLE_M2: Record<string, number> = {
  'Muren en plafonds': 60, 'Latex spuitwerk': 80, 'Kozijnen en deuren': 30, 'Buitengevel / houtwerk': 45,
  'Trap en trapgat': 25, 'Behang en glasvlies': 40, 'Compleet huis': 200, 'Zakelijk / bedrijfspand': 300,
};

export async function generateMetadata({ params }: { params: Promise<{ plaats: string; klus: string }> }): Promise<Metadata> {
  const { plaats, klus } = await params;
  const p = findPlace(plaats);
  const type = JOB_SLUGS[klus];
  if (!p || !type) return {};
  return {
    title: `${type} in ${p.name} – vergelijk schilders | SchildersConnect`,
    description: `${type} laten doen in ${p.name}? Indicatie ${priceRange(type)} per m². Plaats gratis je opdracht en ontvang reacties van gescreende schilders.`,
  };
}

export default async function Page({ params }: { params: Promise<{ plaats: string; klus: string }> }) {
  const { plaats, klus } = await params;
  const p = findPlace(plaats);
  const type = JOB_SLUGS[klus];
  if (!p || !type) notFound();
  const counts = await placeCounts(p.isProvince ? p.cities : [p.name]);
  const m2 = EXAMPLE_M2[type] ?? 50;
  const rate = RATE_PER_M2[type] ?? 20;
  return (
    <>
      <PlaceHero
        title={<>{type} in <span className="accent">{p.name}</span></>}
        intro={`${type} laten doen in ${p.isProvince ? 'de provincie ' + p.name : p.name}? Beschrijf je opdracht in een paar stappen en ontvang reacties van gescreende schilders uit de buurt. Gratis en vrijblijvend.`}
        cta={`/klus-plaatsen?soort=${encodeURIComponent(type)}${p.isProvince ? '' : `&plaats=${encodeURIComponent(p.name)}`}`}
      />
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'start' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.3rem' }}>Wat kost {type.toLowerCase()} in {p.name}?</h2>
              <p>Reken op ongeveer <strong>{priceRange(type)} per m²</strong>, inclusief materiaal en btw.</p>
              <p className="muted">Voorbeeld: {m2} m² kost dan rond de {euro(Math.round(m2 * rate * 0.85))} tot {euro(Math.round(m2 * rate * 1.15))}. Slecht schilderwerk, houtrot of een steiger maken het duurder.</p>
            </div>
            <div className="card">
              <h2 style={{ fontSize: '1.3rem' }}>Nu in {p.name}</h2>
              <p><strong>{counts.jobs}</strong> open opdrachten en <strong>{counts.painters}</strong> gescreende schilders.</p>
              <p className="muted" style={{ margin: 0 }}>Opdrachtgevers betalen niets. Alleen de schilders die jij kiest krijgen je contactgegevens.</p>
            </div>
          </div>
          <h2 style={{ marginTop: 44 }}>Zo werkt het</h2>
          <HowItWorks />
          <h2 style={{ marginTop: 44 }}>Ander schilderwerk in {p.name}</h2>
          <JobLinks place={p} />
          <h2 style={{ marginTop: 44 }}>In de buurt</h2>
          <NearbyLinks place={p} />
        </div>
      </section>
    </>
  );
}
