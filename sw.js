const C = 'chatapp-v2';
const SHELL = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  // Ek file fail ho to bhi service worker install ho jaye
  e.waitUntil(
    caches.open(C)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/admin')) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) {
          const cp = res.clone();
          caches.open(C).then(c => c.put(r, cp));
        }
        return res;
      })
      .catch(() => caches.match(r).then(m => m || caches.match('/')))
  );
});
