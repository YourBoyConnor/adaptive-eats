// Service Worker for AdaptiveEats
const CACHE_NAME = 'adaptive-eats-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/logo.svg',
  '/favicon.ico',
  '/_next/static/css/',
  '/_next/static/js/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for recipe submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'recipe-sync') {
    console.log('Background sync: recipe submission');
    event.waitUntil(
      // Handle offline recipe submissions
      handleOfflineRecipes()
    );
  }
});

// Handle offline recipe submissions
async function handleOfflineRecipes() {
  try {
    // Get pending recipes from IndexedDB
    const pendingRecipes = await getPendingRecipes();
    
    for (const recipe of pendingRecipes) {
      try {
        // Try to submit the recipe
        const response = await fetch('/api/adapt-recipe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(recipe.data)
        });

        if (response.ok) {
          // Remove from pending queue
          await removePendingRecipe(recipe.id);
          console.log('Offline recipe submitted successfully');
        }
      } catch (error) {
        console.log('Failed to submit offline recipe:', error);
      }
    }
  } catch (error) {
    console.log('Error handling offline recipes:', error);
  }
}

// IndexedDB helpers for offline storage
async function getPendingRecipes() {
  return new Promise((resolve) => {
    const request = indexedDB.open('AdaptiveEatsDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['recipes'], 'readonly');
      const store = transaction.objectStore('recipes');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      
      getAllRequest.onerror = () => {
        resolve([]);
      };
    };
    
    request.onerror = () => {
      resolve([]);
    };
  });
}

async function removePendingRecipe(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('AdaptiveEatsDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['recipes'], 'readwrite');
      const store = transaction.objectStore('recipes');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
    };
    
    request.onerror = () => resolve();
  });
}
