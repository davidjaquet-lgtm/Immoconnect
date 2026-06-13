/* ImmoConnect — barre de recherche permanente, insérée sous le bandeau supérieur.
   Composant partagé : inclure <script src="searchbar.js" defer></script> sur chaque page.
   Soumet vers recherche.html avec les filtres en paramètres d'URL. */
(function () {
  // Ne pas dupliquer sur la page de résultats (elle a déjà sa propre barre complète)
  var path = (location.pathname || '').toLowerCase();
  if (path.indexOf('recherche.html') !== -1) return;

  function build() {
    if (document.getElementById('ic-searchbar')) return;

    // Styles (scopés .ic-sb*) injectés une seule fois
    if (!document.getElementById('ic-searchbar-style')) {
      var st = document.createElement('style');
      st.id = 'ic-searchbar-style';
      st.textContent =
        '#ic-searchbar{background:#FAFAF7;border-bottom:1px solid rgba(28,28,26,.10);padding:12px 24px;font-family:"DM Sans","Outfit",system-ui,sans-serif}' +
        '.ic-sb-inner{max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:10px;align-items:center}' +
        '.ic-sb-inner input,.ic-sb-inner select{padding:9px 11px;border:1px solid rgba(28,28,26,.14);border-radius:4px;font-family:inherit;font-size:13px;background:#fff;color:#1C1C1A;height:38px}' +
        '.ic-sb-inner input:focus,.ic-sb-inner select:focus{outline:none;border-color:#B89A5E}' +
        '.ic-sb-ville{flex:1;min-width:180px}' +
        '.ic-sb-sel{min-width:120px}' +
        '.ic-sb-btn{padding:9px 22px;height:38px;background:#1C1C1A;color:#F5F0E8;border:none;border-radius:4px;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:background .2s;white-space:nowrap}' +
        '.ic-sb-btn:hover{background:#B89A5E;color:#1C1C1A}' +
        '.ic-sb-lbl{font-size:12px;color:#8A8478;font-weight:500;margin-right:2px;white-space:nowrap}' +
        '@media(max-width:640px){#ic-searchbar{padding:10px 14px}.ic-sb-lbl{display:none}.ic-sb-ville{min-width:100%;flex-basis:100%}.ic-sb-btn{flex:1}}';
      document.head.appendChild(st);
    }

    var bar = document.createElement('div');
    bar.id = 'ic-searchbar';
    bar.innerHTML =
      '<div class="ic-sb-inner">' +
      '<span class="ic-sb-lbl">🔍 Acheter</span>' +
      '<input class="ic-sb-ville" id="ic-sb-ville" type="text" placeholder="Ville, code postal…">' +
      '<select class="ic-sb-sel" id="ic-sb-type">' +
        '<option value="">Tous types</option>' +
        '<option>Maison</option><option>Appartement</option><option>Villa</option>' +
        '<option>Terrain</option><option>Immeuble</option><option>Local commercial</option>' +
      '</select>' +
      '<select class="ic-sb-sel" id="ic-sb-budget">' +
        '<option value="">Budget max</option>' +
        '<option value="150000">150 000 €</option><option value="250000">250 000 €</option>' +
        '<option value="350000">350 000 €</option><option value="500000">500 000 €</option>' +
        '<option value="750000">750 000 €</option><option value="1000000">1 000 000 €</option>' +
      '</select>' +
      '<select class="ic-sb-sel" id="ic-sb-pieces">' +
        '<option value="">Pièces</option>' +
        '<option value="1">1+</option><option value="2">2+</option><option value="3">3+</option>' +
        '<option value="4">4+</option><option value="5">5+</option>' +
      '</select>' +
      '<button class="ic-sb-btn" id="ic-sb-go">Rechercher</button>' +
      '</div>';

    // Insertion juste sous le bandeau supérieur (nav / header)
    var anchor = document.querySelector('nav, header, .nav, .topbar, .header');
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(bar, anchor.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }

    function go() {
      var p = new URLSearchParams();
      var ville = (document.getElementById('ic-sb-ville') || {}).value;
      var type = (document.getElementById('ic-sb-type') || {}).value;
      var budg = (document.getElementById('ic-sb-budget') || {}).value;
      var piec = (document.getElementById('ic-sb-pieces') || {}).value;
      if (ville && ville.trim()) p.set('ville', ville.trim());
      if (type) p.set('type', type);
      if (budg) p.set('prixmax', budg);
      if (piec) p.set('pieces', piec);
      window.location.href = 'recherche.html' + (p.toString() ? '?' + p.toString() : '');
    }
    document.getElementById('ic-sb-go').addEventListener('click', go);
    document.getElementById('ic-sb-ville').addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
