import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { painterMenu } from '@/lib/menus';
import { JOB_TYPES } from '@/lib/config';
import { DashShell } from '@/app/components/DashShell';
import { JobRow } from '../JobRow';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ regio?: string; soort?: string }> }) {
  const sp = await searchParams;
  const { painter } = await requireProfile('/schilder/opdrachten', 'schilder');
  if (!painter || painter.status !== 'approved') redirect('/schilder');
  const client = db();
  const [{ data: mine }, { data }] = await Promise.all([
    client.from('responses').select('job_id').eq('painter_id', painter.id),
    client.from('jobs').select('id, title, job_type, city, postcode, location_type, surface_m2, estimate_low, estimate_high, match_cost, timing, photos, created_at, responses(count)').eq('status', 'open').order('created_at', { ascending: false }).limit(100),
  ]);
  const responded = new Set((mine ?? []).map((r: any) => r.job_id));
  let jobs = (data ?? []).filter((j: any) => !responded.has(j.id));
  if (sp.regio === '1') jobs = jobs.filter((j: any) => j.postcode.startsWith(painter.postcode.slice(0, 2)));
  if (sp.soort) jobs = jobs.filter((j: any) => j.job_type === sp.soort);
  const q = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { regio: sp.regio, soort: sp.soort, ...o };
    Object.entries(merged).forEach(([k, val]) => val && p.set(k, val));
    const s = p.toString();
    return s ? `/schilder/opdrachten?${s}` : '/schilder/opdrachten';
  };

  return (
    <DashShell title="Schildersaccount" icon="roller" menu={await painterMenu(painter)} active="/schilder/opdrachten">
      <div className="dash-head"><h1>Beschikbare opdrachten</h1></div>
      <p className="muted">Reageren is gratis. Je betaalt de matchprijs pas als de klant jou kiest.</p>
      <div className="chips" style={{ marginBottom: 18 }}>
        <Link href={q({ regio: sp.regio === '1' ? undefined : '1' })} className="chip" style={sp.regio === '1' ? { borderColor: 'var(--orange)', color: 'var(--orange-dark)' } : undefined}>
          Alleen mijn regio ({painter.postcode.slice(0, 2)}..)
        </Link>
        <Link href={q({ soort: undefined })} className="chip" style={!sp.soort ? { borderColor: 'var(--orange)', color: 'var(--orange-dark)' } : undefined}>Alle soorten</Link>
        {JOB_TYPES.map((t) => (
          <Link key={t} href={q({ soort: t })} className="chip" style={sp.soort === t ? { borderColor: 'var(--orange)', color: 'var(--orange-dark)' } : undefined}>{t}</Link>
        ))}
      </div>
      {jobs.length === 0 ? (
        <div className="empty">Geen opdrachten met deze filters. Je credits blijven gewoon staan.</div>
      ) : (
        <div className="list">{jobs.map((j: any) => <JobRow key={j.id} job={j} />)}</div>
      )}
    </DashShell>
  );
}
