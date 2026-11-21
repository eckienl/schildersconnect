import { COMPANY } from '@/lib/site';
import { LegalPage } from '../components/LegalPage';

export const metadata = { title: 'Privacyverklaring – SchildersConnect' };

export default function Page() {
  return (
    <LegalPage title="Privacyverklaring" updated="concept november 2026">
      <div className="alert alert-warn" style={{ marginBottom: 20 }}>Concepttekst. Laat deze verklaring nakijken voordat het platform officieel live gaat.</div>
      <h2>Wie is verantwoordelijk?</h2>
      <p>{COMPANY.name}, {COMPANY.address}, KvK {COMPANY.kvk}, is verantwoordelijk voor de verwerking van je persoonsgegevens. Contact: {COMPANY.email}.</p>
      <h2>Welke gegevens verwerken we?</h2>
      <ul>
        <li><strong>Opdrachtgevers:</strong> naam, e-mailadres, telefoonnummer, postcode en plaats, de opdracht en foto&apos;s.</li>
        <li><strong>Schilders:</strong> naam, e-mailadres, telefoonnummer, bedrijfsgegevens (KvK, vestiging, website), betaal- en factuurgegevens.</li>
        <li>Technische gegevens die nodig zijn om in te loggen en de site veilig te houden.</li>
      </ul>
      <h2>Waarvoor gebruiken we ze?</h2>
      <ul>
        <li>Om opdrachtgevers en schilders met elkaar in contact te brengen (uitvoering van de overeenkomst).</li>
        <li>Om schilders te controleren, credits te verwerken en facturen te maken (wettelijke plicht en overeenkomst).</li>
        <li>Om je e-mails te sturen over je opdracht, reacties, matches en betalingen.</li>
      </ul>
      <h2>Met wie delen we ze?</h2>
      <p>
        Contactgegevens van een opdrachtgever worden alleen gedeeld met schilders die de opdrachtgever zelf kiest. Schilders zien
        vóór een match alleen de plaats en de eerste cijfers van de postcode. We gebruiken verwerkers voor hosting (Vercel),
        database en opslag (Supabase, servers in de EU), betalingen (Mollie) en e-mail. Met hen sluiten we
        verwerkersovereenkomsten. We verkopen je gegevens nooit.
      </p>
      <h2>Hoe lang bewaren we ze?</h2>
      <p>Zolang je account bestaat. Factuurgegevens bewaren we 7 jaar vanwege de fiscale bewaarplicht. Opdrachten verwijderen we 2 jaar na sluiting.</p>
      <h2>Jouw rechten</h2>
      <p>Je mag je gegevens inzien, laten corrigeren of verwijderen, en bezwaar maken. Mail naar {COMPANY.email}. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.</p>
      <h2>Cookies</h2>
      <p>We gebruiken alleen cookies die nodig zijn om in te loggen en de site te laten werken. Voor analytische cookies vragen we eerst toestemming.</p>
    </LegalPage>
  );
}
