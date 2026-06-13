-- Suppression d'annonce par le vendeur (suppression douce)

-- 1. Colonne de traçabilité
alter table annonces_vendeurs
  add column if not exists supprimee_le timestamptz;

-- 2. Politique RLS : un utilisateur connecté ne peut modifier QUE ses propres
--    annonces (email du compte = email_contact de l'annonce, insensible à la casse).
--    Couvre la suppression douce, la modification d'annonce et le changement de prix.
drop policy if exists "vendeur modifie ses annonces" on annonces_vendeurs;
create policy "vendeur modifie ses annonces"
on annonces_vendeurs for update
to authenticated
using (lower(email_contact) = lower(auth.jwt() ->> 'email'))
with check (lower(email_contact) = lower(auth.jwt() ->> 'email'));
