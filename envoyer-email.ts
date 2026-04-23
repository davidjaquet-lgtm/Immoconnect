// Supabase Edge Function — Envoi d'emails transactionnels
// Deploy: supabase functions deploy envoyer-email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = 'ImmoConnect <contact@immoconnect-agence.fr>'

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const body = await req.json()
    const { type, to, subject } = body

    let html = ''

    if (type === 'nouveau_message') {
      const { expediteur, message, bien, lien } = body
      html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <div style="background:#0F0F0E;padding:20px 28px">
          <div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div>
        </div>
        <div style="padding:28px">
          <h2 style="font-size:18px;font-weight:500;margin-bottom:12px;color:#0F0F0E">💬 Nouveau message reçu</h2>
          <p style="font-size:14px;color:#888780;line-height:1.7;margin-bottom:16px">
            <strong style="color:#0F0F0E">${expediteur}</strong> vous a envoyé un message concernant <strong style="color:#0F0F0E">${bien}</strong>.
          </p>
          <div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px;color:#444;line-height:1.7;border-left:3px solid #C09B5A">
            ${message}
          </div>
          <div style="text-align:center">
            <a href="${lien}" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">
              Répondre →
            </a>
          </div>
        </div>
        <div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center;border-top:1px solid #E8E6E0">
          ImmoConnect · <a href="https://immoconnect-agence.fr/cgu.html" style="color:#888780">CGU</a> · <a href="https://immoconnect-agence.fr/mentions-legales.html" style="color:#888780">Mentions légales</a>
        </div>
      </div>`
    }

    else if (type === 'demande_visite') {
      const { acheteur, message, bien, lien } = body
      html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <div style="background:#0F0F0E;padding:20px 28px">
          <div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div>
        </div>
        <div style="padding:28px">
          <h2 style="font-size:18px;font-weight:500;margin-bottom:12px;color:#0F0F0E">📅 Nouvelle demande de visite</h2>
          <p style="font-size:14px;color:#888780;line-height:1.7;margin-bottom:16px">
            <strong style="color:#0F0F0E">${acheteur}</strong> souhaite visiter <strong style="color:#0F0F0E">${bien}</strong>.
          </p>
          ${message ? `<div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px;color:#444;line-height:1.7">${message}</div>` : ''}
          <div style="text-align:center">
            <a href="${lien}" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">
              Confirmer ou refuser →
            </a>
          </div>
        </div>
        <div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center;border-top:1px solid #E8E6E0">
          ImmoConnect · <a href="https://immoconnect-agence.fr/cgu.html" style="color:#888780">CGU</a>
        </div>
      </div>`
    }

    else if (type === 'alerte_agent') {
      const { bien, niveau, lien } = body
      const niveauColors = { silver: '#185FA5', gold: '#854F0B', platinium: '#1E7A62' }
      const niveauBgs = { silver: '#E6F1FB', gold: '#FAEEDA', platinium: '#E1F5EE' }
      const color = niveauColors[niveau] || '#0F0F0E'
      const bg = niveauBgs[niveau] || '#F5F2EC'
      html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <div style="background:#0F0F0E;padding:20px 28px">
          <div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div>
        </div>
        <div style="padding:28px">
          <div style="display:inline-block;background:${bg};color:${color};font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">
            🔔 Nouveau dossier ${niveau.charAt(0).toUpperCase()+niveau.slice(1)}
          </div>
          <h2 style="font-size:18px;font-weight:500;margin-bottom:12px;color:#0F0F0E">Un nouveau bien vient d'être publié</h2>
          <div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px;line-height:1.8">
            <div>🏠 <strong>${bien.titre}</strong></div>
            <div>📍 ${bien.ville} (${bien.code_postal})</div>
            <div>📐 ${bien.surface} m² · ${bien.nb_pieces} pièces</div>
            <div>💶 ${bien.prix ? Math.round(bien.prix).toLocaleString('fr-FR') + ' €' : '—'}</div>
          </div>
          <div style="text-align:center">
            <a href="${lien}" style="background:${color};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">
              Voir le dossier complet →
            </a>
          </div>
        </div>
        <div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center;border-top:1px solid #E8E6E0">
          Vous recevez cet email car vous êtes abonné ImmoConnect · <a href="https://immoconnect-agence.fr/connexion.html" style="color:#888780">Se désabonner</a>
        </div>
      </div>`
    }

    if (!html) return new Response(JSON.stringify({ error: 'Type inconnu' }), { status: 400 })

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html })
    })

    const data = await res.json()
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})
