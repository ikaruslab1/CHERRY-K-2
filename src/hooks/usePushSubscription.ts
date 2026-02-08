'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';
import { subscribeToNotifications } from '@/actions/notifications';

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsLoading(false);
      return;
    }

    // Check current permission
    if (Notification.permission === 'granted') {
      setIsSubscribed(true);
    }
    
    setIsLoading(false);
  }, []);

  const subscribe = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permiso denegado');
      }

      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) {
        throw new Error('Push manager no disponible');
      }

      const vapidKey = env.NEXT_PUBLIC_VAPID_KEY;
      if (!vapidKey) {
          throw new Error('Llave VAPID no configurada');
      }

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Save to server using Server Action
      const result = await subscribeToNotifications(JSON.parse(JSON.stringify(pushSubscription)), navigator.userAgent);

      if (result.error) {
        throw new Error(result.error);
      }

      setIsSubscribed(true);
    } catch (err: any) {
      console.error('Error suscribiendo:', err);
      setError(err.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return { isSubscribed, subscribe, isLoading, error };
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
