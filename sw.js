/* ==========================================================================
   Service Worker — Colegio Cristiano John Wesley
   Estrategia: Cache-first para assets estáticos, Network-first para HTML
   ========================================================================== */

const CACHE_NAME = "ccjw-v2";

/* Assets que queremos tener en caché desde la primera visita */
const PRECACHE_URLS = [
    "./",
    "./index.html",
    "./css/style.css",
    "./css/video-player.css",
    "./css/lector.css",
    "./js/main.js",
    "./js/map.js",
    "./js/video-player.js",
    "./js/revistas-catalog.js",
    "./js/revistas-data.js",
    "./js/revistas.js",
    "./js/lector.js",
    "./pages/revistas.html",
    "./pages/lector.html",
    "./pages/eventos.html",
    "./pages/comunidad.html",
    "./data/eventos.json",
    "./data/calendario.json",
    "./js/eventos.js"
];


/* ---------- INSTALACIÓN ---------- */

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});


/* ---------- ACTIVACIÓN ---------- */

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});


/* ---------- INTERCEPTAR REQUESTS ---------- */

self.addEventListener("fetch", (event) => {
    const { request } = event;

    /* Solo GET */
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    /* Ignorar peticiones a dominios externos diferentes al propio */
    if (url.origin !== location.origin) {
        /* Pero sí cacheamos hojas de estilo y scripts externos conocidos */
        const isKnownExternal =
            url.hostname === "unpkg.com" ||
            url.hostname === "cdn.simpleicons.org";

        if (isKnownExternal) {
            event.respondWith(cacheFirst(request));
        }
        return;
    }

    /* HTML → Network-first (contenido dinámico) */
    const accept = request.headers.get("accept") || "";
    if (accept.includes("text/html")) {
        event.respondWith(networkFirst(request));
        return;
    }

    /* Todo lo demás (CSS, JS, imágenes, fuentes, PDFs) → Cache-first */
    event.respondWith(cacheFirst(request));
});


/* ---------- ESTRATEGIAS ---------- */

function cacheFirst(request) {
    return caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
            if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });
            }
            return response;
        });
    });
}

function networkFirst(request) {
    return fetch(request)
        .then((response) => {
            if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, responseToCache);
                });
            }
            return response;
        })
        .catch(() => caches.match(request));
}
