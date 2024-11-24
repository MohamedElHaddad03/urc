// src/serviceWorkerRegistration.js

// This function registers the service worker
export function register() {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      const swUrl = `./service-worker.js`;
  
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }
  
  export function unregister() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister();
        })
        .catch((error) => {
          console.error('Error during service worker unregistration:', error);
        });
    }
  }
  