/* ══════════════════════════════════════════════════════════════════════
   VISALE — estimateur d'éligibilité (ImmoConnect)
   - Aucun montant en dur : tout vient des tables visale_bareme / visale_config
     / visale_zones (mises à jour par simple UPDATE, cf. sql-visale.sql).
   - Le résultat est une ESTIMATION, jamais une décision. Renvoi systématique
     au simulateur officiel : https://www.visale.fr
   Usage :
     const r = await VisaleEstimator.estimer({ revenus, loyerCC, codePostal, etudiant });
     // r = { ok, zone, plafondZone, plafondEffort, loyerGaranti, eligible, contrainte, taux, annee }
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  var SB_URL = 'https://zxxhyefajfwqcxcfxpmg.supabase.co';
  var SB_KEY = 'sb_publishable_cW5-jNMT_wq5ng4XdOYgQQ_BM6DecbM';
  var _db = null, _bareme = null, _config = null;

  function db() { if (!_db && window.supabase) _db = window.supabase.createClient(SB_URL, SB_KEY); return _db; }

  async function charger(annee) {
    if (_bareme) return;
    try {
      var b = await db().from('visale_bareme').select('*').eq('annee', annee);
      _bareme = {}; (b.data || []).forEach(function (r) { _bareme[r.zone] = r; });
      if (!Object.keys(_bareme).length) { _bareme = null; return; }
      var c = await db().from('visale_config').select('*').eq('annee', annee).maybeSingle();
      _config = (c && c.data) || { taux_effort: 0.5, revenu_max_plus30: null };
    } catch (e) { _bareme = null; }
  }

  async function zonePour(cp) {
    if (!cp) return 3;
    try {
      var z = await db().from('visale_zones').select('zone').eq('code_postal', String(cp).trim()).maybeSingle();
      return (z && z.data && z.data.zone) || 3; // défaut prudent : zone 3
    } catch (e) { return 3; }
  }

  async function estimer(opts) {
    opts = opts || {};
    var annee = opts.annee || 2026;
    await charger(annee);
    if (!_bareme) return { ok: false, erreur: 'Barème Visale indisponible' };
    var zone = await zonePour(opts.codePostal);
    var b = _bareme[zone] || _bareme[3] || _bareme[Object.keys(_bareme)[0]];
    var plafondZone = opts.etudiant ? Number(b.plafond_etudiant) : Number(b.plafond);
    var taux = (_config && _config.taux_effort) || 0.5;
    var revenus = Number(opts.revenus) || 0;
    var plafondEffort = revenus > 0 ? Math.floor(revenus * taux) : null;
    var loyerGaranti = plafondEffort != null ? Math.min(plafondZone, plafondEffort) : plafondZone;
    var loyer = Number(opts.loyerCC) || 0;
    var eligible = loyer > 0 && loyer <= loyerGaranti;
    var contrainte = (plafondEffort != null && plafondEffort < plafondZone) ? 'taux_effort' : 'plafond_zone';
    return {
      ok: true, zone: zone, plafondZone: plafondZone, plafondEffort: plafondEffort,
      loyerGaranti: loyerGaranti, eligible: eligible, contrainte: contrainte, taux: taux, annee: annee
    };
  }

  // Rendu HTML prêt à insérer (facultatif)
  function rendu(r) {
    if (!r || !r.ok) return '<div style="color:#888">Estimation Visale indisponible pour le moment.</div>';
    var e = function (n) { return Math.round(n).toLocaleString('fr-FR') + ' €'; };
    var couleur = r.eligible ? '#1E7A62' : '#A32D2D';
    var titre = r.eligible ? '✅ Vous seriez a priori éligible à Visale' : '⚠️ Loyer probablement trop élevé pour Visale';
    var pourquoi = r.contrainte === 'taux_effort'
      ? 'C\'est la règle des 50 % de vos revenus qui limite (' + e(r.plafondEffort) + '), pas le plafond de zone (' + e(r.plafondZone) + ').'
      : 'C\'est le plafond de votre zone qui limite (' + e(r.plafondZone) + ').';
    return '<div style="border:1px solid #E8E6E0;border-radius:10px;padding:14px;background:#FEFDFB">'
      + '<div style="font-weight:600;color:' + couleur + ';margin-bottom:6px">' + titre + '</div>'
      + '<div style="font-size:13px;color:#333;line-height:1.7">'
      + 'Loyer maximum garantissable estimé : <strong>' + e(r.loyerGaranti) + '/mois</strong> (charges comprises).<br>'
      + pourquoi + '</div>'
      + '<div style="font-size:11px;color:#888;margin-top:8px">Estimation indicative (barème ' + r.annee + '). Seul le simulateur officiel fait foi : '
      + '<a href="https://www.visale.fr" target="_blank" rel="noopener" style="color:#C09B5A">visale.fr</a></div>'
      + '</div>';
  }

  window.VisaleEstimator = { estimer: estimer, rendu: rendu };
})();
