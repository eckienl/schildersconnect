-- SchildersConnect: update 2 (betalen met Mollie, facturen, problemen melden)
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run. Safe to run twice.

-- Purchases: amounts are stored in cents excl. VAT (column name kept for compatibility).
comment on column public.purchases.price_eur is 'Bedrag in centen, excl. btw';
alter table public.purchases add column if not exists mollie_payment_id text;
alter table public.purchases add column if not exists invoice_number text unique;
alter table public.purchases add column if not exists method text not null default 'handmatig';
create index if not exists purchases_mollie_idx on public.purchases(mollie_payment_id);

create sequence if not exists public.invoice_seq start 1;

-- Confirming a payment now also assigns an invoice number (SC2026-00001).
create or replace function public.confirm_purchase(p_purchase uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  p record;
begin
  select * into p from purchases where id = p_purchase for update;
  if not found then return 'niet_gevonden'; end if;
  if p.status <> 'open' then return 'al_verwerkt'; end if;

  update purchases
     set status = 'paid',
         paid_at = now(),
         invoice_number = 'SC' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_seq')::text, 5, '0')
   where id = p_purchase;
  update painters set credits = credits + p.credits where id = p.painter_id;
  insert into credit_transactions (painter_id, amount, reason, note)
  values (p.painter_id, p.credits, 'aankoop', 'Bundel ' || p.bundle);
  return 'ok';
end;
$$;
revoke execute on function public.confirm_purchase(uuid) from public, anon, authenticated;
grant execute on function public.confirm_purchase(uuid) to service_role;

-- Painters can report a match (fake or unreachable customer, job does not match the budget).
alter table public.responses add column if not exists report_reason text not null default '';
alter table public.responses add column if not exists report_note text not null default '';
alter table public.responses add column if not exists report_status text not null default '';
alter table public.responses drop constraint if exists responses_report_status_check;
alter table public.responses add constraint responses_report_status_check
  check (report_status in ('', 'open', 'afgewezen', 'teruggeboekt'));
