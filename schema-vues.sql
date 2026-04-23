-- Fonctions RPC pour incrémenter les compteurs sans conflit de concurrence

CREATE OR REPLACE FUNCTION incrementer_vues(annonce_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE annonces_vendeurs
  SET nb_vues = COALESCE(nb_vues, 0) + 1
  WHERE id = annonce_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION incrementer_visites(annonce_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE annonces_vendeurs
  SET nb_visites = COALESCE(nb_visites, 0) + 1
  WHERE id = annonce_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION incrementer_contacts(annonce_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE annonces_vendeurs
  SET nb_contacts = COALESCE(nb_contacts, 0) + 1
  WHERE id = annonce_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Autoriser l'appel depuis le client (anon key et authenticated)
GRANT EXECUTE ON FUNCTION incrementer_vues(UUID) TO anon;
GRANT EXECUTE ON FUNCTION incrementer_vues(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION incrementer_visites(UUID) TO anon;
GRANT EXECUTE ON FUNCTION incrementer_visites(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION incrementer_contacts(UUID) TO anon;
GRANT EXECUTE ON FUNCTION incrementer_contacts(UUID) TO authenticated;
