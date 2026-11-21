import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findPlace } from '@/lib/places';
import { JOB_TYPES } from '@/lib/config';
import { placeCounts } from '@/lib/seo';
import { HowItWorks, JobLinks, NearbyLinks, PlaceHero, priceRange } from '../PlaceContent';

export async function generateMetadata({ params }: { params: Promise<{ plaats: string }> }): Promise<Metadata> {
  const p = findPlace((await params).plaats);
  if (!p) return {};
  return {
    title: `Schilder in ${p.name} – gratis reacties van gescreende schilders | SchildersConnect`,
    description: `Op zoek naar een schilder in ${p.name}? Plaats gratis je opdracht en ontvang reacties van gescreende schilders uit ${p.isProvince ? 'jouw provincie' : `${p.name} en omgeving`}. Je kiest zelf wie je gegevens krijgt.`,
  };
}

export default async function Page({ params }: { params: Promise<{ plaats: string }> }) {
  const p = findPlace((await params).plaats);
  if (!p) notFound();
  const counts = await placeCounts(p.isProvince ? p.cities : [p.name]);
  const where = p.isProvince ? `de provincie ${p.name}` : p.name;
  return (
    <>
      <PlaceHero
        title={<>Schilder in <span className="accent">{p.name}</span></>}
        intro={`Een betrouwbare schilder vinden in ${where}? Plaats gratis je opdracht met maten en foto's. Gescreende schilders uit de buurt reageren, en jij kiest zelf met wie je in contact komt.`}
        cta={`/klus-plaatsen${p.isProvince ? '' : `?plaats=${encodeURIComponent(p.name)}`}`}
      />
      <section className="section">
        <div className="container">
          <div className="counters">
            <div className="counter"><div><div className="num">{counts.jobs}</div><div className="lbl">open opdrachten in {p.name}</div></div></div>
            <div className="counter"><div><div className="num">{counts.painters}</div><div className="lbl">gescreende schilders in {p.name}</div></div></div>
            <div className="counter"><div><div className="num">€ 0</div><div className="lbl">kosten voor jou als opdrachtgever</div></div></div>
          </div>
          <h2 style={{ marginTop: 44 }}>Wat kost een schilder in {p.name}?</h2>
          <p className="muted">Indicatieve prijzen per m², inclusief materiaal en btw. De echte prijs hangt af van de ondergrond, de staat van het huidige werk en de bereikbaarheid. Schilders geven in hun reactie een prijsindicatie.</p>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Soort werk</th><th>Indicatie per m²</th></tr></thead>
              <tbody>{JOB_TYPES.filter((t) => t !== 'Overig').map((t) => <tr key={t}><td>{t}</td><td>{priceRange(t)}</td></tr>)}</tbody>
            </table>
          </div>
          <h2 style={{ marginTop: 44 }}>Zo werkt het</h2>
          <HowItWorks />
          <h2 style={{ marginTop: 44 }}>Soorten schilderwerk in {p.name}</h2>
          <JobLinks place={p} />
          <h2 style={{ marginTop: 44 }}>{p.isProvince ? `Plaatsen in ${p.name}` : `Schilders in de buurt van ${p.name}`}</h2>
          <NearbyLinks place={p} />
        </div>
      </section>
    </>
  );
}
