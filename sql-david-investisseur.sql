-- Donner l'accès "investisseur" au compte admin davidjaquet@live.fr
-- (upsert : crée la ligne si elle n'existe pas, sinon met à jour le forfait)

insert into projets_acheteurs (email, forfait, type_profil)
values ('davidjaquet@live.fr', 'investisseur', 'investisseur')
on conflict (email) do update
  set forfait = 'investisseur';
