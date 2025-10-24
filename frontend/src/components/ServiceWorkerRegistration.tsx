'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, show update notification
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });

      // Handle offline/online events
      const handleOnline = () => {
        console.log('App is online');
        // Sync any pending data
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SYNC_OFFLINE_DATA' });
        }
      };

      const handleOffline = () => {
        console.log('App is offline');
        // Show offline indicator
        const offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'offline-indicator';
        offlineIndicator.innerHTML = 'You are offline. Some features may be limited.';
        offlineIndicator.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ff6b35;
          color: white;
          text-align: center;
          padding: 8px;
          z-index: 9999;
          font-size: 14px;
        `;
        document.body.appendChild(offlineIndicator);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return null;
}
