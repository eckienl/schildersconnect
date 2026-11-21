import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { budgetLabel } from '@/lib/budget';
import { eur, matchPriceEx } from '@/lib/config';
import { Flash } from '@/app/components/Flash';
import { DashShell } from '@/app/components/DashShell';
import { Icon } from '@/app/components/Icon';
import { painterMenu } from '@/lib/menus';
import { JobDetails } from '@/app/components/JobDetails';
import { respond } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ m?: string }> }) {
  const { id } = await params;
  const { m } = await searchParams;
  const { painter } = await requireProfile(`/schilder/klus/${id}`, 'schilder');
  if (!painter || painter.status !== 'approved') redirect('/schilder');
  const client = db();
  const { data: job } = await client.from('jobs').select('*, profiles(full_name, phone, email)').eq('id', id).maybeSingle();
  if (!job || job.status === 'removed') notFound();
  const { data: mine } = await client.from('responses').select('*').eq('job_id', id).eq('painter_id', painter.id).maybeSingle();
  const enough = painter.credits >= job.match_cost;

  return (
    <DashShell title="Schildersaccount" icon="roller" menu={await painterMenu(painter)} active="/schilder/opdrachten">
        <Link href="/schilder/opdrachten" className="back"><Icon name="back" size={16} /> Beschikbare opdrachten</Link>
        <div className="dash-head">
          <div>
            <h1>{job.title}</h1>
            <div className="meta"><span>{job.city}</span><span>Geplaatst {new Date(job.created_at).toLocaleDateString('nl-NL')}</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="small muted">{budgetLabel(job).startsWith('Richtprijs') ? 'Richtprijs klant' : 'Budget klant'}</div>
            <strong>{budgetLabel(job).replace(/^(Budget|Richtprijs klant): /, '')}</strong>
            <div className="small muted">Matchprijs: {job.match_cost} credits ({eur(matchPriceEx(job.match_cost))} excl. btw)</div>
          </div>
        </div>
        <div className="stack">
          <Flash code={m} />
          <div className="card"><JobDetails job={job} showFullPostcode={mine?.status === 'chosen'} /></div>

          {mine ? (
            <div className="card">
              <h3>Jouw reactie</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{mine.message}</p>
              {mine.price_indication && <p className="small muted">Prijsindicatie: {mine.price_indication}</p>}
              {mine.status === 'chosen' ? (
                <div className="alert alert-success">
                  <strong>De klant heeft jou gekozen!</strong> Er zijn {mine.credits_charged} credits afgeschreven. Neem contact op met{' '}
                  {job.profiles?.full_name}: <a href={`tel:${job.profiles?.phone}`}>{job.profiles?.phone}</a> ·{' '}
                  <a href={`mailto:${job.profiles?.email}`}>{job.profiles?.email}</a>. Adres: {job.postcode} {job.city}.
                  <div className="small" style={{ marginTop: 6 }}>Is de klant nep of onbereikbaar, of klopt de opdracht niet met het opgegeven budget? Meld het ons, dan corrigeren of storten we je credits terug.</div>
                </div>
              ) : mine.status === 'refunded' ? (
                <div className="alert alert-info">Deze match is teruggeboekt; de credits staan weer op je account.</div>
              ) : (
                <div className="alert alert-info">Wacht op de klant. Je betaalt pas als de klant jou kiest ({job.match_cost} credits).</div>
              )}
            </div>
          ) : job.status !== 'open' ? (
            <div className="alert alert-info">Deze klus is gesloten.</div>
          ) : (
            <div className="card">
              <h3>Reageer gratis</h3>
              <p className="small muted">
                Kiest de klant jou, dan worden er <strong>{job.match_cost} credits</strong> afgeschreven en krijgen jullie elkaars
                contactgegevens. Een match is contact met de klant, geen gegarandeerde opdracht. Telefoonnummers, e-mailadressen en links worden uit je bericht gefilterd; contact buiten het platform om vóór een match is niet toegestaan.
              </p>
              {!enough && (
                <div className="alert alert-warn" style={{ marginBottom: 12 }}>
                  Je hebt {painter.credits} credits; voor deze klus heb je er minimaal {job.match_cost} nodig.{' '}
                  <Link href="/schilder/credits">Credits kopen</Link>
                </div>
              )}
              <form action={respond} className="form">
                <input type="hidden" name="job_id" value={job.id} />
                <div className="field">
                  <label htmlFor="message">Je bericht aan de klant</label>
                  <textarea id="message" name="message" minLength={20} maxLength={1500} required placeholder="Stel jezelf kort voor, hoe je het zou aanpakken en wanneer je kunt beginnen." />
                </div>
                <div className="field">
                  <label htmlFor="price_indication">Prijsindicatie (optioneel)</label>
                  <input id="price_indication" name="price_indication" type="text" maxLength={60} placeholder="Bijv. € 1.450 incl. btw, of € 32 per m²" />
                </div>
                <button className="btn btn-lg" disabled={!enough}>Reactie versturen</button>
              </form>
            </div>
          )}
        </div>
    </DashShell>
  );
}
