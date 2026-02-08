'use client';

import { useState } from 'react';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { Button } from '@/components/ui/Button';
import { Bell, BellOff } from 'lucide-react';

export default function PushNotificationButton() {
  const { isSubscribed, subscribe, isLoading, error } = usePushSubscription();

  return (
    <div className="flex flex-col items-center gap-2">
      <Button 
        onClick={subscribe}
        disabled={isSubscribed || isLoading}
        variant={isSubscribed ? "outline" : "primary"}
        className="w-full sm:w-auto"
      >
        {isSubscribed ? (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Notificaciones Activadas
            </>
          ) : (
            <>
              <BellOff className="mr-2 h-4 w-4" />
              Activar Notificaciones
            </>
          )}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
