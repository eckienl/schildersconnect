import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { budgetIdFor } from '@/lib/budget';
import { customerMenu } from '@/lib/menus';
import { DashShell } from '@/app/components/DashShell';
import { Icon } from '@/app/components/Icon';
import { JobWizard } from '@/app/klus-plaatsen/JobWizard';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireProfile(`/account/klus/${id}/bewerken`, 'particulier');
  const client = db();
  const { data: job } = await client.from('jobs').select('*').eq('id', id).maybeSingle();
  if (!job || (job.customer_id !== profile.id && profile.role !== 'admin')) notFound();
  const { count } = await client.from('responses').select('id', { count: 'exact', head: true }).eq('job_id', id).eq('status', 'chosen');
  const b = budgetIdFor(job.estimate_low, job.estimate_high);
  return (
    <DashShell title="Mijn account" icon="user" menu={await customerMenu(profile)} active="/account">
      <Link href={`/account/klus/${id}`} className="back"><Icon name="back" size={16} /> Terug naar opdracht</Link>
      <h1 style={{ fontSize: '1.7rem' }}>Opdracht bewerken</h1>
      {job.status !== 'open' ? (
        <div className="alert alert-info">Deze opdracht is gesloten en kan niet meer worden aangepast.</div>
      ) : (
        <JobWizard
          loggedIn
          budgetLocked={(count ?? 0) > 0}
          defaults={{
            id: job.id,
            job_type: job.job_type,
            location_type: job.location_type,
            surface_m2: job.surface_m2,
            substrate: job.substrate,
            condition: job.condition,
            scaffold_needed: job.scaffold_needed,
            timing: job.timing,
            budget: b.own ? '' : b.id,
            own_amount: b.own,
            title: job.title,
            description: job.description,
            postcode: job.postcode,
            city: job.city,
            photos: job.photos,
          }}
        />
      )}
    </DashShell>
  );
}
