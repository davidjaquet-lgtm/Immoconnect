-- Documents complémentaires vendeur (compte rendu de copro, règlement, diagnostics…)
-- → bucket PRIVÉ : lecture uniquement via URL signées (edge function doc-url)

-- 1. Bucket privé (public = false)
insert into storage.buckets (id, name, public)
values ('documents-vendeurs', 'documents-vendeurs', false)
on conflict (id) do update set public = false;

-- 2. Dépôt autorisé (le questionnaire vendeur peut être rempli sans compte)
drop policy if exists "depot autres docs vendeurs" on storage.objects;
create policy "depot autres docs vendeurs"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'documents-vendeurs');

-- 3. AUCUNE politique de lecture : seul le service role (edge function doc-url)
--    peut générer des URL signées. Pas d'update/delete côté client non plus.
