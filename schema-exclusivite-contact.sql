-- ══════════════════════════════════════════════════════
-- SCHEMA EXCLUSIVITÉS DE CONTACT AGENTS
-- À exécuter dans Supabase > SQL Editor
-- ══════════════════════════════════════════════════════

-- 1. TABLE EXCLUSIVITÉS
CREATE TABLE IF NOT EXISTS exclusivites_contact (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  annonce_id UUID NOT NULL REFERENCES annonces_vendeurs(id) ON DELETE CASCADE,
  agent_email TEXT NOT NULL,
  forfait_agent TEXT NOT NULL,
  duree_heures INTEGER NOT NULL CHECK (duree_heures IN (48, 96)),
  debut_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fin_at TIMESTAMPTZ NOT NULL,
  prix_paye NUMERIC NOT NULL,
  email_vendeur TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'active' CHECK (statut IN ('active', 'expiree', 'revoquee')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_excl_annonce ON exclusivites_contact(annonce_id);
CREATE INDEX IF NOT EXISTS idx_excl_agent ON exclusivites_contact(agent_email);
CREATE INDEX IF NOT EXISTS idx_excl_fin ON exclusivites_contact(fin_at);

-- RLS
ALTER TABLE exclusivites_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture exclusivite" ON exclusivites_contact
  FOR SELECT USING (true);

CREATE POLICY "Insertion exclusivite agent" ON exclusivites_contact
  FOR INSERT WITH CHECK (auth.email() = agent_email);

CREATE POLICY "MAJ exclusivite" ON exclusivites_contact
  FOR UPDATE USING (auth.email() = agent_email OR auth.email() = email_vendeur);

-- 2. FONCTION : vérifier si un bien a une exclusivité active
CREATE OR REPLACE FUNCTION get_exclusivite_active(p_annonce_id UUID)
RETURNS TABLE(
  agent_email TEXT,
  fin_at TIMESTAMPTZ,
  duree_heures INTEGER,
  heures_restantes NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.agent_email,
    e.fin_at,
    e.duree_heures,
    ROUND(EXTRACT(EPOCH FROM (e.fin_at - now())) / 3600, 1) AS heures_restantes
  FROM exclusivites_contact e
  WHERE e.annonce_id = p_annonce_id
    AND e.statut = 'active'
    AND e.fin_at > now()
  ORDER BY e.debut_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 3. FONCTION : expirer automatiquement les exclusivités
CREATE OR REPLACE FUNCTION expirer_exclusivites()
RETURNS void AS $$
BEGIN
  UPDATE exclusivites_contact
  SET statut = 'expiree'
  WHERE statut = 'active' AND fin_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Activer Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE exclusivites_contact;
