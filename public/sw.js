// Service Worker para Notificaciones Push - Softworker I.E.T. Francisco José de Caldas
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listener para notificaciones push entrantes
self.addEventListener('push', (event) => {
  let data = {
    title: 'I.E.T. Francisco José de Caldas - Alerta Escolar',
    body: 'Se ha registrado una novedad de asistencia para su acudido.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'alerta-asistencia',
    data: { url: '/' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'alerta-asistencia',
    vibrate: [200, 100, 200],
    data: data.data || { url: '/' },
    actions: [
      { action: 'ver', title: '👁️ Ver Detalle' },
      { action: 'excusa', title: '📝 Radicar Excusa' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Listener al hacer click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
