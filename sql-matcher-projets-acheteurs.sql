-- ════════════════════════════════════════════════════════════════════
-- Matching des alertes acheteurs basé sur projets_acheteurs (source unique)
-- Remplace l'ancienne logique qui lisait la table alertes_acheteurs.
-- Appelé par l'edge function alerter-acheteurs (TYPE 1, nouvelle annonce).
-- ════════════════════════════════════════════════════════════════════

create or replace function matcher_alertes_acheteurs(p_annonce_id uuid)
returns table (
  email          text,
  budget         numeric,
  alerte_id      uuid,
  token_desabo   text
)
language plpgsql
security definer
as $$
declare
  a record;
begin
  -- Récupérer l'annonce déclencheuse
  select * into a from annonces_vendeurs where id = p_annonce_id;
  if not found then
    return;
  end if;

  return query
  select
    p.email,
    p.budget_envisage::numeric        as budget,
    p.id                              as alerte_id,      -- id du projet (sert de token de désabo)
    coalesce(p.token_desabo, p.id::text) as token_desabo
  from projets_acheteurs p
  where p.email is not null
    -- Type de bien : "tous"/vide = pas de filtre, sinon doit correspondre
    and (
      p.type_bien is null
      or p.type_bien = ''
      or lower(p.type_bien) = lower(coalesce(a.type_bien, ''))
      or lower(p.type_bien) in ('tous','tout','indifférent','indifferent')
    )
    -- Budget : le prix du bien ne dépasse pas le budget (tolérance +5%)
    and (
      p.budget_envisage is null
      or a.prix is null
      or a.prix <= p.budget_envisage * 1.05
    )
    -- Surface : le bien fait au moins la surface souhaitée
    and (
      p.surface_souhaitee is null
      or a.surface is null
      or a.surface >= p.surface_souhaitee
    )
    -- Pièces : au moins le nombre minimum souhaité
    and (
      p.nb_pieces_min is null
      or a.nb_pieces is null
      or a.nb_pieces >= p.nb_pieces_min
    )
    -- Localisation : ville de l'annonce contenue dans la localisation souhaitée
    -- (texte libre type "Bordeaux, Pessac, Mérignac"), ou localisation vide = toute la France
    and (
      p.localisation is null
      or p.localisation = ''
      or a.ville is null
      or lower(p.localisation) like '%' || lower(a.ville) || '%'
      or (a.code_postal is not null and p.localisation like '%' || a.code_postal || '%')
    );
end;
$$;

-- Trace facultative de la dernière alerte envoyée (utilisée par alerter-acheteurs)
alter table projets_acheteurs
  add column if not exists derniere_alerte timestamptz,
  add column if not exists token_desabo text;

-- Anti-doublon : éviter de renvoyer les alertes si moderer-annonce est rejoué
alter table annonces_vendeurs
  add column if not exists alertes_envoyees boolean default false;
