import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="section center">
      <div className="container narrow">
        <h1>Pagina niet gevonden</h1>
        <p className="muted">Deze pagina bestaat niet (meer).</p>
        <Link href="/" className="btn">Naar de homepage</Link>
      </div>
    </div>
  );
}
