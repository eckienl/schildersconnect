import { NextResponse, type NextRequest } from 'next/server';
import { createAuthClient } from '@/lib/supabase/server';
import { DEMO_ENABLED, DEMO_USERS, demoPassword, ensureDemo, type DemoRole } from '@/lib/demo';

const ALIAS: Record<string, DemoRole> = {
  particulier: 'particulier',
  klant: 'particulier',
  schilder: 'schilder',
  'schilder-nieuw': 'schilder_nieuw',
  admin: 'admin',
};
const HOME: Record<DemoRole, string> = { particulier: '/account', schilder_nieuw: '/schilder', schilder: '/schilder', admin: '/admin' };

/** Demo links, e.g. /demo/schilder — handy to share a prototype view. Only works with DEMO_MODE=true. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ rol: string }> }) {
  const { origin } = new URL(request.url);
  if (!DEMO_ENABLED) return NextResponse.redirect(`${origin}/`);
  const { rol } = await params;
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  if (rol === 'reset') {
    await ensureDemo(true);
    return NextResponse.redirect(`${origin}/?demo=reset`);
  }
  const role = ALIAS[rol];
  if (!role) return NextResponse.redirect(`${origin}/`);
  await ensureDemo();
  const u = DEMO_USERS[role];
  const { error } = await supabase.auth.signInWithPassword({ email: u.email, password: demoPassword(u.email) });
  if (error) return NextResponse.redirect(`${origin}/?demo=fout`);
  return NextResponse.redirect(`${origin}${HOME[role]}`);
}
