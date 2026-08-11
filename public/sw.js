/* Wedding invitation PWA service worker */
const CACHE_VERSION = "wedding-pwa-v3";
const TICKET_CACHE = "wedding-tickets-v1";
const PRECACHE = [
  "/",
  "/fr",
  "/en",
  "/manifest.webmanifest",
  "/favicon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/og.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        Promise.all(
          PRECACHE.map((url) =>
            cache.add(url).catch(() => {
              /* ignore missing optional assets */
            }),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION && key !== TICKET_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache Next.js bundles (évite hydratation avec un vieux chunk).
  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  // Never cache APIs or admin
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) {
    return;
  }

  // Ticket pages: network-first, keep offline copy after first visit
  if (url.pathname.startsWith("/ticket/")) {
    event.respondWith(networkFirstTicket(request));
    return;
  }

  // Icons / uploads / images: cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/uploads/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webmanifest")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Pages: network-first, fallback cache
  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_VERSION);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("/fr");
  }
}

async function networkFirstTicket(request) {
  const cache = await caches.open(TICKET_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(
      `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invitation hors ligne</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
      font-family:system-ui,sans-serif;background:#f7f4f0;color:#3b2416;padding:1.5rem;text-align:center}
    h1{font-size:1.5rem;margin:0 0 .75rem}
    p{margin:0;line-height:1.55;color:#7a5c4a;max-width:26rem}
  </style>
</head>
<body>
  <div>
    <h1>Invitation hors ligne</h1>
    <p>Ouvrez ce lien une fois avec Internet pour enregistrer votre carte sur cet appareil, ou utilisez le PNG déjà téléchargé.</p>
  </div>
</body>
</html>`,
      {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
      },
    );
  }
}
