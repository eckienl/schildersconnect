export function SetupNotice() {
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="alert alert-warn">
        <strong>Nog niet gekoppeld aan de database.</strong> Zet in Vercel de omgevingsvariabelen
        NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY en SUPABASE_SERVICE_ROLE_KEY en draai
        supabase/schema.sql in Supabase. Tot die tijd werken inloggen en klussen nog niet.
      </div>
    </div>
  );
}
