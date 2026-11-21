import 'server-only';
import { db } from './supabase/admin';
import { sendMail } from './mail';
import { siteUrl } from './site';

/** Tells the painter that a purchase is paid and the credits are on the account. */
export async function mailPaid(purchaseId: string) {
  const { data } = await db().from('purchases').select('bundle, credits, invoice_number, painters(company_name, profiles(email))').eq('id', purchaseId).maybeSingle();
  const p: any = data;
  if (!p) return;
  await sendMail(p.painters?.profiles?.email, `Betaling ontvangen: ${p.credits} credits`, 'Je credits staan klaar',
    `<p>We hebben je betaling voor de bundel ${p.bundle} ontvangen. Er zijn ${p.credits} credits op je account gezet. Je factuur (${p.invoice_number ?? ''}) staat in je dashboard.</p>`,
    { label: 'Naar mijn credits', url: `${await siteUrl()}/schilder/credits` });
}
