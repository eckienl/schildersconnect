'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { createAuthClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/session';
import { clean } from '@/lib/sanitize';
import { resolveBudget } from '@/lib/budget';
import { JOB_TYPES } from '@/lib/config';

type Result = { error?: string };

function parseJob(fd: FormData): { error?: string; row?: Record<string, any> } {
  const location = clean(fd.get('location_type'), 10);
  const job_type = clean(fd.get('job_type'), 60);
  const m2 = Math.round(Number(fd.get('surface_m2')));
  const title = clean(fd.get('title'), 90);
  const postcode = clean(fd.get('postcode'), 10).toUpperCase().replace(/\s/g, '');
  const city = clean(fd.get('city'), 60);
  if (!JOB_TYPES.includes(job_type as any)) return { error: 'Kies wat er geschilderd moet worden.' };
  if (!['binnen', 'buiten', 'beide'].includes(location)) return { error: 'Kies of het binnen- of buitenwerk is.' };
  if (!m2 || m2 < 1 || m2 > 20000) return { error: 'Vul een geldig aantal m² in.' };
  if (!title) return { error: 'Geef je opdracht een korte titel.' };
  if (!/^\d{4}[A-Z]{2}$/.test(postcode)) return { error: 'Vul een geldige postcode in, bijvoorbeeld 3991 AB.' };
  if (!city) return { error: 'Vul je woonplaats in.' };
  const b = resolveBudget(clean(fd.get('budget'), 20), Math.round(Number(fd.get('own_amount')) || 0));
  return {
    row: {
      title,
      location_type: location,
      job_type,
      surface_m2: m2,
      substrate: clean(fd.get('substrate'), 60),
      condition: clean(fd.get('condition'), 80),
      scaffold_needed: location === 'binnen' ? 'nee' : clean(fd.get('scaffold_needed'), 20) || 'weet niet',
      description: clean(fd.get('description'), 3000),
      postcode: postcode.replace(/^(\d{4})([A-Z]{2})$/, '$1 $2'),
      city,
      timing: clean(fd.get('timing'), 60),
      estimate_low: b.low,
      estimate_high: b.high,
      size_class: b.size,
      match_cost: b.matchCost,
    },
  };
}

async function uploadPhotos(fd: FormData, ownerId: string, max: number) {
  const client = db();
  const urls: string[] = [];
  const files = fd.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0).slice(0, Math.max(0, max));
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await client.storage.from('job-photos').upload(path, file, { contentType: file.type });
    if (!error) urls.push(client.storage.from('job-photos').getPublicUrl(path).data.publicUrl);
  }
  return urls;
}

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  return `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('x-forwarded-host') ?? h.get('host')}`;
}

export async function createJob(fd: FormData): Promise<Result> {
  const parsed = parseJob(fd);
  if (parsed.error) return { error: parsed.error };

  const { profile } = await getSession();
  let customerId = profile?.id;
  let loggedIn = Boolean(profile);
  if (profile?.role === 'schilder') return { error: 'Met een schildersaccount kun je geen opdracht plaatsen.' };

  if (!profile) {
    // Werkspot-style: the account is created at the end of the request.
    const full_name = clean(fd.get('full_name'), 120);
    const email = clean(fd.get('email'), 200).toLowerCase();
    const phone = clean(fd.get('phone'), 30);
    const password = String(fd.get('password') ?? '');
    if (!full_name || !email || !phone) return { error: 'Vul je naam, e-mailadres en telefoonnummer in.' };
    if (password.length < 8) return { error: 'Kies een wachtwoord van minimaal 8 tekens.' };
    if (fd.get('terms') !== 'on') return { error: 'Ga akkoord met de voorwaarden om je opdracht te plaatsen.' };
    const supabase = await createAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'particulier', full_name, phone }, emailRedirectTo: `${await siteUrl()}/auth/callback?next=/account` },
    });
    if (error) {
      if (error.message.toLowerCase().includes('registered')) return { error: 'Er bestaat al een account met dit e-mailadres. Log eerst in; je ingevulde opdracht blijft bewaard.' };
      return { error: 'Account aanmaken lukte niet: ' + error.message };
    }
    if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
      return { error: 'Er bestaat al een account met dit e-mailadres. Log eerst in; je ingevulde opdracht blijft bewaard.' };
    }
    customerId = data.user.id;
    loggedIn = Boolean(data.session);
  }

  const photos = await uploadPhotos(fd, customerId!, 6);
  const { data, error } = await db().from('jobs').insert({ ...parsed.row, customer_id: customerId, photos }).select('id').single();
  if (error || !data) return { error: 'Opslaan lukte niet. Probeer het opnieuw.' };
  if (loggedIn) redirect(`/account/klus/${data.id}?m=klus_geplaatst`);
  redirect(`/klus-geplaatst?email=${encodeURIComponent(clean(fd.get('email'), 200))}`);
}

export async function updateJob(jobId: string, fd: FormData): Promise<Result> {
  const { profile } = await getSession();
  if (!profile) return { error: 'Je sessie is verlopen. Log opnieuw in.' };
  const client = db();
  const { data: job } = await client.from('jobs').select('*').eq('id', jobId).maybeSingle();
  if (!job || (job.customer_id !== profile.id && profile.role !== 'admin')) return { error: 'Deze opdracht kun je niet bewerken.' };
  if (job.status !== 'open') return { error: 'Een gesloten opdracht kun je niet meer bewerken.' };

  const parsed = parseJob(fd);
  if (parsed.error) return { error: parsed.error };
  const row = parsed.row!;

  // Once a painter has paid for a match, the budget (and so the match price) is fixed.
  const { count } = await client.from('responses').select('id', { count: 'exact', head: true }).eq('job_id', jobId).eq('status', 'chosen');
  if ((count ?? 0) > 0) {
    row.estimate_low = job.estimate_low;
    row.estimate_high = job.estimate_high;
    row.size_class = job.size_class;
    row.match_cost = job.match_cost;
  }

  const remove = new Set(fd.getAll('remove_photo').map(String));
  const kept = (job.photos ?? []).filter((p: string) => !remove.has(p));
  const added = await uploadPhotos(fd, job.customer_id, 6 - kept.length);
  const { error } = await client.from('jobs').update({ ...row, photos: [...kept, ...added] }).eq('id', jobId);
  if (error) return { error: 'Opslaan lukte niet. Probeer het opnieuw.' };
  redirect(`/account/klus/${jobId}?m=bijgewerkt`);
}
