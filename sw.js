// ImmoConnect — Service Worker v1.0
// Cache offline + notifications push

const CACHE_NAME = 'immoconnect-v13';
const CACHE_STATIC = 'immoconnect-static-v13';

// Pages à mettre en cache pour fonctionnement offline
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/connexion.html',
  '/forfaits.html',
  '/questionnaire-vendeur.html',
  '/questionnaire-acheteur.html',
  '/bien.html',
  '/dashboard-agent.html',
  '/dashboard-vendeur.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap',
];

// ── INSTALL ───────────────────────────────────────────────────────────
self.addEventListener('install', function(event) {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_STATIC).then(function(cache) {
      return cache.addAll(STATIC_ASSETS.filter(function(url) {
        return !url.startsWith('http') || url.startsWith(self.location.origin);
      }));
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE ──────────────────────────────────────────────────────────
self.addEventListener('activate', function(event) {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME && key !== CACHE_STATIC;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── FETCH — Stratégie Network First avec fallback cache ───────────────
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Ignorer les requêtes Supabase et Stripe (toujours en live)
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('stripe.com') ||
      url.hostname.includes('fonts.gstatic.com') ||
      event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Mettre en cache les pages HTML et assets
        if (response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_STATIC).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        // Offline — servir depuis le cache
        return caches.match(event.request).then(function(cached) {
          if (cached) return cached;
          // Page offline générique
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// ── PUSH NOTIFICATIONS ────────────────────────────────────────────────
self.addEventListener('push', function(event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch(e) {
    data = { title: 'ImmoConnect', body: event.data ? event.data.text() : 'Nouvelle notification' };
  }

  var title = data.title || 'ImmoConnect';
  var options = {
    body: data.body || 'Vous avez une nouvelle notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      type: data.type || 'general'
    },
    actions: data.actions || [
      { action: 'voir', title: 'Voir →' },
      { action: 'ignorer', title: 'Ignorer' }
    ],
    tag: data.tag || 'immoconnect-' + Date.now(),
    renotify: true
  };

  // Personnaliser selon le type
  if (data.type === 'nouvelle_annonce') {
    options.icon = '/icons/icon-192.png';
    options.badge = '/icons/icon-72.png';
    options.vibrate = [300, 100, 300, 100, 300];
  } else if (data.type === 'candidature') {
    options.vibrate = [200, 100, 200];
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ── CLIC SUR NOTIFICATION ─────────────────────────────────────────────
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  var url = (event.notification.data && event.notification.data.url) || '/';

  if (event.action === 'ignorer') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Si une fenêtre ImmoConnect est déjà ouverte, la focus
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes('immoconnect-agence.fr') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ── MESSAGE DU CLIENT ─────────────────────────────────────────────────
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
