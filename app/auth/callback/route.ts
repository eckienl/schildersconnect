import { NextResponse, type NextRequest } from 'next/server';
import { createAuthClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') ?? '/account';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/account';
  if (code) {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/inloggen?fout=link`);
}
