/* IVB High Care — Service Worker
   Strategy:
   - data/*.json + images/*  → NETWORK-FIRST  (always fresh when online, cache as fallback)
   - everything else          → CACHE-FIRST    (fast shell, works fully offline)
*/

const CACHE_NAME = 'ivb-highcare-v8';

const SHELL_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './css/variables.css',
  './css/layout.css',
  './css/components.css',
  './css/pages.css',
  './js/theme.js',
  './js/nav.js',
  './js/accordion.js',
  './js/render.js',
  './js/search.js',
  './js/lang.js',
];

/* Pre-cache the app shell on install */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_ASSETS);
    })
  );
  /* Do NOT call skipWaiting() here — we wait for the user to tap
     the update banner, which sends SKIP_WAITING via postMessage.
     Auto-skipping causes controllerchange to fire unexpectedly and
     can make the bottom nav disappear on reload. */
});

/* Remove old caches on activate */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) { return caches.delete(k); })
      );
    })
  );
  /* Claim all open clients so the new SW takes effect without a reload */
  self.clients.claim();
});

/* ── Helpers ── */
function isDataRequest(url) {
  /* Matches /data/*.json and /images/* — these change with every CMS publish */
  return url.pathname.startsWith('/data/') || url.pathname.startsWith('/images/');
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

/* ── Fetch handler: split strategy ── */
self.addEventListener('fetch', function (event) {
  /* Only handle GET requests for our own origin */
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (!isSameOrigin(url)) return;

  if (isDataRequest(url)) {
    /* ── NETWORK-FIRST for data & images ──────────────────────────
       Try the network. If it succeeds, update the cache and return
       the fresh response. If it fails (offline), serve from cache.
    ──────────────────────────────────────────────────────────────── */
    event.respondWith(
      fetch(event.request)
        .then(function (networkResponse) {
          /* Clone before consuming — responses can only be read once */
          const toCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, toCache);
          });
          return networkResponse;
        })
        .catch(function () {
          /* Offline fallback: serve whatever we cached last time */
          return caches.match(event.request);
        })
    );
  } else {
    /* ── CACHE-FIRST for app shell ────────────────────────────────
       Serve from cache instantly. If not cached yet, fetch and store.
       Navigation fallback ensures the app opens even when offline.
    ──────────────────────────────────────────────────────────────── */
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;
        return fetch(event.request)
          .then(function (networkResponse) {
            const toCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, toCache);
            });
            return networkResponse;
          })
          .catch(function () {
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
    );
  }
});

/* ── Message handler ──────────────────────────────────────────
   The page can send { type: 'SKIP_WAITING' } to activate a
   waiting SW immediately (triggered by the update banner tap).
──────────────────────────────────────────────────────────────── */
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
