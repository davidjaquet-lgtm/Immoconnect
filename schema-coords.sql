-- Ajouter les colonnes latitude/longitude à annonces_vendeurs
ALTER TABLE annonces_vendeurs
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

-- Index spatial pour les requêtes de proximité
CREATE INDEX IF NOT EXISTS idx_annonces_coords 
  ON annonces_vendeurs(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
