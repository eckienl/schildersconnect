// Business rules in one place.

/** A customer can choose at most this many painters per job (each choice = a match). */
export const MAX_CHOSEN_PER_JOB = 3;
/** Painters can react for free, up to this many reactions per job. */
export const MAX_RESPONSES_PER_JOB = 8;
/** Credits a painter gets once, when approved. */
export const WELCOME_CREDITS = 25;

/** Credits charged per match, by job size. 1 credit = EUR 1. */
export const MATCH_COST = { klein: 15, middel: 25, groot: 40 } as const;

export const BUNDLES = [
  { id: 'start', name: 'Start', priceEur: 50, credits: 50, bonus: '' },
  { id: 'plus', name: 'Plus', priceEur: 100, credits: 110, bonus: '+10%' },
  { id: 'pro', name: 'Pro', priceEur: 250, credits: 300, bonus: '+20%' },
] as const;

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
