// Un simple service worker para cumplir con los requisitos de PWA y permitir "Añadir a la pantalla de inicio"
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones de API y solo dejar pasar lo mínimo requerido por Chrome
  // para considerar que la PWA tiene capacidad básica offline.
  return;
});
