const CACHE  = 'training-timer-v1';
const VOICE  = ['1','2','3','4','5','end'].map(n => './voice/' + n + '.mp3');
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'].concat(VOICE);

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // ページ本体は最新を優先し、圏外ならキャッシュへ退避
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put('./index.html', c)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // それ以外は事前キャッシュ分だけを返し、未登録のものは素通し（キャッシュを太らせない）
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
