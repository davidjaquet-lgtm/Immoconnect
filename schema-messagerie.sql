-- ══ TABLE MESSAGERIE ══
-- Conversations entre agents et vendeurs
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  annonce_id UUID REFERENCES annonces_vendeurs(id) ON DELETE CASCADE,
  email_agent TEXT NOT NULL,
  email_vendeur TEXT NOT NULL,
  contact_consomme BOOLEAN DEFAULT false,
  date_contact TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, annonce_id)
);

-- Messages dans une conversation
CREATE TABLE IF NOT EXISTS messages_conversation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  expediteur_email TEXT NOT NULL,
  expediteur_role TEXT CHECK (expediteur_role IN ('agent','vendeur')),
  contenu TEXT NOT NULL,
  lu BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compteur contacts hebdomadaires agents
CREATE TABLE IF NOT EXISTS contacts_semaine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  semaine TEXT NOT NULL, -- format YYYY-WW
  nb_contacts INTEGER DEFAULT 0,
  UNIQUE(agent_id, semaine)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_conv_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_conv_annonce ON conversations(annonce_id);
CREATE INDEX IF NOT EXISTS idx_msgs_conv ON messages_conversation(conversation_id);
CREATE INDEX IF NOT EXISTS idx_contacts_agent ON contacts_semaine(agent_id, semaine);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts_semaine ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acces conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Acces messages conversation" ON messages_conversation FOR ALL USING (true);
CREATE POLICY "Acces contacts semaine" ON contacts_semaine FOR ALL USING (true);

-- ══ EMAIL SUPABASE — Templates ══
-- À configurer dans Supabase > Authentication > Email Templates
-- Voir les templates dans le fichier email-templates.html
