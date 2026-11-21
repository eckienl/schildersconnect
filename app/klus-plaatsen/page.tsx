import Link from 'next/link';
import { getSession } from '@/lib/session';
import { JobWizard } from './JobWizard';

export default async function Page() {
  const { profile } = await getSession();
  return (
    <div className="section">
      <div className="container">
        <div className="wizard" style={{ marginBottom: 18 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.3rem)', marginBottom: 6 }}>Plaats je schilderopdracht</h1>
          <p className="muted" style={{ margin: 0 }}>In een paar stappen. Gescreende schilders reageren meestal binnen 24 uur.</p>
        </div>
        {profile?.role === 'schilder' ? (
          <div className="wizard alert alert-info">Je bent ingelogd als schilder. Ga naar je <Link href="/schilder">dashboard</Link> om op opdrachten te reageren.</div>
        ) : (
          <JobWizard loggedIn={Boolean(profile)} />
        )}
      </div>
    </div>
  );
}
