import Link from 'next/link';
import { BUNDLES, WELCOME_CREDITS, WELCOME_LIMIT, eur, exVat, inclVat } from '@/lib/config';

export function Pricing({ welcomeLeft }: { welcomeLeft?: number }) {
  return (
    <div className="pricing">
      <div className="price-card">
        <div className="ph">Welkom</div>
        <div className="pb">
          <div className="amount">€ 0</div>
          <div className="per">na goedkeuring</div>
          <ul>
            <li>{WELCOME_CREDITS} gratis credits voor de eerste {WELCOME_LIMIT} schilders{typeof welcomeLeft === 'number' ? ` (nog ${welcomeLeft} plekken)` : ''}</li>
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
            <div className="amount" style={{ fontSize: '1.9rem' }}>{eur(exVat(b.priceCents))}</div>
            <div className="per">excl. btw · {eur(inclVat(b.priceCents))} incl. btw</div>
            <ul>
              <li>{b.credits} credits ({eur(exVat(b.priceCents) / b.credits)} per credit)</li>
              {b.discount && <li>{b.discount} op de creditprijs</li>}
              <li>Vervallen nooit</li>
              <li>Terug bij nep- of onbereikbare klant</li>
            </ul>
            <Link href="/registreren?rol=schilder" className={`btn btn-block ${i === 2 ? 'btn-navy' : i === 1 ? '' : 'btn-ghost'}`}>Kies {b.name}</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
