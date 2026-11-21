'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';
import { clean, stripContact } from '@/lib/sanitize';
import { BUNDLES, MAX_RESPONSES_PER_JOB, SPECIALTIES } from '@/lib/config';

async function requirePainterProfile() {
  const s = await getSession();
  if (!s.profile) redirect('/inloggen?next=/schilder');
  if (s.profile.role !== 'schilder') redirect('/account');
  return s;
}

export async function savePainter(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const { profile, painter } = await requirePainterProfile();
  const company_name = clean(formData.get('company_name'), 120);
  const kvk = clean(formData.get('kvk'), 12).replace(/\s/g, '');
  const postcode = clean(formData.get('postcode'), 10).toUpperCase();
  const city = clean(formData.get('city'), 60);
  const radius_km = Math.min(150, Math.max(5, Number(formData.get('radius_km')) || 25));
  const specialties = formData.getAll('specialties').map(String).filter((s) => SPECIALTIES.includes(s as any));
  let website = clean(formData.get('website'), 200);
  if (website && !/^https?:\/\//.test(website)) website = 'https://' + website;

  if (!company_name || !city) return { error: 'Vul je bedrijfsnaam en plaats in.' };
  if (!/^\d{8}$/.test(kvk)) return { error: 'Vul een geldig KvK-nummer van 8 cijfers in.' };
  if (!/^\d{4}\s?[A-Z]{2}$/.test(postcode)) return { error: 'Vul een geldige postcode in.' };
  if (formData.get('truth') !== 'on') return { error: 'Bevestig dat je gegevens kloppen.' };

  const row = {
    id: profile.id,
    company_name,
    kvk,
    postcode,
    city,
    radius_km,
    insured: formData.get('insured') === 'on',
    website,
    description: clean(formData.get('description'), 2000),
    specialties,
    // Re-submitting after "needs_info" puts the painter back in the queue.
    status: painter?.status === 'approved' ? 'approved' : 'pending',
  };
  const { error } = await db().from('painters').upsert(row);
  if (error) return { error: 'Opslaan lukte niet. Probeer het opnieuw.' };
  redirect(painter?.status === 'approved' ? '/schilder?m=opgeslagen' : '/schilder?m=aangemeld');
}

export async function respond(formData: FormData) {
  const { painter } = await requirePainterProfile();
  const jobId = clean(formData.get('job_id'), 64);
  if (!painter || painter.status !== 'approved') redirect('/schilder');
  const client = db();

  const { data: job } = await client.from('jobs').select('id, status, match_cost').eq('id', jobId).maybeSingle();
  if (!job || job.status !== 'open') redirect(`/schilder/klus/${jobId}?m=klus_gesloten`);
  if (painter.credits < job.match_cost) redirect(`/schilder/klus/${jobId}?m=te_weinig_credits`);

  const { count } = await client.from('responses').select('id', { count: 'exact', head: true }).eq('job_id', jobId);
  if ((count ?? 0) >= MAX_RESPONSES_PER_JOB) redirect(`/schilder/klus/${jobId}?m=vol`);

  const message = stripContact(clean(formData.get('message'), 1500));
  const price_indication = stripContact(clean(formData.get('price_indication'), 60));
  if (message.length < 20) redirect(`/schilder/klus/${jobId}?m=${encodeURIComponent('Schrijf een bericht van minimaal 20 tekens.')}`);

  const { error } = await client.from('responses').insert({ job_id: jobId, painter_id: painter.id, message, price_indication });
  if (error) redirect(`/schilder/klus/${jobId}?m=${error.code === '23505' ? 'al_gereageerd' : 'fout'}`);
  redirect(`/schilder/klus/${jobId}?m=gereageerd`);
}

export async function requestBundle(formData: FormData) {
  const { painter } = await requirePainterProfile();
  if (!painter || painter.status !== 'approved') redirect('/schilder');
  const bundle = BUNDLES.find((b) => b.id === formData.get('bundle'));
  if (!bundle) redirect('/schilder/credits?m=fout');
  await db().from('purchases').insert({ painter_id: painter.id, bundle: bundle.name, price_eur: bundle.priceCents /* cents excl. btw */, credits: bundle.credits });
  redirect('/schilder/credits?m=aankoop_aangevraagd');
}

export async function saveWeeklyLimit(formData: FormData) {
  const { painter } = await requirePainterProfile();
  if (!painter) redirect('/schilder');
  const raw = clean(formData.get('weekly_limit'), 6);
  const value = raw === '' ? null : Math.max(0, Math.round(Number(raw)) || 0);
  await db().from('painters').update({ weekly_limit: value }).eq('id', painter.id);
  redirect('/schilder/credits?m=opgeslagen');
}
