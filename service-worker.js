/* OrganizaYa - service worker
   - Guarda la app para que abra sin conexión.
   - index.html: primero red, y si no hay internet usa la copia guardada (así recibes las actualizaciones).
   - Íconos, manifest y fuentes: primero la copia guardada.
   Sube el número de VERSION cada vez que publiques cambios. */
const VERSION = 'v10';
const CACHE = 'organizaya-' + VERSION;
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/organizaya-mark.svg',
  './icons/organizaya-maskable.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon-180.png',
  './icons/favicon-48.png',
  './css/base.css',
  './css/styles.css',
  './js/config/constants.js',
  './js/config/guide.js',
  './js/config/icons.js',
  './js/controller/backup.js',
  './js/controller/files.js',
  './js/controller/links.js',
  './js/controller/navigation.js',
  './js/controller/projects.js',
  './js/controller/sync.js',
  './js/controller/system.js',
  './js/controller/tasks.js',
  './js/core/bus.js',
  './js/core/ics.js',
  './js/core/platform.js',
  './js/core/util.js',
  './js/main.js',
  './js/model/changes.js',
  './js/model/cloud-claude.js',
  './js/model/cloud-supabase.js',
  './js/model/links.js',
  './js/model/queries.js',
  './js/model/state.js',
  './js/model/storage.js',
  './js/model/sync.js',
  './js/model/validation.js',
  './js/view/clock.js',
  './js/view/components.js',
  './js/view/datepicker.js',
  './js/view/dom.js',
  './js/view/format.js',
  './js/view/nav.js',
  './js/view/screens/accesos.js',
  './js/view/screens/archivos.js',
  './js/view/screens/ayuda.js',
  './js/view/screens/calendario.js',
  './js/view/screens/hoy.js',
  './js/view/screens/proyectos.js',
  './js/view/screens/tarea-form.js',
  './js/view/screens/tareas.js',
  './js/view/state.js',
  './js/view/sync-ui.js',
  './js/view/theme.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => (k.startsWith('mi-sistema-') || k.startsWith('organizaya-')) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  // Código de la app (css/js): red primero, copia guardada si no hay conexión
  if (sameOrigin && (req.destination === 'script' || req.destination === 'style')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Páginas: red primero, copia guardada si no hay conexión
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); }
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Todo lo demás: copia guardada primero y se refresca en segundo plano
  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow('./');
    })
  );
});
