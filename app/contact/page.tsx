import { COMPANY } from '@/lib/site';
import { LegalPage } from '../components/LegalPage';
import { Icon } from '../components/Icon';

export const metadata = { title: 'Contact – SchildersConnect' };

export default function Page() {
  return (
    <LegalPage title="Contact">
      <p>Vragen over een opdracht, je account of credits? We helpen je graag.</p>
      <p className="row" style={{ gap: 10 }}><Icon name="chat" /> <a href={`mailto:${COMPANY.email}`}><strong>{COMPANY.email}</strong></a></p>
      <p className="muted small">We reageren op werkdagen binnen 1 werkdag. Meldingen over een match doe je het snelst via je dashboard.</p>
    </LegalPage>
  );
}
