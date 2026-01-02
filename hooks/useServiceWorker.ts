import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration);

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour

            // Handle updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('🔄 New app version available');
                  // Optionally show update notification
                  window.dispatchEvent(
                    new CustomEvent('swUpdateAvailable', {
                      detail: { registration }
                    })
                  );
                }
              });
            });
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed:', error);
          });
      });

      // Handle service worker messages
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }
  }, []);

  return {
    isSupported: 'serviceWorker' in navigator,
    register: () => navigator.serviceWorker?.controller,
    unregister: async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return Promise.all(registrations.map(r => r.unregister()));
    }
  };
};
