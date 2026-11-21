# SchildersConnect

Het platform voor schilderwerk. Particulieren plaatsen gratis een klus en gescreende schilders reageren gratis. De schilder betaalt pas credits als de klant hem kiest (een match).

## Stack

- Next.js 15 (App Router) op Vercel
- Supabase: inloggen, Postgres-database en foto-opslag

## Eenmalige installatie

1. **Supabase**: open de *SQL Editor*, plak de inhoud van `supabase/schema.sql` en klik op *Run*.
2. **Vercel**: zet onder *Settings → Environment Variables* deze variabelen (gebruik `.env.example` als voorbeeld):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (geheim; nooit in git zetten)
   - `NEXT_PUBLIC_SITE_URL` (bijv. `https://schildersconnect.nl`)
3. **Supabase → Authentication → URL Configuration**: zet de *Site URL* op je domein en voeg `https://<jouw-domein>/auth/callback` toe aan de *Redirect URLs*.
4. **Admin worden**: registreer je op de site en voer daarna in de SQL Editor uit:
   ```sql
   update public.profiles set role = 'admin' where email = 'jij@voorbeeld.nl';
   ```

## Update 2: betalen, meldingen en facturen

- Draai `supabase/002_betalen_meldingen.sql` in de Supabase SQL Editor.
- **Betalen:** zet `MOLLIE_API_KEY` in Vercel. Een `test_`-sleutel werkt meteen om te testen; voor echte betalingen heb je een `live_`-sleutel nodig. Mollie geeft die na verificatie van je KvK. Zonder sleutel loopt betalen handmatig via de admin.
- **E-mail:** zet `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` en `ADMIN_EMAIL`. Zonder deze instellingen worden e-mails alleen gelogd.
- **Facturen:** zet `COMPANY_NAME`, `COMPANY_ADDRESS`, `COMPANY_KVK` en `COMPANY_VAT` zodra de KvK-inschrijving rond is.

## Zo werkt het

| Rol | Wat | Waar |
| --- | --- | --- |
| Particulier | Account aanmaken, klus plaatsen met richtprijs, reacties vergelijken, maximaal 3 schilders kiezen | `/klus-plaatsen`, `/account` |
| Schilder | Registreren, bedrijfsgegevens invullen, wachten op goedkeuring, gratis reageren, credits kopen, weeklimiet instellen | `/registreren?rol=schilder`, `/schilder` |
| Admin | Schilders goedkeuren (+25 welkomstcredits), aanvulling vragen of afwijzen, klussen verwijderen, betalingen bevestigen, matches terugboeken | `/admin` |

De bedrijfsregels staan in `lib/config.ts`: matchprijzen (7, 12 of 22 credits à € 1,1178 excl. btw), creditbundels, maximaal 3 gekozen schilders en maximaal 8 reacties per klus.

## Veiligheid

- Row Level Security staat aan op alle tabellen, zonder policies. De browser kan dus niets direct lezen of schrijven.
- Alle data loopt via de server, met de service_role key. De server controleert elke actie.
- Credits afschrijven, terugboeken en goedkeuren gebeurt in Postgres-functies. Daardoor gaat het altijd in één keer goed of helemaal niet.
- Voor een match worden telefoonnummers, e-mailadressen en links uit berichten gefilterd.

## Nog te doen (volgende fase)

- Betalen met iDEAL via Mollie. Nu bevestigt de admin betalingen handmatig.
- E-mailnotificaties bij een nieuwe reactie, een match of een goedkeuring.
- Reviews na oplevering en het onderhoudsplan.
- Klussen filteren op afstand. Nu filter je op de eerste twee cijfers van de postcode.
