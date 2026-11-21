-- SchildersConnect 003: vier prijsklassen (klein, middel, groot, extra) en 20 welkomstcredits.
-- Veilig om meerdere keren te draaien. Draai eerst 002, dan dit bestand.

alter table public.jobs drop constraint if exists jobs_size_class_check;
alter table public.jobs add constraint jobs_size_class_check
  check (size_class in ('klein', 'middel', 'groot', 'extra'));

-- Welkomstcredits: 20 (genoeg voor één match op een kleine of middelgrote klus), alleen de eerste keer.
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
    update painters set credits = credits + 20 where id = p_painter;
    insert into credit_transactions (painter_id, amount, reason, note)
    values (p_painter, 20, 'welkom', 'Welkomstcredits');
  end if;
  return 'ok';
end;
$$;
revoke execute on function public.approve_painter(uuid) from public, anon, authenticated;
