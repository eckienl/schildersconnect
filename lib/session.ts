import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { isConfigured } from './env';
import { createAuthClient } from './supabase/server';
import { db } from './supabase/admin';

export type Profile = {
  id: string;
  role: 'particulier' | 'schilder' | 'admin';
  full_name: string;
  email: string;
  phone: string;
};

export type Painter = {
  id: string;
  company_name: string;
  kvk: string;
  postcode: string;
  city: string;
  radius_km: number;
  insured: boolean;
  website: string;
  description: string;
  specialties: string[];
  status: 'pending' | 'needs_info' | 'approved' | 'rejected';
  admin_note: string;
  credits: number;
  weekly_limit: number | null;
};

export const getSession = cache(async (): Promise<{ profile: Profile | null; painter: Painter | null }> => {
  if (!isConfigured) return { profile: null, painter: null };
  const supabase = await createAuthClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { profile: null, painter: null };

  const client = db();
  let { data: profile } = await client.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  if (!profile) {
    // Fallback if the signup trigger has not run (e.g. schema installed after signup).
    const meta = data.user.user_metadata ?? {};
    const role = meta.role === 'schilder' ? 'schilder' : 'particulier';
    const { data: created } = await client
      .from('profiles')
      .upsert({ id: data.user.id, role, full_name: meta.full_name ?? '', email: data.user.email ?? '', phone: meta.phone ?? '' })
      .select('*')
      .single();
    profile = created;
  }
  let painter: Painter | null = null;
  if (profile?.role === 'schilder') {
    const { data: p } = await client.from('painters').select('*').eq('id', profile.id).maybeSingle();
    painter = p as Painter | null;
  }
  return { profile: profile as Profile | null, painter };
});

export async function requireProfile(next: string, role?: Profile['role']) {
  const s = await getSession();
  if (!s.profile) redirect(`/inloggen?next=${encodeURIComponent(next)}`);
  if (role && s.profile.role !== role && s.profile.role !== 'admin') redirect(homeFor(s.profile.role));
  return s as { profile: Profile; painter: Painter | null };
}

export function homeFor(role: Profile['role']) {
  if (role === 'admin') return '/admin';
  if (role === 'schilder') return '/schilder';
  return '/account';
}
