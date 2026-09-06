const CACHE = 'up-rla-v2';
const CORE = [
  '/', '/index.html', '/manifest.webmanifest', '/icon.svg',
  '/data/up-points.geojson', '/data/up-districts.geojson'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // SPA navigations -> network first, fall back to cached index
  if(req.mode === 'navigate'){
    e.respondWith(fetch(req).catch(()=> caches.match('/index.html')));
    return;
  }
  // static assets + data -> cache first, then network (and cache the response)
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return resp;
    }).catch(()=> caches.match(req)))
  );
});
