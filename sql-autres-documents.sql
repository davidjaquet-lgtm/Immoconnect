-- Documents complémentaires facultatifs joints par le vendeur (compte rendu de copropriété, etc.)
-- Stockés sous forme [{ "name": "...", "url": "..." }]
alter table annonces_vendeurs
  add column if not exists autres_documents jsonb default '[]'::jsonb;
