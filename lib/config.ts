// Business rules in one place.

/** A customer can choose at most this many painters per job (each choice = a match). */
export const MAX_CHOSEN_PER_JOB = 3;
/** Painters can react for free, up to this many reactions per job. */
export const MAX_RESPONSES_PER_JOB = 8;
/** Welcome credits, only for the first WELCOME_LIMIT approved painters: enough for one small or medium match. */
export const WELCOME_CREDITS = 20;
export const WELCOME_LIMIT = 50;

export const VAT = 0.21;

/**
 * Price of one credit, excl. VAT. Not rounded on purpose: it is the outcome of the cost model in the
 * business plan (marketing per request, support, screening, platform, payment fees, refund reserve, margin).
 */
export const CREDIT_PRICE_EX = 1.1178;

/** Credits charged per match, by job size (estimated job value, see lib/budget.ts). About half of a Werkspot lead. */
export const MATCH_COST = { klein: 10, middel: 20, groot: 35, extra: 50 } as const;

/** Size classes by estimated job value in euro (from = inclusive lower bound). */
export const SIZE_CLASSES = [
  { id: 'klein', name: 'Klein', range: 'tot € 500', from: 0 },
  { id: 'middel', name: 'Middel', range: '€ 500 – € 2.000', from: 500 },
  { id: 'groot', name: 'Groot', range: '€ 2.000 – € 5.000', from: 2000 },
  { id: 'extra', name: 'Extra groot', range: 'boven € 5.000', from: 5000 },
] as const;

/** Bundles, prices in cents excl. VAT. Volume discount: Plus 5%, Pro 10%. */
export const BUNDLES = [
  { id: 'start', name: 'Start', credits: 50, priceCents: 5589, discount: '' },
  { id: 'plus', name: 'Plus', credits: 120, priceCents: 12743, discount: '5% korting' },
  { id: 'pro', name: 'Pro', credits: 250, priceCents: 25151, discount: '10% korting' },
] as const;

/** Euro amount with cents, e.g. 51.43 -> "€ 51,43". */
export function eur(amount: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}
export const exVat = (cents: number) => cents / 100;
export const inclVat = (cents: number) => Math.round(cents * (1 + VAT)) / 100;
export const matchPriceEx = (credits: number) => Math.round(credits * CREDIT_PRICE_EX * 100) / 100;

export const JOB_TYPES = [
  'Muren en plafonds',
  'Latex spuitwerk',
  'Kozijnen en deuren',
  'Buitengevel / houtwerk',
  'Trap en trapgat',
  'Behang en glasvlies',
  'Compleet huis',
  'Zakelijk / bedrijfspand',
  'Overig',
] as const;

export const SUBSTRATES = ['Weet ik niet', 'Stucwerk', 'Hout', 'Gipsplaat', 'Beton / steen', 'Metaal', 'Kunststof', 'Behang / glasvlies'] as const;
export const CONDITIONS = ['Weet ik niet', 'Goed, alleen opfrissen', 'Bladdert of scheurt hier en daar', 'Slecht, veel voorbereiding nodig', 'Nieuw / nog nooit geschilderd'] as const;
export const TIMINGS = ['Zo snel mogelijk', 'Binnen 1 maand', 'Binnen 3 maanden', 'Flexibel / winterperiode'] as const;
export const SPECIALTIES = ['Binnenschilderwerk', 'Buitenschilderwerk', 'Latex spuiten', 'Behangen', 'Houtrot herstel', 'Glaszetten', 'Zakelijk / VvE'] as const;

/** "10 credits (€ 11,18)" etc. for every size class, used in explanatory texts. */
export function matchCostSummary() {
  return SIZE_CLASSES.map((c) => `${MATCH_COST[c.id]} credits (${eur(matchPriceEx(MATCH_COST[c.id]))}) bij een klus ${c.range}`);
}
