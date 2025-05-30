const CACHE_NAME = 'my-pwa-cache-v10.2';
//Files need to be cached
const FILES_TO_CACHE = [
  '/index.html',
  '/app.js',
  '/style.css'
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
        console.log('Serving from cache:', event.request.url);
        return cachedResponse;
      }
    // Attempt to get the preload response first
    const preloadResponse = await event.preloadResponse;
    if (preloadResponse) {
      console.log('Serving from preload:', event.request.url);
      return preloadResponse;
    }

      console.log('No cache or preload response, fetching from network:', event.request.url);
      // Fallback to network fetch if no preload or cache is available
      return fetch(event.request);
    })()
  );
});