
// Cache name
const CACHE_NAME = 'grocysync-cache-v1';

// Files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Android icons
  '/icons/android/android-launchericon-48-48.png',
  '/icons/android/android-launchericon-72-72.png',
  '/icons/android/android-launchericon-96-96.png',
  '/icons/android/android-launchericon-144-144.png',
  '/icons/android/android-launchericon-192-192.png',
  '/icons/android/android-launchericon-512-512.png',
  // iOS icons
  '/icons/ios/16.png',
  '/icons/ios/20.png',
  '/icons/ios/29.png',
  '/icons/ios/32.png',
  '/icons/ios/40.png',
  '/icons/ios/50.png',
  '/icons/ios/57.png',
  '/icons/ios/58.png',
  '/icons/ios/60.png',
  '/icons/ios/64.png',
  '/icons/ios/72.png',
  '/icons/ios/76.png',
  '/icons/ios/80.png',
  '/icons/ios/87.png',
  '/icons/ios/100.png',
  '/icons/ios/114.png',
  '/icons/ios/120.png',
  '/icons/ios/128.png',
  '/icons/ios/144.png',
  '/icons/ios/152.png',
  '/icons/ios/167.png',
  '/icons/ios/180.png',
  '/icons/ios/192.png',
  '/icons/ios/256.png',
  '/icons/ios/512.png',
  '/icons/ios/1024.png'
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
