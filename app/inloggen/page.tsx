import { redirect } from 'next/navigation';
import { LoginForm } from '../components/AuthForms';
import { getSession, homeFor } from '@/lib/session';

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; fout?: string }> }) {
  const sp = await searchParams;
  const { profile } = await getSession();
  if (profile) redirect(sp.next || homeFor(profile.role));
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="card">
          <h1 style={{ fontSize: '1.7rem' }}>Inloggen</h1>
          <p className="muted">Welkom terug bij SchildersConnect.</p>
          {sp.fout === 'link' && <div className="alert alert-error" style={{ marginBottom: 16 }}>De bevestigingslink is verlopen of ongeldig. Log in of vraag een nieuwe aan.</div>}
          <LoginForm next={sp.next ?? ''} />
        </div>
      </div>
    </div>
  );
}
