
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
  '/icons/ios/180.png',
  // Windows icons
  '/icons/windows/LargeTile.scale-100.png',
  '/icons/windows/LargeTile.scale-125.png',
  '/icons/windows/LargeTile.scale-150.png',
  '/icons/windows/LargeTile.scale-200.png',
  '/icons/windows/LargeTile.scale-400.png',
  '/icons/windows/SmallTile.scale-100.png',
  '/icons/windows/SmallTile.scale-125.png',
  '/icons/windows/SmallTile.scale-150.png',
  '/icons/windows/SmallTile.scale-200.png',
  '/icons/windows/SmallTile.scale-400.png',
  '/icons/windows/SplashScreen.scale-100.png',
  '/icons/windows/SplashScreen.scale-125.png',
  '/icons/windows/SplashScreen.scale-150.png',
  '/icons/windows/SplashScreen.scale-200.png',
  '/icons/windows/SplashScreen.scale-400.png',
  '/icons/windows/Square150x150Logo.scale-100.png',
  '/icons/windows/Square150x150Logo.scale-125.png',
  '/icons/windows/Square150x150Logo.scale-150.png',
  '/icons/windows/Square150x150Logo.scale-200.png',
  '/icons/windows/Square150x150Logo.scale-400.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-16.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-20.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-24.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-256.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-30.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-32.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-36.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-40.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-44.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-48.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-60.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-64.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-72.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-80.png',
  '/icons/windows/Square44x44Logo.altform-lightunplated_targetsize-96.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-16.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-20.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-24.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-256.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-30.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-32.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-36.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-40.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-44.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-48.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-60.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-64.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-72.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-80.png',
  '/icons/windows/Square44x44Logo.altform-unplated_targetsize-96.png',
  '/icons/windows/Square44x44Logo.scale-100.png',
  '/icons/windows/Square44x44Logo.scale-125.png',
  '/icons/windows/Square44x44Logo.scale-150.png',
  '/icons/windows/Square44x44Logo.scale-200.png',
  '/icons/windows/Square44x44Logo.scale-400.png',
  '/icons/windows/Square44x44Logo.targetsize-16.png',
  '/icons/windows/Square44x44Logo.targetsize-20.png',
  '/icons/windows/Square44x44Logo.targetsize-24.png',
  '/icons/windows/Square44x44Logo.targetsize-256.png',
  '/icons/windows/Square44x44Logo.targetsize-30.png',
  '/icons/windows/Square44x44Logo.targetsize-32.png',
  '/icons/windows/Square44x44Logo.targetsize-36.png',
  '/icons/windows/Square44x44Logo.targetsize-40.png',
  '/icons/windows/Square44x44Logo.targetsize-44.png',
  '/icons/windows/Square44x44Logo.targetsize-48.png',
  '/icons/windows/Square44x44Logo.targetsize-60.png',
  '/icons/windows/Square44x44Logo.targetsize-64.png',
  '/icons/windows/Square44x44Logo.targetsize-72.png',
  '/icons/windows/Square44x44Logo.targetsize-80.png',
  '/icons/windows/Square44x44Logo.targetsize-96.png',
  '/icons/windows/StoreLogo.scale-100.png',
  '/icons/windows/StoreLogo.scale-125.png',
  '/icons/windows/StoreLogo.scale-150.png',
  '/icons/windows/StoreLogo.scale-200.png',
  '/icons/windows/StoreLogo.scale-400.png',
  '/icons/windows/Wide310x150Logo.scale-100.png',
  '/icons/windows/Wide310x150Logo.scale-125.png',
  '/icons/windows/Wide310x150Logo.scale-150.png',
  '/icons/windows/Wide310x150Logo.scale-200.png',
  '/icons/windows/Wide310x150Logo.scale-400.png'
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
