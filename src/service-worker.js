// Service Worker for static.ericraslich.com
// Replace with your own site name ^

const VERSION = 'v1::';

self.addEventListener('install', function(event) {
    console.log('WORKER: install event in progress.');
    // The waitUntil method blocks the 'event' until the given promise returns fulfilled.
    // If the promise is rejected, the install event fails.
    event.waitUntil(
        // The caches built-in is a promise-based API that helps you cache responses,
        // as well as finding and deleting them.
        caches
            // You can open a cache by name, and this method returns a promise. We use
            // a versioned cache name here so that we can remove old cache entries in
            // one fell swoop later, when phasing out an older service worker.
            .open(`${VERSION}fundamentals`)
            .then(function(cache) {
                // After the cache is opened, we can fill it with the offline fundamentals.
                // The method below will add all the resources we've indicated to the cache,
                // after making HTTP requests for each of them.
                return cache.addAll([
                    '/',
                    // '/offline/',
                    // '/hire/',
                    '/css/main.css',
                    '/js/main.js'
                ]);
            })
            .then(function() {
                console.log('WORKER: install completed.');
            })
    );
});

self.addEventListener('fetch', function(event) {
    console.log('WORKER: fetch event in progress.');
    // Only cache GET requests. Everything else should be handled on the client side
    // by handling failed POST, PUT, DELETE requests.
    if (event.request.method !== 'GET') {
        console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return;
    }
    // Similar to waitUntil, respondsWith blocks the fetch event waiting for a Promise.
    // Fulfillment result will be used as the response,
    // and rejection results in an HTTP response indicating failure.
    event.respondWith(
        // This method returns a promise that resolves to a cache entry matching
        // the request. Once the promise is settled, we can then provide a response to the fetch request.
        caches.match(event.request)
            .then(function(cached) {
                // Even if the response is in our cache, we go to the network after.
                // This pattern is known for producing "eventually fresh" responses,
                // where we return cached responses immediately, and meanwhile pull
                // a network response and store that in the cache.
                let networked = fetch(event.request)
                    // Handle the network request with success and failure scenarios.
                    .then(fetchedFromNetwork, unableToResolve)
                    // Should catch errors on the fetchedFromNetwork handler as well.
                    .catch(unableToResolve)
                // Return the cached response immediately if there is one, or fall back
                // to waiting on the netork as usual.
                console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
                return cached || networked;

                function fetchedFromNetwork(response) {
                    // Copy the response before replying to the network request.
                    // This is the response that will be stored on the ServiceWorker cache.
                    let cacheCopy = response.clone()

                    console.log('WORKER: fetch response from network.', event.request.url);

                    caches
                    // Open a cache to store the response for this request.
                    .open(`${VERSION}pages`)
                        .then(function add(cache) {
                            // Store the response for this request. It'll later become available
                            // to caches.match(event.request) calls, when looking for cached responses.
                            cache.put(event.request, cacheCopy);
                        })
                        .then(function() {
                            console.log('WORKER: fetch response stored in cache.', event.request.url);
                        });
                    // Return the response so that the promise is settled in fulfillment.
                    return response;
                }

                // When this method is called, it means we were unable to produce a response
                // from either the cache or the network. This is our opportunity to provide a 
                // meaningful response when all else fails. It's the last chance, so you probably
                // want to display a "Service Unavailable" view or an error response.
                function unableToResolve() {
                    // Options here:
                    // - Test the Accept header and then return one of the 'offlineFundamentals'
                    //   e.g.: 'return caches.match('/some/cached/Image.png')'
                    // - Consider the origin. It's easier to decide what 'unavailable' means for requests against
                    //   your origins than for requests against a third party, such as an ad provider.
                    // - Generate a Response programmatically, as shown below, and return that.
                    console.log('WORKER: fetch request failed in both cache and network.')
                    // Create a response programmatically here. First parameter is the response body,
                    // the second is the options definitions.
                    return caches.match('/offline/') 
                    // new Response('<h1>Service Unavaible. Maybe call instead?</h1>', {
                    //     status: 503,
                    //     statusText: 'Service Unavailable',
                    //     headers: new Headers({
                    //         'Content-Type': 'text/html'
                    //     })
                    // });
                }
            })
    )
});

self.addEventListener('activate', function(event) {
    console.log('WORKER: activate event in progress.');
    // Just like with the install event, waitUntil blocks activate on a Promise.
    // Activation will fail unless the promise is fulfilled.
    event.waitUntil(
        caches
            // This method returns a promise which will resolve to an array of cache keys.
            .keys()
            .then(function(keys) {
                return Promise.all(
                    keys
                        .filter(function(key) {
                            // Filter by keys that don't start with the latest VERSION number.
                            return !key.startsWith(VERSION);
                        })
                        .map(function(key) {
                            // Return a promise that's fulfilled when each outdated cache is deleted.
                            return caches.delete(key);
                        })
                );
            })
            .then(function() {
                console.log('WORKER: activate complete.')
            })
    );
});
