/**
 * SunuSchoolExpress - Service Worker PWA Hors-Ligne
 * Cache-First Strategy pour fonctionnement 100% autonome sans Internet
 */

const CACHE_NAME = 'sunuschool-pwa-v4.2.4';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './admin.html',
  './dashboard.css',
  './styles.css',
  './supabase-client.js?v=4.2.4',
  './app.js?v=4.2.4',
  './admin.js?v=4.2.4',
  './manifest.json',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/app-download.png',
  './assets/logo.svg',
  './assets/logo-icon.svg'
];

// 1. Installation du Service Worker et mise en cache initiale
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SunuSchool SW] Mise en cache des ressources pour mode Hors-Ligne...');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SunuSchool SW] Erreur partielle lors de la mise en cache initiale:', err);
      });
    })
  );
});

// 2. Activation et nettoyage immédiat des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SunuSchool SW] Suppression de l\'ancien cache obsolète:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Stratégie Réseau en priorité (Network-First) pour scripts, pages HTML et requêtes de navigation
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // IMPORTANT : Ne JAMAIS intercepter les requêtes vers des domaines externes (Supabase Cloud, Render, Wave, QR...)
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/')) return;

  const isNavigate = event.request.mode === 'navigate';
  const isCodeOrPage = isNavigate ||
                       url.pathname.endsWith('.js') || 
                       url.pathname.endsWith('.html') || 
                       url.pathname.endsWith('.css') || 
                       url.pathname === '/' || 
                       url.pathname.endsWith('/') ||
                       url.pathname.includes('/admin') ||
                       url.pathname.includes('/dashboard');

  if (isCodeOrPage) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            if (event.request.headers.get('accept')?.includes('text/html') || isNavigate) {
              if (url.pathname.includes('/admin')) return caches.match('./admin.html');
              if (url.pathname.includes('/dashboard')) return caches.match('./index.html');
              return caches.match('./index.html');
            }
          });
        })
    );
    return;
  }

  // Autres ressources locales (images, favicons, fonts) : Cache-First avec fallback sécurisé
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return new Response('', { status: 404, statusText: 'Not Found' });
        });
    })
  );
});

// 4. RÉCEPTION DES NOTIFICATIONS PUSH W3C (Mobile Android / iOS PWA & Ordinateur PC/Mac)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: '🔔 SunuSchool Express HQ', body: event.data.text() };
    }
  }

  const title = data.title || '🔔 Nouvelle Demande Établissement — SunuSchool HQ';
  const options = {
    body: data.body || 'Une nouvelle demande d\'adhésion d\'école ou de daara a été enregistrée.',
    icon: data.icon || './assets/icons/icon-192.png',
    badge: data.badge || './assets/icons/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'sse-etab-notification',
    renotify: true,
    requireInteraction: true,
    data: data.data || { url: './admin.html' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. CLIC SUR LA NOTIFICATION PUSH : OUVRE OU FOCUS DIRECT SUR L'ADMIN HQ
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './admin.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url && client.url.includes('admin.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
