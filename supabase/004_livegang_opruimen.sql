-- SchildersConnect 004: opruimen vlak vóór de livegang. Draai dit ÉÉN keer, NA het uitzetten van DEMO_MODE
-- in Vercel (anders maakt de site de demo-accounts meteen opnieuw aan) en VÓÓR de eerste echte verkoop.
--
-- 1. Verwijdert de vier demo-accounts met al hun voorbeeldopdrachten, reacties, credits en demo-aankopen.
--    Alles hangt aan het account (on delete cascade), dus er blijft niets achter.
-- 2. Zet de factuurnummering terug op SC{jaar}-00001, maar alleen als er geen enkele factuur meer bestaat.
--    Verwijder daarom eerst zelf jullie eigen testaccounts (Supabase > Authentication > Users),
--    zodat de eerste echte factuur ook echt nummer 1 is. Een doorlopende nummering is verplicht.

delete from auth.users where email like 'demo-%@schildersconnect.nl';

do $$
begin
  if not exists (select 1 from public.purchases where invoice_number is not null) then
    alter sequence public.invoice_seq restart with 1;
    raise notice 'Factuurnummering staat weer op 1.';
  else
    raise notice 'Er bestaan nog facturen; nummering NIET teruggezet. Verwijder eerst testaccounts.';
  end if;
end $$;

-- Controle: dit moet 0 opleveren.
select count(*) as demo_accounts_over from auth.users where email like 'demo-%@schildersconnect.nl';
