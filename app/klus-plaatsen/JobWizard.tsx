'use client';

import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { createJob, updateJob } from './actions';
import { CONDITIONS, JOB_TYPES, SUBSTRATES, TIMINGS } from '@/lib/config';
import { BUDGETS, euro } from '@/lib/budget';
import { Icon } from '@/app/components/Icon';

const TYPE_ICON: Record<string, string> = {
  'Muren en plafonds': 'wall',
  'Latex spuitwerk': 'spray',
  'Kozijnen en deuren': 'door',
  'Buitengevel / houtwerk': 'house',
  'Trap en trapgat': 'stairs',
  'Behang en glasvlies': 'brush',
  'Compleet huis': 'roller',
  'Zakelijk / bedrijfspand': 'building',
  Overig: 'plus',
};

export type JobDefaults = {
  id?: string;
  job_type?: string;
  location_type?: string;
  surface_m2?: number;
  substrate?: string;
  condition?: string;
  scaffold_needed?: string;
  timing?: string;
  budget?: string;
  own_amount?: number;
  title?: string;
  description?: string;
  postcode?: string;
  city?: string;
  photos?: string[];
};

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

export function JobWizard({ loggedIn, defaults = {}, budgetLocked = false }: { loggedIn: boolean; defaults?: JobDefaults; budgetLocked?: boolean }) {
  const edit = Boolean(defaults.id);
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();
  const [v, setV] = useState({
    job_type: defaults.job_type ?? '',
    location_type: defaults.location_type ?? '',
    surface_m2: defaults.surface_m2 ? String(defaults.surface_m2) : '',
    scaffold_needed: defaults.scaffold_needed ?? 'weet niet',
    timing: defaults.timing ?? '',
    budget: defaults.budget ?? '',
    own_amount: defaults.own_amount ? String(defaults.own_amount) : '',
    title: defaults.title ?? '',
    postcode: defaults.postcode ?? '',
    city: defaults.city ?? '',
  });
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));

  const steps = ['Soort werk', 'Binnen of buiten', 'Omvang', 'Planning en budget', 'Omschrijving', 'Locatie', edit ? 'Controleren' : loggedIn ? 'Controleren' : 'Jouw gegevens'];
  const last = steps.length - 1;

  function check(s: number): string {
    if (s === 0 && !v.job_type) return 'Kies wat er geschilderd moet worden.';
    if (s === 1 && !v.location_type) return 'Kies of het binnen- of buitenwerk is.';
    if (s === 2 && !(Number(v.surface_m2) > 0)) return 'Vul ongeveer in hoeveel m² het is.';
    if (s === 3 && !v.timing) return 'Kies wanneer het werk moet gebeuren.';
    if (s === 3 && !v.budget && !(Number(v.own_amount) > 0)) return 'Kies een budget of vul zelf een richtprijs in.';
    if (s === 4 && v.title.trim().length < 4) return 'Geef je opdracht een korte titel.';
    if (s === 5 && !/^\d{4}\s?[a-zA-Z]{2}$/.test(v.postcode.trim())) return 'Vul een geldige postcode in, bijvoorbeeld 3991 AB.';
    if (s === 5 && !v.city.trim()) return 'Vul je woonplaats in.';
    return '';
  }

  function next() {
    const e = check(step);
    if (e) return setError(e);
    setError('');
    setStep((s) => Math.min(last, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function prev() {
    setError('');
    setStep((s) => Math.max(0, s - 1));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < last) return next();
    for (let s = 0; s < last; s++) {
      const msg = check(s);
      if (msg) { setStep(s); return setError(msg); }
    }
    setError('');
    const fd = new FormData(e.currentTarget);
    const files = fd.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0).slice(0, 6);
    fd.delete('photos');
    for (const f of files) fd.append('photos', await resize(f));
    const total = (fd.getAll('photos') as File[]).reduce((sum, f) => sum + f.size, 0);
    if (total > 3.5 * 1024 * 1024) return setError('De foto’s zijn samen te groot. Kies minder foto’s.');
    start(async () => {
      const res = edit ? await updateJob(defaults.id!, fd) : await createJob(fd);
      if (res?.error) setError(res.error);
    });
  }

  const budgetText = Number(v.own_amount) > 0
    ? `Richtprijs ${euro(Number(v.own_amount))}`
    : BUDGETS.find((b) => b.id === v.budget)?.label ?? '–';
  const show = (s: number) => ({ display: step === s ? 'block' : 'none' });

  return (
    <form ref={formRef} onSubmit={onSubmit} className="wizard" noValidate>
      <div className="row between small muted">
        <span>Stap {step + 1} van {steps.length} · {steps[step]}</span>
        <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
      </div>
      <div className="wizard-progress"><span style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>

      <div className="card" style={{ marginTop: 18 }}>
        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        {/* 1. Soort werk */}
        <div className="wizard-step" style={show(0)}>
          <h2>Wat moet er geschilderd worden?</h2>
          <p className="muted">Kies wat het beste past. Je kunt het straks toelichten.</p>
          <div className="options big">
            {JOB_TYPES.map((t) => (
              <label key={t} className="option">
                <input type="radio" name="job_type" value={t} checked={v.job_type === t} onChange={set('job_type')} />
                <span><Icon name={TYPE_ICON[t] ?? 'roller'} size={28} />{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 2. Binnen of buiten */}
        <div className="wizard-step" style={show(1)}>
          <h2>Is het binnen- of buitenwerk?</h2>
          <p className="muted">Buitenwerk vraagt vaak om ander materiaal en soms een steiger.</p>
          <div className="options big">
            {[['binnen', 'Binnen', 'house'], ['buiten', 'Buiten', 'sun'], ['beide', 'Binnen én buiten', 'roller']].map(([val, label, icon]) => (
              <label key={val} className="option">
                <input type="radio" name="location_type" value={val} checked={v.location_type === val} onChange={set('location_type')} />
                <span><Icon name={icon} size={28} />{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 3. Omvang */}
        <div className="wizard-step" style={show(2)}>
          <h2>Hoe groot is het werk?</h2>
          <p className="muted">Een schatting is prima. Een kamer van 4 × 4 meter heeft ongeveer 45 m² muur en 16 m² plafond.</p>
          <div className="form">
            <div className="field">
              <label htmlFor="surface_m2">Oppervlakte in m²</label>
              <input id="surface_m2" name="surface_m2" type="number" min={1} max={20000} inputMode="numeric" value={v.surface_m2} onChange={set('surface_m2')} style={{ maxWidth: 220 }} />
            </div>
            <div className="grid grid-2" style={{ gap: 16 }}>
              <div className="field">
                <label htmlFor="substrate">Ondergrond</label>
                <select id="substrate" name="substrate" defaultValue={defaults.substrate || SUBSTRATES[0]}>
                  {SUBSTRATES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="condition">Staat van het huidige schilderwerk</label>
                <select id="condition" name="condition" defaultValue={defaults.condition || CONDITIONS[0]}>
                  {CONDITIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {v.location_type !== 'binnen' && (
              <div className="field">
                <span className="label">Is er een steiger of hoogwerker nodig?</span>
                <div className="options">
                  {['ja', 'nee', 'weet niet'].map((val) => (
                    <label key={val} className="option">
                      <input type="radio" name="scaffold_needed" value={val} checked={v.scaffold_needed === val} onChange={set('scaffold_needed')} />
                      <span>{val[0].toUpperCase() + val.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Planning en budget */}
        <div className="wizard-step" style={show(3)}>
          <h2>Wanneer en voor welk budget?</h2>
          <div className="form" style={{ marginTop: 12 }}>
            <div className="field">
              <span className="label">Wanneer moet het gebeuren?</span>
              <div className="options">
                {TIMINGS.map((t) => (
                  <label key={t} className="option">
                    <input type="radio" name="timing" value={t} checked={v.timing === t} onChange={set('timing')} />
                    <span><Icon name="clock" size={20} />{t}</span>
                  </label>
                ))}
              </div>
            </div>
            {budgetLocked ? (
              <div className="alert alert-info">
                Er is al een schilder gekozen, daarom ligt het budget van deze opdracht vast ({budgetText}).
                <input type="hidden" name="budget" value={v.budget} />
                <input type="hidden" name="own_amount" value={v.own_amount} />
              </div>
            ) : (
              <>
                <div className="field">
                  <span className="label">Wat is ongeveer je budget?</span>
                  <div className="options">
                    {BUDGETS.map((b) => (
                      <label key={b.id} className="option">
                        <input type="radio" name="budget" value={b.id} checked={v.budget === b.id && !(Number(v.own_amount) > 0)} onChange={(e) => setV((s) => ({ ...s, budget: e.target.value, own_amount: '' }))} />
                        <span>{b.label}<small>{b.hint}</small></span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="own_amount">Of vul zelf een richtprijs in (optioneel)</label>
                  <div className="euro-input" style={{ maxWidth: 220 }}>
                    <span>€</span>
                    <input id="own_amount" name="own_amount" type="number" min={0} step={50} inputMode="numeric" placeholder="Bijv. 1500" value={v.own_amount} onChange={set('own_amount')} />
                  </div>
                  <span className="hint">Schilders zien je budget of richtprijs. Zo krijg je reacties die bij je verwachting passen.</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 5. Omschrijving */}
        <div className="wizard-step" style={show(4)}>
          <h2>Omschrijf je opdracht</h2>
          <p className="muted">Hoe duidelijker, hoe beter de reacties. Foto&apos;s helpen enorm.</p>
          <div className="form">
            <div className="field">
              <label htmlFor="title">Korte titel</label>
              <input id="title" name="title" type="text" maxLength={90} placeholder="Bijv. Woonkamer en hal sauzen" value={v.title} onChange={set('title')} />
            </div>
            <div className="field">
              <label htmlFor="description">Omschrijving</label>
              <textarea id="description" name="description" maxLength={3000} defaultValue={defaults.description} placeholder="Wat moet er gebeuren? Kleurwensen, bijzonderheden, bereikbaarheid…" />
              <span className="hint">Zet hier geen telefoonnummer of e-mailadres in; die deel je pas met de schilder die jij kiest.</span>
            </div>
            {defaults.photos && defaults.photos.length > 0 && (
              <div className="field">
                <span className="label">Huidige foto&apos;s <span className="muted small">(vink aan om te verwijderen)</span></span>
                <div className="photos">
                  {defaults.photos.map((src) => (
                    <label key={src} className="photo-pick">
                      <img src={src} alt="Foto van de opdracht" />
                      <input type="checkbox" name="remove_photo" value={src} aria-label="Foto verwijderen" />
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="field">
              <label htmlFor="photos"><Icon name="camera" size={18} /> Foto&apos;s toevoegen (optioneel, max. 6)</label>
              <input id="photos" name="photos" type="file" accept="image/*" multiple />
            </div>
          </div>
        </div>

        {/* 6. Locatie */}
        <div className="wizard-step" style={show(5)}>
          <h2>Waar moet er geschilderd worden?</h2>
          <p className="muted">Schilders zien alleen je plaats en de eerste cijfers van je postcode, nooit je naam of adres.</p>
          <div className="grid grid-2" style={{ gap: 16 }}>
            <div className="field">
              <label htmlFor="postcode">Postcode</label>
              <input id="postcode" name="postcode" type="text" placeholder="3991 AB" autoComplete="postal-code" value={v.postcode} onChange={set('postcode')} />
            </div>
            <div className="field">
              <label htmlFor="city">Plaats</label>
              <input id="city" name="city" type="text" autoComplete="address-level2" value={v.city} onChange={set('city')} />
            </div>
          </div>
        </div>

        {/* 7. Gegevens / controleren */}
        <div className="wizard-step" style={show(last)}>
          <h2>{edit ? 'Controleer je wijzigingen' : loggedIn ? 'Controleer je opdracht' : 'Bijna klaar! Waar mogen schilders je bereiken?'}</h2>
          <dl className="summary" style={{ margin: '14px 0 20px' }}>
            <dt>Opdracht</dt><dd>{v.title || '–'}</dd>
            <dt>Soort werk</dt><dd>{v.job_type || '–'} · {v.location_type || '–'}</dd>
            <dt>Oppervlakte</dt><dd>{v.surface_m2 ? `ca. ${v.surface_m2} m²` : '–'}</dd>
            <dt>Planning</dt><dd>{v.timing || '–'}</dd>
            <dt>Budget</dt><dd>{budgetText}</dd>
            <dt>Locatie</dt><dd>{v.postcode} {v.city}</dd>
          </dl>
          {!edit && !loggedIn && (
            <div className="form">
              <p className="muted" style={{ margin: 0 }}>
                We maken een gratis account voor je aan, zodat je reacties kunt bekijken en je opdracht kunt aanpassen. Je
                gegevens gaan alleen naar schilders die jij kiest.
              </p>
              <div className="field">
                <label htmlFor="full_name">Je naam</label>
                <input id="full_name" name="full_name" type="text" autoComplete="name" />
              </div>
              <div className="grid grid-2" style={{ gap: 16 }}>
                <div className="field">
                  <label htmlFor="email">E-mailadres</label>
                  <input id="email" name="email" type="email" autoComplete="email" />
                </div>
                <div className="field">
                  <label htmlFor="phone">Telefoonnummer</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="password">Kies een wachtwoord</label>
                <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} />
                <span className="hint">Minimaal 8 tekens.</span>
              </div>
              <label className="checkbox">
                <input type="checkbox" name="terms" />
                <span>Ik ga akkoord met de voorwaarden en de privacyverklaring. Ik begrijp dat SchildersConnect bemiddelt en niet kan garanderen dat er schilders reageren of dat de opdracht wordt uitgevoerd.</span>
              </label>
              <p className="small muted" style={{ margin: 0 }}>Heb je al een account? <Link href="/inloggen?next=/klus-plaatsen">Log dan eerst in</Link>.</p>
            </div>
          )}
        </div>

        <div className="wizard-nav">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={prev}><Icon name="back" size={18} /> Vorige</button>
          ) : <span />}
          {step < last ? (
            <button type="button" className="btn" onClick={next}>Volgende <Icon name="arrow" size={18} /></button>
          ) : (
            <button type="submit" className="btn btn-lg" disabled={pending}>
              {pending ? 'Bezig…' : edit ? 'Wijzigingen opslaan' : 'Opdracht gratis plaatsen'}
            </button>
          )}
        </div>
      </div>
      {!edit && <p className="small muted center" style={{ marginTop: 12 }}>Gratis en vrijblijvend · Alleen schilders die jij kiest krijgen je contactgegevens</p>}
    </form>
  );
}
