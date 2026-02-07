'use client';

import { useEffect } from 'react';

export function DevServiceWorkerUnregister() {
  useEffect(() => {
    // Double check we are in dev environment
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          console.log('[Dev] Unregistering stale service worker to fix HMR', registration);
          registration.unregister();
        });
      });
    }
  }, []);

  return null;
}
