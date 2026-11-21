/** Provinces and their largest places, for the national SEO pages (/schilders/...). */
export const PROVINCES: { name: string; slug: string; cities: string[] }[] = [
  { name: 'Groningen', slug: 'groningen-provincie', cities: ['Groningen', 'Hoogezand', 'Veendam', 'Stadskanaal', 'Delfzijl', 'Winschoten', 'Leek', 'Haren'] },
  { name: 'Friesland', slug: 'friesland', cities: ['Leeuwarden', 'Sneek', 'Heerenveen', 'Drachten', 'Harlingen', 'Franeker', 'Dokkum', 'Joure'] },
  { name: 'Drenthe', slug: 'drenthe', cities: ['Assen', 'Emmen', 'Hoogeveen', 'Meppel', 'Coevorden', 'Roden'] },
  { name: 'Overijssel', slug: 'overijssel', cities: ['Zwolle', 'Enschede', 'Deventer', 'Hengelo', 'Almelo', 'Kampen', 'Oldenzaal', 'Rijssen', 'Hardenberg'] },
  { name: 'Flevoland', slug: 'flevoland', cities: ['Almere', 'Lelystad', 'Dronten', 'Emmeloord', 'Zeewolde'] },
  { name: 'Gelderland', slug: 'gelderland', cities: ['Arnhem', 'Nijmegen', 'Apeldoorn', 'Ede', 'Doetinchem', 'Harderwijk', 'Zutphen', 'Tiel', 'Wageningen', 'Barneveld', 'Culemborg', 'Winterswijk'] },
  { name: 'Utrecht', slug: 'utrecht-provincie', cities: ['Utrecht', 'Amersfoort', 'Nieuwegein', 'Veenendaal', 'Zeist', 'Houten', 'IJsselstein', 'Woerden', 'Soest', 'De Bilt', 'Maarssen', 'Leusden'] },
  { name: 'Noord-Holland', slug: 'noord-holland', cities: ['Amsterdam', 'Haarlem', 'Zaandam', 'Hilversum', 'Alkmaar', 'Hoorn', 'Purmerend', 'Amstelveen', 'Den Helder', 'Heerhugowaard', 'Hoofddorp', 'Bussum'] },
  { name: 'Zuid-Holland', slug: 'zuid-holland', cities: ['Rotterdam', 'Den Haag', 'Leiden', 'Dordrecht', 'Zoetermeer', 'Delft', 'Gouda', 'Alphen aan den Rijn', 'Schiedam', 'Vlaardingen', 'Spijkenisse', 'Westland', 'Capelle aan den IJssel'] },
  { name: 'Zeeland', slug: 'zeeland', cities: ['Middelburg', 'Vlissingen', 'Goes', 'Terneuzen', 'Zierikzee'] },
  { name: 'Noord-Brabant', slug: 'noord-brabant', cities: ['Eindhoven', 'Tilburg', 'Breda', "'s-Hertogenbosch", 'Helmond', 'Oss', 'Roosendaal', 'Bergen op Zoom', 'Waalwijk', 'Veghel', 'Uden', 'Oosterhout'] },
  { name: 'Limburg', slug: 'limburg', cities: ['Maastricht', 'Venlo', 'Heerlen', 'Sittard', 'Roermond', 'Weert', 'Kerkrade', 'Geleen', 'Venray'] },
];

export function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export type Place = { name: string; slug: string; province: string; provinceSlug: string; isProvince: boolean; cities: string[] };

export function allPlaces(): Place[] {
  const out: Place[] = [];
  for (const p of PROVINCES) {
    out.push({ name: p.name, slug: p.slug, province: p.name, provinceSlug: p.slug, isProvince: true, cities: p.cities });
    for (const c of p.cities) out.push({ name: c, slug: slugify(c), province: p.name, provinceSlug: p.slug, isProvince: false, cities: p.cities.filter((x) => x !== c) });
  }
  return out;
}

export function findPlace(slug: string) {
  return allPlaces().find((p) => p.slug === slug);
}

/** Job types as URL slugs for /schilders/[plaats]/[klus]. */
export const JOB_SLUGS: Record<string, string> = {
  'muren-en-plafonds': 'Muren en plafonds',
  'latex-spuiten': 'Latex spuitwerk',
  'kozijnen-schilderen': 'Kozijnen en deuren',
  'buitenschilderwerk': 'Buitengevel / houtwerk',
  'trap-schilderen': 'Trap en trapgat',
  'behang-en-glasvlies': 'Behang en glasvlies',
  'huis-schilderen': 'Compleet huis',
  'bedrijfspand-schilderen': 'Zakelijk / bedrijfspand',
};
