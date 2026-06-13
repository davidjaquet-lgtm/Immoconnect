-- Quota leads agents : tracer l'annonce concernée par chaque déclaration d'acheteur potentiel
alter table contacts_semaine
  add column if not exists annonce_id uuid;
