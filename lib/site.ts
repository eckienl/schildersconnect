import 'server-only';
import { headers } from 'next/headers';

export async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const h = await headers();
  return `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('x-forwarded-host') ?? h.get('host')}`;
}

/** Company details for invoices and legal pages. Fill these in Vercel once the KvK registration is done. */
export const COMPANY = {
  name: process.env.COMPANY_NAME || 'SchildersConnect',
  address: process.env.COMPANY_ADDRESS || '[adres nog in te vullen]',
  kvk: process.env.COMPANY_KVK || '[KvK-nummer nog in te vullen]',
  vat: process.env.COMPANY_VAT || '[btw-nummer nog in te vullen]',
  iban: process.env.COMPANY_IBAN || '[IBAN nog in te vullen]',
  email: process.env.CONTACT_EMAIL || 'info@schildersconnect.nl',
};
