export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        <h1 style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)' }}>{title}</h1>
        {updated && <p className="muted small">Versie: {updated}</p>}
        <div className="card legal">{children}</div>
      </div>
    </div>
  );
}
