// Service worker d'Ajusto : il permet de jouer hors ligne et de recevoir les mises à jour tout seul.
// Stratégie « réseau d'abord » : avec internet, le jeu prend toujours la dernière version publiée
// (et en garde une copie) ; sans internet, ou si le réseau est trop lent, il utilise la copie gardée.

const CACHE = 'pile-poil';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
];
const SLOW_NETWORK_MS = 3000;  // au-delà, on joue avec la copie gardée (la nouvelle version sera prise la fois suivante)

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function fromCache(request) {
  return caches.match(request, { ignoreSearch: true }).then((res) => res || caches.match('./index.html'));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // « no-cache » : on redemande toujours au serveur s'il y a une version plus récente
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
      .then((res) => res || network)  // pas encore de copie gardée : on attend le réseau
      .catch(() => fromCache(request))
  );
});
