// Concert Tracker Service Worker — network-first strategy
// Increment CACHE_VERSION whenever you deploy updates to force a refresh
const CACHE_VERSION = 'ct-v6';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  // Delete any old caches from previous versions
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first: try to fetch fresh from network, fall back to cache if offline
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Store a fresh copy in cache for offline use
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
