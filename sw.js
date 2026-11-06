// Service worker d'Ultimate Football : jouer hors ligne et recevoir les mises à jour tout seul.
// Stratégie « réseau d'abord » : avec internet, le jeu prend toujours la dernière version publiée (et en garde
// une copie) ; sans internet, ou si le réseau est trop lent, il utilise la copie gardée.

const CACHE = 'ultimate-football-0.2';
const FILES = [
  './', './index.html', './css/style.css', './manifest.webmanifest', './lib/three.module.min.js',
  './src/main.js', './src/config.js',
  './src/engine/renderer.js', './src/engine/camera.js', './src/engine/geometry.js',
  './src/world/pitch.js', './src/world/stadium.js',
  './src/entities/player.js', './src/entities/ball.js', './src/physics/ballPhysics.js',
  './src/ai/simpleAI.js', './src/input/touch.js', './src/game/match.js',
  './src/ui/hud.js', './src/ui/menus.js', './src/save/storage.js',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png',
];
const SLOW_NETWORK_MS = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

// Les anciennes copies (dont celle d'Ajusto, l'ancien jeu à cette adresse) sont effacées
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function fromCache(request) {
  return caches.match(request, { ignoreSearch: true }).then((res) => res || (request.mode === 'navigate' ? caches.match('./index.html') : undefined));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const network = fetch(request.url, { cache: 'no-cache' }).then((res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy));
    }
    return res;
  });
  const slow = new Promise((resolve) => setTimeout(resolve, SLOW_NETWORK_MS)).then(() => fromCache(request));
  event.respondWith(
    Promise.race([network, slow])
      .then((res) => res || network)
      .catch(() => fromCache(request).then((res) => res || Response.error())),
  );
});
