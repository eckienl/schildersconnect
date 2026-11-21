'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signIn, signUp, type AuthState } from '@/app/auth/actions';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <form action={action} className="form">
      {state.error && <div className="alert alert-error">{state.error}</div>}
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="email">E-mailadres</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Wachtwoord</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="btn btn-lg" disabled={pending}>{pending ? 'Bezig…' : 'Inloggen'}</button>
      <p className="small muted center">
        Nog geen account? <Link href={`/registreren?next=${encodeURIComponent(next)}`}>Registreer als particulier</Link> of{' '}
        <Link href="/registreren?rol=schilder">meld je aan als schilder</Link>.
      </p>
    </form>
  );
}

export function SignupForm({ role, next }: { role: 'particulier' | 'schilder'; next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
  if (state.info) return <div className="alert alert-success">{state.info}</div>;
  return (
    <form action={action} className="form">
      {state.error && <div className="alert alert-error">{state.error}</div>}
      <input type="hidden" name="role" value={role} />
      <input type="hidden" name="next" value={next} />
      <div className="field">
        <label htmlFor="full_name">{role === 'schilder' ? 'Je naam (contactpersoon)' : 'Je naam'}</label>
        <input id="full_name" name="full_name" type="text" autoComplete="name" required />
      </div>
      <div className="grid grid-2" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="email">E-mailadres</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefoonnummer</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required />
        </div>
      </div>
      <div className="field">
        <label htmlFor="password">Wachtwoord</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <span className="hint">Minimaal 8 tekens.</span>
      </div>
      <label className="checkbox">
        <input type="checkbox" name="terms" />
        <span>
          Ik ga akkoord met de voorwaarden en de privacyverklaring.{' '}
          {role === 'particulier'
            ? 'Mijn contactgegevens worden alleen gedeeld met schilders die ik zelf kies.'
            : 'Mijn gegevens worden gecontroleerd voordat ik opdrachten kan zien.'}
        </span>
      </label>
      <button className="btn btn-lg" disabled={pending}>
        {pending ? 'Bezig…' : role === 'schilder' ? 'Account aanmaken en doorgaan' : 'Account aanmaken'}
      </button>
      <p className="small muted center">
        Al een account? <Link href={`/inloggen?next=${encodeURIComponent(next)}`}>Log in</Link>
      </p>
    </form>
  );
}
