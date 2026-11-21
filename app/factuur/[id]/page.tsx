import { notFound } from 'next/navigation';
import { requireProfile } from '@/lib/session';
import { db } from '@/lib/supabase/admin';
import { VAT, eur } from '@/lib/config';
import { COMPANY } from '@/lib/site';
import { PrintButton } from './PrintButton';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireProfile(`/factuur/${id}`);
  const { data: p } = await db()
    .from('purchases')
    .select('*, painters(company_name, kvk, postcode, city, profiles(full_name, email))')
    .eq('id', id)
    .maybeSingle();
  if (!p || p.status !== 'paid' || (p.painter_id !== profile.id && profile.role !== 'admin')) notFound();
  const ex = p.price_eur / 100;
  const vat = Math.round(p.price_eur * VAT) / 100;
  const total = Math.round(p.price_eur * (1 + VAT)) / 100;
  const pr: any = p.painters;

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 780 }}>
        <div className="row between" style={{ marginBottom: 16 }}>
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>Factuur {p.invoice_number}</h1>
          <PrintButton />
        </div>
        <div className="card" style={{ padding: 36 }}>
          <div className="row between" style={{ alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 800, fontStyle: 'italic', fontSize: '1.4rem' }}>Schilders<span className="accent">Connect</span></div>
              <div className="small muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
                {COMPANY.name}<br />{COMPANY.address}<br />KvK: {COMPANY.kvk}<br />Btw: {COMPANY.vat}<br />{COMPANY.email}
              </div>
            </div>
            <div style={{ textAlign: 'right' }} className="small">
              <div><strong>Factuurnummer</strong><br />{p.invoice_number}</div>
              <div style={{ marginTop: 8 }}><strong>Factuurdatum</strong><br />{new Date(p.paid_at).toLocaleDateString('nl-NL')}</div>
            </div>
          </div>
          <div style={{ margin: '28px 0' }} className="small">
            <strong>Aan</strong><br />
            {pr?.company_name}<br />t.a.v. {pr?.profiles?.full_name}<br />{pr?.postcode} {pr?.city}<br />KvK: {pr?.kvk}<br />{pr?.profiles?.email}
          </div>
          <table className="table" style={{ border: 0 }}>
            <thead><tr><th>Omschrijving</th><th style={{ textAlign: 'right' }}>Bedrag</th></tr></thead>
            <tbody>
              <tr><td>Creditbundel {p.bundle}: {p.credits} credits voor SchildersConnect</td><td style={{ textAlign: 'right' }}>{eur(ex)}</td></tr>
              <tr><td className="muted">Subtotaal excl. btw</td><td style={{ textAlign: 'right' }}>{eur(ex)}</td></tr>
              <tr><td className="muted">Btw {Math.round(VAT * 100)}%</td><td style={{ textAlign: 'right' }}>{eur(vat)}</td></tr>
              <tr><td><strong>Totaal</strong></td><td style={{ textAlign: 'right' }}><strong>{eur(total)}</strong></td></tr>
            </tbody>
          </table>
          <p className="small muted" style={{ marginTop: 20 }}>
            Voldaan via {p.method === 'ideal' ? 'iDEAL' : 'bankoverschrijving'} op {new Date(p.paid_at).toLocaleDateString('nl-NL')}. Credits vervallen niet.
          </p>
        </div>
      </div>
    </div>
  );
}
