-- ══════════════════════════════════════════════════════════════
--  ImmoConnect — Table projets_acheteurs
--  À coller dans Supabase → SQL Editor → Run
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS projets_acheteurs (

  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Forfait
  forfait                 TEXT NOT NULL DEFAULT 'gratuit',
  -- valeurs : gratuit | acheteur | investisseur

  -- Identité
  nom_acheteur            TEXT NOT NULL,
  telephone               TEXT NOT NULL,
  email                   TEXT NOT NULL,
  situation_familiale     TEXT,
  personnes_charge        INTEGER DEFAULT 0,

  -- Projet d'achat (tous forfaits)
  type_bien               TEXT,
  finalite                TEXT,
  localisation            TEXT,
  rayon                   TEXT,
  surface_souhaitee       NUMERIC,
  nb_pieces_min           INTEGER,
  budget_envisage         NUMERIC,

  -- Revenus (investisseur)
  salaire_net             NUMERIC,
  salaire_co              NUMERIC,
  type_contrat            TEXT,
  anciennete              TEXT,
  primes_annuelles        NUMERIC,
  revenus_locatifs        NUMERIC,
  revenus_locatifs_90pc   NUMERIC,  -- 90% des loyers perçus
  autres_revenus          NUMERIC,
  revenu_total_calcul     NUMERIC,  -- total revenus pris en compte

  -- Charges & Crédits (investisseur)
  credit_immo             NUMERIC,
  credit_auto             NUMERIC,
  credit_conso            NUMERIC,
  pension_versee          NUMERIC,
  loyer_actuel            NUMERIC,
  autres_charges          NUMERIC,
  charges_total_calcul    NUMERIC,  -- total charges mensuelles

  -- Apport & Financement (investisseur)
  apport                  NUMERIC,
  origine_apport          TEXT,
  epargne_residuelle      NUMERIC,
  duree_emprunt           INTEGER,  -- en années
  taux_envisage           NUMERIC,
  type_taux               TEXT,

  -- Résultats calcul capacité (investisseur)
  mensualite_max          NUMERIC,  -- mensualité max à 35%
  capacite_emprunt        NUMERIC,  -- montant empruntable calculé
  budget_total            NUMERIC,  -- capacité + apport
  taux_endettement        NUMERIC,  -- taux d'endettement en %

  -- Critères investissement (investisseur)
  rendement_min           NUMERIC,  -- % rendement brut minimum
  strategie               TEXT,
  horizon_detention       TEXT,
  tolerance_travaux       TEXT,
  type_bien_recherche     TEXT,
  surface_min             NUMERIC,
  prix_max                NUMERIC,
  commentaires            TEXT,

  -- Méta
  statut                  TEXT NOT NULL DEFAULT 'en_attente',
  -- valeurs : en_attente | contacté | signé | archivé
  acheteur_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_projets_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projets_updated_at
  BEFORE UPDATE ON projets_acheteurs
  FOR EACH ROW EXECUTE FUNCTION update_projets_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_projets_forfait      ON projets_acheteurs(forfait);
CREATE INDEX IF NOT EXISTS idx_projets_localisation ON projets_acheteurs(localisation);
CREATE INDEX IF NOT EXISTS idx_projets_statut       ON projets_acheteurs(statut);
CREATE INDEX IF NOT EXISTS idx_projets_budget       ON projets_acheteurs(budget_total);
CREATE INDEX IF NOT EXISTS idx_projets_rendement    ON projets_acheteurs(rendement_min);
CREATE INDEX IF NOT EXISTS idx_projets_created      ON projets_acheteurs(created_at DESC);

-- RLS
ALTER TABLE projets_acheteurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acheteur voit son projet"
  ON projets_acheteurs FOR SELECT
  USING (auth.uid() = acheteur_id);

CREATE POLICY "Acheteur peut créer son projet"
  ON projets_acheteurs FOR INSERT
  WITH CHECK (auth.uid() = acheteur_id);

CREATE POLICY "Acheteur peut modifier son projet"
  ON projets_acheteurs FOR UPDATE
  USING (auth.uid() = acheteur_id);

-- Vue pour le matching investisseur (agents & admin)
CREATE OR REPLACE VIEW vue_investisseurs_actifs AS
SELECT
  id,
  nom_acheteur,
  localisation,
  type_bien_recherche,
  surface_min,
  prix_max,
  budget_total,
  rendement_min,
  strategie,
  tolerance_travaux,
  capacite_emprunt,
  taux_endettement,
  statut,
  created_at
FROM projets_acheteurs
WHERE forfait = 'investisseur'
  AND statut = 'en_attente'
  AND budget_total IS NOT NULL
ORDER BY rendement_min DESC, budget_total DESC;
