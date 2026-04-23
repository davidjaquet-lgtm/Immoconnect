# Supabase Edge Functions — ImmoConnect

## Comment déployer ces fonctions

1. Installez Supabase CLI : `npm install -g supabase`
2. Connectez-vous : `supabase login`
3. Liez votre projet : `supabase link --project-ref zxxhyefajfwqcxcfxpmg`
4. Déployez chaque fonction :
   - `supabase functions deploy envoyer-email`
   - `supabase functions deploy alerter-agents`
5. Ajoutez les secrets :
   - `supabase secrets set RESEND_API_KEY=your_key`
   - `supabase secrets set SUPABASE_URL=https://zxxhyefajfwqcxcfxpmg.supabase.co`
   - `supabase secrets set SUPABASE_SERVICE_KEY=your_service_key`

## Obtenir une clé Resend gratuite
1. Créez un compte sur resend.com
2. Vérifiez votre domaine immoconnect-agence.fr
3. Copiez votre clé API dans les secrets Supabase
