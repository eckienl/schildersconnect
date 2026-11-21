'use client';

import { useState, useTransition } from 'react';
import { createJob } from './actions';
import { CONDITIONS, JOB_TYPES, SUBSTRATES, TIMINGS } from '@/lib/config';
import { estimate, euro, type LocationType } from '@/lib/estimate';

async function resize(file: File, max = 1600): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.8));
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export function JobForm() {
  const [location, setLocation] = useState<LocationType>('binnen');
  const [m2, setM2] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [pending, start] = useTransition();
  const n = Number(m2);
  const est = n > 0 ? estimate(location, n) : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const files = fd.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0).slice(0, 6);
    fd.delete('photos');
    for (const f of files) fd.append('photos', await resize(f));
    const total = (fd.getAll('photos') as File[]).reduce((s, f) => s + f.size, 0);
    if (total > 3.5 * 1024 * 1024) {
      setError('De foto’s zijn samen te groot. Kies minder foto’s.');
      return;
    }
    start(async () => {
      const res = await createJob(fd);
      if (res?.error) {
        setError(res.error);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="field">
        <span className="label">Waar moet er geschilderd worden?</span>
        <div className="options">
          {(['binnen', 'buiten', 'beide'] as const).map((v) => (
            <label key={v} className="option">
              <input type="radio" name="location_type" value={v} checked={location === v} onChange={() => setLocation(v)} />
              <span>{v === 'beide' ? 'Binnen én buiten' : v[0].toUpperCase() + v.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="job_type">Wat moet er geschilderd worden?</label>
          <select id="job_type" name="job_type" required defaultValue="">
            <option value="" disabled>Kies…</option>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="surface_m2">Oppervlakte (m²)</label>
          <input id="surface_m2" name="surface_m2" type="number" min={1} max={20000} inputMode="numeric" required value={m2} onChange={(e) => setM2(e.target.value)} />
          <span className="hint">Een schatting is prima. Een kamer van 4×4 m heeft ca. 45 m² muur en 16 m² plafond.</span>
        </div>
      </div>

      {est && (
        <div className="estimate" aria-live="polite">
          <div className="small muted">Richtprijs inclusief materiaal en btw</div>
          <div className="big">{euro(est.low)} – {euro(est.high)}</div>
          <div className="small muted">Gebaseerd op gemiddelde tarieven per m². De schilder geeft na de reactie een exacte prijs.</div>
        </div>
      )}

      <div className="grid grid-2" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="substrate">Ondergrond</label>
          <select id="substrate" name="substrate" defaultValue={SUBSTRATES[0]}>
            {SUBSTRATES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="condition">Staat van het huidige schilderwerk</label>
          <select id="condition" name="condition" defaultValue={CONDITIONS[0]}>
            {CONDITIONS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {location !== 'binnen' && (
        <div className="field">
          <span className="label">Is er een steiger of hoogwerker nodig?</span>
          <div className="options">
            {['ja', 'nee', 'weet niet'].map((v) => (
              <label key={v} className="option">
                <input type="radio" name="scaffold_needed" value={v} defaultChecked={v === 'weet niet'} />
                <span>{v[0].toUpperCase() + v.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="title">Korte titel</label>
        <input id="title" name="title" type="text" maxLength={90} placeholder="Bijv. Woonkamer en hal sauzen" required />
      </div>
      <div className="field">
        <label htmlFor="description">Omschrijving</label>
        <textarea id="description" name="description" maxLength={3000} placeholder="Wat moet er gebeuren? Kleurwensen, bijzonderheden, bereikbaarheid…" />
        <span className="hint">Zet hier geen telefoonnummer of e-mailadres in; die deel je pas met de schilder die je kiest.</span>
      </div>

      <div className="field">
        <label htmlFor="photos">Foto&apos;s (optioneel, max. 6)</label>
        <input id="photos" name="photos" type="file" accept="image/*" multiple />
        <span className="hint">Met foto&apos;s krijg je snellere en betere reacties.</span>
      </div>

      <div className="grid grid-3" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="postcode">Postcode</label>
          <input id="postcode" name="postcode" type="text" placeholder="3991 AB" required autoComplete="postal-code" />
        </div>
        <div className="field">
          <label htmlFor="city">Plaats</label>
          <input id="city" name="city" type="text" required autoComplete="address-level2" />
        </div>
        <div className="field">
          <label htmlFor="timing">Wanneer?</label>
          <select id="timing" name="timing" defaultValue={TIMINGS[1]}>
            {TIMINGS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <p className="small muted">Schilders zien alleen je plaats en de eerste cijfers van je postcode, nooit je naam of adres.</p>

      <button className="btn btn-lg" disabled={pending}>{pending ? 'Bezig met plaatsen…' : 'Klus gratis plaatsen'}</button>
    </form>
  );
}
