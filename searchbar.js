/* ImmoConnect — composant d'en-tête partagé (inclure une fois par page) :
   1) Affiche le nom du compte connecté en haut à droite (sinon "Connexion").
   2) Insère, sous le bandeau supérieur, une barre de recherche au style de l'accueil
      (pilule blanche, libellés, bouton doré) qui soumet vers recherche.html.
   Aucune dépendance : la session est lue directement depuis le stockage local. */
(function () {
  var REF = 'zxxhyefajfwqcxcfxpmg';

  // ── 1) NOM DU COMPTE CONNECTÉ ───────────────────────────────
  function readSession() {
    try {
      var base = 'sb-' + REF + '-auth-token';
      var raw = localStorage.getItem(base);
      if (raw == null) { // jeton éventuellement découpé en morceaux .0, .1…
        var parts = [], i = 0, c;
        while ((c = localStorage.getItem(base + '.' + i)) != null) { parts.push(c); i++; }
        if (parts.length) raw = parts.join('');
      }
      if (!raw) return null;
      var o = JSON.parse(raw);
      var sess = o.currentSession || o;
      if (sess && sess.user) return sess;
      if (o.user) return { user: o.user };
      return null;
    } catch (e) { return null; }
  }

  function nomCompte(user) {
    if (!user) return null;
    var m = user.user_metadata || {};
    var n = ((m.prenom || '') + ' ' + (m.nom || '')).trim() || (m.full_name || '') || (user.email ? user.email.split('@')[0] : '');
    return n || null;
  }

  function lienCompte() {
    var el = document.getElementById('nav-account');
    if (el) return el;
    // N'importe quel lien vers connexion.html dans le bandeau (quel que soit son libellé)
    var head = document.querySelector('nav, header, .nav, .topbar, .header');
    if (head) { var a = head.querySelector('a[href*="connexion.html"]'); if (a) return a; }
    // Repli global par libellé courant
    var links = document.querySelectorAll('a[href*="connexion.html"]');
    for (var i = 0; i < links.length; i++) {
      var t = (links[i].textContent || '').trim().toLowerCase();
      if (t === 'connexion' || t === 'mon espace' || t === 'se connecter') return links[i];
    }
    return null;
  }

  function majCompte() {
    var el = lienCompte();
    if (!el) return;
    var sess = readSession();
    var nom = sess ? nomCompte(sess.user) : null;
    if (nom) {
      el.textContent = nom;
      el.setAttribute('href', 'connexion.html');
      el.title = 'Mon tableau de bord';
    }
    // Non connecté : on laisse "Connexion" tel quel.
  }

  // ── 2) BARRE DE RECHERCHE (style accueil) ───────────────────
  function buildBar() {
    // Pas sur la page de résultats (barre complète déjà présente)
    if ((location.pathname || '').toLowerCase().indexOf('recherche.html') !== -1) return;
    if (document.getElementById('ic-searchbar')) return;

    if (!document.getElementById('ic-sb-style')) {
      var st = document.createElement('style');
      st.id = 'ic-sb-style';
      st.textContent =
        '#ic-searchbar{background:#1C1C1A;padding:16px 48px}' +
        '.ic-sb-bar{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:12px;background:#FAFAF7;border-radius:2px;padding:6px 6px 6px 22px;box-shadow:0 4px 40px rgba(28,28,26,.18)}' +
        '.ic-sb-field{flex:1;display:flex;align-items:center;gap:8px;border-right:1px solid rgba(28,28,26,.1);padding:6px 16px 6px 0}' +
        '.ic-sb-field.ic-sb-last{border-right:none}' +
        '.ic-sb-field svg{color:#8A8478;flex-shrink:0}' +
        '.ic-sb-field label{display:block;font-size:10px;color:#8A8478;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px}' +
        '.ic-sb-field input,.ic-sb-field select{border:none;background:transparent;outline:none;font-family:"DM Sans","Outfit",system-ui,sans-serif;font-size:14px;color:#1C1C1A;width:100%;cursor:pointer}' +
        '.ic-sb-btn{padding:14px 26px;background:#B89A5E;color:#1C1C1A;border:none;border-radius:1px;font-family:"DM Sans","Outfit",system-ui,sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:background .2s;white-space:nowrap;letter-spacing:.3px}' +
        '.ic-sb-btn:hover{background:#D4B87A}' +
        '@media(max-width:760px){#ic-searchbar{padding:12px 16px}.ic-sb-bar{flex-wrap:wrap;padding:12px}.ic-sb-field{flex-basis:calc(50% - 6px);border-right:none;padding:6px 0}.ic-sb-field.ic-sb-loc{flex-basis:100%}.ic-sb-btn{flex-basis:100%}}';
      document.head.appendChild(st);
    }

    var pin = '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>';
    var bar = document.createElement('div');
    bar.id = 'ic-searchbar';
    bar.innerHTML =
      '<div class="ic-sb-bar">' +
        '<div class="ic-sb-field ic-sb-loc">' + pin +
          '<div style="flex:1"><label>Localisation</label>' +
          '<input id="ic-sb-ville" type="text" placeholder="Ville, code postal…"></div></div>' +
        '<div class="ic-sb-field"><div style="flex:1"><label>Type de bien</label>' +
          '<select id="ic-sb-type"><option value="">Tous</option><option>Maison</option><option>Appartement</option>' +
          '<option>Villa</option><option>Terrain</option><option>Immeuble</option><option>Local commercial</option></select></div></div>' +
        '<div class="ic-sb-field"><div style="flex:1"><label>Budget max</label>' +
          '<select id="ic-sb-budget"><option value="">Sans limite</option>' +
          '<option value="150000">150 000 €</option><option value="250000">250 000 €</option>' +
          '<option value="350000">350 000 €</option><option value="500000">500 000 €</option>' +
          '<option value="750000">750 000 €</option><option value="1000000">1 000 000 €</option></select></div></div>' +
        '<div class="ic-sb-field ic-sb-last"><div style="flex:1"><label>Pièces min.</label>' +
          '<select id="ic-sb-pieces"><option value="">Indifférent</option>' +
          '<option value="1">1+</option><option value="2">2+</option><option value="3">3+</option>' +
          '<option value="4">4+</option><option value="5">5+</option></select></div></div>' +
        '<button class="ic-sb-btn" id="ic-sb-go">Rechercher →</button>' +
      '</div>';

    var anchor = document.querySelector('nav, header, .nav, .topbar, .header');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);

    function go() {
      var p = new URLSearchParams();
      var v = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };
      if (v('ic-sb-ville').trim()) p.set('ville', v('ic-sb-ville').trim());
      if (v('ic-sb-type')) p.set('type', v('ic-sb-type'));
      if (v('ic-sb-budget')) p.set('prixmax', v('ic-sb-budget'));
      if (v('ic-sb-pieces')) p.set('pieces', v('ic-sb-pieces'));
      window.location.href = 'recherche.html' + (p.toString() ? '?' + p.toString() : '');
    }
    document.getElementById('ic-sb-go').addEventListener('click', go);
    document.getElementById('ic-sb-ville').addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  }

  function init() { try { majCompte(); } catch (e) {} try { buildBar(); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
