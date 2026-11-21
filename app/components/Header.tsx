import Link from 'next/link';
import { getSession, homeFor } from '@/lib/session';
import { signOut } from '@/app/auth/actions';
import { Logo } from './Logo';

export async function Header() {
  const { profile } = await getSession();
  return (
    <header className="header">
      <div className="container">
        <Logo />
        <nav className="nav">
          <Link href="/#hoe-werkt-het" className="hide-sm">Hoe werkt het?</Link>
          <Link href="/#voor-schilders" className="hide-sm">Voor schilders</Link>
          {profile ? (
            <>
              <Link href={homeFor(profile.role)}>Dashboard</Link>
              <form action={signOut}>
                <button className="btn btn-outline btn-sm" type="submit">Uitloggen</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/inloggen">Inloggen</Link>
              <Link href="/klus-plaatsen" className="btn btn-sm hide-xs">Klus plaatsen</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
