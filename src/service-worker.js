/* eslint-disable no-undef */

// Ensure Workbox is loaded before using it
if (typeof workbox !== 'undefined') {
  // Import the generated manifest (this will be injected by the build process)
  importScripts('/__WB_MANIFEST');

  // Use Workbox for caching (precaching)
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

  // Custom caching strategy (example: cache images, JS, CSS, etc.)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate()
  );

  console.log('Workbox loaded successfully');
} else {
  console.log('Workbox failed to load.');
}

// Import the Pusher service worker script (if Pusher Beams is in use)
if (typeof importScripts === 'function') {
  importScripts('https://js.pusher.com/beams/service-worker.js');
  console.log('Pusher Beams SDK loaded successfully');
}

// Handle Pusher notification logic
PusherPushNotifications.onNotificationReceived = ({ pushEvent, payload, handleNotification }) => {
  console.log('Worker received notification: ' + JSON.stringify(payload));

  // Post the notification data to the client
  self.clients.matchAll().then((matchedClients) => {
    matchedClients.forEach((client) => {
      client.postMessage(payload.data); // Send payload data to the client
    });
  });

  // Handle the notification with the provided handleNotification function
  pushEvent.waitUntil(handleNotification(payload));
};
