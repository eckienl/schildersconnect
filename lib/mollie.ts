import 'server-only';

const API = 'https://api.mollie.com/v2';
export const MOLLIE_ENABLED = Boolean(process.env.MOLLIE_API_KEY);

async function call(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.MOLLIE_API_KEY}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Mollie ${res.status}: ${data?.detail ?? 'onbekende fout'}`);
  return data;
}

/** Creates an iDEAL payment. `amountCents` is the amount the customer pays (incl. VAT). */
export async function createPayment(opts: { amountCents: number; description: string; redirectUrl: string; webhookUrl: string; purchaseId: string }) {
  return call('/payments', {
    method: 'POST',
    body: JSON.stringify({
      amount: { currency: 'EUR', value: (opts.amountCents / 100).toFixed(2) },
      description: opts.description,
      redirectUrl: opts.redirectUrl,
      webhookUrl: opts.webhookUrl,
      method: 'ideal',
      metadata: { purchaseId: opts.purchaseId },
    }),
  }) as Promise<{ id: string; _links: { checkout?: { href: string } } }>;
}

export async function getPayment(id: string) {
  return call(`/payments/${encodeURIComponent(id)}`) as Promise<{ id: string; status: string; metadata?: { purchaseId?: string } }>;
}
