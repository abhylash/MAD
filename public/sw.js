const CACHE_NAME = 'smartspendr-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/vite.svg'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(error => {
          console.error('Fetch failed:', error);
          // Return a fallback response for critical assets
          if (event.request.url.includes('/manifest.json')) {
            return new Response(JSON.stringify({
              name: 'SmartSpendr',
              short_name: 'SmartSpendr',
              start_url: '/',
              display: 'standalone'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
          throw error;
        });
      })
  );
});

// Background sync for offline expense submission
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline data sync when back online
  return new Promise(resolve => {
    // Sync pending expenses from IndexedDB to Firebase
    resolve();
  });
}

// Push notification handling
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from SmartSpendr',
    icon: 'https://images.pexels.com/photos/3483098/pexels-photo-3483098.jpeg?auto=compress&cs=tinysrgb&w=192&h=192',
    badge: 'https://images.pexels.com/photos/3483098/pexels-photo-3483098.jpeg?auto=compress&cs=tinysrgb&w=72&h=72',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('SmartSpendr', options)
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});