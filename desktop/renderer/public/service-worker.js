const CACHE_NAME = 'v1';
const ASSETS_TO_CACHE = [
    '/',                // Cache the main page
    '/_next/static/chunks/main-app.js', // Main bundle, adjust according to your output
    '/_next/static/chunks/webpack.js', // Main bundle, adjust according to your output
    // Add other assets as needed, e.g., '/_next/static/chunks/main-app.js'
];

// Install the service worker and pre-cache assets
self.addEventListener('install', (event) => {
    console.log('Service worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching assets...');
                return Promise.all(
                    ASSETS_TO_CACHE.map((url) => {
                        return fetch(url)
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error(`Failed to fetch ${url}: ${response.status}`);
                                }
                                return cache.put(url, response);
                            });
                    })
                );
            })
            .catch((error) => {
                console.error('Failed to cache assets:', error);
            })
    );
});

// Activate the service worker and clear old caches
self.addEventListener('activate', (event) => {
    console.log('Service worker activating...');
    const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event to serve cached content or fetch from network
self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log('Serving from cache:', event.request.url);
                    return response; // Return cached response
                }
                console.log('Fetching from network:', event.request.url);
                return fetch(event.request) // Fetch from network
                    .then((networkResponse) => {
                        // Check if we received a valid response
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        // Cache the new response
                        return caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    });
            })
            .catch((error) => {
                console.error('Fetching failed:', error);
            })
    );
});
