'use client';

import { useSyncData } from '@/hooks/useSyncData';

export function SyncWrapper({ children }: { children: React.ReactNode }) {
  useSyncData();
  return <>{children}</>;
}
