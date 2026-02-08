/// <reference lib="webworker" />
// @ts-nocheck

declare const self: ServiceWorkerGlobalScope;

// To disable all workbox logging during development, you can set self.__WB_DISABLE_DEV_LOGS to true
// self.__WB_DISABLE_DEV_LOGS = true;

// listen to push event
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Cherry-K-2';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// listen to notification click event
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].url === event.notification.data.url) {
              client = clientList[i];
            }
          }
          if (client.url === event.notification.data.url) return client.focus();
          return client.focus();
        }
        return self.clients.openWindow(event.notification.data.url);
      })
  );
});
