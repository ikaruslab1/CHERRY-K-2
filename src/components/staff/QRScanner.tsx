'use client';

import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { checkAndNotifyCertificate } from '@/actions/notifications';

interface QRScannerProps {
  eventId: string;
  durationDays?: number;
  onSuccess?: () => void;
}

export function QRScanner({ eventId, durationDays = 1, onSuccess }: QRScannerProps) {
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [scannedProfile, setScannedProfile] = useState<{name: string, degree: string} | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
     supabase.auth.getUser().then(({ data }) => {
         if (data.user) setCurrentUserId(data.user.id);
     });
  }, []);

  const handleScan = async (detectedCodes: any[]) => {
    if (status === 'processing' || status === 'success' || status === 'error') return;
    if (!detectedCodes || detectedCodes.length === 0) return;

    const rawValue = detectedCodes[0].rawValue;
    if (rawValue === lastScanned) return; 

    setLastScanned(rawValue);
    setStatus('processing');

    try {
      // 1. Parse Data
      let parsedData;
      try {
        parsedData = JSON.parse(rawValue);
      } catch (e) {
        throw new Error("Formato QR inválido");
      }

      const { id: shortId } = parsedData;
      if (!shortId) throw new Error("ID no encontrado en QR");

      // 2. Fetch User Profile by short_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, degree, gender')
        .eq('short_id', shortId)
        .single();

      if (profileError || !profile) {
        throw new Error("Usuario no encontrado");
      }

      setScannedProfile({ name: `${profile.first_name} ${profile.last_name}`, degree: profile.degree });

      // 3. Check Existing Attendance Count
      const { count: attendanceCount, error: countError } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('event_id', eventId);

      if (countError) throw countError;

      const currentCount = attendanceCount || 0;
      // Force integer parsing
      const targetDuration = parseInt(String(durationDays || '1'), 10);

      // Debug log (remove in prod if needed, but useful now)
      console.log(`Scanning: Current ${currentCount}, Target ${targetDuration}, ID ${profile.id}, Event ${eventId}`);

      if (currentCount >= targetDuration) {
          setMessage(`Límite alcanzado: ${currentCount}/${targetDuration} asistencias.`);
          setStatus('error');
          return;
      }

      // 4. Register Attendance
      if (!currentUserId) throw new Error("Sesión no válida");
      
      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert({
          user_id: profile.id,
          event_id: eventId,
          scanned_by: currentUserId
        });

      if (attendanceError) {
        // Fallback for unique constraint
        if (attendanceError.code === '23505') { 
             // This might happen if user scans twice in RAPID succession
             setMessage(`Ya registrado (${currentCount + 1}/${targetDuration}).`);
             setStatus('error');
             return;
        }
        throw attendanceError;
      }

      setStatus('success');
      // Show progress in message
      setMessage(`Asistencia ${currentCount + 1}/${targetDuration} registrada.`);
      
      // Notify about Certificate
      try {
          // Fire and forget notification (non-blocking) - wait, server actions are usually awaited or fire-and-forget?
          // If we await, it slows down the scanner feedback. But it's safer.
          // Since it's a critical new feature, let's await but catch errors so scanning doesn't fail.
          await checkAndNotifyCertificate(profile.id, eventId);
      } catch (notifyErr) {
          console.error("Failed to notify certificate:", notifyErr);
      }

      if (onSuccess) onSuccess();

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || "Error al registrar");
    }
  };

  const reset = () => {
    setStatus('idle');
    setLastScanned(null);
    setMessage('');
    setScannedProfile(null);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
      <div className="w-full aspect-square bg-black rounded-2xl overflow-hidden relative border-2 border-indigo-500/50 shadow-2xl">
        {status === 'idle' && (
            <Scanner 
                onScan={handleScan} 
                allowMultiple={true} 
                scanDelay={2000}
                styles={{ container: { width: '100%', height: '100%' } }}
            />
        )}
        
        {/* Overlay States */}
        {status !== 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center animate-in fade-in duration-200">
                {status === 'processing' && (
                    <>
                        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                        <p className="text-white font-medium">Procesando...</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4 animate-in zoom-in spin-in-12" />
                        <h3 className="text-2xl font-bold text-white mb-2">¡Éxito!</h3>
                        <p className="text-green-200 mb-4">{message}</p>
                        {scannedProfile && (
                            <div className="bg-white/10 p-3 rounded-lg border border-white/20 mb-6 w-full">
                                <p className="text-sm text-slate-400">Asistente</p>
                                <p className="text-lg font-semibold text-white">{scannedProfile.name}</p>
                            </div>
                        )}
                        <Button onClick={reset} className="w-full">Siguiente</Button>
                    </>
                )}
                {status === 'error' && (
                    <>
                         <XCircle className="h-16 w-16 text-red-500 mb-4 animate-in zoom-in" />
                        <h3 className="text-2xl font-bold text-white mb-2">Error</h3>
                        <p className="text-red-200 mb-6">{message}</p>
                        <Button onClick={reset} variant="secondary" className="w-full">Intentar de nuevo</Button>
                    </>
                )}
            </div>
        )}
        
        {/* Scan Line Animation */}
        {status === 'idle' && (
             <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-[scan_2s_infinite]" />
        )}
      </div>
      
      {status === 'idle' && (
          <p className="text-slate-400 text-sm">Apunta la cámara al código QR del asistente</p>
      )}
    </div>
  );
}
