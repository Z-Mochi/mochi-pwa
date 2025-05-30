const CACHE_NAME = 'pwa-cache-mochi-v1'; // Thay đổi version khi cập nhật
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
];

// Cài đặt Service Worker và cache file
self.addEventListener('install', event => {
  self.skipWaiting(); // Kích hoạt SW mới ngay lập tức
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Kích hoạt Service Worker và xoá cache cũ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim(); // Chiếm quyền kiểm soát client ngay
});

// Fetch: Ưu tiên dùng cache, cập nhật từ mạng nếu có thể
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Cập nhật cache nếu có dữ liệu mới
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });

          // Gửi thông báo đến client nếu muốn
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
            });
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse); // fallback khi offline

      // Nếu đã có trong cache thì dùng tạm
      return cachedResponse || fetchPromise;
    })
  );
});