import { useState, useRef, useCallback, useEffect } from 'react';
import { IParticipant, attendanceService } from '@/services/attendanceService';

interface UseAttendanceScannerProps {
    activityId: string | null;
    onSuccess?: (participant: IParticipant) => void;
}

export function useAttendanceScanner({ activityId, onSuccess }: UseAttendanceScannerProps) {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [participant, setParticipant] = useState<IParticipant | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'verified' | 'error'>('idle');
    
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
        // Implementación simple con osciladores si no hay assets, o usar assets si existen
        // Usar objetos Audio nativos apuntando a assets/sounds/
        const audio = new Audio();
        if (type === 'beep') audio.src = '/assets/sounds/scan-beep.mp3';
        else if (type === 'success') audio.src = '/assets/sounds/success-chime.mp3';
        // Fallback simple si no carga (opcional, o confiar en que el archivo existe)
        
        audio.play().catch(e => console.log("Audio play failed (interaction needed?):", e));
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

        // Pausar escáner visualmente (manejado por UI consumiendo 'showModal' o 'status')
        
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
    }, [activityId, playSound]);

    const confirmAttendance = async () => {
        if (!participant || !activityId) return;

        setIsLoading(true);
        const result = await attendanceService.confirmAttendance(participant.id, activityId);
        setIsLoading(false);

        if (result.success) {
            playSound('success');
            if (onSuccess) onSuccess(participant);
            resetScanner();
        } else {
            alert(result.message); // O usar un toast state
        }
    };

    const resetScanner = () => {
        setShowModal(false);
        setParticipant(null);
        setScannedData(null);
        setError(null);
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
        showModal,
        status,
        handleScan,
        handleError,
        confirmAttendance,
        resetScanner,
        setStatus
    };
}
