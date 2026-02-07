'use client';

import { useState, useEffect } from 'react';
import { QRScanner } from '@/components/attendance/QRScanner';
import { VerificationModal } from '@/components/attendance/VerificationModal';
import { useAttendanceScanner } from '@/hooks/useAttendanceScanner';
import { attendanceService } from '@/services/attendanceService';
import { Loader2, Calendar, AlertTriangle, Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useConference } from '@/context/ConferenceContext';
import { Event } from '@/types';

export function StaffScannerView() {
    const [events, setEvents] = useState<Pick<Event, 'id' | 'title' | 'duration_days'>[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [loadingActivities, setLoadingActivities] = useState(true);
    const { currentConference } = useConference();

    const {
        participant,
        isLoading,
        error: scannerError,
        successMessage,
        showModal,
        status,
        handleScan,
        handleError,
        confirmAttendance,
        resetScanner,
        isOnline,
        pendingScans,
        syncQueue,
        isSyncing
    } = useAttendanceScanner({ 
        activityId: selectedEventId || null,
        onSuccess: (p) => {
             console.log(`Asistencia confirmada para ${p.first_name}`);
        }
    });

    useEffect(() => {
        const fetchEvents = async () => {
            if (!currentConference) return;
            setLoadingActivities(true);
            try {
                const evts = await attendanceService.getActiveEvents(currentConference.id as string);
                setEvents(evts as any); 
                
                if (evts && evts.length > 0) {
                    setSelectedEventId(evts[0].id);
                }
            } catch (e) {
                console.error("Failed to load events", e);
            } finally {
                setLoadingActivities(false);
            }
        };
        fetchEvents();
    }, [currentConference]);

  return (
      <div className="w-full max-w-sm xs:max-w-md md:max-w-lg mx-auto space-y-6 px-4 xs:px-0 pb-20">
         
         {/* Network Status Banners */}
         {!isOnline && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full shrink-0">
                    <WifiOff className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-amber-900 text-sm">Modo Offline Activo</h3>
                    <p className="text-xs text-amber-700 mt-1">
                        Las asistencias se guardarán en tu dispositivo. ({pendingScans.length} pendientes)
                    </p>
                </div>
            </div>
         )}

         {isOnline && pendingScans.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full shrink-0">
                        <RefreshCw className={`h-5 w-5 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-blue-900 text-sm">Sincronización Pendiente</h3>
                        <p className="text-xs text-blue-700 mt-1">
                            {pendingScans.length} escaneos guardados.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => syncQueue()}
                    disabled={isSyncing}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isSyncing ? 'Subiendo...' : 'Sincronizar'}
                </button>
            </div>
         )}

         {/* Header / Selector Section */}
         <div className="bg-white p-5 xs:p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-3 xs:space-y-4 md:space-y-5">
                <div>
                    <h2 className="text-xl xs:text-2xl md:text-3xl font-bold text-center text-[#373737]">Scanner de Asistencia</h2>
                    <p className="text-xs xs:text-sm md:text-base text-gray-500 text-center">Escanea el código QR de los asistentes.</p>
                </div>

                <div className="space-y-1.5 xs:space-y-2">
                    <label className="text-[10px] xs:text-xs font-bold uppercase text-gray-400 tracking-wider">Actividad Actual</label>
                    {loadingActivities ? (
                        <div className="h-10 xs:h-12 w-full bg-gray-50 rounded-xl animate-pulse" />
                    ) : (
                        <div className="relative">
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-[#373737] font-semibold rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#DBF227]"
                            >
                                {events.length === 0 && <option value="" disabled>No hay eventos activos</option>}
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>
                                        {event.title}
                                    </option>
                                ))}
                            </select>
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    )}
                </div>
         </div>

        {/* Scanner Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl ring-4 ring-black/5">
            {!selectedEventId ? (
                <div className="aspect-square bg-gray-100 flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-[#373737] font-bold">Cámara Desactivada</h3>
                        <p className="text-sm text-gray-500 mt-1">Selecciona una actividad arriba para iniciar el escáner.</p>
                    </div>
                </div>
            ) : (
                <>
                    <QRScanner 
                        onScan={handleScan}
                        onError={handleError}
                        paused={showModal || isLoading}
                    />
                    
                    {/* Status Overlays */}
                    {scannerError && (
                        <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white py-3 px-4 rounded-xl text-sm font-medium text-center shadow-lg animate-in slide-in-from-bottom-2 fade-in">
                            {scannerError}
                        </div>
                    )}

                    {successMessage && (
                        <div className="absolute top-4 left-4 right-4 bg-green-500/90 backdrop-blur-sm text-white py-3 px-4 rounded-xl text-sm font-bold text-center shadow-lg animate-in slide-in-from-top-2 fade-in flex items-center justify-center gap-2">
                             <CheckCircle2 className="h-5 w-5" />
                             {successMessage}
                        </div>
                    )}
                        
                    {status === 'processing' && !showModal && !successMessage && (
                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-[#DBF227] animate-spin" />
                            </div>
                    )}
                </>
            )}
        </div>

        {/* Verification Modal */}
        <VerificationModal 
            isOpen={showModal}
            participant={participant}
            isLoading={isLoading}
            onConfirm={confirmAttendance}
            onCancel={resetScanner}
        />

      </div>
  );
}
