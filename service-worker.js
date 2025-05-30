const CACHE_NAME = 'my-pwa-cache-v4';
const FILES_TO_CACHE = [
  '/index.html',
  '/app.js',
  '/style.css',
];

// Cài đặt (Install): Cache các file tĩnh cần thiết
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // kích hoạt ngay lập tức
});

// Kích hoạt (Activate): Xoá cache cũ và bật preload
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Xoá tất cả cache cũ (trừ CACHE_NAME hiện tại)
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );

      // Bật navigation preload (nếu hỗ trợ)
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  self.clients.claim(); // chiếm quyền điều khiển client ngay
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

      // Fallback to network fetch if no preload or cache is available
      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());

        // self.clients.matchAll().then(clients => {
        //   clients.forEach(client => {
        //     client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
        //   });
        // });

        return networkResponse;
      } catch (error) {
        // Nếu offline và không có cache
        return new Response('Offline và không có cache', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      }
    })()
  );
});