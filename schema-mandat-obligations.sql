-- ═══════════════════════════════════════════════════════
-- Schema : obligations mandat vendeur + sanctions
-- ═══════════════════════════════════════════════════════

-- Colonnes annonces_vendeurs
ALTER TABLE annonces_vendeurs
  ADD COLUMN IF NOT EXISTS agent_choisi_email TEXT,
  ADD COLUMN IF NOT EXISTS mandat_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mandat_signe BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mandat_rappel_envoye BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS mode_contact_verrouille BOOLEAN DEFAULT false;

-- Colonnes candidatures_agents
ALTER TABLE candidatures_agents
  ADD COLUMN IF NOT EXISTS confirmation_agent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmation_agent_at TIMESTAMPTZ;

-- Colonnes mandats_agents
ALTER TABLE mandats_agents
  ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'en_attente'
    CHECK (statut IN ('en_attente','envoye','signe','actif','annule','refuse')),
  ADD COLUMN IF NOT EXISTS refuse_par_agent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS refuse_at TIMESTAMPTZ;

-- Table sanctions vendeurs
CREATE TABLE IF NOT EXISTS sanctions_vendeurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendeur_email TEXT NOT NULL,
  annonce_id UUID REFERENCES annonces_vendeurs(id),
  type_sanction TEXT NOT NULL CHECK (type_sanction IN ('avertissement','bannissement_1mois','bannissement_3mois','admin_review')),
  raison TEXT,
  debut_sanction TIMESTAMPTZ DEFAULT now(),
  fin_sanction TIMESTAMPTZ,
  nb_infraction INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sanctions_vendeur ON sanctions_vendeurs(vendeur_email);
CREATE INDEX IF NOT EXISTS idx_sanctions_fin ON sanctions_vendeurs(fin_sanction);

-- Colonnes profil vendeur pour suivi infractions
ALTER TABLE annonces_vendeurs
  ADD COLUMN IF NOT EXISTS nb_mandats_non_signes INTEGER DEFAULT 0;

-- Vue : vendeurs bannis actuellement
CREATE OR REPLACE VIEW vendeurs_bannis AS
SELECT vendeur_email, type_sanction, fin_sanction, nb_infraction
FROM sanctions_vendeurs
WHERE fin_sanction > now() OR fin_sanction IS NULL
ORDER BY created_at DESC;
