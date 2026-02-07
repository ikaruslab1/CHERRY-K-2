import { useState, useEffect, useCallback, useRef } from 'react';
import { attendanceService } from '@/services/attendanceService';
import { nanoid } from 'nanoid';

export interface OfflineScan {
  id: string; // Unique ID for the scan record
  qrCode: string;
  activityId: string;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingScans, setPendingScans] = useState<OfflineScan[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const isLoaded = useRef(false);

  // Initialize state on mount
  useEffect(() => {
    // Check initial status
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    // Load pending scans
    const saved = localStorage.getItem('offline_attendance_queue');
    if (saved) {
      try {
        setPendingScans(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse offline queue", e);
      }
    }
    isLoaded.current = true;

    // Listeners
    // Listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to persistence whenever pendingScans changes
  useEffect(() => {
    if (isLoaded.current) {
        localStorage.setItem('offline_attendance_queue', JSON.stringify(pendingScans));
    }
  }, [pendingScans]);

  const saveOfflineScan = useCallback((qrCode: string, activityId: string) => {
    const newScan: OfflineScan = {
      id: nanoid(),
      qrCode,
      activityId,
      timestamp: Date.now(),
    };
    
    setPendingScans(prev => [...prev, newScan]);
    return newScan;
  }, []);

  const syncQueue = useCallback(async () => {
    if (pendingScans.length === 0 || isSyncing || !isOnline) return 0;

    setIsSyncing(true);
    const queue = [...pendingScans];
    const failedScans: OfflineScan[] = [];
    let successCount = 0;

    for (const scan of queue) {
      try {
        // Try to get participant
        const participant = await attendanceService.getParticipantByQR(scan.qrCode);
        
        if (participant) {
            // Try to confirm
            const result = await attendanceService.confirmAttendance(participant.id, scan.activityId);
            
            // If success or logical error (already registered), we consider it processed.
            // We only keep it if it throws an exception (network error).
            successCount++;
        } else {
            console.error(`Participant not found for QR ${scan.qrCode} during sync`);
            // Discard invalid QR
        }
      } catch (error) {
        console.error(`Sync network error for ${scan.qrCode}`, error);
        failedScans.push(scan); // Keep for retry
      }
    }

    setPendingScans(failedScans);
    setIsSyncing(false);
    return successCount;
  }, [pendingScans, isSyncing, isOnline]);

  return {
    isOnline,
    pendingScans,
    isSyncing,
    saveOfflineScan,
    syncQueue
  };
}
