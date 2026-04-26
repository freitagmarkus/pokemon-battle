const CACHE_NAME = 'pokemon-battle-v2';
const urlsToCache = [
  './',
  './index.html',
  './icon-512.png',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  // Don't skipWaiting automatically — wait for user to approve update
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Listen for skip waiting message from the page
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(fetchResponse => {
      // Cache everything for offline use
      const responseClone = fetchResponse.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseClone);
      });
      return fetchResponse;
    }).catch(() => {
      // Offline fallback: serve from cache
      return caches.match(event.request).then(response => {
        if (response) return response;
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
