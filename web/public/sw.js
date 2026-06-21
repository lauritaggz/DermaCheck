const CACHE_NAME = 'dermacheck-v2';
const urlsToCache = [
  '/manifest.json',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin || url.pathname.includes('/api/')) {
    return;
  }

  const isNavigation = event.request.mode === 'navigate';
  const isHtmlShell = url.pathname === '/' || url.pathname === '/index.html';

  event.respondWith(
    (async () => {
      // HTML / navegación: red primero para no servir landing antigua
      if (isNavigation || isHtmlShell) {
        try {
          const fresh = await fetch(event.request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, fresh.clone());
          return fresh;
        } catch {
          return (await caches.match('/index.html')) ?? (await caches.match('/'));
        }
      }

      const cached = await caches.match(event.request);
      if (cached) {
        return cached;
      }

      return fetch(event.request);
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return undefined;
        }),
      ),
    ).then(() => self.clients.claim()),
  );
});
