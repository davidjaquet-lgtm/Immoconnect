// ImmoConnect — PWA Helper
// À inclure dans toutes les pages : <script src="pwa.js"></script>

(function() {

  // ── 1. ENREGISTREMENT SERVICE WORKER ──────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js').then(function(reg) {
        console.log('[PWA] Service Worker enregistré', reg.scope);

        // Détecter les mises à jour
        reg.addEventListener('updatefound', function() {
          var newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', function() {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible
                afficherToastMaj();
              }
            });
          }
        });
      }).catch(function(err) {
        console.warn('[PWA] Erreur SW:', err);
      });
    });
  }

  // ── 2. BANNER INSTALLATION (A2HS) ─────────────────────────────────
  var deferredPrompt = null;
  var bannerShown = false;

  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredPrompt = e;

    // Ne pas montrer si déjà installé ou refusé récemment
    var refuse = localStorage.getItem('pwa-install-refused');
    if (refuse && Date.now() - parseInt(refuse) < 7 * 24 * 3600000) return;

    // Attendre 3s avant d'afficher
    setTimeout(function() {
      if (!bannerShown) afficherBannerInstall();
    }, 3000);
  });

  window.addEventListener('appinstalled', function() {
    console.log('[PWA] App installée');
    masquerBannerInstall();
    localStorage.removeItem('pwa-install-refused');
    // Analytics
    if (typeof gtag !== 'undefined') gtag('event', 'pwa_installed');
  });

  function afficherBannerInstall() {
    if (document.getElementById('pwa-banner')) return;
    bannerShown = true;

    var banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.innerHTML = '<div style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#0F0F0E;color:#fff;border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,.3);z-index:9999;max-width:380px;width:calc(100% - 32px);font-family:Outfit,system-ui,sans-serif">'
      + '<div style="font-size:28px;flex-shrink:0">🏠</div>'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:13px;font-weight:500;margin-bottom:2px">Installer ImmoConnect</div>'
      + '<div style="font-size:11px;color:rgba(255,255,255,.5)">Accès rapide + alertes en temps réel</div>'
      + '</div>'
      + '<button id="pwa-install-btn" style="padding:8px 14px;background:#C09B5A;color:#0F0F0E;border:none;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit;white-space:nowrap">Installer</button>'
      + '<button id="pwa-close-btn" style="background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:18px;padding:4px;line-height:1">×</button>'
      + '</div>';

    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', function() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(result) {
          if (result.outcome === 'accepted') {
            console.log('[PWA] Accepté');
          } else {
            localStorage.setItem('pwa-install-refused', Date.now().toString());
          }
          deferredPrompt = null;
          masquerBannerInstall();
        });
      }
    });

    document.getElementById('pwa-close-btn').addEventListener('click', function() {
      localStorage.setItem('pwa-install-refused', Date.now().toString());
      masquerBannerInstall();
    });
  }

  function masquerBannerInstall() {
    var banner = document.getElementById('pwa-banner');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateX(-50%) translateY(20px)';
      banner.style.transition = 'all .3s';
      setTimeout(function() { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 300);
    }
  }

  // ── 3. NOTIFICATIONS PUSH ─────────────────────────────────────────
  window.ImmoConnectPWA = {

    // Demander la permission et s'abonner
    demanderPermissionPush: async function(agentEmail) {
      if (!('Notification' in window) || !('PushManager' in window)) {
        console.warn('[PWA] Push non supporté');
        return false;
      }

      var permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      try {
        var reg = await navigator.serviceWorker.ready;
        var sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            // Clé VAPID publique — à remplacer après génération
            'BPZ9k0A7LJEkOG1HmIoIRAG8ZstC3z01tOSkIX8DMyNEPd1D77YmA3V_SKdYxj2N13L_6dwFIQWu0QpfU-MMhOU'
          )
        });

        // Enregistrer la subscription dans Supabase
        if (agentEmail && sub) {
          await fetch('https://zxxhyefajfwqcxcfxpmg.supabase.co/rest/v1/push_subscriptions', {
            method: 'POST',
            headers: {
              'apikey': 'sb_publishable_cW5-jNMT_wq5ng4XdOYgQQ_BM6DecbM',
              'Content-Type': 'application/json',
              'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
              email: agentEmail,
              subscription: JSON.stringify(sub),
              user_agent: navigator.userAgent,
              created_at: new Date().toISOString()
            })
          }).catch(function(e) { console.warn('[PWA] Erreur enregistrement push:', e); });
        }

        console.log('[PWA] Abonnement push réussi');
        return true;
      } catch(e) {
        console.warn('[PWA] Erreur push:', e);
        return false;
      }
    },

    // Vérifier si déjà abonné
    estAbonne: async function() {
      if (!('serviceWorker' in navigator)) return false;
      try {
        var reg = await navigator.serviceWorker.ready;
        var sub = await reg.pushManager.getSubscription();
        return !!sub;
      } catch(e) { return false; }
    },

    // Test notification locale
    testerNotification: function() {
      if (Notification.permission === 'granted') {
        new Notification('ImmoConnect', {
          body: 'Les notifications sont actives ! Vous serez alerté en temps réel.',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-72.png'
        });
      }
    }
  };

  // ── 4. TOAST MISE À JOUR ──────────────────────────────────────────
  function afficherToastMaj() {
    var toast = document.createElement('div');
    toast.innerHTML = '<div style="position:fixed;top:70px;right:16px;background:#0F0F0E;color:#fff;padding:12px 16px;border-radius:8px;font-size:12px;z-index:9999;display:flex;align-items:center;gap:10px;font-family:Outfit,system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.2)">'
      + '<span>🔄 Nouvelle version disponible</span>'
      + '<button onclick="location.reload()" style="padding:4px 10px;background:#C09B5A;color:#0F0F0E;border:none;border-radius:5px;font-size:11px;cursor:pointer;font-family:inherit">Mettre à jour</button>'
      + '</div>';
    document.body.appendChild(toast);
    setTimeout(function() { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 10000);
  }

  // ── 5. HELPER VAPID ──────────────────────────────────────────────
  function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

})();
