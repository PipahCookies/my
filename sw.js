// sw.js - Service Worker

const CACHE_NAME = 'waktusolat-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    // Note: External fonts (Google Fonts) and API calls are not cached here
    // to prevent CORS issues in simple configurations.
    // The app will fallback gracefully if offline.
];

// 1. Install Event: Cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('[SW] Caching App Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// 3. Fetch Event: Network First, fallback to Cache (Strategy for Dynamic Apps)
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests (like API calls) from basic caching
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network works, return response
                return response;
            })
            .catch(() => {
                // If network fails (offline), return from cache
                return caches.match(event.request);
            })
    );
});
