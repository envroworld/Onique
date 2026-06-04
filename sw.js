// service-worker.js

const CACHE_NAME = "app-cache-v1";

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          // Clone response because it can only be used once
          const responseClone = networkResponse.clone();

          // Store in cache
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          // Optional fallback
          return new Response("Offline", {
            status: 503,
            statusText: "Offline",
          });
        });
    })
  );
});