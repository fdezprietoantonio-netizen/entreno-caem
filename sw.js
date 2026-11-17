const C = 'caem-1794916410775', F = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(F.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => { if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin === location.origin) { // la app: red primero (con cobertura, siempre la última versión); sin cobertura, la guardada
    e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return; }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return res; }))); });
