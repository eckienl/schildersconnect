import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { BUNDLES, MATCH_COST, eur, exVat, inclVat, matchPriceEx } from '@/lib/config';
import { Flash } from '@/app/components/Flash';
import { DashShell } from '@/app/components/DashShell';
import { Icon } from '@/app/components/Icon';
import { painterMenu } from '@/lib/menus';
import { requestBundle, saveWeeklyLimit } from '../actions';

export const dynamic = 'force-dynamic';

const REASON: Record<string, string> = { welkom: 'Welkomstcredits', aankoop: 'Aankoop', match: 'Match', terugboeking: 'Terugboeking', correctie: 'Correctie' };

export default async function Page({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const { painter } = await requireProfile('/schilder/credits', 'schilder');
  if (!painter || painter.status !== 'approved') redirect('/schilder');
  const client = db();
  const [{ data: tx }, { data: open }] = await Promise.all([
    client.from('credit_transactions').select('*, jobs(title)').eq('painter_id', painter.id).order('created_at', { ascending: false }).limit(50),
    client.from('purchases').select('*').eq('painter_id', painter.id).eq('status', 'open').order('created_at', { ascending: false }),
  ]);

  return (
    <DashShell title="Schildersaccount" icon="roller" menu={await painterMenu(painter)} active="/schilder/credits">
        
        <div className="dash-head">
          <div>
            <h1>Credits</h1>
            <p className="muted" style={{ margin: 0 }}>Geen abonnement. Credits vervallen nooit. Alle prijzen excl. btw.</p>
          </div>
          <div className="stat" style={{ minWidth: 180 }}><div className="num">{painter.credits}</div><div className="lbl">Huidig saldo</div></div>
        </div>
        <div className="stack">
          <Flash code={m} />

          <div className="grid grid-3">
            {BUNDLES.map((b) => (
              <form key={b.id} action={requestBundle} className="card center">
                <input type="hidden" name="bundle" value={b.id} />
                <div className="muted">{b.name}</div>
                <div className="price">{eur(exVat(b.priceCents))}</div>
                <div className="small muted">excl. btw · {eur(inclVat(b.priceCents))} incl. btw</div>
                <div style={{ marginTop: 6 }}>{b.credits} credits {b.discount && <span className="badge badge-orange">{b.discount}</span>}</div>
                <button className="btn" style={{ marginTop: 14, width: '100%' }}>Kies {b.name}</button>
              </form>
            ))}
          </div>
          <p className="small muted">
            Een match kost {MATCH_COST.klein} credits ({eur(matchPriceEx(MATCH_COST.klein))}), {MATCH_COST.middel} credits ({eur(matchPriceEx(MATCH_COST.middel))}) of {MATCH_COST.groot} credits ({eur(matchPriceEx(MATCH_COST.groot))}), excl. btw.
            Een match geeft je contact met de klant; SchildersConnect kan niet garanderen dat je de opdracht krijgt. Na je keuze sturen we
            een betaalverzoek; na betaling staan de credits direct op je account.
          </p>
          {open && open.length > 0 && (
            <div className="alert alert-info">
              Openstaande aanvraag: {open.map((p: any) => `${p.bundle} (${eur(p.price_eur / 100)} excl. btw)`).join(', ')}. We sturen je een betaalverzoek.
            </div>
          )}

          <div className="card">
            <h3>Weeklimiet</h3>
            <p className="small muted">Stel in hoeveel credits er maximaal per 7 dagen aan matches mogen worden besteed. Leeg = geen limiet.</p>
            <form action={saveWeeklyLimit} className="row">
              <input name="weekly_limit" type="number" min={0} defaultValue={painter.weekly_limit ?? ''} placeholder="Bijv. 50" style={{ maxWidth: 160 }} />
              <button className="btn btn-ghost">Opslaan</button>
            </form>
          </div>

          <h2 style={{ fontSize: '1.2rem', marginTop: 16 }}>Geschiedenis</h2>
          {!tx || tx.length === 0 ? (
            <div className="empty">Nog geen transacties.</div>
          ) : (
            <table className="table">
              <thead><tr><th>Datum</th><th>Omschrijving</th><th>Klus</th><th style={{ textAlign: 'right' }}>Credits</th></tr></thead>
              <tbody>
                {tx.map((t: any) => (
                  <tr key={t.id}>
                    <td>{new Date(t.created_at).toLocaleDateString('nl-NL')}</td>
                    <td>{REASON[t.reason] ?? t.reason}{t.note ? ` · ${t.note}` : ''}</td>
                    <td>{t.jobs?.title ?? '–'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: t.amount < 0 ? 'var(--red)' : 'var(--green)' }}>{t.amount > 0 ? '+' : ''}{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
    </DashShell>
  );
}
