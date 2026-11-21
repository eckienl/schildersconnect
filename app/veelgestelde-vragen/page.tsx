import Link from 'next/link';
import { CREDIT_PRICE_EX, MATCH_COST, WELCOME_CREDITS, WELCOME_LIMIT, eur, matchPriceEx } from '@/lib/config';
import { LegalPage } from '../components/LegalPage';

export const metadata = { title: 'Veelgestelde vragen – SchildersConnect' };

const PARTICULIER: [string, string][] = [
  ['Wat kost het om een opdracht te plaatsen?', 'Niets. Plaatsen, reacties ontvangen en een schilder kiezen is gratis en vrijblijvend.'],
  ['Wie krijgt mijn telefoonnummer?', 'Alleen de schilders die jij kiest, maximaal 3 per opdracht. Andere schilders zien alleen je plaats en de eerste cijfers van je postcode.'],
  ['Hoe snel krijg ik reacties?', 'Meestal binnen 24 uur. Garanderen kunnen we het niet: het hangt af van hoeveel schilders er in jouw regio beschikbaar zijn.'],
  ['Kan ik mijn opdracht nog aanpassen?', 'Ja, zolang hij open staat. Ga naar je opdracht en klik op Bewerken. Heb je al een schilder gekozen, dan ligt het budget vast.'],
  ['Zijn de schilders gecontroleerd?', 'Ja. We controleren elke schilder voordat hij opdrachten ziet: KvK-inschrijving, verzekering en portfolio.'],
];
const SCHILDER: [string, string][] = [
  ['Wat kost SchildersConnect voor een schilder?', `Aanmelden en reageren is gratis. Je betaalt alleen als een klant jou kiest: ${MATCH_COST.klein} credits (${eur(matchPriceEx(MATCH_COST.klein))}), ${MATCH_COST.middel} credits (${eur(matchPriceEx(MATCH_COST.middel))}) of ${MATCH_COST.groot} credits (${eur(matchPriceEx(MATCH_COST.groot))}) per match, excl. btw, afhankelijk van het budget van de klus.`],
  ['Wie bepaalt hoeveel credits een opdracht kost?', 'SchildersConnect, op basis van de opdracht zelf: soort werk, aantal m², binnen of buiten, staat van het huidige schilderwerk en of er een steiger nodig is. Geeft de klant een hoger budget op, dan telt dat. Een laag budget maakt een grote klus dus nooit goedkoop. Bij elke opdracht zie je de prijs in credits en euro\'s, met de uitleg.'],
  ['Wat kost één credit?', `${eur(CREDIT_PRICE_EX)} excl. btw bij de Start-bundel, en minder bij grotere bundels (tot ${eur(15090 / 100 / 150)} bij Pro).`],
  ['Krijg ik mijn credits terug als ik de opdracht niet krijg?', 'Nee. Een match betekent dat je de contactgegevens van de klant krijgt; of je de opdracht krijgt hangt af van je offerte en het gesprek. Credits krijg je wel terug als de klant onbereikbaar of nep is, of als de opdracht duidelijk niet klopt met het opgegeven budget.'],
  ['Hoe betaal ik?', 'Je koopt vooraf een bundel credits met iDEAL. De credits staan direct op je account en je krijgt een factuur met btw. Er is geen abonnement en credits vervallen nooit.'],
  ['Krijg ik gratis credits?', `De eerste ${WELCOME_LIMIT} goedgekeurde schilders krijgen ${WELCOME_CREDITS} gratis welkomstcredits.`],
  ['Hoeveel schilders reageren er op een opdracht?', 'Maximaal 8 schilders kunnen reageren, en de klant kiest er maximaal 3. Zo heb je meer kans dan op platforms waar een aanvraag naar veel vakmensen gaat.'],
  ['Mag ik de klant al vóór een match bellen?', 'Nee. Contactgegevens zijn pas na een match zichtbaar, en contact buiten het platform om vóór een match is niet toegestaan.'],
];

export default function Page() {
  return (
    <LegalPage title="Veelgestelde vragen">
      <h2>Voor opdrachtgevers</h2>
      <div className="faq">{PARTICULIER.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      <h2>Voor schilders</h2>
      <div className="faq">{SCHILDER.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      <p style={{ marginTop: 24 }}>Staat je vraag er niet bij? <Link href="/contact">Neem contact op</Link>.</p>
    </LegalPage>
  );
}
