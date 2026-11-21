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
          <h4>SchildersConnect</h4>
          <Link href="/#zakelijk">Voor bedrijven &amp; VvE</Link>
          <Link href="/veelgestelde-vragen">Veelgestelde vragen</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/voorwaarden">Voorwaarden</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
