-- Table queue alertes agents (pour les délais J+1, J+2, J+4)
CREATE TABLE IF NOT EXISTS alertes_agents_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_email TEXT NOT NULL,
  forfait_agent TEXT NOT NULL,
  niveau_bien TEXT NOT NULL,
  bien_data JSONB,
  envoyer_le TIMESTAMPTZ NOT NULL,
  envoye BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alertes_envoyer ON alertes_agents_queue(envoyer_le) WHERE envoye = false;

ALTER TABLE alertes_agents_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acces alertes" ON alertes_agents_queue FOR ALL USING (true);
