// ════════════════════════════════════════════════════════════════════
//  messagerie-badge.js — Pastille "messages non lus" GLOBALE
//  À inclure sur toutes les pages : <script src="messagerie-badge.js" defer></script>
//  S'auto-injecte en haut à droite, compte les non-lus de l'utilisateur
//  connecté (conversations agents/vendeurs + contacts acheteurs) et se met
//  à jour en temps réel. Ne s'affiche pas si personne n'est connecté.
// ════════════════════════════════════════════════════════════════════
(function () {
  var SB_URL = 'https://zxxhyefajfwqcxcfxpmg.supabase.co';
  var SB_KEY = 'sb_publishable_cW5-jNMT_wq5ng4XdOYgQQ_BM6DecbM';
  var db, myEmail, myUid, convIds = [];

  function ensureSupabase(cb) {
    if (window.supabase && window.supabase.createClient) return cb();
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = cb;
    document.head.appendChild(s);
  }

  function pill() {
    var el = document.getElementById('mc-msg-pill');
    if (el) return el;
    var a = document.createElement('a');
    a.id = 'mc-msg-pill';
    a.href = 'messagerie.html';
    a.title = 'Messagerie';
    a.style.cssText = 'position:fixed;top:12px;right:14px;z-index:9500;display:none;' +
      'align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;' +
      'background:#0F3A6B;color:#fff;font-size:19px;text-decoration:none;' +
      'box-shadow:0 4px 14px rgba(0,0,0,.20)';
    a.innerHTML = '<span style="line-height:1">\uD83D\uDCAC</span>' +
      '<span id="mc-msg-count" style="position:absolute;top:-4px;right:-4px;background:#A32D2D;' +
      'color:#fff;font-size:11px;font-weight:700;min-width:18px;height:18px;line-height:18px;' +
      'border-radius:9px;padding:0 4px;text-align:center;display:none"></span>';
    document.body.appendChild(a);
    return a;
  }

  function setCount(n) {
    var p = pill();
    var c = document.getElementById('mc-msg-count');
    p.style.display = 'flex';                 // pastille visible dès qu'on est connecté
    if (n > 0) { c.textContent = n > 9 ? '9+' : String(n); c.style.display = 'block'; }
    else { c.style.display = 'none'; }
  }

  async function compter() {
    if (!myEmail) return;
    var total = 0;
    try {
      var r1 = await db.from('conversations').select('id')
        .or('agent_id.eq.' + myUid + ',vendeur_id.eq.' + myUid + ',acheteur_id.eq.' + myUid
          + ',email_agent.ilike.' + myEmail + ',email_vendeur.ilike.' + myEmail + ',email_acheteur.ilike.' + myEmail);
      convIds = (r1.data || []).map(function (c) { return c.id; });
      if (convIds.length) {
        var r2 = await db.from('messages_conversation').select('*', { count: 'exact', head: true })
          .in('conversation_id', convIds).eq('lu', false).neq('expediteur_email', myEmail);
        total += r2.count || 0;
      }
    } catch (e) {}
    try {
      var r3 = await db.from('messages_annonces').select('*', { count: 'exact', head: true })
        .ilike('email_vendeur', myEmail).eq('lu', false);
      total += r3.count || 0;
    } catch (e) {}
    setCount(total);
  }

  function abonner() {
    try {
      db.channel('mc-msg-global')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages_conversation' },
          function (payload) {
            var m = payload.new;
            if (!m || (m.expediteur_email || '').toLowerCase() === myEmail) return;
            if (convIds.indexOf(m.conversation_id) !== -1) compter();
            else compter(); // recalcule au cas où c'est une nouvelle conversation nous concernant
          })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages_annonces' },
          function () { compter(); })
        .subscribe();
    } catch (e) {}
  }

  function start() {
    if (!window.supabase || !window.supabase.createClient) return;
    db = window.supabase.createClient(SB_URL, SB_KEY);
    db.auth.getSession().then(function (res) {
      var s = res && res.data && res.data.session;
      if (!s || !s.user) return;               // pas connecté → pas de pastille
      myEmail = (s.user.email || '').trim().toLowerCase();
      myUid = s.user.id;
      compter();
      abonner();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { ensureSupabase(start); });
  } else {
    ensureSupabase(start);
  }
})();
