-- ══════════════════════════════════════════════
-- SCHEMA NOTATION AGENTS + CHAT REALTIME
-- À exécuter dans Supabase > SQL Editor
-- ══════════════════════════════════════════════

-- 1. TABLE NOTATIONS AGENTS
CREATE TABLE IF NOT EXISTS notations_agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_email TEXT NOT NULL,
  notateur_email TEXT NOT NULL,
  notateur_role TEXT NOT NULL CHECK (notateur_role IN ('vendeur', 'acheteur')),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Empêcher double notation par conversation
CREATE UNIQUE INDEX IF NOT EXISTS idx_notation_unique
  ON notations_agents(notateur_email, conversation_id);

-- RLS
ALTER TABLE notations_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique notations" ON notations_agents
  FOR SELECT USING (true);

CREATE POLICY "Insertion propre notation" ON notations_agents
  FOR INSERT WITH CHECK (auth.email() = notateur_email);

-- 2. VUE MOYENNES AGENTS
CREATE OR REPLACE VIEW stats_agents AS
SELECT
  agent_email,
  ROUND(AVG(note)::numeric, 1) AS note_moyenne,
  COUNT(*) AS nb_avis,
  COUNT(*) FILTER (WHERE note = 5) AS nb_5_etoiles,
  COUNT(*) FILTER (WHERE note >= 4) AS nb_4_etoiles_plus
FROM notations_agents
GROUP BY agent_email;

-- 3. ACTIVER REALTIME SUR messages_conversation
-- (Supabase Realtime est activé par défaut sur les tables avec RLS)
ALTER PUBLICATION supabase_realtime ADD TABLE messages_conversation;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 4. COLONNE typed_at pour "en train d'écrire"
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS typing_agent TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS typing_vendeur TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dernier_message TEXT,
  ADD COLUMN IF NOT EXISTS dernier_message_at TIMESTAMPTZ;

-- 5. FONCTION mise à jour dernier message
CREATE OR REPLACE FUNCTION update_dernier_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    dernier_message = NEW.contenu,
    dernier_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dernier_message ON messages_conversation;
CREATE TRIGGER trg_dernier_message
  AFTER INSERT ON messages_conversation
  FOR EACH ROW EXECUTE FUNCTION update_dernier_message();

-- 6. RLS messages_conversation (si pas déjà en place)
ALTER TABLE messages_conversation ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lecture messages conversation" ON messages_conversation;
CREATE POLICY "Lecture messages conversation" ON messages_conversation
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.email_agent = auth.email() OR c.email_vendeur = auth.email())
    )
  );

DROP POLICY IF EXISTS "Insertion message" ON messages_conversation;
CREATE POLICY "Insertion message" ON messages_conversation
  FOR INSERT WITH CHECK (auth.email() = expediteur_email);

DROP POLICY IF EXISTS "MAJ lu message" ON messages_conversation;
CREATE POLICY "MAJ lu message" ON messages_conversation
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.email_agent = auth.email() OR c.email_vendeur = auth.email())
    )
  );
