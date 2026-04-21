-- Ajouter les colonnes stats aux annonces_vendeurs
ALTER TABLE annonces_vendeurs
  ADD COLUMN IF NOT EXISTS nb_vues INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nb_visites INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nb_contacts INTEGER DEFAULT 0;

-- Table messages entre acheteurs et vendeurs
CREATE TABLE IF NOT EXISTS messages_annonces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annonce_id UUID REFERENCES annonces_vendeurs(id) ON DELETE CASCADE,
  email_vendeur TEXT NOT NULL,
  nom_acheteur TEXT,
  email_acheteur TEXT,
  telephone_acheteur TEXT,
  message TEXT NOT NULL,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_vendeur ON messages_annonces(email_vendeur);
CREATE INDEX IF NOT EXISTS idx_messages_annonce ON messages_annonces(annonce_id);
CREATE INDEX IF NOT EXISTS idx_messages_lu ON messages_annonces(lu);

ALTER TABLE messages_annonces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces messages" ON messages_annonces FOR ALL USING (true);
