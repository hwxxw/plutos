/* ─────────────────────────────────────────────────────
   PLUTOS Service Worker  —  Domain Lock + Cache Shell
   허용되지 않은 도메인에서 실행 시 모든 요청 차단
───────────────────────────────────────────────────── */

const ALLOWED_ORIGINS = [
  'https://plutos.app',
  'https://www.plutos.app',
  'https://plutos-six.vercel.app',
  'https://plutos-six-hwxxws-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
];

const CACHE_NAME = 'plutos-shell-v2';
const SHELL_ASSETS = ['/', '/manifest.json', '/logo.png'];

/* ── Install ── */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS).catch(() => {}))
  );
});

/* ── Activate ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch — Domain Lock 핵심 로직 ── */
self.addEventListener('fetch', (event) => {
  const currentOrigin = self.location.origin;

  // 허용되지 않은 도메인이면 즉시 차단 (vercel.app 전체 허용)
  const isAllowed = ALLOWED_ORIGINS.includes(currentOrigin) || currentOrigin.endsWith('.vercel.app');
  if (!isAllowed) {
    event.respondWith(
      new Response(
        `<!DOCTYPE html><html><body style="font-family:monospace;background:#0d0d14;color:#cc1a1a;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column">
          <h2>🔒 Domain Lock Active</h2>
          <p style="color:#666;font-size:12px">This application is bound to its original domain.</p>
          <p style="color:#444;font-size:10px">Origin: ${currentOrigin}</p>
        </body></html>`,
        {
          status: 403,
          headers: {
            'Content-Type': 'text/html',
            'X-PLUTOS-Lock': 'domain-unauthorized',
          },
        }
      )
    );
    return;
  }

  // API / 인증 / Next 내부 요청은 SW 거치지 않고 직통
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/auth/')
  ) return;

  // Shell assets: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
        return response;
      }).catch(() => caches.match('/'));
    })
  );
});
