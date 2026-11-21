import Link from 'next/link';
import { getSession, homeFor } from '@/lib/session';
import { signOut } from '@/app/auth/actions';
import { Logo } from './Logo';
import { Icon } from './Icon';

const NAV = [
  ['/', 'Home'],
  ['/opdrachten', 'Opdrachten'],
  ['/voor-schilders', 'Voor schilders'],
  ['/#zakelijk', 'Voor bedrijven'],
  ['/#hoe-werkt-het', 'Hoe werkt het?'],
] as const;

export async function Header() {
  const { profile } = await getSession();
  return (
    <header className="header">
      <div className="container header-inner">
        <Logo />
        <nav className="nav" aria-label="Hoofdmenu">
          {NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          {profile ? (
            <>
              <Link href={homeFor(profile.role)} className="btn btn-outline-light btn-sm">
                <Icon name="user" size={16} /> <span className="hide-xs">{profile.full_name.split(' ')[0] || 'Mijn account'}</span>
              </Link>
              <form action={signOut}>
                <button className="btn btn-sm btn-outline-light" type="submit" title="Uitloggen"><Icon name="logout" size={16} /><span className="hide-xs">Uitloggen</span></button>
              </form>
            </>
          ) : (
            <>
              <Link href="/inloggen" className="btn btn-outline-light btn-sm">Inloggen</Link>
              <Link href="/registreren" className="btn btn-sm hide-xs">Account aanmaken</Link>
            </>
          )}
          <details className="mobile-menu">
            <summary aria-label="Menu"><Icon name="menu" /></summary>
            <div className="mobile-menu-panel">
              {NAV.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
              {!profile && <Link href="/registreren">Account aanmaken</Link>}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
