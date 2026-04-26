-- ══ TABLE MANDATS EXCLUSIFS ══
CREATE TABLE IF NOT EXISTS mandats_exclusifs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annonce_id UUID REFERENCES annonces_vendeurs(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_vendeur TEXT NOT NULL,
  email_agent TEXT NOT NULL,
  nom_agent TEXT,
  agence_agent TEXT,
  forfait_agent TEXT CHECK (forfait_agent IN ('expert','platinium')),
  duree_mois INTEGER DEFAULT 3,
  date_debut TIMESTAMPTZ DEFAULT NOW(),
  date_fin TIMESTAMPTZ,
  statut TEXT DEFAULT 'actif' CHECK (statut IN ('actif','termine','resilie')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(annonce_id)
);

-- Colonne mandat dans annonces_vendeurs
ALTER TABLE annonces_vendeurs
  ADD COLUMN IF NOT EXISTS sous_mandat_exclusif BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mandat_id UUID REFERENCES mandats_exclusifs(id);

CREATE INDEX IF NOT EXISTS idx_mandats_annonce ON mandats_exclusifs(annonce_id);
CREATE INDEX IF NOT EXISTS idx_mandats_agent ON mandats_exclusifs(agent_id);

ALTER TABLE mandats_exclusifs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces mandats" ON mandats_exclusifs FOR ALL USING (true);

-- ══ TABLE DISPONIBILITÉS VISITES ══
CREATE TABLE IF NOT EXISTS disponibilites_visites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_vendeur TEXT NOT NULL,
  annonce_id UUID REFERENCES annonces_vendeurs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin TIME NOT NULL,
  statut TEXT DEFAULT 'libre' CHECK (statut IN ('libre','reserve')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dispos_vendeur ON disponibilites_visites(email_vendeur);
CREATE INDEX IF NOT EXISTS idx_dispos_date ON disponibilites_visites(date);
CREATE INDEX IF NOT EXISTS idx_dispos_annonce ON disponibilites_visites(annonce_id);

ALTER TABLE disponibilites_visites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces dispos" ON disponibilites_visites FOR ALL USING (true);

-- ══ TABLE RÉSERVATIONS VISITES ══
CREATE TABLE IF NOT EXISTS reservations_visites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispo_id UUID REFERENCES disponibilites_visites(id) ON DELETE CASCADE,
  email_vendeur TEXT NOT NULL,
  email_acheteur TEXT NOT NULL,
  message TEXT,
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente','confirme','refuse')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resa_vendeur ON reservations_visites(email_vendeur);
CREATE INDEX IF NOT EXISTS idx_resa_acheteur ON reservations_visites(email_acheteur);

ALTER TABLE reservations_visites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces reservations" ON reservations_visites FOR ALL USING (true);

-- ══ TABLE VALIDATION AGENTS ══
CREATE TABLE IF NOT EXISTS agents_validation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nom TEXT,
  agence TEXT,
  carte_t TEXT NOT NULL,
  cci TEXT,
  carte_t_expiration DATE,
  ocr_statut TEXT DEFAULT 'non_analyse',
  statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente','valide','refuse')),
  raison_refus TEXT,
  valide_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_val_statut ON agents_validation(statut);

ALTER TABLE agents_validation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces agents validation" ON agents_validation FOR ALL USING (true);

-- Rapport de visite généré par Hanaé
ALTER TABLE reservations_visites
  ADD COLUMN IF NOT EXISTS rapport_visite TEXT,
  ADD COLUMN IF NOT EXISTS rapport_genere_at TIMESTAMPTZ;
