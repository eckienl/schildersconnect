'use client';

import { useActionState } from 'react';
import { savePainter } from '../actions';
import { SPECIALTIES } from '@/lib/config';

export function PainterForm({ painter }: { painter: any }) {
  const [state, action, pending] = useActionState<{ error?: string }, FormData>(savePainter, {});
  const p = painter ?? {};
  return (
    <form action={action} className="form">
      {state.error && <div className="alert alert-error">{state.error}</div>}
      <div className="grid grid-2" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="company_name">Bedrijfsnaam</label>
          <input id="company_name" name="company_name" type="text" defaultValue={p.company_name} required />
        </div>
        <div className="field">
          <label htmlFor="kvk">KvK-nummer</label>
          <input id="kvk" name="kvk" type="text" inputMode="numeric" defaultValue={p.kvk} placeholder="12345678" required />
        </div>
      </div>
      <div className="grid grid-3" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="postcode">Postcode vestiging</label>
          <input id="postcode" name="postcode" type="text" defaultValue={p.postcode} required />
        </div>
        <div className="field">
          <label htmlFor="city">Plaats</label>
          <input id="city" name="city" type="text" defaultValue={p.city} required />
        </div>
        <div className="field">
          <label htmlFor="radius_km">Werkgebied (km)</label>
          <input id="radius_km" name="radius_km" type="number" min={5} max={150} defaultValue={p.radius_km ?? 25} />
        </div>
      </div>
      <div className="field">
        <span className="label">Specialisaties</span>
        <div className="options">
          {SPECIALTIES.map((s) => (
            <label key={s} className="option">
              <input type="checkbox" name="specialties" value={s} defaultChecked={p.specialties?.includes(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="website">Website of portfolio (optioneel)</label>
        <input id="website" name="website" type="text" defaultValue={p.website} placeholder="www.jouwbedrijf.nl" />
      </div>
      <div className="field">
        <label htmlFor="description">Over je bedrijf</label>
        <textarea id="description" name="description" defaultValue={p.description} placeholder="Ervaring, soort werk, garantie, keurmerken…" />
        <span className="hint">Klanten zien dit bij je reacties.</span>
      </div>
      <label className="checkbox">
        <input type="checkbox" name="insured" defaultChecked={p.insured} />
        <span>Ik heb een bedrijfsaansprakelijkheidsverzekering.</span>
      </label>
      <label className="checkbox">
        <input type="checkbox" name="truth" />
        <span>Mijn gegevens kloppen en SchildersConnect mag ze controleren (KvK, verzekering, portfolio). Ik begrijp dat een match contact met een klant geeft maar geen gegarandeerde opdracht, en dat ik vóór een match geen contact buiten het platform om zoek.</span>
      </label>
      <button className="btn btn-lg" disabled={pending}>{pending ? 'Bezig…' : painter?.status === 'approved' ? 'Opslaan' : 'Aanmelding versturen'}</button>
    </form>
  );
}
