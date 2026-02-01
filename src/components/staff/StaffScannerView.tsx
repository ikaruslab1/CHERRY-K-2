'use client';

import { useState, useEffect } from 'react';
import { QRScanner } from '@/components/attendance/QRScanner';
import { VerificationModal } from '@/components/attendance/VerificationModal';
import { useAttendanceScanner } from '@/hooks/useAttendanceScanner';
import { attendanceService } from '@/services/attendanceService';
import { Loader2, Calendar, AlertTriangle } from 'lucide-react';
import { Event } from '@/types';

export function StaffScannerView() {
    const [events, setEvents] = useState<Pick<Event, 'id' | 'title' | 'duration_days'>[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [loadingActivities, setLoadingActivities] = useState(true);

    const {
        participant,
        isLoading,
        error: scannerError,
        showModal,
        status,
        handleScan,
        handleError,
        confirmAttendance,
        resetScanner
    } = useAttendanceScanner({ 
        activityId: selectedEventId || null,
        onSuccess: (p) => {
             // Optional: Show a transient success toast or log
             console.log(`Asistencia confirmada para ${p.first_name}`);
        }
    });

    useEffect(() => {
    const fetchEvents = async () => {
        setLoadingActivities(true);
        // Using existing service method or direct supabase if specific fields needed
        // attendanceService.getActiveEvents returns {id, title, type, date}
        // StaffScannerView previously used supabase directly for duration_days, but let's stick to service or consistent appraoch.
        // However, duration_days is not in attendanceService.getActiveEvents currently, but we don't strictly need it for validation anymore since we removed the check.
        // But checking the previous code, it fetched duration_days. 
        // Since we are creating a UNIFIED scanner, we can use attendanceService.getActiveEvents() like Admin view.
        // If duration_days is just for display, we can skip it or add it to service. 
        // Admin view didn't display duration days. I will stick to what Admin view does to ensure "SAME" experience.
        
        const evts = await attendanceService.getActiveEvents();
        // The type returned by getActiveEvents matches what we need mostly. 
        // We can cast or map if needed.
        setEvents(evts as any); 
        
        if (evts && evts.length > 0) {
            // Optional: Auto-select or not. Admin view comments say "Auto-select first if available".
            // Previous Staff view auto-selected.
            setSelectedEventId(evts[0].id);
        }
        setLoadingActivities(false);
    };
    fetchEvents();
  }, []);

  return (
      <div className="w-full max-w-sm xs:max-w-md md:max-w-lg mx-auto space-y-6 px-4 xs:px-0">
         {/* Header / Selector Section - Styled like Admin */}
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
                    
                    {/* Status Overlay */}
                    {scannerError && (
                        <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white py-3 px-4 rounded-xl text-sm font-medium text-center backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in">
                            {scannerError}
                        </div>
                    )}
                        
                    {status === 'processing' && !showModal && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
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
