// Mi paga: permite abrir la app sin internet.
// Guarda una copia de la app en el móvil; con conexión siempre intenta cargar la versión nueva.
const V = 'mipaga-v6';
const APP = './index.html';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(['./', APP, './styles.css', './app.js'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);

  // La app: primero internet (para tener siempre la última versión); si no hay o tarda, la copia guardada.
  if (r.mode === 'navigate' || u.origin === location.origin) {
    const key = r.mode === 'navigate' ? APP : r;
    e.respondWith((async () => {
      const c = await caches.open(V);
      try {
        const net = await Promise.race([
          fetch(r),
          new Promise((_, no) => setTimeout(() => no(new Error('lento')), 4000))
        ]);
        if (net && net.ok) c.put(key, net.clone());
        return net;
      } catch (_) {
        return (await c.match(key)) || (await c.match(APP)) || Response.error();
      }
    })());
    return;
  }

  // Librería del PDF: se guarda para poder generar PDF sin conexión.
  if (u.hostname === 'cdnjs.cloudflare.com') {
    e.respondWith(caches.open(V).then(async c => {
      const hit = await c.match(r);
      const net = fetch(r).then(n => { c.put(r, n.clone()); return n; }).catch(() => hit);
      return hit || net;
    }));
  }
  // Supabase y el cambio de moneda van siempre directos a internet.
});
