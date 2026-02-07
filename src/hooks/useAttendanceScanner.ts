import { useState, useRef, useCallback, useEffect } from 'react';
import { IParticipant, attendanceService } from '@/services/attendanceService';
import { useOfflineSync } from './useOfflineSync';

interface UseAttendanceScannerProps {
    activityId: string | null;
    onSuccess?: (participant: IParticipant) => void;
}

export function useAttendanceScanner({ activityId, onSuccess }: UseAttendanceScannerProps) {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [participant, setParticipant] = useState<IParticipant | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'verified' | 'error'>('idle');
    
    // Offline capabilities
    const { isOnline, saveOfflineScan, pendingScans, syncQueue, isSyncing } = useOfflineSync();

    const lastScanRef = useRef<string | null>(null);
    const lastScanTimeRef = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Inicializar AudioContext
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const playSound = useCallback((type: 'beep' | 'success' | 'error') => {
        // Audio logic
    }, []);

    const handleScan = useCallback(async (data: string) => {
        if (!activityId) {
            setError("Selecciona una actividad primero.");
            return;
        }

        const now = Date.now();
        // Debounce: evitar lecturas duplicadas en 2 segundos
        if (data === lastScanRef.current && now - lastScanTimeRef.current < 2000) {
            return;
        }

        lastScanRef.current = data;
        lastScanTimeRef.current = now;

        setScannedData(data);
        setStatus('processing');
        setIsLoading(true);
        playSound('beep');

        // OFFLINE HANDLING
        if (!isOnline) {
            saveOfflineScan(data, activityId);
            setIsLoading(false);
            setSuccessMessage("Guardado localmente (Sin conexión)");
            // playSound('success'); 
            
            // Auto reset for fast offline scanning
            setTimeout(() => {
                setSuccessMessage(null);
                setStatus('scanning');
                // Don't reset lastScanRef immediately to prevent double scan of same person instantly
            }, 1500);
            return;
        }

        // ONLINE HANDLING
        try {
            const foundParticipant = await attendanceService.getParticipantByQR(data);
            
            setIsLoading(false);
    
            if (foundParticipant) {
                setParticipant(foundParticipant);
                setShowModal(true);
                setStatus('verified'); // Esperando confirmación manual
            } else {
                setError("Participante no encontrado.");
                setStatus('error');
                setTimeout(() => {
                    setStatus('scanning');
                    setError(null);
                }, 3000);
            }
        } catch (err) {
            console.error(err);
            setIsLoading(false);
            // If network error, suggest checking connection
            setError("Error al consultar servidor.");
            setStatus('error');
        }
    }, [activityId, playSound, isOnline, saveOfflineScan]);

    const confirmAttendance = async () => {
        if (!participant || !activityId) return;

        setIsLoading(true);
        try {
            const result = await attendanceService.confirmAttendance(participant.id, activityId);
            setIsLoading(false);
    
            if (result.success) {
                playSound('success');
                if (onSuccess) onSuccess(participant);
                resetScanner();
            } else {
                alert(result.message); // O usar un toast state
            }
        } catch (err) {
            setIsLoading(false);
            alert("Error de conexión al confirmar.");
        }
    };

    const resetScanner = () => {
        setShowModal(false);
        setParticipant(null);
        setScannedData(null);
        setError(null);
        setSuccessMessage(null);
        setStatus('scanning');
        lastScanRef.current = null; // Permitir re-escanear el mismo inmediatamente si se reinicia
    };

    const handleError = (err: any) => {
        console.error(err);
        setError("Error de acceso a cámara o lectura.");
    };

    return {
        participant,
        isLoading,
        error,
        successMessage,
        showModal,
        status,
        handleScan,
        handleError,
        confirmAttendance,
        resetScanner,
        setStatus,
        // Offline props
        isOnline,
        pendingScans,
        syncQueue,
        isSyncing
    };
}
