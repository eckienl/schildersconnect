import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="SchildersConnect home">
      <span className="logo-mark" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="15" height="7" rx="2" fill="#fff" />
          <path d="M18 6.5h2.5V12H11v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9" y="15" width="4" height="6" rx="1.2" fill="#fff" />
        </svg>
      </span>
      <span>
        Schilders<span className="c">Connect</span>
      </span>
    </Link>
  );
}
