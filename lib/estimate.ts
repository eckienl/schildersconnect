import { MATCH_COST } from './config';

export type LocationType = 'binnen' | 'buiten' | 'beide';
export type SizeClass = keyof typeof MATCH_COST;

const RATES: Record<LocationType, [number, number]> = {
  binnen: [30, 35],
  buiten: [35, 40],
  beide: [32, 40],
};

/** Indicative price range incl. materials and VAT, based on average market rates per m2. */
export function estimate(location: LocationType, m2: number) {
  const [lo, hi] = RATES[location] ?? RATES.binnen;
  const low = Math.round((m2 * lo) / 10) * 10;
  const high = Math.round((m2 * hi) / 10) * 10;
  const mid = (low + high) / 2;
  const size: SizeClass = mid < 1000 ? 'klein' : mid <= 5000 ? 'middel' : 'groot';
  return { low, high, size, matchCost: MATCH_COST[size] };
}

export function euro(n: number) {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
