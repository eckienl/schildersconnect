import { MATCH_COST } from './config';

export type SizeClass = keyof typeof MATCH_COST;

/** Budget options the customer picks from. They also set the match price for painters. */
export const BUDGETS = [
  { id: 'klein', label: 'Tot € 1.000', hint: 'Bijv. één kamer, een deur of een paar kozijnen', low: 0, high: 1000, size: 'klein' as SizeClass },
  { id: 'middel', label: '€ 1.000 – € 5.000', hint: 'Bijv. een verdieping of alle kozijnen buiten', low: 1000, high: 5000, size: 'middel' as SizeClass },
  { id: 'groot', label: 'Meer dan € 5.000', hint: 'Bijv. een heel huis, bedrijfspand of VvE', low: 5000, high: 0, size: 'groot' as SizeClass },
  { id: 'onbekend', label: 'Weet ik nog niet', hint: 'De schilder adviseert je', low: 0, high: 0, size: 'middel' as SizeClass },
] as const;

export function sizeForAmount(amount: number): SizeClass {
  if (amount < 1000) return 'klein';
  if (amount <= 5000) return 'middel';
  return 'groot';
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
  const b = BUDGETS.find((x) => x.id === budgetId) ?? BUDGETS[3];
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
