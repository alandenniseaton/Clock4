/* 
    Document   : service-worker.js
    Created on : 19/10/2017, 18:24
    Updated on : 31/07/2020, 08:59
    Author     : Alan Dennis Eaton <alan.dennis.eaton@gmail.com>
*/

'use strict';

//-----------------------------------------------------------------
var APP = 'Clock4';
var VERSION = '2020.07.31';

var CACHE = APP + '-V' + VERSION;

var TOCACHE = [
    './',
    './index.html',
    './manifest.json',
    './images/android-chrome-192x192.png',
    './images/android-chrome-512x512.png',
    './images/Clock16.png',
    './images/Clock48.png',
    './images/Clock128.png',
    './scripts/css/box.css',
    './scripts/css/main.css',
    './scripts/js/main.js',
    './scripts/js/page.js',
    './scripts/js/timer.js',
    './scripts/js/util.js'
];


//-----------------------------------------------------------------
self.addEventListener('install', function(event) {
    event.waitUntil(onInstall());
});


self.addEventListener('activate', function(event) {
    event.waitUntil(onActivate());
});


self.addEventListener('fetch', function(event) {
    console.log('The service worker is serving the asset:');
    console.log(event.request.url);

    event.respondWith(onFetch(event.request));
  });


//-----------------------------------------------------------------
function onInstall() {    
    console.log('The service worker is being installed');

    return caches.open(CACHE).then(function (cache) {
        return cache.addAll(TOCACHE);
      });
}


async function onActivate() {
    console.log('The Service worker is activating');

    let keyList = await caches.keys();
    let deletes = [];
    
    keyList.map(key => {
        if (key.indexOf(APP) === 0) {
            // its a cache for THIS app
            if (key !== CACHE) {
                // but not the current cache
                console.log('Deleting cache: ' + key);
                deletes.push(caches.delete(key));
            }
        }
    });

    return Promise.all(deletes);
}


async function onFetch(request) {
    let cache = await caches.open(CACHE);
    let response = await cache.match(request);

    if (response) {
        return response;
    }

    response = await fetch(request);
    if (response) {
        cache.put(request, response.clone());
        return response;
    }

    throw new Error('no-match');
}
