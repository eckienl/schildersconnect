import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div>
          <strong style={{ color: '#fff' }}>SchildersConnect</strong>
          <div>Het platform voor schilderwerk. Gestart in de provincie Utrecht.</div>
        </div>
        <div className="row" style={{ gap: 20 }}>
          <Link href="/klus-plaatsen">Klus plaatsen</Link>
          <Link href="/registreren?rol=schilder">Aanmelden als schilder</Link>
          <Link href="/inloggen">Inloggen</Link>
        </div>
      </div>
    </footer>
  );
}
