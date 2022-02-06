
var initUrls = [
  '/static/battle.mp3',
  '/index.html',
  '/',
  '/main.js',
  '/index.css',
  '/mainfest.json',
  '/static/Thectro.ttf',
  '/static/background.jpg',
  '/static/bullet.png',
  '/static/ebullet.png',
  '/static/player2.png',
  '/static/eship2.png',
  '/static/exp.png',
  '/static/muzzleflash3.png',
  '/static/rocks.png',
  '/static/button.png',
  '/static/enemystation2.png',
  '/static/missile.png',
  '/static/gunshot.mp3',
  '/static/explosion.mp3',
  '/static/fightershot.mp3',
  '/static/play.png',
  '/static/info2.png',
  '/static/firebutton2.png',
  '/static/Digital.ttf',
];

self.addEventListener('message', function (event) {
  switch (event.data) {
    case 'SKIP_WAITING':
      event.waitUntil(
        self.skipWaiting()
      );
      break;
  };
});

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async function(cache) {
        await cache.addAll(initUrls)
      })
      .catch(function(error) {
        console.log(`There are install issues - ${JSON.stringify(error)}`);
      })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(function (response) {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            return caches.open(CACHE_NAME)
              .then(function (cache) {
                cache.put(event.request, response.clone());
                return response;
              })
              .catch(function (error) {
                console.log(`Error on cache opening - ${JSON.stringify(error)}`);
              })
          })
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.filter(function (cache) {
            if (cache !== CACHE_NAME) {
              return true;
            }
          })
          .map(function (cache) {
            return caches.delete(cache);
          })
        );
      })
      .catch(function (err) {
        console.log(`Error in deleting older cache - ${JSON.stringify(err)}`);
      })
  );
});
var CACHE_NAME = 'red-wings:1644126522316';