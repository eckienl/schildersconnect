import 'server-only';
import { db } from './supabase/admin';
import type { MenuItem } from '@/app/components/DashShell';
import type { Painter, Profile } from './session';

export async function customerMenu(profile: Profile): Promise<MenuItem[]> {
  const client = db();
  const { data: jobs } = await client.from('jobs').select('id').eq('customer_id', profile.id).neq('status', 'removed');
  const ids = (jobs ?? []).map((j: any) => j.id);
  let open = 0;
  if (ids.length) {
    const { count } = await client.from('responses').select('id', { count: 'exact', head: true }).in('job_id', ids).eq('status', 'sent');
    open = count ?? 0;
  }
  return [
    { href: '/account', label: 'Mijn opdrachten', icon: 'house', badge: ids.length || undefined },
    { href: '/klus-plaatsen', label: 'Nieuwe opdracht', icon: 'plus' },
    { href: '/account/reacties', label: 'Ontvangen reacties', icon: 'inbox', badge: open, badgeTone: 'orange' },
  ];
}

export async function painterMenu(painter: Painter | null): Promise<MenuItem[]> {
  const approved = painter?.status === 'approved';
  let available = 0;
  if (approved) {
    const client = db();
    const [{ count: openJobs }, { count: mine }] = await Promise.all([
      client.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      client.from('responses').select('id', { count: 'exact', head: true }).eq('painter_id', painter!.id),
    ]);
    available = Math.max(0, (openJobs ?? 0) - (mine ?? 0));
  }
  const items: MenuItem[] = [{ href: '/schilder', label: 'Dashboard', icon: 'grid' }];
  if (approved) {
    items.push(
      { href: '/schilder/opdrachten', label: 'Beschikbare opdrachten', icon: 'list', badge: available, badgeTone: 'orange' },
      { href: '/schilder/reacties', label: 'Mijn reacties', icon: 'chat' },
    );
  }
  items.push({ href: '/schilder/aanmelden', label: 'Bedrijfsprofiel', icon: 'building' });
  if (approved) items.push({ href: '/schilder/credits', label: 'Credits', icon: 'coins', badge: painter!.credits, badgeTone: 'green' });
  return items;
}

export async function adminMenu(): Promise<MenuItem[]> {
  const client = db();
  const [{ count: pending }, { count: purchases }] = await Promise.all([
    client.from('painters').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    client.from('purchases').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);
  return [
    { href: '/admin', label: 'Schilders', icon: 'shield', badge: pending ?? 0, badgeTone: 'orange' },
    { href: '/admin?tab=klussen', label: 'Klussen', icon: 'list' },
    { href: '/admin?tab=aankopen', label: 'Aankopen', icon: 'coins', badge: purchases ?? 0, badgeTone: 'orange' },
    { href: '/admin?tab=matches', label: 'Matches', icon: 'handshake' },
  ];
}
