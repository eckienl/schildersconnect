import { COMPANY } from '@/lib/site';
import { MATCH_COST, SIZE_CLASSES, WELCOME_CREDITS, WELCOME_LIMIT } from '@/lib/config';
import { LegalPage } from '../components/LegalPage';

export const metadata = { title: 'Algemene voorwaarden – SchildersConnect' };

export default function Page() {
  return (
    <LegalPage title="Algemene voorwaarden" updated="concept november 2026">
      <div className="alert alert-warn" style={{ marginBottom: 20 }}>
        Concepttekst. Laat deze voorwaarden nakijken door een jurist voordat het platform officieel live gaat.
      </div>
      <h2>1. Wie we zijn en wat we doen</h2>
      <p>
        SchildersConnect ({COMPANY.name}, KvK {COMPANY.kvk}) is een online platform dat opdrachtgevers (particulieren en
        bedrijven) in contact brengt met schilders. SchildersConnect is bemiddelaar en voert zelf geen schilderwerk uit. De
        overeenkomst over het werk komt rechtstreeks tot stand tussen opdrachtgever en schilder.
      </p>
      <h2>2. Voor opdrachtgevers</h2>
      <ol>
        <li>Een opdracht plaatsen en reacties ontvangen is gratis en vrijblijvend.</li>
        <li>Je geeft de opdracht naar waarheid op, inclusief een realistisch budget of richtprijs.</li>
        <li>Je contactgegevens worden alleen gedeeld met schilders die jij kiest, met een maximum van 3 per opdracht.</li>
        <li>SchildersConnect garandeert niet dat er schilders reageren, dat een schilder de opdracht aanneemt of uitvoert, of de kwaliteit van het werk.</li>
        <li>Je kunt je opdracht aanpassen zolang hij open staat. Na een match ligt het budget vast.</li>
      </ol>
      <h2>3. Voor schilders</h2>
      <ol>
        <li>Na aanmelding controleert SchildersConnect je gegevens (onder meer KvK, verzekering en portfolio). SchildersConnect mag een aanmelding zonder opgaaf van redenen weigeren of een account beëindigen.</li>
        <li>Reageren op opdrachten is gratis. Kiest een opdrachtgever jou, dan ontstaat een <strong>match</strong>: jullie krijgen elkaars contactgegevens en er worden credits van je saldo afgeschreven ({SIZE_CLASSES.map((c) => MATCH_COST[c.id]).join(', ')} credits, afhankelijk van de geschatte waarde van de opdracht). De matchprijs zie je voordat je reageert.</li>
        <li>Een match is contact met een opdrachtgever en <strong>geen gegarandeerde opdracht</strong>. Wordt de opdracht na de match niet aan jou gegund, dan worden de credits niet teruggeboekt.</li>
        <li>Credits worden teruggeboekt als de opdrachtgever na drie pogingen onbereikbaar is, de contactgegevens onjuist zijn, de aanvraag nep is, of de opdracht duidelijk niet overeenkomt met het opgegeven budget. Meld dit binnen 14 dagen na de match via je dashboard. SchildersConnect beslist over de melding.</li>
        <li>Je mag vóór een match geen contactgegevens uitwisselen of contact buiten het platform om zoeken. Bij misbruik kan SchildersConnect je account blokkeren en matchkosten in rekening brengen.</li>
        <li>Je bent zelf verantwoordelijk voor je offerte, de uitvoering van het werk, je verzekeringen en het naleven van wet- en regelgeving.</li>
      </ol>
      <h2>4. Credits en betaling</h2>
      <ol>
        <li>Credits koop je vooraf in bundels. Alle genoemde prijzen zijn exclusief 21% btw. Je ontvangt een factuur.</li>
        <li>Credits vervallen niet en zijn niet inwisselbaar voor geld, behalve waar de wet dat vereist.</li>
        <li>De eerste {WELCOME_LIMIT} goedgekeurde schilders ontvangen eenmalig {WELCOME_CREDITS} gratis welkomstcredits. Deze zijn niet inwisselbaar voor geld.</li>
        <li>SchildersConnect mag prijzen aanpassen. Een gewijzigde prijs geldt niet voor credits die je al hebt gekocht; de matchprijs van een opdracht staat vast op het moment dat je reageert.</li>
      </ol>
      <h2>5. Reviews</h2>
      <p>Reviews moeten eerlijk zijn en gaan over een werkelijk uitgevoerde opdracht. SchildersConnect mag reviews die in strijd zijn met deze regels verwijderen.</p>
      <h2>6. Aansprakelijkheid</h2>
      <p>
        SchildersConnect is niet aansprakelijk voor schade die voortvloeit uit de overeenkomst tussen opdrachtgever en schilder,
        of uit het (tijdelijk) niet beschikbaar zijn van het platform. Aansprakelijkheid is in alle gevallen beperkt tot het
        bedrag dat de schilder in de drie maanden voor de schade aan SchildersConnect heeft betaald.
      </p>
      <h2>7. Overig</h2>
      <p>Op deze voorwaarden is Nederlands recht van toepassing. Vragen? Mail naar {COMPANY.email}.</p>
    </LegalPage>
  );
}
