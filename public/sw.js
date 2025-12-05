const CACHE_NAME = 'pwa-auth-cache-v1';
const URLS_TO_CACHE = ['/', '/auth'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // ✅ 1) Only handle same-origin, non-API, GET requests
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // <-- don't touch API routes

  event.respondWith(
    (async () => {
      try {
        // Try network first
        const response = await fetch(request);

        // Cache a clone
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());

        return response; // ✅ Response
      } catch (err) {
        // Network failed – try cache
        const cached = await caches.match(request);
        if (cached) return cached; // ✅ Response

        // Still nothing – return a fallback Response instead of undefined
        return new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    })()
  );
});
