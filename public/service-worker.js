
// Cache name
const CACHE_NAME = 'grocysync-cache-v1';

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/cart-icon.png',
  '/icons/grocysync-logo.png'
];

// Install service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Instead of failing completely on error, we'll catch errors for individual items
        const cachePromises = urlsToCache.map(url => 
          cache.add(url).catch(error => {
            console.warn(`Failed to cache ${url}: ${error.message}`);
          })
        );
        return Promise.all(cachePromises);
      })
  );
});

// Fetch from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API requests
                if (!event.request.url.includes('/api/')) {
                  cache.put(event.request, responseToCache)
                    .catch(error => {
                      console.warn(`Failed to add to cache: ${error.message}`);
                    });
                }
              });

            return response;
          }
        ).catch(() => {
          // If fetch fails (e.g., offline), we can't do much but log it
          console.log('Fetch failed; returning offline page instead.');
          // In the future, you might want to return a custom offline page here
        });
      })
  );
});

// Update service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        }).filter(Boolean)
      );
    })
  );
});
