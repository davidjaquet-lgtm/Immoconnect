-- ══════════════════════════════════════════════════════════════
-- SCHEMA MANDATS AGENTS + MODE CONTACT VENDEUR
-- À exécuter dans Supabase > SQL Editor
-- ══════════════════════════════════════════════════════════════

-- 1. Colonnes quotas dans agents_validation
ALTER TABLE agents_validation
  ADD COLUMN IF NOT EXISTS candidatures_mois_utilisees INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leads_semaine_utilises INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mandats_actifs INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mandats_acheteurs_actifs INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dernier_reset_leads DATE,
  ADD COLUMN IF NOT EXISTS penalite_score INTEGER DEFAULT 0;

-- 2. Mode contact dans annonces_vendeurs
ALTER TABLE annonces_vendeurs
  ADD COLUMN IF NOT EXISTS mode_contact TEXT DEFAULT 'acheteurs'
    CHECK (mode_contact IN ('acheteurs', 'agents', 'comparatif'));

-- 3. Table mandats vendeurs publiés par agents
CREATE TABLE IF NOT EXISTS mandats_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_email TEXT NOT NULL,
  type_bien TEXT NOT NULL,
  surface NUMERIC,
  nb_pieces INTEGER,
  ville TEXT NOT NULL,
  code_postal TEXT,
  prix NUMERIC NOT NULL,
  description TEXT,
  photos TEXT[] DEFAULT '{}',
  dpe TEXT,
  charges_annuelles NUMERIC,
  loyer_mensuel NUMERIC,
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif', 'vendu', 'suspendu')),
  mandat_signe BOOLEAN DEFAULT true,
  nb_vues INTEGER DEFAULT 0,
  nb_contacts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mandats_agent ON mandats_agents(agent_email);
CREATE INDEX IF NOT EXISTS idx_mandats_ville ON mandats_agents(ville);
CREATE INDEX IF NOT EXISTS idx_mandats_statut ON mandats_agents(statut);

ALTER TABLE mandats_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture mandats publics" ON mandats_agents
  FOR SELECT USING (statut = 'actif');

CREATE POLICY "Gestion propre mandat" ON mandats_agents
  FOR ALL USING (auth.email() = agent_email);

-- 4. Table pénalités agents (contact abusif mode A)
CREATE TABLE IF NOT EXISTS penalites_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_email TEXT NOT NULL,
  annonce_id UUID REFERENCES annonces_vendeurs(id),
  raison TEXT DEFAULT 'contact_mode_acheteurs',
  points_perdus INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE penalites_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin lecture penalites" ON penalites_agents FOR SELECT USING (true);

-- 5. Fonction reset leads hebdomadaire
CREATE OR REPLACE FUNCTION reset_leads_hebdomadaires()
RETURNS void AS $$
BEGIN
  UPDATE agents_validation
  SET leads_semaine_utilises = 0,
      dernier_reset_leads = CURRENT_DATE
  WHERE dernier_reset_leads IS NULL
     OR dernier_reset_leads < date_trunc('week', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- 6. Fonction reset candidatures mensuelles
CREATE OR REPLACE FUNCTION reset_candidatures_mensuelles()
RETURNS void AS $$
BEGIN
  UPDATE agents_validation
  SET candidatures_mois_utilisees = 0,
      dernier_reset_candidatures = CURRENT_DATE
  WHERE dernier_reset_candidatures IS NULL
     OR dernier_reset_candidatures < date_trunc('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- 7. Fonction pénaliser un agent
CREATE OR REPLACE FUNCTION penaliser_agent(
  p_agent_email TEXT,
  p_annonce_id UUID,
  p_points INTEGER DEFAULT 5
)
RETURNS void AS $$
BEGIN
  UPDATE agents_validation
  SET penalite_score = COALESCE(penalite_score, 0) + p_points
  WHERE email = p_agent_email;

  INSERT INTO penalites_agents(agent_email, annonce_id, points_perdus)
  VALUES (p_agent_email, p_annonce_id, p_points);
END;
$$ LANGUAGE plpgsql;

-- 8. Quotas par forfait (vue pratique)
CREATE OR REPLACE VIEW quotas_forfaits AS
SELECT * FROM (VALUES
  ('pay_per_use', 0,  2,  2,  3,  'H+24'),
  ('starter',     5,  5,  5,  10, 'H+12'),
  ('pro',         20, 15, 20, 30, 'H+4'),
  ('premium',     999,999,999,999,'H+0')
) AS t(forfait, candidatures_mois, leads_semaine, mandats_max, acheteurs_max, delai_alerte);

-- 9. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE mandats_agents;
ALTER PUBLICATION supabase_realtime ADD TABLE penalites_agents;

-- Estimation Hanaé confidentielle (jamais affichée aux agents)
ALTER TABLE annonces_vendeurs
  ADD COLUMN IF NOT EXISTS estimation_hanae NUMERIC;
