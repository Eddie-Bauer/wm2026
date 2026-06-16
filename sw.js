const CACHE = 'wm2026-v1';
const SHELL = ['/wm2026/', '/wm2026/index.html', '/wm2026/icon.svg', '/wm2026/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  /* HTML: network-first — immer neueste Version, Fallback Cache wenn offline */
  if (e.request.destination === 'document') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  /* Assets (icon, manifest): cache-first */
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
});
