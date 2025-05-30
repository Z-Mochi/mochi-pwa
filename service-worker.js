const CACHE_NAME = 'mochi-pwa-cache-v2';
//Files need to be cached
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
];

// Install event: Cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate event: preload everything
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

// Fetch event: Serve from cache
// self.addEventListener('fetch', (event) => {
//     event.respondWith(
//       caches.match(event.request).then((response) => {
//         return response || fetch(event.request);
//       })
//     );
// });
// Fetch event: Serve from cache, use preload response if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {

      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      // Attempt to get the preload response first
      const preloadResponse = await event.preloadResponse;
      if (preloadResponse) {
        return preloadResponse;
      }

      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Cập nhật cache nếu có dữ liệu mới
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          // Gửi thông báo đến client nếu muốn
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
            });
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);
      // Fallback to network fetch if no preload or cache is available
      return fetchPromise;
    })()
  );
});