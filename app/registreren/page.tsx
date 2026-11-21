import { redirect } from 'next/navigation';
import { SignupForm } from '../components/AuthForms';
import { getSession, homeFor } from '@/lib/session';

export default async function Page({ searchParams }: { searchParams: Promise<{ rol?: string; next?: string }> }) {
  const sp = await searchParams;
  const { profile } = await getSession();
  if (profile) redirect(homeFor(profile.role));
  const role = sp.rol === 'schilder' ? 'schilder' : 'particulier';
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card">
          {role === 'schilder' ? (
            <>
              <span className="badge badge-orange">Voor schilders</span>
              <h1 style={{ fontSize: '1.7rem', marginTop: 10 }}>Aanmelden als schilder</h1>
              <p className="muted">
                Stap 1 van 2: maak een account aan. Daarna vul je je bedrijfsgegevens in en controleren wij je aanmelding.
                Reageren is gratis; je betaalt alleen als een klant jou kiest.
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '1.7rem' }}>Account aanmaken</h1>
              <p className="muted">Gratis en vrijblijvend. Je kiest zelf welke schilders je gegevens krijgen.</p>
            </>
          )}
          <SignupForm role={role} next={sp.next ?? ''} />
        </div>
      </div>
    </div>
  );
}
