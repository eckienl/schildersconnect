-- SchildersConnect database schema
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.
-- All tables have Row Level Security enabled without policies: the browser
-- (anon key) cannot read or write anything directly. The Next.js server uses
-- the service_role key and enforces the business rules below.

create extension if not exists "pgcrypto";

-- Profiles -------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'particulier' check (role in ('particulier', 'schilder', 'admin')),
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

-- Painters (one row per schilder account) ------------------------------------
create table if not exists public.painters (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  kvk text not null,
  postcode text not null,
  city text not null,
  radius_km int not null default 25,
  insured boolean not null default false,
  website text not null default '',
  description text not null default '',
  specialties text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'needs_info', 'approved', 'rejected')),
  admin_note text not null default '',
  credits int not null default 0 check (credits >= 0),
  weekly_limit int,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

-- Jobs (klussen) -------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  location_type text not null check (location_type in ('binnen', 'buiten', 'beide')),
  job_type text not null,
  surface_m2 int not null check (surface_m2 > 0),
  substrate text not null default '',
  condition text not null default '',
  scaffold_needed text not null default 'weet niet',
  description text not null default '',
  postcode text not null,
  city text not null,
  timing text not null default '',
  estimate_low int not null,
  estimate_high int not null,
  size_class text not null check (size_class in ('klein', 'middel', 'groot')),
  match_cost int not null,
  photos text[] not null default '{}',
  status text not null default 'open' check (status in ('open', 'closed', 'removed')),
  created_at timestamptz not null default now()
);
create index if not exists jobs_status_idx on public.jobs(status, created_at desc);

-- Responses (reacties) -------------------------------------------------------
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  painter_id uuid not null references public.painters(id) on delete cascade,
  message text not null,
  price_indication text not null default '',
  status text not null default 'sent' check (status in ('sent', 'chosen', 'refunded')),
  credits_charged int not null default 0,
  chosen_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, painter_id)
);

-- Credit ledger --------------------------------------------------------------
create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  painter_id uuid not null references public.painters(id) on delete cascade,
  amount int not null,
  reason text not null check (reason in ('welkom', 'aankoop', 'match', 'terugboeking', 'correctie')),
  job_id uuid references public.jobs(id) on delete set null,
  note text not null default '',
  created_at timestamptz not null default now()
);

-- Purchase requests (manual payment in the MVP) -------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  painter_id uuid not null references public.painters(id) on delete cascade,
  bundle text not null,
  price_eur int not null,
  credits int not null,
  status text not null default 'open' check (status in ('open', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.painters enable row level security;
alter table public.jobs enable row level security;
alter table public.responses enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.purchases enable row level security;

-- Create a profile for every new auth user ------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role text := coalesce(new.raw_user_meta_data->>'role', 'particulier');
begin
  if v_role not in ('particulier', 'schilder') then
    v_role := 'particulier'; -- admin can never be self-assigned
  end if;
  insert into public.profiles (id, role, full_name, email, phone)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customer chooses a painter: atomic credit charge -----------------------------
create or replace function public.choose_response(p_response uuid, p_customer uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  r record;
  v_chosen int;
  v_week int;
  v_limit int;
begin
  select resp.id, resp.status, resp.painter_id, j.id as job_id, j.customer_id, j.match_cost, j.status as job_status
    into r
    from responses resp join jobs j on j.id = resp.job_id
   where resp.id = p_response
   for update of resp;

  if not found then return 'niet_gevonden'; end if;
  if r.customer_id <> p_customer then return 'geen_toegang'; end if;
  if r.job_status <> 'open' then return 'klus_gesloten'; end if;
  if r.status = 'chosen' then return 'al_gekozen'; end if;

  select count(*) into v_chosen from responses where job_id = r.job_id and status = 'chosen';
  if v_chosen >= 3 then return 'maximum_bereikt'; end if;

  select weekly_limit into v_limit from painters where id = r.painter_id;
  if v_limit is not null then
    select coalesce(-sum(amount), 0) into v_week
      from credit_transactions
     where painter_id = r.painter_id and reason = 'match' and created_at > now() - interval '7 days';
    if v_week + r.match_cost > v_limit then return 'weeklimiet_schilder'; end if;
  end if;

  update painters set credits = credits - r.match_cost
   where id = r.painter_id and credits >= r.match_cost;
  if not found then return 'onvoldoende_credits_schilder'; end if;

  insert into credit_transactions (painter_id, amount, reason, job_id, note)
  values (r.painter_id, -r.match_cost, 'match', r.job_id, 'Gekozen door klant');

  update responses set status = 'chosen', credits_charged = r.match_cost, chosen_at = now()
   where id = p_response;

  return 'ok';
end;
$$;

-- Admin refunds a match (fake or unreachable customer) -------------------------
create or replace function public.refund_response(p_response uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  r record;
begin
  select * into r from responses where id = p_response for update;
  if not found then return 'niet_gevonden'; end if;
  if r.status <> 'chosen' then return 'niet_gekozen'; end if;

  update painters set credits = credits + r.credits_charged where id = r.painter_id;
  insert into credit_transactions (painter_id, amount, reason, job_id, note)
  values (r.painter_id, r.credits_charged, 'terugboeking', r.job_id, 'Match teruggeboekt door SchildersConnect');
  update responses set status = 'refunded' where id = p_response;
  return 'ok';
end;
$$;

-- Admin approves a painter: +25 welcome credits (only the first time) ----------
create or replace function public.approve_painter(p_painter uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_had_welcome boolean;
begin
  update painters set status = 'approved', approved_at = coalesce(approved_at, now()), admin_note = ''
   where id = p_painter;
  if not found then return 'niet_gevonden'; end if;

  select exists(select 1 from credit_transactions where painter_id = p_painter and reason = 'welkom')
    into v_had_welcome;
  if not v_had_welcome then
    update painters set credits = credits + 25 where id = p_painter;
    insert into credit_transactions (painter_id, amount, reason, note)
    values (p_painter, 25, 'welkom', 'Welkomstcredits');
  end if;
  return 'ok';
end;
$$;

-- Admin confirms a paid purchase ----------------------------------------------
create or replace function public.confirm_purchase(p_purchase uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  p record;
begin
  select * into p from purchases where id = p_purchase for update;
  if not found then return 'niet_gevonden'; end if;
  if p.status <> 'open' then return 'al_verwerkt'; end if;

  update purchases set status = 'paid', paid_at = now() where id = p_purchase;
  update painters set credits = credits + p.credits where id = p.painter_id;
  insert into credit_transactions (painter_id, amount, reason, note)
  values (p.painter_id, p.credits, 'aankoop', 'Bundel ' || p.bundle);
  return 'ok';
end;
$$;

-- Only the server (service_role) may call these functions.
revoke execute on function public.choose_response(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.refund_response(uuid) from public, anon, authenticated;
revoke execute on function public.approve_painter(uuid) from public, anon, authenticated;
revoke execute on function public.confirm_purchase(uuid) from public, anon, authenticated;
grant execute on function public.choose_response(uuid, uuid) to service_role;
grant execute on function public.refund_response(uuid) to service_role;
grant execute on function public.approve_painter(uuid) to service_role;
grant execute on function public.confirm_purchase(uuid) to service_role;

-- Storage bucket for job photos (public read, uploads go through the server).
insert into storage.buckets (id, name, public)
values ('job-photos', 'job-photos', true)
on conflict (id) do nothing;

-- Make yourself admin after registering (replace the e-mail address):
-- update public.profiles set role = 'admin' where email = 'jij@voorbeeld.nl';
