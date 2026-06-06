// service-worker.js

const CACHE_NAME = "app-cache-v1";

self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated...");

  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);

      // Always fetch latest version in background
      const networkFetch = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            cache.put(event.request, networkResponse.clone());
          }

          return networkResponse;
        })
        .catch(() => null);

      // Return cache immediately if available
      if (cachedResponse) {
        networkFetch; // Updates cache in background
        return cachedResponse;
      }

      // No cache, wait for network
      const networkResponse = await networkFetch;

      if (networkResponse) {
        return networkResponse;
      }

      return new Response("Offline", {
        status: 503,
        statusText: "Offline",
      });
    })
  );
});
