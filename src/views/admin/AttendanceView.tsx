'use client';

import { useState, useEffect } from 'react';
import { QRScanner } from '@/components/attendance/QRScanner';
import { VerificationModal } from '@/components/attendance/VerificationModal';
import { useAttendanceScanner } from '@/hooks/useAttendanceScanner';
import { attendanceService } from '@/services/attendanceService';
import { useConference } from '@/context/ConferenceContext';
import { Loader2, Calendar, AlertTriangle } from 'lucide-react';

export default function AttendanceView() { // Default export for import ease
    const [activities, setActivities] = useState<{id: string, title: string}[]>([]);
    const [selectedActivity, setSelectedActivity] = useState<string>("");
    const [loadingActivities, setLoadingActivities] = useState(true);
    const { currentConference } = useConference();

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
        activityId: selectedActivity || null,
        onSuccess: (p) => {
            // Optional: Show a transient success toast or log
            console.log(`Asistencia confirmada para ${p.first_name}`);
        }
    });

    useEffect(() => {
        async function loadEvents() {
            if (!currentConference) return;
            setLoadingActivities(true);
            const evts = await attendanceService.getActiveEvents(currentConference.id);
            setActivities(evts);
            if (evts.length > 0) {
                 // Auto-select first if available, or force user to choose
                 // setSelectedActivity(evts[0].id);
            }
            setLoadingActivities(false);
        }
        loadEvents();
    }, [currentConference]);

    return (
        <div className="w-full max-w-sm xs:max-w-md md:max-w-lg xl:max-w-xl mx-auto px-1 xs:px-4 py-2 space-y-4 xs:space-y-6 md:space-y-8">
            
            {/* Header / Selector Section */}
            <div className="bg-white dark:bg-[#111111] p-4 xs:p-6 md:p-8 rounded-2xl xs:rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 space-y-3 xs:space-y-4">
                <div>
                    <h2 className="text-base xs:text-xl md:text-2xl font-black text-[#373737] dark:text-white">Control de Asistencia</h2>
                    <p className="text-xs xs:text-sm md:text-base text-gray-500 dark:text-gray-400 mt-0.5">Escanea el código QR de los asistentes.</p>
                </div>

                <div className="space-y-1.5 xs:space-y-2">
                    <label className="text-[10px] xs:text-xs font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider block">Actividad Actual</label>
                    {loadingActivities ? null : (
                        <div className="relative">
                            <select
                                value={selectedActivity}
                                onChange={(e) => setSelectedActivity(e.target.value)}
                                className="w-full appearance-none bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-[#373737] dark:text-white font-semibold rounded-xl py-2.5 xs:py-3 px-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#DBF227] text-xs xs:text-sm"
                            >
                                <option value="" disabled>Seleccionar Actividad...</option>
                                {activities.map(evt => (
                                    <option key={evt.id} value={evt.id} className="bg-white dark:bg-[#111111] text-black dark:text-white">{evt.title}</option>
                                ))}
                            </select>
                            <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        </div>
                    )}
                </div>
            </div>

            {/* Scanner Section */}
            <div className="relative rounded-2xl xs:rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-zinc-800">
                {!selectedActivity ? (
                    <div className="aspect-square bg-gray-50 dark:bg-zinc-900/60 flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <div className="w-14 h-14 bg-gray-200/80 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <AlertTriangle className="h-7 w-7 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-[#373737] dark:text-white font-bold text-sm xs:text-base">Cámara Desactivada</h3>
                            <p className="text-xs xs:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">Selecciona una actividad arriba para iniciar el escáner.</p>
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
                            <div className="absolute bottom-4 left-4 right-4 bg-red-500 text-white py-3 px-4 rounded-xl text-sm font-medium text-center shadow-lg animate-in slide-in-from-bottom-2 fade-in">
                                {scannerError}
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
