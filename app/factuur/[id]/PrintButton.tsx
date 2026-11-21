'use client';

export function PrintButton() {
  return <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Opslaan als PDF / printen</button>;
}
