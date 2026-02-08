'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { env } from '@/lib/env';

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

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Save to server
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Usuario no autenticado');

      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!res.ok) {
        throw new Error('Error al guardar suscripción en servidor');
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
