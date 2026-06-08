import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = 'ImmoConnect <contact@immoconnect-agence.fr>'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    })
  }

  try {
    const body = await req.json()
    const { type, to, subject } = body
    let html = ''

    if (type === 'nouveau_message') {
      const { expediteur, message, bien, lien } = body
      html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>
        <div style="padding:28px">
          <h2 style="font-size:18px;font-weight:500;margin-bottom:12px">💬 Nouveau message reçu</h2>
          <p style="font-size:14px;color:#888780;line-height:1.7;margin-bottom:16px"><strong style="color:#0F0F0E">${expediteur}</strong> vous a envoyé un message concernant <strong style="color:#0F0F0E">${bien}</strong>.</p>
          <div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px;color:#444;line-height:1.7;border-left:3px solid #C09B5A">${message}</div>
          <div style="text-align:center"><a href="${lien}" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Répondre →</a></div>
        </div>
        <div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect · <a href="https://immoconnect-agence.fr/cgu.html" style="color:#888780">CGU</a></div>
      </div>`
    }

    else if (type === 'demande_visite') {
      const { acheteur, message, bien, lien } = body
      html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>
        <div style="padding:28px">
          <h2 style="font-size:18px;font-weight:500;margin-bottom:12px">📅 Nouvelle demande de visite</h2>
          <p style="font-size:14px;color:#888780;line-height:1.7;margin-bottom:16px"><strong style="color:#0F0F0E">${acheteur}</strong> souhaite visiter <strong style="color:#0F0F0E">${bien}</strong>.</p>
          ${message ? `<div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px;color:#444">${message}</div>` : ''}
          <div style="text-align:center"><a href="${lien}" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Confirmer ou refuser →</a></div>
        </div>
        <div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>
      </div>`
    }

    else if (type === 'alerte_agent') {
      const { bien, niveau, lien } = body
      const colors: Record<string, string> = { silver:'#185FA5', gold:'#854F0B', platinium:'#1E7A62' }
      const bgs: Record<string, string> = { silver:'#E6F1FB', gold:'#FAEEDA', platinium:'#E1F5EE' }
      const color = colors[niveau] || '#0F0F0E'
      const bg = bgs[niveau] || '#F5F2EC'
      html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>
        <div style="padding:28px">
          <div style="display:inline-block;background:${bg};color:${color};font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">🔔 Nouveau dossier ${niveau}</div>
          <h2 style="font-size:18px;font-weight:500;margin-bottom:12px">Un nouveau bien vient d'être publié</h2>
          <div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px;line-height:1.8">
            <div>🏠 <strong>${bien.titre}</strong></div>
            <div>📍 ${bien.ville} (${bien.code_postal})</div>
            <div>📐 ${bien.surface} m²</div>
            <div>💶 ${bien.prix ? Math.round(bien.prix).toLocaleString('fr-FR') + ' €' : '—'}</div>
          </div>
          <div style="text-align:center"><a href="${lien}" style="background:${color};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir le dossier →</a></div>
        </div>
        <div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect · <a href="https://immoconnect-agence.fr/connexion.html" style="color:#888780">Se désabonner</a></div>
      </div>`
    }

    else if (type === 'alerte_investisseur') {
      const { bien, rendement_net, rendement_demande, lien } = body
      html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>
        <div style="padding:28px">
          <div style="display:inline-block;background:#E1F5EE;color:#1E7A62;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">🎯 Bien compatible avec votre profil</div>
          <h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un bien correspond à vos critères de rendement</h2>
          <p style="font-size:13px;color:#888780;margin-bottom:16px">Ce bien affiche un rendement net de <strong style="color:#1E7A62">${rendement_net}%</strong>, supérieur à votre rendement minimum de ${rendement_demande}%.</p>
          <div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:16px;font-size:13px;line-height:1.9">
            <div>🏠 <strong>${bien.titre || (bien.type_bien + ' · ' + bien.surface + ' m²')}</strong></div>
            <div>📍 ${bien.ville} (${bien.code_postal})</div>
            <div>📐 ${bien.surface} m² · ${bien.nb_pieces || '—'} pièces</div>
            <div>💶 Prix : <strong>${bien.prix ? Math.round(bien.prix).toLocaleString('fr-FR') + ' €' : '—'}</strong></div>
            <div>📈 Rendement net estimé : <strong style="color:#1E7A62">${rendement_net}%</strong></div>
          </div>
          <div style="text-align:center"><a href="${lien}" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir la fiche bien →</a></div>
        </div>
        <div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect · Vous recevez cette alerte car ce bien correspond à votre profil investisseur</div>
      </div>`
    }

    else if (type === 'alerte_acheteur') {
      const { bien, budget_acheteur, lien } = body
      html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>
        <div style="padding:28px">
          <div style="display:inline-block;background:#E6F1FB;color:#185FA5;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">🏠 Nouveau bien compatible</div>
          <h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un bien correspond à votre projet</h2>
          <p style="font-size:13px;color:#888780;margin-bottom:16px">Ce bien est dans votre budget de <strong style="color:#185FA5">${budget_acheteur.toLocaleString('fr-FR')} €</strong> et correspond à vos critères de recherche.</p>
          <div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:16px;font-size:13px;line-height:1.9">
            <div>🏠 <strong>${bien.titre || (bien.type_bien + ' · ' + bien.surface + ' m²')}</strong></div>
            <div>📍 ${bien.ville} (${bien.code_postal})</div>
            <div>📐 ${bien.surface} m² · ${bien.nb_pieces || '—'} pièces</div>
            <div>💶 Prix : <strong>${bien.prix ? Math.round(bien.prix).toLocaleString('fr-FR') + ' €' : '—'}</strong></div>
            <div>🏷️ Niveau dossier : <strong>${bien.niveau_vendeur || 'standard'}</strong></div>
          </div>
          <div style="text-align:center"><a href="${lien}" style="background:#185FA5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir ce bien →</a></div>
        </div>
        <div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect · Vous recevez cette alerte car ce bien correspond à votre projet d'achat</div>
      </div>`
    }

    else if (type === 'baisse_prix') {
      const { bien_titre, ville, surface, type_bien, ancien_prix, nouveau_prix, baisse_pct, baisse_montant, profil, lien } = body
      const ancienFmt = ancien_prix ? ancien_prix.toLocaleString('fr-FR') + ' EUR' : '-'
      const nouveauFmt = nouveau_prix ? nouveau_prix.toLocaleString('fr-FR') + ' EUR' : '-'
      const baisseFmt = baisse_montant ? baisse_montant.toLocaleString('fr-FR') + ' EUR' : '-'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#1E7A62;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Baisse de prix -' + baisse_pct + '%</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Le prix a baisse sur un bien que vous suivez</h2>'
        + '<p style="font-size:13px;color:#888780;margin-bottom:16px">' + (bien_titre || type_bien + ' ' + surface + ' m2 - ' + ville) + '</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:16px;margin-bottom:16px;text-align:center">'
        + '<div style="font-size:13px;color:#888780;margin-bottom:4px">Ancien prix</div>'
        + '<div style="font-size:18px;color:#888780;text-decoration:line-through;margin-bottom:8px">' + ancienFmt + '</div>'
        + '<div style="font-size:13px;color:#1E7A62;margin-bottom:4px">Nouveau prix</div>'
        + '<div style="font-size:28px;font-weight:600;color:#1E7A62">' + nouveauFmt + '</div>'
        + '<div style="font-size:12px;color:#1E7A62;margin-top:6px">Economie de ' + baisseFmt + ' (-' + baisse_pct + '%)</div>'
        + '</div>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:12px 14px;font-size:12px;color:#444;margin-bottom:16px;line-height:1.7">'
        + '<div><strong>' + (type_bien || 'Bien') + '</strong> - ' + (surface || '-') + ' m2 - ' + (ville || '') + '</div>'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir ce bien maintenant</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect - alerte baisse de prix</div>'
        + '</div>'
    }

    else if (type === 'candidature_selectionnee') {
      const { bien_titre, score_total, rang, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">✓ Vous êtes sélectionné</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Votre candidature est retenue — en attente du choix vendeur</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Sur le bien <strong style="color:#0F0F0E">' + bien_titre + '</strong>, vous avez obtenu <strong style="color:#1E7A62">' + score_total + '/100</strong>. Votre score dépasse le seuil de qualité et votre profil est présenté au vendeur.</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:16px;font-size:13px;color:#085041;line-height:1.8;margin-bottom:16px;text-align:center">'
        + '<div style="font-size:32px;font-weight:300;margin-bottom:4px">' + score_total + '<span style="font-size:16px;font-weight:400">/100</span></div>'
        + '<div style="font-size:12px">Rang #' + rang + ' dans la sélection</div>'
        + '</div>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:14px 16px;font-size:12px;color:#444;line-height:1.7;margin-bottom:16px">'
        + 'Le vendeur consulte les profils de tous les agents qualifiés (≥ 60 pts) et choisit librement. Restez disponible — il peut vous contacter directement via la messagerie ImmoConnect.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir ma candidature →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — en attente du choix vendeur</div>'
        + '</div>'
    }

    else if (type === 'candidature_non_retenue') {
      // Agent < 60pts : non présenté au vendeur
      const { bien_titre, score_total, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:12px">Score insuffisant — candidature non présentée</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Sur le bien <strong style="color:#0F0F0E">' + bien_titre + '</strong>, votre score de <strong>' + score_total + '/100</strong> est en dessous du seuil de 60 pts. Votre profil n\'est pas présenté au vendeur cette fois.</p>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:14px 16px;font-size:12px;color:#444;line-height:1.7;margin-bottom:16px">'
        + 'Pour améliorer votre score : ajoutez des preuves de ventes locales, complétez votre stratégie marketing et déclarez vos mandats de recherche depuis votre dashboard.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Améliorer mon profil</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — 9,99 € engagés à la candidature, quel que soit le résultat</div>'
        + '</div>'
    }

    else if (type === 'agents_selectionnes') {
      const { nb_agents, bien_titre, lien, candidats } = body
      // candidats = array [{nom, score, rang}] de tous les agents >= 60pts
      const candidatsHtml = (candidats || []).map((c: any, i: number) => {
        const medal = i === 0 ? '\u{1F947}' : i === 1 ? '\u{1F948}' : i === 2 ? '\u{1F949}' : '\u2713'
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #E8E6E0">'
          + '<div style="font-size:13px;color:#0F0F0E">' + medal + ' <strong>#' + (i+1) + '</strong> ' + (c.nom || c.agent_email) + '</div>'
          + '<div style="font-size:13px;font-weight:600;color:#1E7A62">' + c.score_total + '/100</div>'
          + '</div>'
      }).join('')
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#1E7A62;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Classement final</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">' + nb_agents + ' candidat(s) qualifié(s) pour votre bien</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Tous les agents ayant obtenu un score ≥ 60/100 sur <strong style="color:#0F0F0E">' + bien_titre + '</strong> vous sont présentés ci-dessous, classés par score.</p>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:14px 16px;margin-bottom:16px">'
        + candidatsHtml
        + '</div>'
        + '<div style="background:#E6F1FB;border-radius:8px;padding:10px 14px;font-size:12px;color:#0C447C;margin-bottom:16px">Vous pouvez choisir librement parmi tous les candidats qualifiés. Consultez le détail de chaque profil et son analyse Hanaé pour faire votre choix.</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir tous les profils qualifiés →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — seuil qualité 60/100 — scoring automatique</div>'
        + '</div>'
    }

    else if (type === 'match_mandat_agent') {
      const { bien_titre, ville, surface, type_bien, prix, rendement_net, lien, budget_acheteur } = body
      const prixFmt = prix ? prix.toLocaleString('fr-FR') + ' EUR' : '-'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#1E7A62;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Bien compatible via agent</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un agent a un bien qui correspond a votre projet</h2>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:16px;font-size:13px;line-height:1.9">'
        + '<div><strong>' + bien_titre + '</strong></div>'
        + '<div>' + (ville || '') + ' - ' + (surface || '') + ' m2</div>'
        + '<div>Prix : <strong>' + prixFmt + '</strong></div>'
        + (rendement_net ? '<div>Rendement net : <strong style="color:#1E7A62">' + rendement_net + '%</strong></div>' : '')
        + '</div>'
        + '<div style="background:#E6F1FB;border-radius:8px;padding:10px 14px;font-size:12px;color:#0C447C;margin-bottom:16px">Ce bien est propose par un agent immobilier mandaté. Contactez-le directement via ImmoConnect.</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir ce bien</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect - matching automatique gratuit</div>'
        + '</div>'
    }

    else if (type === 'match_acheteur_agent') {
      const { bien_titre, ville, surface, type_bien, prix, annonce_id, lien } = body
      const prixFmt = prix ? prix.toLocaleString('fr-FR') + ' EUR' : '-'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAEEDA;color:#854F0B;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Bien compatible pour votre acheteur</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un bien correspond a votre acheteur en portefeuille</h2>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:16px;font-size:13px;line-height:1.9">'
        + '<div><strong>' + bien_titre + '</strong></div>'
        + '<div>' + (ville || '') + ' - ' + (surface || '') + ' m2</div>'
        + '<div>Prix : <strong>' + prixFmt + '</strong></div>'
        + '</div>'
        + '<div style="background:#FAEEDA;border-radius:8px;padding:10px 14px;font-size:12px;color:#633806;margin-bottom:16px">Ce vendeur accepte les contacts agents. Candidatez maintenant pour etre selectionne parmi les 3 meilleurs profils.</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#854F0B;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir ce bien et candidater</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect - matching automatique gratuit</div>'
        + '</div>'
    }

    else if (type === 'vendeur_mode_change') {
      const { bien_titre, nouveau_mode, lien } = body
      const modeLabel = nouveau_mode === 'acheteurs_agents' ? 'Acheteurs + Je choisis mon agent' : 'ImmoConnect sélectionne les 3 meilleurs'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#1E7A62;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Nouveau bien accessible</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un vendeur accepte maintenant les contacts agents</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Le bien <strong style="color:#0F0F0E">' + bien_titre + '</strong> a active le mode <strong>' + modeLabel + '</strong>. Vous pouvez maintenant candidater.</p>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir ce bien</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect - alerte changement mode</div>'
        + '</div>'
    }

    else if (type === 'vendeur_mode_acheteurs') {
      const { bien_titre, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAECE7;color:#712B13;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Acces agents ferme</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Ce vendeur a ferme les contacts agents</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Le bien <strong style="color:#0F0F0E">' + bien_titre + '</strong> est passe en mode acheteurs uniquement. Tout contact de votre part entrainerait une penalite de score.</p>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mes candidatures</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect - alerte mode contact</div>'
        + '</div>'
    }

    else if (type === 'agent_fantome') {
      const { bien_titre, score_estime, delai_heures, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#1E7A62;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Opportunite exclusive</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Vous auriez ete dans le top 3</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">D\'apres votre profil, vous auriez obtenu un score de <strong style="color:#1E7A62">' + score_estime + '/100</strong> sur le bien <strong style="color:#0F0F0E">' + bien_titre + '</strong>. Ce score depasse celui des candidats actuels.</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:14px;margin-bottom:14px;font-size:13px;line-height:1.7">'
        + 'Les candidatures initiales n\'ont pas atteint notre seuil de qualite de 60 points. Vous avez <strong>' + delai_heures + 'h</strong> pour candidater et ameliorer la selection proposee au vendeur.'
        + '</div>'
        + '<div style="background:#FAECE7;border-radius:8px;padding:10px 14px;font-size:12px;color:#712B13;line-height:1.6;margin-bottom:16px">'
        + '<strong>Important :</strong> Si les scores restent insuffisants, le vendeur ne sera pas oblige de choisir parmi les candidats. '
        + 'Votre candidature avec un score superieur a 60 pts ameliore significativement les chances que le vendeur obtienne une selection de qualite.'
        + '</div>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:10px 14px;font-size:12px;color:#888780;line-height:1.6;margin-bottom:16px">'
        + 'Cette opportunite est envoyee a un nombre limite d\'agents selectionnes par notre algorithme selon votre profil. Ne la manquez pas.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Candidater maintenant — 9,99 EUR</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — opportunite exclusive · Seuil qualite : 60/100</div>'
        + '</div>'
    }

    else if (type === 'alerte_choix_libre') {
      const { bien_titre, lien, priorite } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAEEDA;color:#854F0B;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">' + (priorite ? 'Candidat prioritaire' : 'Nouveau bien disponible') + '</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un vendeur souhaite choisir son agent librement</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Le vendeur du bien <strong style="color:#0F0F0E">' + bien_titre + '</strong> a opte pour le mode libre apres la selection automatique. ' + (priorite ? 'Votre candidature precedente vous place en position prioritaire.' : 'Vous etes invite a candidater.') + '</p>'
        + '<div style="background:#FAEEDA;border-radius:8px;padding:12px 14px;font-size:12px;color:#633806;line-height:1.6;margin-bottom:16px">'
        + 'Le vendeur peut signer jusqu\'a 3 mandats simples simultanement. Candidatez maintenant pour etre dans sa selection.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#854F0B;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir ce bien</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — choix libre vendeur</div>'
        + '</div>'
    }

    else if (type === 'signalement_agent') {
      const { email_signale, email_signalant, conversation_id, raison, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect - ADMIN</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAECE7;color:#712B13;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Signalement comportement suspect</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:16px">Un utilisateur a signale un contact suspect</h2>'
        + '<div style="background:#FAECE7;border-radius:8px;padding:16px;font-size:13px;line-height:1.9;margin-bottom:20px">'
        + '<div>Email signale : <strong>' + email_signale + '</strong></div>'
        + '<div>Signale par : ' + email_signalant + '</div>'
        + '<div>Conversation : ' + conversation_id + '</div>'
        + '<div>Raison : <strong>' + raison + '</strong></div>'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#C0392B;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Examiner ce compte</a></div>'
        + '</div>'
        + '</div>'
    }

    else if (type === 'avertissement_agent') {
      const { raison, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAEEDA;color:#854F0B;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">⚠️ Avertissement</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Contact non autorisé — premier avertissement</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">' + raison + '</p>'
        + '<div style="background:#FAEEDA;border-radius:8px;padding:14px;font-size:12px;color:#633806;line-height:1.7;margin-bottom:16px">'
        + '<strong>Ce qu\'il faut retenir :</strong><br>'
        + '① Cet avertissement est enregistré dans votre dossier agent.<br>'
        + '② Tout nouveau contact non autorisé entraînera automatiquement une pénalité de <strong>−10 points pendant 6 mois</strong> sur votre score de sélection.<br>'
        + '③ En cas de récidive répétée, votre compte pourra être suspendu.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mon espace agent</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — règlement agents · <a href="https://immoconnect-agence.fr/cgu.html" style="color:#888780">CGU</a></div>'
        + '</div>'
    }

    else if (type === 'penalite_agent') {
      const { points, duree, raison, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAECE7;color:#712B13;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">🚫 Pénalité appliquée</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Sanction — contact non autorisé (récidive)</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">' + raison + '</p>'
        + '<div style="background:#FAECE7;border-radius:8px;padding:14px;font-size:13px;color:#712B13;line-height:1.7;margin-bottom:16px;text-align:center">'
        + '<div style="font-size:32px;font-weight:300;margin-bottom:4px">−' + points + ' pts</div>'
        + '<div style="font-size:12px">appliqués pendant <strong>' + duree + '</strong> sur votre score de sélection</div>'
        + '</div>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:12px 14px;font-size:12px;color:#444;line-height:1.7;margin-bottom:16px">'
        + 'Pour contester cette sanction, répondez à cet email avec vos éléments. ImmoConnect traitera votre demande sous 5 jours ouvrés.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mon espace agent</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — règlement agents · <a href="https://immoconnect-agence.fr/cgu.html" style="color:#888780">CGU</a></div>'
        + '</div>'
    }

    else if (type === 'match_mandat_recherche') {
      const { bien, mandat_label, budget_max, lien } = body
      const prixFmt = bien.prix ? Math.round(parseFloat(bien.prix)).toLocaleString('fr-FR') + ' €' : '—'
      const budgetFmt = budget_max ? Math.round(parseFloat(budget_max)).toLocaleString('fr-FR') + ' €' : '—'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAEEDA;color:#854F0B;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">🎯 Mandat de recherche — Correspondance trouvée</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un bien correspond à votre mandat <em>' + mandat_label + '</em></h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Ce bien vient d\'être publié et correspond aux critères que vous avez déclarés.</p>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:16px;font-size:13px;line-height:1.9">'
        + '<div>🏠 <strong>' + (bien.titre || (bien.type_bien + ' · ' + bien.surface + ' m²')) + '</strong></div>'
        + '<div>📍 ' + (bien.ville || '—') + ' (' + (bien.code_postal || '—') + ')</div>'
        + '<div>📐 ' + (bien.surface || '—') + ' m²</div>'
        + '<div>💶 Prix : <strong>' + prixFmt + '</strong> · Budget max déclaré : ' + budgetFmt + '</div>'
        + '</div>'
        + '<div style="background:#FAEEDA;border-radius:8px;padding:10px 14px;font-size:12px;color:#633806;margin-bottom:16px">Ce bien est accessible selon le mode de contact choisi par le vendeur. Consultez le dossier et candidatez si le bien correspond à votre acheteur.</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#854F0B;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir ce bien →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — matching automatique gratuit</div>'
        + '</div>'
    }

    else if (type === 'recap_mandats_recherche') {
      const { nb_biens, biens, mandat_label, lien_dashboard } = body
      const biensHtml = (biens || []).map((b: any) => {
        const prixFmt = b.prix ? Math.round(parseFloat(b.prix)).toLocaleString('fr-FR') + ' €' : '—'
        return '<div style="border:1px solid #E8E6E0;border-radius:8px;padding:10px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">'
          + '<div><div style="font-size:12px;font-weight:500;color:#0F0F0E">' + b.titre + '</div>'
          + '<div style="font-size:11px;color:#888780">' + (b.ville || '') + '</div></div>'
          + '<div style="text-align:right"><div style="font-size:13px;font-weight:600;color:#1E7A62">' + prixFmt + '</div>'
          + '<a href="' + b.lien + '" style="font-size:11px;color:#854F0B;text-decoration:none">Voir →</a></div>'
          + '</div>'
      }).join('')
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">🔍 Mandat déclaré — Résultats immédiats</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">' + nb_biens + ' bien(s) déjà compatible(s) avec <em>' + mandat_label + '</em></h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Ces biens sont actuellement publiés sur ImmoConnect et correspondent à vos critères de recherche.</p>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:14px;margin-bottom:16px">' + biensHtml + '</div>'
        + (nb_biens > 5 ? '<p style="font-size:12px;color:#888780;text-align:center;margin-bottom:16px">+ ' + (nb_biens - 5) + ' autre(s) bien(s) dans votre dashboard</p>' : '')
        + '<div style="text-align:center"><a href="' + lien_dashboard + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir dans mon dashboard →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — matching automatique gratuit</div>'
        + '</div>'
    }

    else if (type === 'acheteur_potentiel_vendeur') {
      const { bien_titre, agent_email, agent_nom, mandat_label, budget_max, lien } = body
      const budgetFmt = budget_max ? Math.round(parseFloat(budget_max)).toLocaleString('fr-FR') + ' €' : '—'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">👤 Acheteur potentiel</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un agent a un acheteur pour votre bien</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">L\'agent <strong style="color:#0F0F0E">' + (agent_nom || agent_email) + '</strong> vous contacte concernant <strong style="color:#0F0F0E">' + bien_titre + '</strong>.</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:14px;font-size:13px;line-height:1.9;margin-bottom:16px">'
        + '<div>👤 Profil acheteur : <strong>' + mandat_label + '</strong></div>'
        + '<div>💶 Budget : <strong>' + budgetFmt + '</strong></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:10px 14px;font-size:12px;color:#444;line-height:1.6;margin-bottom:16px">'
        + 'Vous pouvez répondre à cet agent via la messagerie ImmoConnect et lui poser des questions sur la capacité de financement de son acheteur.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Répondre à l\'agent →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'agent_retenu') {
      const { nom_agent, bien_titre, nb_agents, lien } = body
      const typeMandat = nb_agents === 1 ? 'mandat simple exclusif' : 'mandat simple (2 agents retenus sur ce bien)'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Félicitations</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Vous avez été sélectionné</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Le vendeur du bien <strong style="color:#0F0F0E">' + bien_titre + '</strong> vous a sélectionné pour un <strong>' + typeMandat + '</strong>.</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:14px;font-size:12px;color:#085041;line-height:1.7;margin-bottom:16px">'
        + 'Votre stratégie marketing telle que soumise lors de la candidature est maintenant un engagement envers le vendeur. Vos honoraires sont figés conformément aux CGU ImmoConnect.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Accéder au dossier →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — <a href="https://immoconnect-agence.fr/cgu.html" style="color:#888780">CGU</a></div>'
        + '</div>'
    }

    else if (type === 'agent_non_retenu') {
      const { nom_agent, bien_titre, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un agent a été retenu sur ce bien</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Le vendeur du bien <strong style="color:#0F0F0E">' + bien_titre + '</strong> a fait son choix. Votre candidature n\'a pas été retenue cette fois.</p>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:12px 14px;font-size:12px;color:#444;line-height:1.7;margin-bottom:16px">'
        + 'Pour améliorer votre score sur les prochaines candidatures : uploadez vos preuves de vente locales, complétez votre stratégie marketing et déclarez vos mandats de recherche depuis votre dashboard.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mon dashboard →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'question_vendeur_agent') {
      const { nom_agent, question, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E6F1FB;color:#0C447C;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Question du vendeur</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Le vendeur vous pose une question</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:12px">Le vendeur du bien sur lequel vous avez candidaté souhaite obtenir des précisions :</p>'
        + '<div style="background:#E6F1FB;border-radius:8px;padding:14px 16px;font-size:13px;color:#0C447C;line-height:1.7;margin-bottom:16px;border-left:3px solid #185FA5">' + question + '</div>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:10px 14px;font-size:12px;color:#444;line-height:1.6;margin-bottom:16px">'
        + 'Répondez via la messagerie ImmoConnect pour que votre réponse soit visible du vendeur dans son tableau de candidatures.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#185FA5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Répondre →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — le vendeur attend votre réponse</div>'
        + '</div>'
    }

    else if (type === 'alerte_acheteur_potentiel') {
      const { bien_titre, mandat_label, budget_max, nouveau_mode, lien_candidature, lien_bien } = body
      const budgetFmt = budget_max ? Math.round(parseFloat(budget_max)).toLocaleString('fr-FR') + ' \u20ac' : '\u2014'
      const modeLabel = nouveau_mode === 'comparatif' ? 'mode s\u00e9lection ImmoConnect' : 'mode libre'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAEEDA;color:#854F0B;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">\ud83c\udfaf Acheteur potentiel \u2014 Opportunit\u00e9</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Un bien correspond \u00e0 votre mandat de recherche</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Le bien <strong style="color:#0F0F0E">' + bien_titre + '</strong> vient de passer en <strong>' + modeLabel + '</strong>. Il correspond \u00e0 votre mandat <em>' + mandat_label + '</em> (budget max : ' + budgetFmt + ').</p>'
        + '<div style="background:#FAEEDA;border-radius:8px;padding:12px 14px;font-size:12px;color:#633806;line-height:1.6;margin-bottom:16px">'
        + 'Candidatez maintenant pour \u00eatre s\u00e9lectionn\u00e9 parmi les 3 meilleurs profils. Votre mandat de recherche d\u00e9clar\u00e9 booste votre score de s\u00e9lection.'
        + '</div>'
        + '<div style="text-align:center;margin-bottom:8px"><a href="' + (lien_candidature || lien_bien) + '" style="background:#854F0B;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Candidater maintenant \u2192</a></div>'
        + '<div style="text-align:center"><a href="' + lien_bien + '" style="font-size:12px;color:#888780">Voir le bien sans candidater</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect \u2014 matching automatique gratuit</div>'
        + '</div>'
    }

    else if (type === 'nouveau_agent') {
      const { nom, email, agence, carte_t, cci, forfait, lien } = body
      html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">
        <div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span> — ADMIN</div></div>
        <div style="padding:28px">
          <h2 style="font-size:18px;font-weight:500;margin-bottom:16px">🆕 Nouvelle inscription agent</h2>
          <div style="background:#F5F2EC;border-radius:8px;padding:16px;font-size:13px;line-height:1.9;margin-bottom:20px">
            <div>👤 <strong>${nom}</strong></div>
            <div>📧 ${email}</div>
            <div>🏢 ${agence}</div>
            <div>🪪 Carte T : <strong>${carte_t}</strong></div>
            <div>🏛 CCI : ${cci}</div>
            <div>💶 Forfait : ${forfait}</div>
          </div>
          <div style="text-align:center"><a href="${lien}" style="background:#D4732A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Valider ou refuser →</a></div>
        </div>
      </div>`
    }

    else if (type === 'nouveau_bien') {
      const { bien_titre, ville, surface, type_bien, niveau, email_vendeur, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect — ADMIN</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E6F1FB;color:#185FA5;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Nouveau bien publié</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:16px">Un vendeur vient de publier une annonce</h2>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:16px;font-size:13px;line-height:1.9;margin-bottom:20px">'
        + '<div>\ud83c\udfe0 <strong>' + (bien_titre || type_bien + ' · ' + surface + ' m²') + '</strong></div>'
        + '<div>\ud83d\udccd ' + (ville || '—') + '</div>'
        + '<div>\ud83d\udcc4 Niveau : <strong>' + (niveau || 'standard') + '</strong></div>'
        + '<div>\ud83d\udce7 Vendeur : ' + (email_vendeur || '—') + '</div>'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#185FA5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir le bien →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — admin</div>'
        + '</div>'
    }

    else if (type === 'compte_agent_valide') {
      const { nom, forfait, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Compte validé</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Votre Carte T a été validée</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Bienvenue sur ImmoConnect, <strong style="color:#0F0F0E">' + (nom || '') + '</strong>. Votre compte agent est activé en forfait <strong>' + (forfait || 'Pay per use') + '</strong>.</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:14px;font-size:12px;color:#085041;line-height:1.7;margin-bottom:16px">'
        + 'Vous pouvez désormais recevoir des alertes sur les nouveaux biens de votre secteur, candidater en mode comparatif et déclarer vos mandats de recherche.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Accéder à mon espace agent →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — <a href="https://immoconnect-agence.fr/cgu.html" style="color:#888780">CGU</a></div>'
        + '</div>'
    }

    else if (type === 'compte_agent_refuse') {
      const { nom, motif, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAECE7;color:#712B13;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Validation refusée</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Votre Carte T n\'a pas pu être validée</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Bonjour <strong style="color:#0F0F0E">' + (nom || '') + '</strong>, nous n\'avons pas pu valider votre inscription suite à la vérification de vos documents.</p>'
        + '<div style="background:#FAECE7;border-radius:8px;padding:14px;font-size:13px;color:#712B13;line-height:1.7;margin-bottom:16px">'
        + '<strong>Motif :</strong> ' + (motif || 'Document non conforme ou expire')
        + '</div>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:12px 14px;font-size:12px;color:#444;line-height:1.7;margin-bottom:16px">'
        + 'Pour soumettre à nouveau votre dossier avec les documents corrects, connectez-vous à votre espace et mettez à jour votre Carte T.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Mettre à jour mon dossier</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — <a href="https://immoconnect-agence.fr/cgu.html" style="color:#888780">CGU</a></div>'
        + '</div>'
    }

    else if (type === 'mandat_rappel_vendeur') {
      const { bien_titre, agent_nom, heures_restantes, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAEEDA;color:#854F0B;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Mandat en attente</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Rappel : mandat a signer sous ' + heures_restantes + 'h</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Vous avez selectionne <strong style="color:#0F0F0E">' + (agent_nom || 'un agent') + '</strong> pour <strong style="color:#0F0F0E">' + bien_titre + '</strong>. Envoyez le mandat via Docage dans les <strong>' + heures_restantes + 'h</strong>.</p>'
        + '<div style="background:#FAEEDA;border-radius:8px;padding:14px;font-size:12px;color:#633806;line-height:1.7;margin-bottom:16px">'
        + 'Sans mandat signe dans ce delai : annonce cloturee, candidatures remboursees, nouvelle annonce impossible pendant 1 mois.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#854F0B;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Envoyer le mandat maintenant</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'mandat_rappel_agent') {
      const { bien_titre, heures_restantes, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E6F1FB;color:#185FA5;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">En attente du mandat</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Le vendeur n\'a pas encore envoye le mandat</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Vous etes selectionne pour <strong style="color:#0F0F0E">' + bien_titre + '</strong>. Le vendeur a encore <strong>' + heures_restantes + 'h</strong> pour envoyer le mandat.</p>'
        + '<div style="background:#E6F1FB;border-radius:8px;padding:14px;font-size:12px;color:#0C447C;line-height:1.7;margin-bottom:16px">'
        + 'Sans mandat dans ce delai, la selection sera annulee et votre candidature remboursee automatiquement.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#185FA5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir ma candidature</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'mandat_expire_remboursement') {
      const { bien_titre, nb_candidats_rembourses, montant_total, sanction, fin_sanction, lien } = body
      const sanctionMsg = sanction === 'bannissement_1mois'
        ? 'Vous ne pouvez pas poster de nouvelle annonce pendant <strong>1 mois</strong> (jusqu\'au ' + (fin_sanction || '') + ').'
        : sanction === 'bannissement_3mois'
        ? 'Vous ne pouvez pas poster de nouvelle annonce pendant <strong>3 mois</strong> (jusqu\'au ' + (fin_sanction || '') + ').'
        : 'Votre compte est definitivement banni de la plateforme (3eme infraction). Contactez-nous pour contester cette decision.'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAECE7;color:#712B13;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Annonce cloturee</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Delai de signature depasse</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Votre annonce <strong style="color:#0F0F0E">' + bien_titre + '</strong> a ete cloturee car le mandat n\'a pas ete signe dans les 48h.</p>'
        + '<div style="background:#FAECE7;border-radius:8px;padding:14px;font-size:13px;color:#712B13;line-height:1.9;margin-bottom:16px">'
        + '<div>' + (nb_candidats_rembourses || 0) + ' candidature(s) remboursee(s) — ' + (montant_total || '0') + ' EUR restitues aux agents</div>'
        + '<div style="margin-top:8px">' + sanctionMsg + '</div>'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mon compte</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'mandat_expire_agent_retenu') {
      const { bien_titre, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#FAECE7;color:#712B13;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Selection annulee</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Le vendeur n\'a pas envoye le mandat</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Votre selection sur <strong style="color:#0F0F0E">' + bien_titre + '</strong> est annulee. Le vendeur n\'a pas transmis le mandat dans les 48h.</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:14px;font-size:12px;color:#085041;line-height:1.7;margin-bottom:16px">'
        + 'Votre candidature a ete remboursee automatiquement (9,99 EUR). Le vendeur a ete sanctionne conformement aux CGU.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mon dashboard</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'candidature_annulee_remboursee') {
      const { bien_titre, montant, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Remboursement effectue</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Votre candidature a ete remboursee</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">L\'annonce <strong style="color:#0F0F0E">' + bien_titre + '</strong> a ete cloturee suite au non-respect des engagements du vendeur.</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:16px;font-size:14px;color:#085041;line-height:1.8;margin-bottom:16px;text-align:center">'
        + '<div style="font-size:28px;font-weight:300;margin-bottom:4px">+' + (montant || '9,99') + ' EUR</div>'
        + '<div style="font-size:12px">rembourse sur votre moyen de paiement (5-7 jours ouvrables)</div>'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mon dashboard</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'mandat_signe_confirmation') {
      const { bien_titre, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Mandat signe</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Confirmez la prise en charge du bien</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Le mandat pour <strong style="color:#0F0F0E">' + bien_titre + '</strong> est signe. Confirmez votre prise en charge dans les 7 jours pour activer votre mandat.</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:14px;font-size:12px;color:#085041;line-height:1.7;margin-bottom:16px">'
        + 'En confirmant, vous vous engagez a commercialiser le bien conformement a votre candidature.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '?action=confirmer_prise_en_charge" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Confirmer la prise en charge</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'agent_refuse_mandat') {
      const { bien_titre, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E6F1FB;color:#185FA5;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Agent indisponible</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">L\'agent selectionne a refuse le mandat</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">L\'agent que vous aviez selectionne pour <strong style="color:#0F0F0E">' + bien_titre + '</strong> n\'est pas disponible.</p>'
        + '<div style="background:#E6F1FB;border-radius:8px;padding:14px;font-size:12px;color:#0C447C;line-height:1.7;margin-bottom:16px">'
        + 'Votre annonce reste active. Vous pouvez choisir un autre agent parmi les candidats qualifies. Aucune sanction ne s\'applique.'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#185FA5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Choisir un autre agent</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'compte_rendu_hebdo') {
      // Le HTML est fourni directement par generer-cr
      const { html_direct } = body
      if (html_direct) {
        html = html_direct
      }
    }
    else if (type === 'vente_declaree_confirmation') {
      const { prix_vente, qui_vendu, commission_due } = body
      const quiLabels: any = { agent_immoconnect: 'Agent ImmoConnect', autre_agent: 'Autre agent immobilier', pap: 'Particulier a particulier' }
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Vente declaree</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Votre declaration de vente a ete enregistree</h2>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:14px;font-size:13px;line-height:1.9;margin-bottom:16px">'
        + '<div>Prix de vente declare : <strong>' + (prix_vente || '—') + ' EUR</strong></div>'
        + '<div>Realise par : <strong>' + (quiLabels[qui_vendu] || qui_vendu) + '</strong></div>'
        + '<div>Commission ImmoConnect : <strong>' + (commission_due ? 'Due (sera facturee en phase 2)' : 'Non applicable') + '</strong></div>'
        + '</div>'
        + '<div style="background:#E6F1FB;border-radius:8px;padding:12px 14px;font-size:12px;color:#185FA5;line-height:1.6;margin-bottom:16px">'
        + 'Votre declaration sera croisee avec les donnees notariales DVF dans les 6 mois suivant la vente. Conservez votre compromis signe.'
        + '</div>'
        + '<div style="text-align:center"><a href="https://immoconnect-agence.fr/connexion.html" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mon espace</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }
    else if (type === 'annonce_expiration_rappel') {
      const { bien_titre, jours_restants, lien_renouveler, lien_vendu, lien_annonce } = body
      const urgence = parseInt(jours_restants) <= 7
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:' + (urgence ? '#FAECE7' : '#FAEEDA') + ';color:' + (urgence ? '#712B13' : '#854F0B') + ';font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">'
        + (urgence ? 'Urgent — ' : '') + 'Annonce expire dans ' + jours_restants + ' jours</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Que voulez-vous faire avec votre annonce ?</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:20px">Votre annonce <strong style="color:#0F0F0E">' + bien_titre + '</strong> expire dans <strong>' + jours_restants + ' jours</strong>. Choisissez une action ci-dessous.</p>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'
        + '<a href="' + lien_renouveler + '" style="display:block;background:#1E7A62;color:#fff;padding:14px;border-radius:10px;text-decoration:none;text-align:center">'
        + '<div style="font-size:18px;margin-bottom:4px">🔄</div>'
        + '<div style="font-size:13px;font-weight:500">Renouveler</div>'
        + '<div style="font-size:11px;opacity:.8;margin-top:2px">3 mois de plus gratuits</div>'
        + '</a>'
        + '<a href="' + lien_vendu + '" style="display:block;background:#C09B5A;color:#fff;padding:14px;border-radius:10px;text-decoration:none;text-align:center">'
        + '<div style="font-size:18px;margin-bottom:4px">🏆</div>'
        + '<div style="font-size:13px;font-weight:500">Bien vendu !</div>'
        + '<div style="font-size:11px;opacity:.8;margin-top:2px">Declarer la vente</div>'
        + '</a>'
        + '</div>'
        + '<div style="text-align:center;margin-top:8px"><a href="' + lien_annonce + '" style="font-size:12px;color:#888780">Voir mon annonce</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect · Sans action, votre annonce sera depubliee automatiquement</div>'
        + '</div>'
    }

    else if (type === 'annonce_expiree') {
      const { bien_titre, lien_republier } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#F1EFE8;color:#888780;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Annonce depubliee</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Votre annonce a ete depubliee</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Votre annonce <strong style="color:#0F0F0E">' + bien_titre + '</strong> n\'est plus visible sur ImmoConnect. Vous pouvez la republier gratuitement a tout moment depuis votre espace.</p>'
        + '<div style="text-align:center"><a href="' + lien_republier + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Republier mon annonce</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect · Vos donnees sont conservees 12 mois</div>'
        + '</div>'
    }

    else if (type === 'rappel_documents_vendeur') {
      const { bien_titre, niveau_demande, heures_restantes, lien } = body
      const niveauColors: Record<string, string> = { silver: '#185FA5', gold: '#854F0B', platinium: '#1E7A62' }
      const niveauBgs: Record<string, string> = { silver: '#E6F1FB', gold: '#FAEEDA', platinium: '#E1F5EE' }
      const color = niveauColors[niveau_demande] || '#0F0F0E'
      const bg = niveauBgs[niveau_demande] || '#F5F2EC'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>'        + '<div style="padding:28px">'        + '<div style="display:inline-block;background:' + bg + ';color:' + color + ';font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Rappel documents</div>'        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Il vous reste ' + heures_restantes + 'h pour valider votre niveau ' + (niveau_demande || '') + '</h2>'        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Votre annonce <strong style="color:#0F0F0E">' + bien_titre + '</strong> est publiee en niveau Standard. Pour passer au niveau <strong style="color:' + color + '">' + (niveau_demande || '') + '</strong> et beneficier de la visibilite superieure, vous devez completer vos documents avant la deadline.</p>'        + '<div style="background:#FCEBEB;border-radius:8px;padding:14px;font-size:13px;line-height:1.7;margin-bottom:16px;border-left:3px solid #E24B4A">'        + 'Si les documents ne sont pas fournis dans <strong style="color:#A32D2D">' + heures_restantes + 'h</strong>, votre annonce restera en niveau Standard.'        + '</div>'        + '<div style="text-align:center"><a href="' + lien + '" style="background:' + color + ';color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Completer mes documents</a></div>'        + '</div>'        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'        + '</div>'
    }

    else if (type === 'retrograde_niveau') {
      const { bien_titre, niveau_demande, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>'        + '<div style="padding:28px">'        + '<div style="display:inline-block;background:#FCEBEB;color:#A32D2D;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Annonce retrograde</div>'        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Votre annonce a ete retrogradee au niveau Standard</h2>'        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Votre annonce <strong style="color:#0F0F0E">' + bien_titre + '</strong> n\'a pas ete validee au niveau <strong>' + (niveau_demande || '') + '</strong> dans le delai imparti. Elle est desormais publiee en <strong>niveau Standard</strong>.</p>'        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Vous pouvez a tout moment fournir vos documents pour monter en niveau et beneficier d\'une meilleure visibilite.</p>'        + '<div style="text-align:center"><a href="' + lien + '" style="background:#0F0F0E;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Acceder a mon espace</a></div>'        + '</div>'        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'        + '</div>'
    }

    else if (type === 'montee_niveau') {
      const { bien_titre, nouveau_niveau, lien } = body
      const colors: Record<string, string> = { silver: '#185FA5', gold: '#854F0B', platinium: '#1E7A62' }
      const bgs: Record<string, string>    = { silver: '#E6F1FB', gold: '#FAEEDA', platinium: '#E1F5EE' }
      const labels: Record<string, string> = { silver: 'Silver', gold: 'Gold', platinium: 'Platinium' }
      const avantages: Record<string, string> = {
        silver: 'photos illimitées, contact acheteurs gratuit, matching investisseurs et accès au top 3 des agents Hanaé',
        gold: 'adresse exacte visible par tous les acheteurs et contact direct gratuit',
        platinium: 'mise en avant prioritaire dans les résultats et alertes investisseurs en temps réel'
      }
      const color = colors[nouveau_niveau] || '#1E7A62'
      const bg = bgs[nouveau_niveau] || '#E1F5EE'
      const label = labels[nouveau_niveau] || nouveau_niveau
      const avantage = avantages[nouveau_niveau] || ''
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:' + bg + ';color:' + color + ';font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Niveau ' + label + ' débloqué</div>'
        + '<h2 style="font-size:20px;font-weight:600;margin-bottom:8px">🎉 Félicitations, niveau ' + label + ' débloqué !</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Bonne nouvelle : vos documents ont été validés. Votre bien <strong style="color:#0F0F0E">' + (bien_titre || 'votre bien') + '</strong> passe au niveau <strong style="color:' + color + '">' + label + '</strong>.</p>'
        + '<div style="background:' + bg + ';border-radius:8px;padding:14px 16px;font-size:13px;color:' + color + ';line-height:1.7;margin-bottom:20px">Nouveaux avantages débloqués : ' + avantage + '.</div>'
        + '<div style="text-align:center"><a href="' + (lien || 'https://immoconnect-agence.fr/dashboard-vendeur.html') + '" style="background:' + color + ';color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mon espace vendeur →</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect — Hanaé veille sur la valorisation de votre bien</div>'
        + '</div>'
    }

    else if (type === 'rappel_candidature_agent') {
      const { bien_titre, heures_restantes, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>'        + '<div style="padding:28px">'        + '<div style="display:inline-block;background:#FAEEDA;color:#633806;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Derniere chance</div>'        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Fenetre de candidature : ' + heures_restantes + 'h restantes</h2>'        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">La selection pour le bien <strong style="color:#0F0F0E">' + bien_titre + '</strong> se cloture dans <strong style="color:#854F0B">' + heures_restantes + 'h</strong>. Vous n\'avez pas encore candidate.</p>'        + '<div style="background:#FAEEDA;border-radius:8px;padding:14px;font-size:13px;line-height:1.7;margin-bottom:16px;border-left:3px solid #BA7517">'        + 'Apres la cloture, les candidatures ne seront plus acceptees et le top 3 sera calcule automatiquement.'        + '</div>'        + '<div style="text-align:center"><a href="' + lien + '" style="background:#854F0B;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Candidater maintenant</a></div>'        + '</div>'        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'        + '</div>'
    }

    else if (type === 'rapport_visite') {
      const { bien_titre, agent_nom, agent_agence, visite_date, acheteur_profil, acheteur_financement, acheteur_budget_fourchette, acheteur_delai, interet, points_forts, points_faibles, objections, offre_potentielle, commentaire_agent, recommandation, actions_suivantes, lien } = body

      const interetLabels: Record<string,{label:string,color:string,bg:string}> = {
        tres_interesse: { label: 'Très intéressé', color: '#085041', bg: '#E1F5EE' },
        interesse: { label: 'Intéressé', color: '#185FA5', bg: '#E6F1FB' },
        mitige: { label: 'Mitigé', color: '#633806', bg: '#FAEEDA' },
        non_interesse: { label: 'Non intéressé', color: '#791F1F', bg: '#FCEBEB' }
      }
      const interetInfo = interetLabels[interet] || interetLabels['interesse']

      const recommLabels: Record<string,string> = {
        maintenir_prix: 'Maintenir le prix',
        baisser_prix: 'Envisager une baisse de prix',
        valorisation: 'Mise en valeur recommandée',
        visite_supplémentaire: 'Nouvelles visites à programmer',
        negociation_possible: 'Négociation possible',
        retrait_temporaire: 'Retrait temporaire suggéré'
      }

      const financLabel: Record<string,string> = {
        comptant: 'Achat comptant',
        credit_obtenu: 'Crédit obtenu',
        credit_en_cours: 'Crédit en cours',
        non_precise: 'Non précisé'
      }
      const delaiLabel: Record<string,string> = {
        urgent: 'Urgent (< 1 mois)',
        '3_mois': '2-3 mois',
        '6_mois': '4-6 mois',
        plus: '6 mois +',
        non_precise: 'Non précisé'
      }

      const objRow = (objections && objections.length > 0)
        ? '<div style=\"margin-top:6px\"><span style=\"font-size:11px;color:#888780\">Objections : </span>' + objections.map((o:string) => '<span style=\"display:inline-block;background:#F1EFE8;color:#888780;font-size:10px;padding:2px 7px;border-radius:20px;margin:2px\">' + o + '</span>').join('') + '</div>'
        : ''

      const offreRow = offre_potentielle
        ? '<div style=\"background:#E1F5EE;border-radius:8px;padding:12px 14px;margin-bottom:12px;font-size:13px;color:#085041\"><strong>Offre potentielle envisagée : ' + Math.round(offre_potentielle).toLocaleString('fr-FR') + ' €</strong></div>'
        : ''

      html = '<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden\">'
        + '<div style=\"background:#0F0F0E;padding:20px 28px;display:flex;align-items:center;justify-content:space-between\">'
        + '<div style=\"font-size:20px;font-weight:600;color:#fff\">Immo<span style=\"color:#C09B5A\">Connect</span></div>'
        + '<div style=\"font-size:11px;color:rgba(255,255,255,.4)\">Rapport de visite · ' + (visite_date || '') + '</div>'
        + '</div>'
        + '<div style=\"padding:24px 28px\">'
        + '<div style=\"display:inline-block;background:' + interetInfo.bg + ';color:' + interetInfo.color + ';font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.8px;margin-bottom:14px\">' + interetInfo.label + '</div>'
        + '<h2 style=\"font-size:18px;font-weight:500;color:#0F0F0E;margin-bottom:4px\">Rapport de visite — ' + bien_titre + '</h2>'
        + '<div style=\"font-size:12px;color:#888780;margin-bottom:20px\">Rédigé par <strong style=\"color:#0F0F0E\">' + (agent_nom || '') + '</strong>' + (agent_agence ? ' · ' + agent_agence : '') + '</div>'

        + '<div style=\"font-size:11px;font-weight:700;color:#888780;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px\">Profil de l\'acquéreur</div>'
        + '<div style=\"background:#F5F2EC;border-radius:8px;padding:14px;font-size:13px;line-height:1.9;margin-bottom:16px\">'
        + (acheteur_profil ? '<div>👤 ' + acheteur_profil + '</div>' : '')
        + '<div>💳 Financement : <strong>' + (financLabel[acheteur_financement] || 'Non précisé') + '</strong></div>'
        + (acheteur_budget_fourchette ? '<div>💶 Budget envisagé : <strong>' + acheteur_budget_fourchette + '</strong></div>' : '')
        + '<div>🗓️ Délai d\'achat : <strong>' + (delaiLabel[acheteur_delai] || 'Non précisé') + '</strong></div>'
        + objRow
        + '</div>'

        + offreRow

        + '<div style=\"font-size:11px;font-weight:700;color:#888780;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px\">Retours sur le bien</div>'
        + '<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px\">'
        + (points_forts ? '<div style=\"background:#E1F5EE;border-radius:8px;padding:12px;font-size:12px;color:#085041\"><div style=\"font-weight:600;margin-bottom:4px\">✅ Points forts</div>' + points_forts + '</div>' : '<div style=\"background:#F5F2EC;border-radius:8px;padding:12px;font-size:12px;color:#888780\">Aucun point fort noté</div>')
        + (points_faibles ? '<div style=\"background:#FAEEDA;border-radius:8px;padding:12px;font-size:12px;color:#633806\"><div style=\"font-weight:600;margin-bottom:4px\">⚠️ Points faibles</div>' + points_faibles + '</div>' : '<div style=\"background:#F5F2EC;border-radius:8px;padding:12px;font-size:12px;color:#888780\">Aucun point faible noté</div>')
        + '</div>'

        + '<div style=\"font-size:11px;font-weight:700;color:#888780;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px\">Analyse et recommandation de votre agent</div>'
        + '<div style=\"background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:12px;font-size:13px;color:#444;line-height:1.7;border-left:3px solid #C09B5A\">' + (commentaire_agent || '') + '</div>'
        + (recommandation ? '<div style=\"background:#E6F1FB;border-radius:8px;padding:10px 14px;font-size:12px;color:#185FA5;margin-bottom:12px\">📋 Recommandation : <strong>' + (recommLabels[recommandation] || recommandation) + '</strong></div>' : '')
        + (actions_suivantes ? '<div style=\"background:#F5F2EC;border-radius:8px;padding:10px 14px;font-size:12px;color:#444;margin-bottom:16px\">🔜 Prochaine étape : ' + actions_suivantes + '</div>' : '')

        + '<div style=\"text-align:center\">'
        + '<a href=\"' + lien + '\" style=\"background:#0F0F0E;color:#fff;padding:11px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:500;display:inline-block\">Voir mon annonce →</a>'
        + '</div></div>'
        + '<div style=\"background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center\">ImmoConnect · Rapport transmis par votre agent mandaté</div>'
        + '</div>'
    }

    else if (type === 'confirmation_alerte_acheteur') {
      const { criteres, lien_desabo } = body
      const typeBien = (criteres && criteres.type_bien) ? criteres.type_bien : 'Tous'
      const prixMax = (criteres && criteres.prix_max) ? criteres.prix_max : 'Non defini'
      const surfMin = (criteres && criteres.surface_min) ? criteres.surface_min : 'Non defini'
      const villes = (criteres && criteres.villes) ? criteres.villes : 'Toute la France'
      const desaboUrl = lien_desabo || '#'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Alerte activee</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Votre alerte est maintenant active</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Vous recevrez un email des qu un bien correspondant a vos criteres est publie sur ImmoConnect.</p>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:16px;margin-bottom:16px;font-size:13px;line-height:1.9">'
        + '<div>Type : <strong>' + typeBien + '</strong></div>'
        + '<div>Budget max : <strong>' + prixMax + '</strong></div>'
        + '<div>Surface min : <strong>' + surfMin + '</strong></div>'
        + '<div>Secteur : <strong>' + villes + '</strong></div>'
        + '</div>'
        + '<div style="text-align:center;margin-bottom:12px"><a href="https://immoconnect-agence.fr" style="background:#185FA5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir les biens disponibles</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect · <a href="' + desaboUrl + '" style="color:#888780">Se desabonner</a></div>'
        + '</div>'
    }

    else if (type === 'demande_notation_visite') {
      const { titre_bien, lien_notation } = body
      const titreBienSafe = titre_bien || 'ce bien'
      const lienSafe = lien_notation || '#'
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>'
        + '<div style="padding:28px">'
        + '<div style="font-size:36px;text-align:center;margin-bottom:16px">&#11088;</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px;text-align:center">Comment s&#39;est passee votre visite ?</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:20px;text-align:center">Vous avez visite <strong style="color:#0F0F0E">' + titreBienSafe + '</strong>.<br>Votre avis aide a ameliorer la qualite des agents sur ImmoConnect.</p>'
        + '<div style="text-align:center;margin-bottom:20px">'
        + '<a href="' + lienSafe + '" style="background:#1E7A62;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:500;display:inline-block">Donner mon avis</a>'
        + '</div>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:12px;font-size:12px;color:#888780;text-align:center;line-height:1.6">Votre avis est anonyme. Il ne sera pas transmis au vendeur. 30 secondes suffisent.</div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'bonne_notation_agent') {
      const { note, qualificatifs } = body
      const nbEtoiles = note || 5
      const etoilesHtml = '&#11088;'.repeat(nbEtoiles)
      const qualifs = (qualificatifs && qualificatifs.length > 0) ? qualificatifs.join(', ') : ''
      const qualifLine = qualifs ? '<br>Il vous decrit comme : <strong style="color:#1E7A62">' + qualifs + '</strong>.' : ''
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">Immo<span style="color:#C09B5A">Connect</span></div></div>'
        + '<div style="padding:28px;text-align:center">'
        + '<div style="font-size:36px;margin-bottom:12px">' + etoilesHtml + '</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Excellent retour de visite !</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px">Un acheteur vous a attribue la note de <strong style="color:#0F0F0E">' + nbEtoiles + '/5</strong> pour votre derniere visite.' + qualifLine + '</p>'
        + '<div style="background:#E1F5EE;border-radius:8px;padding:12px 16px;font-size:13px;color:#085041;line-height:1.6">Cette note ameliore votre score sur ImmoConnect et augmente vos chances d&#39;etre selectionne dans le top 3 des prochaines annonces.</div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect · Votre score agent a ete mis a jour</div>'
        + '</div>'
    }

    else if (type === 'agent_vente_validee') {
      const { bien_titre, prix_vente, nb_ventes_prouvees, lien } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E1F5EE;color:#085041;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Vente validee</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Felicitations — votre vente est confirmee !</h2>'
        + '<div style="background:#E1F5EE;border-radius:10px;padding:16px;text-align:center;margin-bottom:16px">'
        + '<div style="font-size:28px;margin-bottom:4px">🏆</div>'
        + '<div style="font-size:15px;font-weight:500;color:#085041">' + bien_titre + '</div>'
        + '<div style="font-size:13px;color:#1E7A62;margin-top:4px">Vendu a ' + (prix_vente || '—') + ' EUR</div>'
        + '</div>'
        + '<div style="background:#F5F2EC;border-radius:8px;padding:14px;font-size:13px;line-height:1.9;margin-bottom:16px">'
        + '<div>Ventes prouvees sur ImmoConnect : <strong>' + (nb_ventes_prouvees || 1) + '</strong></div>'
        + '<div>Badge <strong>Vente prouvee</strong> : desormais visible sur votre profil</div>'
        + '<div>Bonus scoring : <strong>+5 pts</strong> sur vos 3 prochaines candidatures</div>'
        + '</div>'
        + '<div style="text-align:center"><a href="' + lien + '" style="background:#1E7A62;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:500;display:inline-block">Voir mon dashboard</a></div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
    }

    else if (type === 'vendeur_confirmer_vente_agent') {
      const { bien_titre, agent_nom, prix_declare, lien_confirmer, lien_contester } = body
      html = '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#FEFDFB;border:1px solid #E8E6E0;border-radius:10px;overflow:hidden">'
        + '<div style="background:#0F0F0E;padding:20px 28px"><div style="font-size:20px;font-weight:600;color:#fff">ImmoConnect</div></div>'
        + '<div style="padding:28px">'
        + '<div style="display:inline-block;background:#E6F1FB;color:#185FA5;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:16px">Confirmation requise</div>'
        + '<h2 style="font-size:18px;font-weight:500;margin-bottom:8px">Votre agent a declare une vente</h2>'
        + '<p style="font-size:13px;color:#888780;line-height:1.7;margin-bottom:16px"><strong style="color:#0F0F0E">' + (agent_nom || 'Votre agent') + '</strong> a declare avoir vendu votre bien <strong style="color:#0F0F0E">' + bien_titre + '</strong> au prix de <strong style="color:#0F0F0E">' + (prix_declare || '—') + ' EUR</strong>.</p>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">'
        + '<a href="' + lien_confirmer + '" style="display:block;background:#1E7A62;color:#fff;padding:12px;border-radius:10px;text-decoration:none;text-align:center;font-size:13px;font-weight:500">Confirmer la vente</a>'
        + '<a href="' + lien_contester + '" style="display:block;background:#FAECE7;color:#712B13;border:1px solid #F5C4B3;padding:12px;border-radius:10px;text-decoration:none;text-align:center;font-size:13px;font-weight:500">Contester</a>'
        + '</div>'
        + '<div style="font-size:11px;color:#888780;line-height:1.6">En confirmant, vous validez la vente et permettez a l\'agent d\'obtenir son badge Vente prouvee sur ImmoConnect.</div>'
        + '</div>'
        + '<div style="background:#F5F2EC;padding:14px 28px;font-size:11px;color:#888780;text-align:center">ImmoConnect</div>'
        + '</div>'
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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch(e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
})
