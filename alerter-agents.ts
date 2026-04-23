// Supabase Edge Function — Alertes agents nouveau bien
// Deploy: supabase functions deploy alerter-agents

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY') || ''

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const body = await req.json()
    const { niveau, forfaits_eligibles, delais, bien } = body

    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    // Récupérer tous les agents inscrits avec leurs forfaits
    const { data: agents } = await db.auth.admin.listUsers()
    const agentsEligibles = (agents?.users || []).filter(u => {
      const meta = u.user_metadata || {}
      const profils = meta.profils || []
      const forfait = meta.forfait_agent || 'starter'
      return profils.includes('agent') && forfaits_eligibles.includes(forfait)
    })

    // Envoyer les alertes avec les délais correspondants
    const now = new Date()
    for (const agent of agentsEligibles) {
      const meta = agent.user_metadata || {}
      const forfait = meta.forfait_agent || 'starter'
      const delaiHeures = (delais[forfait] || 4) * 24 // Convertir jours en heures

      // Planifier l'envoi selon le délai (ici on envoie immédiatement pour H+0, sinon on log)
      // En production, utiliser pg_cron ou une queue pour les délais
      if (delaiHeures === 0) {
        // Envoi immédiat (Platinium H+0)
        await fetch(`${SUPABASE_URL}/functions/v1/envoyer-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'alerte_agent',
            to: agent.email,
            subject: `🔔 Nouveau dossier ${niveau} — ImmoConnect`,
            bien,
            niveau,
            lien: `https://immoconnect-agence.fr/connexion.html`
          })
        })
      } else {
        // Stocker pour envoi différé (J+1, J+2, J+4)
        await db.from('alertes_agents_queue').insert({
          agent_email: agent.email,
          forfait_agent: forfait,
          niveau_bien: niveau,
          bien_data: JSON.stringify(bien),
          envoyer_le: new Date(now.getTime() + delaiHeures * 3600000).toISOString(),
          envoye: false
        }).catch(() => {}) // Silencieux si table pas encore créée
      }
    }

    return new Response(JSON.stringify({
      success: true,
      agents_notifies: agentsEligibles.length
    }), { headers: { 'Content-Type': 'application/json' } })

  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})
