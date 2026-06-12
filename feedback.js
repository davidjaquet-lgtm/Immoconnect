/* ImmoConnect — widget de retour utilisateur (phase bêta)
   Bouton flottant « Un problème ? » présent sur toutes les pages.
   Enregistre le retour en base (table feedbacks) + email à l'équipe. */
(function () {
  if (window.__icFeedback) return; window.__icFeedback = true;
  var SB = 'https://zxxhyefajfwqcxcfxpmg.supabase.co';
  var KEY = 'sb_publishable_cW5-jNMT_wq5ng4XdOYgQQ_BM6DecbM';

  /* ── Bouton flottant ── */
  var btn = document.createElement('button');
  btn.id = 'ic-fb-btn';
  btn.type = 'button';
  btn.innerHTML = '\uD83D\uDEDF Un probl\u00E8me\u00A0?';
  btn.style.cssText = 'position:fixed;bottom:18px;left:18px;z-index:9000;background:#1C1C1A;color:#fff;border:none;border-radius:24px;padding:10px 16px;font-family:Outfit,Arial,sans-serif;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)';
  document.body.appendChild(btn);

  /* ── Panneau ── */
  var panel = document.createElement('div');
  panel.id = 'ic-fb-panel';
  panel.style.cssText = 'display:none;position:fixed;bottom:70px;left:18px;z-index:9001;width:300px;max-width:calc(100vw - 36px);background:#fff;border:1px solid #E8E4DC;border-radius:12px;box-shadow:0 10px 32px rgba(0,0,0,.18);padding:16px;font-family:Outfit,Arial,sans-serif';
  panel.innerHTML =
    '<div style="font-size:14px;font-weight:700;margin-bottom:4px">Votre avis nous aide \uD83D\uDE4F</div>' +
    '<div style="font-size:11px;color:#8A8578;margin-bottom:10px">Site en phase b\u00EAta \u2014 chaque retour compte.</div>' +
    '<select id="ic-fb-cat" style="width:100%;padding:8px;border:1px solid #E8E4DC;border-radius:6px;font-family:inherit;font-size:13px;margin-bottom:8px">' +
      '<option value="bug">\uD83D\uDC1E Signaler un bug</option>' +
      '<option value="question">\u2753 Poser une question</option>' +
      '<option value="idee">\uD83D\uDCA1 Sugg\u00E9rer une id\u00E9e</option>' +
    '</select>' +
    '<textarea id="ic-fb-msg" rows="4" placeholder="D\u00E9crivez le probl\u00E8me ou votre question\u2026" style="width:100%;padding:8px;border:1px solid #E8E4DC;border-radius:6px;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;margin-bottom:8px"></textarea>' +
    '<input id="ic-fb-email" type="email" placeholder="Votre email (pour vous r\u00E9pondre)" style="width:100%;padding:8px;border:1px solid #E8E4DC;border-radius:6px;font-family:inherit;font-size:13px;box-sizing:border-box;margin-bottom:10px">' +
    '<button id="ic-fb-send" type="button" style="width:100%;background:#C09B5A;color:#fff;border:none;border-radius:6px;padding:10px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">Envoyer</button>' +
    '<div id="ic-fb-ok" style="display:none;font-size:13px;color:#0F6E56;font-weight:600;text-align:center;padding:8px 0">\u2705 Merci, bien re\u00E7u !</div>';
  document.body.appendChild(panel);

  btn.addEventListener('click', function () {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  /* Pré-remplir l'email si une session Supabase existe (sans charger la lib) */
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('sb-') === 0 && k.indexOf('auth-token') > -1) {
        var s = JSON.parse(localStorage.getItem(k));
        var em = s && (s.user && s.user.email || s.currentSession && s.currentSession.user && s.currentSession.user.email);
        if (em) document.getElementById('ic-fb-email').value = em;
        break;
      }
    }
  } catch (e) {}

  document.getElementById('ic-fb-send').addEventListener('click', async function () {
    var send = this;
    var msg = document.getElementById('ic-fb-msg').value.trim();
    if (!msg) { document.getElementById('ic-fb-msg').style.borderColor = '#C0392B'; return; }
    send.disabled = true; send.textContent = 'Envoi\u2026';
    var data = {
      categorie: document.getElementById('ic-fb-cat').value,
      message: msg.slice(0, 3000),
      email: document.getElementById('ic-fb-email').value.trim() || null,
      page: location.pathname + location.search,
      navigateur: navigator.userAgent.slice(0, 200)
    };
    try {
      /* 1. Enregistrement en base */
      await fetch(SB + '/rest/v1/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': 'Bearer ' + KEY },
        body: JSON.stringify(data)
      });
      /* 2. Email à l'équipe */
      fetch(SB + '/functions/v1/envoyer-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + KEY, 'apikey': KEY },
        body: JSON.stringify({
          type: 'feedback',
          to: 'contact@immoconnect-agence.fr',
          subject: '[B\u00EAta] ' + data.categorie + ' \u2014 ' + data.page,
          categorie: data.categorie, message: data.message,
          email_user: data.email, page: data.page, navigateur: data.navigateur
        })
      }).catch(function () {});
      document.getElementById('ic-fb-ok').style.display = 'block';
      document.getElementById('ic-fb-msg').value = '';
      setTimeout(function () { panel.style.display = 'none'; document.getElementById('ic-fb-ok').style.display = 'none'; }, 1800);
    } catch (e) {
      alert("L'envoi a \u00E9chou\u00E9 \u2014 vous pouvez nous \u00E9crire \u00E0 contact@immoconnect-agence.fr");
    }
    send.disabled = false; send.textContent = 'Envoyer';
  });
})();
