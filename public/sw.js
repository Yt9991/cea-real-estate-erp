// CEA Real Estate ERP - Service Worker
const CACHE_NAME = 'cea-erp-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

const RUNTIME_CACHE = 'cea-erp-runtime';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.log('Some assets failed to cache:', error);
        });
      })
  );
  
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request).then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          }).catch(() => {
            return new Response(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>CEA ERP - Offline</title>
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f6f4; }
                    .offline { color: #422d2a; }
                    button { background: #422d2a; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                  </style>
                </head>
                <body>
                  <div class="offline">
                    <h1>📱 CEA ERP - Offline Mode</h1>
                    <p>You're currently offline. The app is still functional with cached data.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                  </div>
                </body>
              </html>
            `, {
              headers: { 'Content-Type': 'text/html' }
            });
          });
        })
    );
  }
});

console.log('CEA ERP Service Worker: Loaded and ready!');


