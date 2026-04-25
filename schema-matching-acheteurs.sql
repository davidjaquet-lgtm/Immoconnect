-- ══════════════════════════════════════════════════════
-- SCHEMA MATCHING ACHETEURS PAYANTS
-- À exécuter dans Supabase > SQL Editor
-- ══════════════════════════════════════════════════════

-- 1. S'assurer que projets_acheteurs a les colonnes nécessaires
ALTER TABLE projets_acheteurs
  ADD COLUMN IF NOT EXISTS forfait TEXT DEFAULT 'gratuit',
  ADD COLUMN IF NOT EXISTS capacite_emprunt NUMERIC,
  ADD COLUMN IF NOT EXISTS apport NUMERIC,
  ADD COLUMN IF NOT EXISTS surface_souhaitee NUMERIC,
  ADD COLUMN IF NOT EXISTS nb_pieces_min INTEGER,
  ADD COLUMN IF NOT EXISTS prix_max NUMERIC;

-- 2. Index pour accélérer le matching
CREATE INDEX IF NOT EXISTS idx_projets_forfait 
  ON projets_acheteurs(forfait);

CREATE INDEX IF NOT EXISTS idx_projets_budget 
  ON projets_acheteurs(budget_total);

-- 3. Activer Realtime sur projets_acheteurs (pour matching live)
ALTER PUBLICATION supabase_realtime ADD TABLE projets_acheteurs;

-- 4. RLS projets_acheteurs
ALTER TABLE projets_acheteurs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture propre projet" ON projets_acheteurs;
CREATE POLICY "Lecture propre projet" ON projets_acheteurs
  FOR SELECT USING (auth.email() = email);

DROP POLICY IF EXISTS "Insertion propre projet" ON projets_acheteurs;
CREATE POLICY "Insertion propre projet" ON projets_acheteurs
  FOR INSERT WITH CHECK (auth.email() = email);

DROP POLICY IF EXISTS "MAJ propre projet" ON projets_acheteurs;
CREATE POLICY "MAJ propre projet" ON projets_acheteurs
  FOR UPDATE USING (auth.email() = email);

-- 5. Permettre à la Service Key (Edge Function) de lire tous les projets pour le matching
-- (déjà possible avec SERVICE_KEY_SUPABASE qui bypass RLS)
