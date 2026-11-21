'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAuthClient } from '@/lib/supabase/server';
import { db } from '@/lib/supabase/admin';
import { homeFor } from '@/lib/session';
import { clean } from '@/lib/sanitize';
import { isConfigured } from '@/lib/env';

function safeNext(next: string) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '';
}

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

export type AuthState = { error?: string; info?: string };

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isConfigured) return { error: 'De database is nog niet gekoppeld.' };
  const email = clean(formData.get('email'), 200).toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(clean(formData.get('next'), 300));

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    if (error?.message?.toLowerCase().includes('confirm')) {
      return { error: 'Bevestig eerst je e-mailadres via de link in je mailbox.' };
    }
    return { error: 'E-mailadres of wachtwoord klopt niet.' };
  }
  const { data: profile } = await db().from('profiles').select('role').eq('id', data.user.id).maybeSingle();
  redirect(next || homeFor((profile?.role as any) ?? 'particulier'));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!isConfigured) return { error: 'De database is nog niet gekoppeld.' };
  const role = formData.get('role') === 'schilder' ? 'schilder' : 'particulier';
  const full_name = clean(formData.get('full_name'), 120);
  const phone = clean(formData.get('phone'), 30);
  const email = clean(formData.get('email'), 200).toLowerCase();
  const password = String(formData.get('password') ?? '');
  const terms = formData.get('terms') === 'on';
  const next = safeNext(clean(formData.get('next'), 300)) || (role === 'schilder' ? '/schilder/aanmelden' : '/account');

  if (!full_name || !email || !phone) return { error: 'Vul je naam, e-mailadres en telefoonnummer in.' };
  if (password.length < 8) return { error: 'Kies een wachtwoord van minimaal 8 tekens.' };
  if (!terms) return { error: 'Ga akkoord met de voorwaarden om verder te gaan.' };

  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name, phone },
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes('registered')) return { error: 'Er bestaat al een account met dit e-mailadres. Log in.' };
    return { error: 'Registreren lukte niet: ' + error.message };
  }
  if (data.session) redirect(next);
  return { info: `We hebben een bevestigingslink gestuurd naar ${email}. Klik op de link om verder te gaan.` };
}

export async function signOut() {
  if (isConfigured) {
    const supabase = await createAuthClient();
    await supabase.auth.signOut();
  }
  redirect('/');
}
