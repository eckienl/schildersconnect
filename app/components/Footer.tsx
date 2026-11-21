import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p style={{ marginTop: 14, maxWidth: 320 }}>Hét platform voor schilderwerk. Gestart in de provincie Utrecht, straks landelijk.</p>
        </div>
        <div>
          <h4>Particulieren</h4>
          <Link href="/klus-plaatsen">Klus plaatsen</Link>
          <Link href="/#hoe-werkt-het">Hoe werkt het?</Link>
          <Link href="/inloggen">Inloggen</Link>
        </div>
        <div>
          <h4>Schilders</h4>
          <Link href="/voor-schilders">Voor schilders</Link>
          <Link href="/opdrachten">Opdrachten</Link>
          <Link href="/registreren?rol=schilder">Aanmelden</Link>
        </div>
        <div>
          <h4>Bedrijven &amp; VvE</h4>
          <Link href="/#zakelijk">Zakelijk schilderwerk</Link>
          <Link href="/klus-plaatsen">Opdracht plaatsen</Link>
        </div>
      </div>
    </footer>
  );
}
