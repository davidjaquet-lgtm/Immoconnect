-- ══════════════════════════════════════════════════════
-- SCHEMA AGENTS V2 — Nouveau modèle inscription
-- À exécuter dans Supabase > SQL Editor
-- ══════════════════════════════════════════════════════

-- 1. Colonnes supplémentaires dans agents_validation
ALTER TABLE agents_validation
  ADD COLUMN IF NOT EXISTS carte_t_expiration DATE,
  ADD COLUMN IF NOT EXISTS rayon_intervention INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS specialite TEXT,
  ADD COLUMN IF NOT EXISTS presentation TEXT,
  ADD COLUMN IF NOT EXISTS nb_ventes_12m INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nb_ventes_locales INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delai_moyen_vente INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taux_vente_prix INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS honoraires_fourchette TEXT,
  ADD COLUMN IF NOT EXISTS score_agent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS forfait_agent TEXT DEFAULT 'pay_per_use',
  ADD COLUMN IF NOT EXISTS nb_candidatures_mois INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dernier_reset_candidatures DATE;

-- 2. Colonne expiration agent dans projets_acheteurs
ALTER TABLE projets_acheteurs
  ADD COLUMN IF NOT EXISTS agent_email TEXT,
  ADD COLUMN IF NOT EXISTS ville_souhaitee TEXT;

-- 3. Table candidatures agents
CREATE TABLE IF NOT EXISTS candidatures_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  annonce_id UUID NOT NULL REFERENCES annonces_vendeurs(id) ON DELETE CASCADE,
  agent_email TEXT NOT NULL,
  flux TEXT NOT NULL CHECK (flux IN ('A', 'B')),
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'selectionne', 'non_retenu', 'expire')),
  score_total INTEGER DEFAULT 0,
  score_detail JSONB DEFAULT '{}'::jsonb,
  badges TEXT[] DEFAULT '{}',
  strategie_hanae TEXT,
  honoraires_proposes TEXT,
  message_vendeur TEXT,
  paiement_stripe_id TEXT,
  paiement_montant NUMERIC DEFAULT 9.99,
  paiement_statut TEXT DEFAULT 'en_attente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_candidatures_annonce ON candidatures_agents(annonce_id);
CREATE INDEX IF NOT EXISTS idx_candidatures_agent ON candidatures_agents(agent_email);
CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures_agents(statut);

ALTER TABLE candidatures_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture propre candidature" ON candidatures_agents
  FOR SELECT USING (auth.email() = agent_email);

CREATE POLICY "Insertion propre candidature" ON candidatures_agents
  FOR INSERT WITH CHECK (auth.email() = agent_email);

-- 4. Vue score vendeur sur candidatures sélectionnées
CREATE OR REPLACE VIEW top3_agents AS
SELECT
  c.annonce_id,
  c.agent_email,
  c.flux,
  c.score_total,
  c.badges,
  c.strategie_hanae,
  c.honoraires_proposes,
  c.message_vendeur,
  c.created_at
FROM candidatures_agents c
WHERE c.statut = 'selectionne'
ORDER BY c.annonce_id, c.score_total DESC;

-- 5. Fonction : calculer score agent
CREATE OR REPLACE FUNCTION calculer_score_agent(
  p_nb_ventes_locales INTEGER,
  p_delai_moyen INTEGER,
  p_taux_prix INTEGER,
  p_honoraires TEXT,
  p_presentation TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
BEGIN
  -- Expérience locale (max 20pts)
  v_score := v_score + LEAST(20, ROUND(p_nb_ventes_locales::numeric / 10 * 20));
  -- Délai de vente (max 15pts)
  IF p_delai_moyen > 0 AND p_delai_moyen <= 30 THEN v_score := v_score + 15;
  ELSIF p_delai_moyen <= 60 THEN v_score := v_score + 10;
  ELSIF p_delai_moyen > 0 THEN v_score := v_score + 5;
  END IF;
  -- Taux au prix (max 15pts)
  IF p_taux_prix >= 98 THEN v_score := v_score + 15;
  ELSIF p_taux_prix >= 95 THEN v_score := v_score + 10;
  ELSIF p_taux_prix > 0 THEN v_score := v_score + 5;
  END IF;
  -- Honoraires renseignés (max 10pts)
  IF p_honoraires IS NOT NULL AND p_honoraires != '' THEN v_score := v_score + 10; END IF;
  -- Présentation renseignée (max 5pts)
  IF p_presentation IS NOT NULL AND LENGTH(p_presentation) > 20 THEN v_score := v_score + 5; END IF;
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- 6. Activer Realtime sur candidatures
ALTER PUBLICATION supabase_realtime ADD TABLE candidatures_agents;
