import { requireProfile } from '@/lib/session';
import { PainterForm } from './PainterForm';
import { DashShell } from '@/app/components/DashShell';
import { painterMenu } from '@/lib/menus';

export default async function Page() {
  const { painter } = await requireProfile('/schilder/aanmelden', 'schilder');
  return (
    <DashShell title="Schildersaccount" icon="roller" menu={await painterMenu(painter)} active="/schilder/aanmelden">
        {!painter && <span className="badge badge-orange">Stap 2 van 2</span>}
        <h1 style={{ fontSize: '1.9rem', marginTop: 10 }}>{painter ? 'Bedrijfsprofiel' : 'Je bedrijfsgegevens'}</h1>
        <p className="muted">
          {painter
            ? 'Pas je gegevens aan. Klanten zien je bedrijfsnaam, plaats, specialisaties en omschrijving.'
            : 'We controleren elke schilder voordat hij klussen kan zien. Zo weten klanten dat ze met een echt bedrijf te maken hebben.'}
        </p>
        {painter?.status === 'needs_info' && painter.admin_note && (
          <div className="alert alert-warn" style={{ marginTop: 12 }}><strong>Wat we nog nodig hebben:</strong> {painter.admin_note}</div>
        )}
        <div className="card" style={{ marginTop: 20 }}>
          <PainterForm painter={painter} />
        </div>
    </DashShell>
  );
}
