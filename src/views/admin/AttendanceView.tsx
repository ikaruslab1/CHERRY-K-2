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
        <div className="w-full max-w-sm xs:max-w-md md:max-w-lg xl:max-w-xl mx-auto p-0 xs:p-4 space-y-6 md:space-y-8">
            
            {/* Header / Selector Section */}
            <div className="bg-white p-5 xs:p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-3 xs:space-y-4 md:space-y-5">
                <div>
                    <h2 className="text-lg xs:text-xl md:text-2xl font-black text-[#373737]">Control de Asistencia</h2>
                    <p className="text-xs xs:text-sm md:text-base text-gray-500">Escanea el código QR de los asistentes.</p>
                </div>

                <div className="space-y-1.5 xs:space-y-2">
                    <label className="text-[10px] xs:text-xs font-bold uppercase text-gray-400 tracking-wider">Actividad Actual</label>
                    {loadingActivities ? null : (
                        <div className="relative">
                            <select
                                value={selectedActivity}
                                onChange={(e) => setSelectedActivity(e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-[#373737] font-semibold rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#DBF227]"
                            >
                                <option value="" disabled>Seleccionar Actividad...</option>
                                {activities.map(evt => (
                                    <option key={evt.id} value={evt.id}>{evt.title}</option>
                                ))}
                            </select>
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                    )}
                </div>
            </div>

            {/* Scanner Section */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl ring-4 ring-black/5">
                {!selectedActivity ? (
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
