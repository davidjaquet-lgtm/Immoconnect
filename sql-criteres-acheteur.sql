-- Permettre à un acheteur connecté de modifier ses propres critères de recherche
-- (édition en ligne dans le dashboard acheteur).
alter table projets_acheteurs enable row level security;

drop policy if exists "acheteur modifie son projet" on projets_acheteurs;
create policy "acheteur modifie son projet"
on projets_acheteurs for update
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'))
with check (lower(email) = lower(auth.jwt() ->> 'email'));
