import Link from 'next/link';
import { Icon } from '../components/Icon';

export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <div className="auth-wrap">
      <div className="container auth-card">
        <div className="card center">
          <span style={{ color: 'var(--green)', display: 'inline-flex' }}><Icon name="check" size={56} strokeWidth={2.4} /></span>
          <h1 style={{ fontSize: '1.7rem' }}>Je opdracht is geplaatst!</h1>
          <p>
            We hebben een bevestigingslink gestuurd naar <strong>{email || 'je e-mailadres'}</strong>. Klik op de link om je account te
            activeren. Daarna zie je de reacties van schilders in je account.
          </p>
          <p className="muted small">Geen mail ontvangen? Kijk in je spam-map.</p>
          <Link href="/inloggen" className="btn">Naar inloggen</Link>
        </div>
      </div>
    </div>
  );
}
