-- Retours utilisateurs (phase bêta) — signalements de bugs, questions, idées
create table if not exists feedbacks (
  id uuid primary key default gen_random_uuid(),
  categorie text,              -- bug / question / idee
  message text not null,
  email text,
  page text,
  navigateur text,
  traite boolean default false,
  created_at timestamptz default now()
);
alter table feedbacks enable row level security;
drop policy if exists "insertion feedback publique" on feedbacks;
create policy "insertion feedback publique" on feedbacks
  for insert to anon, authenticated with check (true);
-- Aucune politique de lecture : seul le service role (toi, via le dashboard) lit.
