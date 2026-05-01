// ═════════════════════════════════════════════
//   Envirovue Tools — Service Worker
//   Caches all tool assets for offline use
// ═════════════════════════════════════════════

// Bump this version whenever you update any file in the repo.
// Users will get the fresh version next time they open the app
// while online — the old cache is purged automatically.
const CACHE_VERSION = 'envirovue-v1.3.1';

// All files that should work offline
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './home-inspector/',
  './home-inspector/index.html',
  './home-inspector/manifest.json',
  './mold-inspector/',
  './mold-inspector/index.html',
  './mold-inspector/manifest.json',
  './photo-tool/index.html',
  './photo-tool/manifest.json',
  './photo-tool/jspdf.min.js'
];

// ── INSTALL ──────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        console.log('[SW] Precaching tool assets');
        // Cache each URL individually so one failure doesn't abort the whole install
        return Promise.all(
          PRECACHE_URLS.map(url =>
            cache.add(url).catch(err => console.warn('[SW] Skip', url, err.message))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean old caches ──────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => {
          console.log('[SW] Purging old cache:', k);
          return caches.delete(k);
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first, network fallback ────
self.addEventListener('fetch', event => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Only handle same-origin requests (skip external fonts/APIs — let them fail gracefully offline)
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    // Cache CDN resources (jsPDF, Google Fonts) for offline use
    if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('cdnjs.cloudflare.com') || url.hostname.includes('unpkg.com')) {
      event.respondWith(cacheFirstWithNetworkFallback(req));
    }
    return;
  }

  event.respondWith(cacheFirstWithNetworkFallback(req));
});

async function cacheFirstWithNetworkFallback(request) {
  // 1. Try cache
  const cached = await caches.match(request);
  if (cached) {
    // Kick off a background update if online (stale-while-revalidate lite)
    if (navigator.onLine) {
      fetch(request).then(fresh => {
        if (fresh && fresh.ok) {
          caches.open(CACHE_VERSION).then(c => c.put(request, fresh));
        }
      }).catch(() => {});
    }
    return cached;
  }

  // 2. Try network
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      const clone = fresh.clone();
      caches.open(CACHE_VERSION).then(c => c.put(request, clone));
    }
    return fresh;
  } catch (e) {
    // 3. Final fallback: if we were looking for an HTML doc, return the offline landing
    if (request.destination === 'document' || request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('Offline and not cached.', {
      status: 503,
      statusText: 'Offline'
    });
  }
}

// ── MESSAGE: allow manual cache clear from page ─
self.addEventListener('message', event => {
  if (event.data === 'clear-cache') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
