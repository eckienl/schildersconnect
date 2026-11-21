import Link from 'next/link';
import { getSession } from '@/lib/session';
import { JobForm } from './JobForm';

export default async function Page() {
  const { profile } = await getSession();
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: '2rem' }}>Plaats je schilderklus</h1>
        <p className="muted">Gratis en vrijblijvend. Hoe completer je aanvraag, hoe beter de reacties.</p>
        <div className="card" style={{ marginTop: 20 }}>
          {!profile ? (
            <div className="stack">
              <p>Om je klus te plaatsen en reacties te ontvangen heb je een gratis account nodig. Dat duurt een minuut.</p>
              <div className="row">
                <Link href="/registreren?next=/klus-plaatsen" className="btn">Gratis account aanmaken</Link>
                <Link href="/inloggen?next=/klus-plaatsen" className="btn btn-ghost">Ik heb al een account</Link>
              </div>
            </div>
          ) : profile.role === 'schilder' ? (
            <div className="alert alert-info">Je bent ingelogd als schilder. Ga naar je <Link href="/schilder">dashboard</Link> om op klussen te reageren.</div>
          ) : (
            <JobForm />
          )}
        </div>
      </div>
    </div>
  );
}
