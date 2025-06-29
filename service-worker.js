const CACHE_NAME = 'gamecences-v1';
const CACHE_ASSETS = [
    '/',
    '/index.html'
]; // Minimal app shell to cache on install

// Install event: open cache and add app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        return cache.addAll(CACHE_ASSETS);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache, fallback to network, then cache the new response
self.addEventListener('fetch', (event) => {
  // Do not cache API calls to Google
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return; // Let the browser handle it without caching
  }

  // Use a cache-first strategy for all other GET requests
  if (event.request.method === 'GET') {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          // Return cached response if found
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise, fetch from network
          return fetch(event.request).then((networkResponse) => {
            // If we got a valid response, clone it, cache it, and return it
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }).catch(error => {
              console.log('Service worker fetch failed:', error);
              // Optionally return a fallback page for navigations, but for assets let it fail
          });
        })
      );
  }
});
