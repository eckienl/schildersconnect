import Link from 'next/link';

export function LogoMark({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M5 23 24 7l19 16" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 15V9.5h4.5V19" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 21v7M38 21v3" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <rect x="11" y="23" width="23" height="10" rx="4" fill="#f26a1b" />
      <rect x="13.5" y="25" width="9" height="2.2" rx="1.1" fill="#ffb27f" />
      <path d="M34 28h4.5v8H23.5v3.5" stroke="#f26a1b" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="20.5" y="38.5" width="6" height="7.5" rx="2.2" fill="#f26a1b" />
    </svg>
  );
}

export function Logo({ tagline = true }: { tagline?: boolean }) {
  return (
    <Link href="/" className="logo" aria-label="SchildersConnect, naar de homepage">
      <LogoMark />
      <span className="logo-text">
        <span className="logo-word">
          Schilders<span className="c">Connect</span>
        </span>
        {tagline && <span className="logo-tag">Het platform voor schilderwerk</span>}
      </span>
    </Link>
  );
}
