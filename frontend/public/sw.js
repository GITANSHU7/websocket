const OFFLINE_HTML = `
<!DOCTYPE html><html><head><title>Offline</title></head>
<body style="font-family:sans-serif;text-align:center;padding:2rem">
<h1>Failed to connect to the server.</h1>
</body></html>
`;

self.addEventListener('install', (event) => self.skipWaiting());
self.addEventListener('activate', (event) => self.clients.claim());

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response(OFFLINE_HTML, {
        headers: { 'Content-Type': 'text/html' }
      });
    })
  );
});
