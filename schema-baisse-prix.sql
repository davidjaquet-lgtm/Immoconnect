-- ══════════════════════════════════════════════════════
-- SCHEMA ALERTES BAISSE DE PRIX
-- À exécuter dans Supabase > SQL Editor
-- ══════════════════════════════════════════════════════

-- 1. Colonnes supplémentaires dans annonces_vendeurs
ALTER TABLE annonces_vendeurs
  ADD COLUMN IF NOT EXISTS prix_initial NUMERIC,
  ADD COLUMN IF NOT EXISTS prix_precedent NUMERIC,
  ADD COLUMN IF NOT EXISTS date_derniere_baisse TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS nb_baisses INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS historique_prix JSONB DEFAULT '[]'::jsonb;

-- 2. Table des abonnements alertes prix (acheteurs/agents qui suivent un bien)
CREATE TABLE IF NOT EXISTS suivi_biens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  annonce_id UUID NOT NULL REFERENCES annonces_vendeurs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  profil TEXT NOT NULL CHECK (profil IN ('acheteur', 'agent', 'investisseur')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(annonce_id, email)
);

CREATE INDEX IF NOT EXISTS idx_suivi_annonce ON suivi_biens(annonce_id);
CREATE INDEX IF NOT EXISTS idx_suivi_email ON suivi_biens(email);

ALTER TABLE suivi_biens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture suivi" ON suivi_biens
  FOR SELECT USING (auth.email() = email);

CREATE POLICY "Insertion suivi" ON suivi_biens
  FOR INSERT WITH CHECK (auth.email() = email);

CREATE POLICY "Suppression suivi" ON suivi_biens
  FOR DELETE USING (auth.email() = email);

-- 3. Activer Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE suivi_biens;

-- 4. Fonction : enregistrer une baisse de prix
CREATE OR REPLACE FUNCTION enregistrer_baisse_prix(
  p_annonce_id UUID,
  p_nouveau_prix NUMERIC,
  p_ancien_prix NUMERIC
)
RETURNS void AS $$
DECLARE
  v_historique JSONB;
  v_entry JSONB;
BEGIN
  SELECT historique_prix INTO v_historique
  FROM annonces_vendeurs WHERE id = p_annonce_id;

  v_entry := jsonb_build_object(
    'date', now()::text,
    'prix', p_nouveau_prix,
    'baisse', p_ancien_prix - p_nouveau_prix,
    'pct', ROUND(((p_ancien_prix - p_nouveau_prix) / p_ancien_prix * 100)::numeric, 1)
  );

  UPDATE annonces_vendeurs SET
    prix_precedent = p_ancien_prix,
    date_derniere_baisse = now(),
    nb_baisses = COALESCE(nb_baisses, 0) + 1,
    historique_prix = COALESCE(v_historique, '[]'::jsonb) || v_entry
  WHERE id = p_annonce_id;
END;
$$ LANGUAGE plpgsql;
