const MESSAGES: Record<string, { type: 'error' | 'success' | 'info'; text: string }> = {
  // generic
  opgeslagen: { type: 'success', text: 'Opgeslagen.' },
  fout: { type: 'error', text: 'Er ging iets mis. Probeer het opnieuw.' },
  // customer
  klus_geplaatst: { type: 'success', text: 'Je opdracht staat online. Gescreende schilders kunnen nu reageren; meestal binnen 24 uur. Je ziet hun reacties hier.' },
  ok: { type: 'success', text: 'Gelukt! Je ziet nu de contactgegevens van deze schilder; hij heeft die van jou ook ontvangen.' },
  al_gekozen: { type: 'info', text: 'Deze schilder had je al gekozen.' },
  maximum_bereikt: { type: 'error', text: 'Je hebt al 3 schilders gekozen voor deze klus.' },
  klus_gesloten: { type: 'error', text: 'Deze klus is gesloten.' },
  onvoldoende_credits_schilder: { type: 'error', text: 'Deze schilder kan op dit moment niet gekozen worden. Kies een andere schilder of probeer het later opnieuw.' },
  weeklimiet_schilder: { type: 'error', text: 'Deze schilder heeft zijn weeklimiet bereikt. Kies een andere schilder of probeer het later opnieuw.' },
  gesloten: { type: 'success', text: 'De klus is gesloten. Er kunnen geen nieuwe reacties meer komen.' },
  // painter
  aangemeld: { type: 'success', text: 'Bedankt! Je aanmelding is in behandeling. We controleren je gegevens, meestal binnen 2 werkdagen.' },
  gereageerd: { type: 'success', text: 'Je reactie is verstuurd. Je betaalt pas als de klant jou kiest. Een match is contact met de klant, geen gegarandeerde opdracht.' },
  te_weinig_credits: { type: 'error', text: 'Je hebt te weinig credits om op deze klus te reageren. Je betaalt pas bij een match, maar je saldo moet de matchprijs dekken.' },
  vol: { type: 'error', text: 'Op deze klus is al het maximum aantal reacties gegeven.' },
  al_gereageerd: { type: 'info', text: 'Je hebt al op deze klus gereageerd.' },
  aankoop_aangevraagd: { type: 'success', text: 'Je aanvraag is ontvangen. Je ontvangt een betaalverzoek; na betaling staan de credits direct op je account.' },
  // demo
  demo_reset: { type: 'success', text: 'De demodata is teruggezet naar het begin.' },
  demo_fout: { type: 'error', text: 'Inloggen op het demo-account lukte niet. Probeer het opnieuw.' },
  bijgewerkt: { type: 'success', text: 'Je aanvraag is bijgewerkt.' },
  prijs_aangepast: { type: 'success', text: 'Matchprijs aangepast.' },
  betaling_fout: { type: 'error', text: 'De betaling kon niet worden gestart. Probeer het opnieuw of neem contact met ons op.' },
  betaald_ideal: { type: 'success', text: 'Betaling ontvangen! Je credits staan op je account en je factuur staat hieronder.' },
  betaling_mislukt: { type: 'error', text: 'De betaling is geannuleerd of mislukt. Er is niets afgeschreven.' },
  gemeld: { type: 'success', text: 'Je melding is ontvangen. We beoordelen hem binnen 2 werkdagen en laten je weten of we de credits terugboeken.' },
  // admin
  goedgekeurd: { type: 'success', text: 'Schilder goedgekeurd. Welkomstcredits zijn bijgeschreven (eerste 50 schilders).' },
  goedgekeurd_zonder_welkom: { type: 'success', text: 'Schilder goedgekeurd. De 50 welkomstplekken zijn vol, dus er zijn geen gratis credits bijgeschreven.' },
  teruggeboekt: { type: 'success', text: 'Match teruggeboekt.' },
  betaald: { type: 'success', text: 'Betaling bevestigd en credits bijgeschreven.' },
};

export function Flash({ code }: { code?: string }) {
  if (!code) return null;
  const m = MESSAGES[code] ?? { type: 'error' as const, text: code };
  return <div className={`alert alert-${m.type}`} role="status">{m.text}</div>;
}
