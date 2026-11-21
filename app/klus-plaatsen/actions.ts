'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';
import { clean } from '@/lib/sanitize';
import { estimate, type LocationType } from '@/lib/estimate';
import { JOB_TYPES } from '@/lib/config';

export async function createJob(formData: FormData): Promise<{ error?: string }> {
  const { profile } = await getSession();
  if (!profile) return { error: 'Je sessie is verlopen. Log opnieuw in.' };
  if (profile.role === 'schilder') return { error: 'Met een schildersaccount kun je geen klus plaatsen.' };

  const location = clean(formData.get('location_type'), 10) as LocationType;
  const job_type = clean(formData.get('job_type'), 60);
  const m2 = Math.round(Number(formData.get('surface_m2')));
  const title = clean(formData.get('title'), 90);
  const postcode = clean(formData.get('postcode'), 10).toUpperCase();
  const city = clean(formData.get('city'), 60);

  if (!['binnen', 'buiten', 'beide'].includes(location)) return { error: 'Kies of het binnen- of buitenwerk is.' };
  if (!JOB_TYPES.includes(job_type as any)) return { error: 'Kies wat er geschilderd moet worden.' };
  if (!m2 || m2 < 1 || m2 > 20000) return { error: 'Vul een geldig aantal m² in.' };
  if (!title) return { error: 'Geef je klus een korte titel.' };
  if (!/^\d{4}\s?[A-Z]{2}$/.test(postcode)) return { error: 'Vul een geldige postcode in, bijvoorbeeld 3991 AB.' };
  if (!city) return { error: 'Vul je woonplaats in.' };

  const est = estimate(location, m2);
  const client = db();

  // Photos (already resized in the browser).
  const photos: string[] = [];
  const files = formData.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0).slice(0, 6);
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const path = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await client.storage.from('job-photos').upload(path, file, { contentType: file.type, upsert: false });
    if (!error) photos.push(client.storage.from('job-photos').getPublicUrl(path).data.publicUrl);
  }

  const { data, error } = await client
    .from('jobs')
    .insert({
      customer_id: profile.id,
      title,
      location_type: location,
      job_type,
      surface_m2: m2,
      substrate: clean(formData.get('substrate'), 60),
      condition: clean(formData.get('condition'), 80),
      scaffold_needed: clean(formData.get('scaffold_needed'), 20) || 'weet niet',
      description: clean(formData.get('description'), 3000),
      postcode: postcode.replace(/\s/g, '').replace(/^(\d{4})([A-Z]{2})$/, '$1 $2'),
      city,
      timing: clean(formData.get('timing'), 60),
      estimate_low: est.low,
      estimate_high: est.high,
      size_class: est.size,
      match_cost: est.matchCost,
      photos,
    })
    .select('id')
    .single();

  if (error || !data) return { error: 'Opslaan lukte niet. Probeer het opnieuw.' };
  redirect(`/account/klus/${data.id}?m=klus_geplaatst`);
}
