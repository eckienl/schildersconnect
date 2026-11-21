'use server';

import { redirect } from 'next/navigation';
import { createAuthClient } from '@/lib/supabase/server';
import { DEMO_ENABLED, DEMO_USERS, demoPassword, ensureDemo, type DemoRole } from '@/lib/demo';

const HOME: Record<DemoRole, string> = {
  particulier: '/account',
  schilder_nieuw: '/schilder',
  schilder: '/schilder',
  admin: '/admin',
};

export async function demoSwitch(formData: FormData) {
  if (!DEMO_ENABLED) redirect('/');
  const role = String(formData.get('role') ?? '');
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  if (role === 'bezoeker') redirect('/');
  if (!(role in DEMO_USERS)) redirect('/');
  await ensureDemo();
  const u = DEMO_USERS[role as DemoRole];
  const { error } = await supabase.auth.signInWithPassword({ email: u.email, password: demoPassword(u.email) });
  if (error) redirect('/?demo=fout');
  redirect(HOME[role as DemoRole]);
}

export async function demoReset() {
  if (!DEMO_ENABLED) redirect('/');
  await ensureDemo(true);
  redirect('/?demo=reset');
}
