import { MATCH_COST, SIZE_CLASSES } from './config';

export type SizeClass = keyof typeof MATCH_COST;

/** Budget options the customer picks from. They also set the match price for painters. */
export const BUDGETS = [
  { id: 'klein', label: 'Tot € 500', hint: 'Bijv. één kamer, een deur of een plafond', low: 0, high: 500, size: 'klein' as SizeClass },
  { id: 'middel', label: '€ 500 – € 2.000', hint: 'Bijv. een paar kamers of een trapgat', low: 500, high: 2000, size: 'middel' as SizeClass },
  { id: 'groot', label: '€ 2.000 – € 5.000', hint: 'Bijv. een verdieping of alle kozijnen buiten', low: 2000, high: 5000, size: 'groot' as SizeClass },
  { id: 'extra', label: 'Meer dan € 5.000', hint: 'Bijv. een heel huis, buitengevel, bedrijfspand of VvE', low: 5000, high: 0, size: 'extra' as SizeClass },
  { id: 'onbekend', label: 'Weet ik nog niet', hint: 'De schilder adviseert je', low: 0, high: 0, size: 'middel' as SizeClass },
] as const;

export function sizeForAmount(amount: number): SizeClass {
  let size: SizeClass = 'klein';
  for (const c of SIZE_CLASSES) if (amount >= c.from) size = c.id;
  return size;
}

export function sizeLabel(size: string) {
  const c = SIZE_CLASSES.find((x) => x.id === size);
  return c ? `${c.name.toLowerCase()} (${c.range})` : size;
}

/**
 * The customer either picks a range or types an own indicative price (richtprijs).
 * An own amount wins. Stored in jobs.estimate_low / estimate_high:
 *  - own amount: low = high = amount
 *  - range: low / high of the range (high 0 = open-ended)
 *  - unknown: 0 / 0
 */
export function resolveBudget(budgetId: string, ownAmount: number) {
  if (ownAmount > 0) {
    const size = sizeForAmount(ownAmount);
    return { low: ownAmount, high: ownAmount, size, matchCost: MATCH_COST[size] };
  }
  const b = BUDGETS.find((x) => x.id === budgetId) ?? BUDGETS[4];
  return { low: b.low, high: b.high, size: b.size, matchCost: MATCH_COST[b.size] };
}

export function budgetIdFor(low: number, high: number): { id: string; own: number } {
  if (low > 0 && low === high) return { id: 'onbekend', own: low };
  const b = BUDGETS.find((x) => x.low === low && x.high === high);
  return { id: b?.id ?? 'onbekend', own: 0 };
}

export function euro(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export function budgetLabel(job: { estimate_low: number; estimate_high: number }) {
  const { estimate_low: low, estimate_high: high } = job;
  if (low > 0 && low === high) return `Richtprijs klant: ${euro(low)}`;
  if (low === 0 && high === 0) return 'Budget: nog onbekend';
  if (high === 0) return `Budget: meer dan ${euro(low)}`;
  if (low === 0) return `Budget: tot ${euro(high)}`;
  return `Budget: ${euro(low)} – ${euro(high)}`;
}

/**
 * Objective job size, so the match price cannot be gamed by the customer's budget choice.
 * Indicative labour+material rates per m2 (market averages for painting work in NL).
 */
export const RATE_PER_M2: Record<string, number> = {
  'Muren en plafonds': 13,
  'Latex spuitwerk': 8,
  'Kozijnen en deuren': 35,
  'Buitengevel / houtwerk': 38,
  'Trap en trapgat': 30,
  'Behang en glasvlies': 18,
  'Compleet huis': 20,
  'Zakelijk / bedrijfspand': 20,
  Overig: 20,
};
const CONDITION_FACTOR: Record<string, number> = {
  'Bladdert of scheurt hier en daar': 1.15,
  'Slecht, veel voorbereiding nodig': 1.3,
};

export function estimatedValue(job: { job_type: string; surface_m2: number; condition?: string; scaffold_needed?: string; location_type?: string }) {
  const rate = RATE_PER_M2[job.job_type] ?? 20;
  let value = rate * (job.surface_m2 || 0) * (CONDITION_FACTOR[job.condition ?? ''] ?? 1);
  if (job.scaffold_needed === 'ja') value *= 1.2;
  return Math.round(value);
}

const ORDER: SizeClass[] = SIZE_CLASSES.map((c) => c.id);

/**
 * Final size class = the higher of (a) the estimate from the job details and (b) the customer's budget.
 * A low budget can never make a big job cheap; a high budget can make it more expensive.
 */
export function sizeForJob(job: { job_type: string; surface_m2: number; condition?: string; scaffold_needed?: string; estimate_low: number; estimate_high: number }) {
  const est = estimatedValue(job);
  const fromEstimate = sizeForAmount(est);
  let fromBudget: SizeClass = 'klein';
  const { estimate_low: low, estimate_high: high } = job;
  if (low > 0) fromBudget = sizeForAmount(low); // own amount or lower bound of the chosen range
  const size = ORDER[Math.max(ORDER.indexOf(fromEstimate), ORDER.indexOf(fromBudget))];
  const basis = ORDER.indexOf(fromBudget) > ORDER.indexOf(fromEstimate) ? 'budget' : 'opdracht';
  return { size, matchCost: MATCH_COST[size], estimate: est, basis: basis as 'budget' | 'opdracht' };
}
