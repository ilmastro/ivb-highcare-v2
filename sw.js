/* IVB High Care — Service Worker */

/* BUG FIX 3: cache name was still 'ivb-highcare-v1' — bumped to v2 so old cache gets busted */
const CACHE_NAME = 'ivb-highcare-v2';

/* BUG FIX 4: ASSETS list was nearly empty — added all CSS, JS, and data files so offline actually works */
const ASSETS = [
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
  './data/home.json',
  './data/team.json',
  './data/programma.json',
  './data/regels.json',
  './data/contact.json',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

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
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).catch(function () {
        /* Fallback to index.html for navigation requests when offline */
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
