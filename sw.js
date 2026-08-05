/* Service Worker
   アプリを更新したら、下の CACHE の数字を必ず1つ増やしてください。
   （増やさないと、スマホ側に古い画面が残り続けます） */
const CACHE = "log-v8";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

// インストール時：必要なファイルをまとめて保存する
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 有効化時：古いバージョンのキャッシュを捨てる
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 取得時：ネットワーク優先、つながらなければキャッシュ（＝オフラインでも起動する）
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // 天気APIはキャッシュに入れず、そのままネットワークに任せる
  if (e.request.url.indexOf("open-meteo.com") !== -1) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
