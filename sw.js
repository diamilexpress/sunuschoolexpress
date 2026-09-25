/**
 * SunuSchoolExpress - Service Worker PWA Hors-Ligne
 * Cache-First Strategy pour fonctionnement 100% autonome sans Internet
 */

const CACHE_NAME = 'sunuschool-pwa-v3.9.5';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './dashboard.html',
  './admin.html',
  './dashboard.css',
  './styles.css',
  './dashboard.js',
  './app.js',
  './admin.js',
  './manifest.json',
  './assets/icons/favicon.svg',
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
              if (url.pathname.includes('/dashboard')) return caches.match('./dashboard.html');
              return caches.match('./index.html');
            }
          });
        })
    );
    return;
  }

  // Autres ressources (images, favicons, fonts) : Cache-First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      });
    })
  );
});
