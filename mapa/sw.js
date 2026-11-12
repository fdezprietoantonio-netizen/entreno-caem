const C = 'mapa-1794476370753', T = 'mapa-teselas', F = ['./', './index.html', './datos_rutas.js', './manifest.json', './icon-192.png', './icon-512.png'];
const MAX = 6000;
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(F)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C && x !== T).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
async function recortar() { const c = await caches.open(T), k = await c.keys(); for (let i = 0; i < k.length - MAX; i++) await c.delete(k[i]); }
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url), propio = u.origin === location.origin;
  const tesela = /elevation-tiles-prod|mapterhorn|arcgisonline|opentopomap/.test(u.host + u.pathname);
  if (propio) { // red primero para recibir las actualizaciones; caché si no hay cobertura
    e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  } else if (tesela || /cdnjs|fonts\.g/.test(u.host)) { // teselas, librería y fuentes: caché primero
    const nom = tesela ? T : C;
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(nom).then(c => c.put(e.request, cp)).then(() => tesela && Math.random() < .02 && recortar()); } return res; })));
  }
});
