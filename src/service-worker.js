// src/service-worker.js

/* eslint-disable no-undef */

// Import the generated manifest.
importScripts('/__WB_MANIFEST');  // <-- This is where __WB_MANIFEST will be injected

// If you're using Workbox for caching
if (workbox) {
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
} else {
  console.log('Workbox failed to load.');
}

// Your Pusher-specific code can go here
if ('function' === typeof importScripts) {
  importScripts("https://js.pusher.com/beams/service-worker.js");
}

// Your Pusher notification handling logic:
PusherPushNotifications.onNotificationReceived = ({
  pushEvent,
  payload,
  handleNotification,
}) => {
  console.log("worker got: " + JSON.stringify(payload));
  
  // Send the notification payload to the client
  self.clients.matchAll().then((matchedClients) =>
    matchedClients.forEach((client) => client.postMessage(payload.data))
  );

  pushEvent.waitUntil(handleNotification(payload));
};
