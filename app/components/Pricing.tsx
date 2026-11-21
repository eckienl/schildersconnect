import Link from 'next/link';
import { BUNDLES, WELCOME_CREDITS } from '@/lib/config';
import { euro } from '@/lib/budget';

export function Pricing() {
  return (
    <div className="pricing">
      <div className="price-card">
        <div className="ph">Welkom</div>
        <div className="pb">
          <div className="amount">€ 0</div>
          <div className="per">na goedkeuring</div>
          <ul>
            <li>{WELCOME_CREDITS} gratis credits</li>
            <li>Bedrijfsprofiel</li>
            <li>Onbeperkt gratis reageren</li>
          </ul>
          <Link href="/registreren?rol=schilder" className="btn btn-ghost btn-block">Start gratis</Link>
        </div>
      </div>
      {BUNDLES.map((b, i) => (
        <div key={b.id} className={`price-card ${i === 1 ? 'hl' : ''} ${i === 2 ? 'dark' : ''}`}>
          {i === 1 && <span className="ribbon">Meest gekozen</span>}
          <div className="ph">{b.name}</div>
          <div className="pb">
            <div className="amount">{euro(b.priceEur)}</div>
            <div className="per">eenmalig · {b.credits} credits</div>
            <ul>
              <li>{b.credits} credits{b.bonus ? ` (${b.bonus} bonus)` : ''}</li>
              <li>Vervallen nooit</li>
              <li>Credits terug bij een nepklant</li>
            </ul>
            <Link href="/registreren?rol=schilder" className={`btn btn-block ${i === 2 ? 'btn-navy' : i === 1 ? '' : 'btn-ghost'}`}>Kies {b.name}</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
