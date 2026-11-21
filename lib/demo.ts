import 'server-only';
import { createHmac } from 'crypto';
import { db } from './supabase/admin';
import { SUPABASE_SERVICE_ROLE_KEY } from './env';

/** Demo mode lets you click through every role without creating e-mail accounts. Turn off before launch. */
export const DEMO_ENABLED = process.env.DEMO_MODE === 'true';

export type DemoRole = 'particulier' | 'schilder_nieuw' | 'schilder' | 'admin';

export const DEMO_USERS: Record<DemoRole, { email: string; name: string; phone: string; role: 'particulier' | 'schilder' | 'admin'; label: string }> = {
  particulier: { email: 'demo-particulier@schildersconnect.nl', name: 'Sanne de Vries', phone: '06 12 34 56 78', role: 'particulier', label: 'Particulier' },
  schilder_nieuw: { email: 'demo-schilder-nieuw@schildersconnect.nl', name: 'Mark Jansen', phone: '06 23 45 67 89', role: 'schilder', label: 'Schilder (in behandeling)' },
  schilder: { email: 'demo-schilder@schildersconnect.nl', name: 'Peter van Dijk', phone: '06 98 76 54 32', role: 'schilder', label: 'Schilder (goedgekeurd)' },
  admin: { email: 'demo-admin@schildersconnect.nl', name: 'Beheer SchildersConnect', phone: '030 000 00 00', role: 'admin', label: 'Admin' },
};

export function demoPassword(email: string) {
  return 'Demo-' + createHmac('sha256', SUPABASE_SERVICE_ROLE_KEY).update(email).digest('hex').slice(0, 24);
}

export function isDemoEmail(email: string) {
  return Object.values(DEMO_USERS).some((u) => u.email === email);
}

async function ensureUser(key: DemoRole): Promise<string> {
  const u = DEMO_USERS[key];
  const client = db();
  const { data: existing } = await client.from('profiles').select('id').eq('email', u.email).maybeSingle();
  let id = existing?.id as string | undefined;
  if (!id) {
    const { data, error } = await client.auth.admin.createUser({
      email: u.email,
      password: demoPassword(u.email),
      email_confirm: true,
      user_metadata: { role: u.role === 'admin' ? 'particulier' : u.role, full_name: u.name, phone: u.phone },
    });
    if (error && !error.message.toLowerCase().includes('already')) throw error;
    id = data?.user?.id;
    if (!id) {
      // Auth user exists but profile is missing: look it up.
      const { data: list } = await client.auth.admin.listUsers({ perPage: 200 });
      id = ((list as any)?.users ?? []).find((x: any) => x.email === u.email)?.id;
    }
  }
  if (!id) throw new Error('Demo-account kon niet worden aangemaakt');
  await client.from('profiles').upsert({ id, role: u.role, full_name: u.name, email: u.email, phone: u.phone });
  return id;
}

const DEMO_JOBS = [
  {
    title: 'Woonkamer en hal sauzen',
    location_type: 'binnen',
    job_type: 'Muren en plafonds',
    surface_m2: 95,
    substrate: 'Stucwerk',
    condition: 'Goed, alleen opfrissen',
    scaffold_needed: 'weet niet',
    description: 'Muren en plafond van de woonkamer (ca. 35 m²) en de hal met trapgat. Kleur gebroken wit. Meubels zetten we zelf aan de kant.',
    postcode: '3991 AB',
    city: 'Houten',
    timing: 'Binnen 1 maand',
    estimate_low: 1000,
    estimate_high: 5000,
    size_class: 'middel',
    match_cost: 16,
  },
  {
    title: 'Kozijnen en voordeur buiten schilderen',
    location_type: 'buiten',
    job_type: 'Kozijnen en deuren',
    surface_m2: 40,
    substrate: 'Hout',
    condition: 'Bladdert of scheurt hier en daar',
    scaffold_needed: 'nee',
    description: 'Tussenwoning, 6 kozijnen voorkant en achterkant plus de voordeur. Een paar plekken houtrot bij de onderdorpel.',
    postcode: '3701 CD',
    city: 'Zeist',
    timing: 'Binnen 3 maanden',
    estimate_low: 1800,
    estimate_high: 1800,
    size_class: 'middel',
    match_cost: 16,
  },
];

const OTHER_JOBS = [
  { title: 'Slaapkamer latex spuiten', location_type: 'binnen', job_type: 'Latex spuitwerk', surface_m2: 50, city: 'Nieuwegein', postcode: '3431 EF', estimate_low: 0, estimate_high: 1000, size_class: 'klein', match_cost: 6, timing: 'Zo snel mogelijk' },
  { title: 'Vrijstaande woning buitenschilderwerk', location_type: 'buiten', job_type: 'Buitengevel / houtwerk', surface_m2: 220, city: 'Utrecht', postcode: '3584 GH', estimate_low: 5000, estimate_high: 0, size_class: 'groot', match_cost: 32, timing: 'Flexibel / winterperiode' },
  { title: 'Trap en trapgat schilderen', location_type: 'binnen', job_type: 'Trap en trapgat', surface_m2: 30, city: 'Amersfoort', postcode: '3811 JK', estimate_low: 0, estimate_high: 0, size_class: 'middel', match_cost: 16, timing: 'Binnen 1 maand' },
];

/** Creates the demo accounts and example data if they do not exist yet. */
export async function ensureDemo(reset = false) {
  const client = db();
  const ids = {} as Record<DemoRole, string>;
  for (const key of Object.keys(DEMO_USERS) as DemoRole[]) ids[key] = await ensureUser(key);

  const { error: painterError } = await client.from('painters').upsert([
    {
      id: ids.schilder,
      company_name: 'Van Dijk Schilderwerken',
      kvk: '12345678',
      postcode: '3511 AB',
      city: 'Utrecht',
      radius_km: 30,
      insured: true,
      website: 'https://www.vandijkschilderwerken.nl',
      description: 'Al 15 jaar schildersbedrijf in de regio Utrecht. Binnen- en buitenschilderwerk, houtrotherstel en latex spuiten. 5 jaar garantie op buitenwerk.',
      specialties: ['Binnenschilderwerk', 'Buitenschilderwerk', 'Houtrot herstel'],
      status: 'approved',
      admin_note: '',
      approved_at: new Date().toISOString(),
    },
    {
      id: ids.schilder_nieuw,
      company_name: 'Jansen Afbouw',
      kvk: '87654321',
      postcode: '3431 AA',
      city: 'Nieuwegein',
      radius_km: 20,
      insured: true,
      website: '',
      description: 'Startende zzp-schilder, gespecialiseerd in latex spuiten en binnenwerk.',
      specialties: ['Binnenschilderwerk', 'Latex spuiten'],
      status: 'pending',
      admin_note: '',
      approved_at: null,
    },
  ]);
  if (painterError) throw new Error('Demo-schilders aanmaken mislukt: ' + painterError.message);

  const { count } = await client.from('jobs').select('id', { count: 'exact', head: true }).eq('customer_id', ids.particulier);
  if (reset || !count) {
    // Wipe and rebuild all demo data.
    await client.from('jobs').delete().in('customer_id', [ids.particulier, ids.admin]);
    await client.from('credit_transactions').delete().in('painter_id', [ids.schilder, ids.schilder_nieuw]);
    await client.from('purchases').delete().in('painter_id', [ids.schilder, ids.schilder_nieuw]);
    await client.from('painters').update({ credits: 100, weekly_limit: null }).eq('id', ids.schilder);
    await client.from('painters').update({ credits: 0, status: 'pending' }).eq('id', ids.schilder_nieuw);
    await client.from('credit_transactions').insert([
      { painter_id: ids.schilder, amount: 25, reason: 'welkom', note: 'Demo' },
      { painter_id: ids.schilder, amount: 75, reason: 'correctie', note: 'Demotegoed' },
    ]);

    const { data: mine } = await client.from('jobs').insert(DEMO_JOBS.map((j) => ({ ...j, customer_id: ids.particulier }))).select('id, title');
    // Jobs of "other customers" (owned by the demo admin account) so the painter has more to browse.
    await client.from('jobs').insert(
      OTHER_JOBS.map((j) => ({ ...j, substrate: 'Weet ik niet', condition: 'Weet ik niet', scaffold_needed: 'weet niet', description: 'Voorbeeldklus voor de demo.', customer_id: ids.admin })),
    );
    const first = mine?.find((j) => j.title.startsWith('Woonkamer'));
    if (first) {
      await client.from('responses').insert({
        job_id: first.id,
        painter_id: ids.schilder,
        message: 'Goedemiddag Sanne, wij doen dit soort klussen dagelijks in Houten en omgeving. We kunnen over twee weken starten en zijn in 3 dagen klaar, inclusief afplakken en opruimen. Graag kom ik even langs om te kijken.',
        price_indication: '€ 1.650 incl. btw',
      });
    }
    await client.from('purchases').insert({ painter_id: ids.schilder, bundle: 'Plus', price_eur: 11725, credits: 60 });
  }
  return ids;
}
