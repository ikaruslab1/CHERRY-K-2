'use client';

import { useState, useEffect } from 'react';
import { metricsService, EventAttendee, AttendanceDetail } from '@/services/metricsService';
import { Event } from '@/types';
import { Button } from '@/components/ui/Button';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { formatMexicoTime, formatMexicoDate } from '@/lib/dateUtils';
import { supabase } from '@/lib/supabase';

interface EventMetricsDetailProps {
  eventId: string;
  onBack: () => void;
}

export function EventMetricsDetail({ eventId, onBack }: EventMetricsDetailProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    try {
        // Fetch Event Info
        const { data: eventData } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();
        
        if (eventData) {
            setEvent(eventData);
            // Fetch Attendees
            const data = await metricsService.getEventAttendanceDetails(eventId, eventData.date);
            setAttendees(data);
        }
    } catch (error) {
        console.error("Error loading event details", error);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
      if (!confirm("¿Estás seguro de que quieres eliminar este registro de asistencia?")) return;

      const success = await metricsService.deleteAttendanceRecord(scanId);
      if (success) {
          // Reload data
          loadData();
      } else {
          alert("Error al eliminar el registro.");
      }
  };

  if (loading || !event) {
    return <ContentPlaceholder type="grid" count={1} />;
  }

  const durationDays = event.duration_days || 1;
  const daysArray = Array.from({ length: durationDays }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full h-10 w-10 p-0 text-gray-500 hover:text-[#373737]">
            <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
            <h2 className="text-xl font-bold text-[#373737]">{event.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{formatMexicoDate(event.date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                <span>•</span>
                <span>{attendees.length} Asistentes únicos</span>
            </div>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                     <tr>
                         <th className="px-6 py-4 w-1/3">Asistente</th>
                         <th className="px-6 py-4 w-24 text-center">Estado</th>
                         {daysArray.map(day => (
                             <th key={day} className="px-6 py-4 text-center min-w-[140px]">
                                 Día {day}
                             </th>
                         ))}
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                     {attendees.length === 0 ? (
                         <tr>
                             <td colSpan={2 + durationDays} className="px-6 py-12 text-center text-gray-400">
                                 No hay registros de asistencia aún.
                             </td>
                         </tr>
                     ) : (
                         attendees.map((attendee) => {
                             // Agenda Logic Replacement: 
                             // Status is based on Total Scans vs Duration Days.
                             // Strict day checking removed as per user request.
                             const scanCount = attendee.scans.length;
                             const isComplete = scanCount >= durationDays;
                             const statusColor = isComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-50 text-yellow-600';
                             // If complete or single day attended -> Asistido/Completo
                             // If multi-day and not complete -> Parcial
                             const statusLabel = isComplete ? (durationDays > 1 ? 'Completo' : 'Asistido') : 'Parcial';

                             return (
                                 <tr key={attendee.user_id} className="hover:bg-gray-50/50 transition-colors group">
                                     <td className="px-6 py-4">
                                         <div className="flex flex-col">
                                             <span className="font-bold text-[#373737]">
                                                 {attendee.user.first_name} {attendee.user.last_name}
                                             </span>
                                             <span className="text-xs text-gray-400 font-mono">
                                                 {attendee.user.degree} • {attendee.user.role === 'owner' ? 'Admin' : attendee.user.role}
                                             </span>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                         <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${statusColor}`}>
                                             {statusLabel}
                                         </span>
                                     </td>
                                     
                                     {daysArray.map(day => {
                                         // Filter scans for this logical column
                                         const dayScans = attendee.scans.filter(scan => {
                                            // Naive Day Alignment for visual purposes
                                            const d = new Date(scan.scanned_at);
                                            const start = new Date(event.date);
                                            // We just check if it kinda matches the day index
                                            // If not exact, we could just dump all extra scans in the last column or something, 
                                            // but let's try strict date match locally.
                                            const diffTime = d.getTime() - start.getTime();
                                            const dayNum = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            
                                            // If the dayNum matches this column (1, 2...)
                                            // Or if it's the first column (day 1) and dayNum <= 1 (handles same start day)
                                            if (day === 1 && dayNum <= 1) return true;
                                            return dayNum === day;
                                         });

                                         const hasDuplicate = dayScans.length > 1;

                                         return (
                                             <td key={day} className="px-6 py-4 text-center align-top">
                                                 {dayScans.length > 0 ? (
                                                     <div className="flex flex-col items-center gap-2">
                                                         {dayScans.map((scan, idx) => (
                                                             <div key={scan.id} className="relative group/scan flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-600">
                                                                 <span>{formatMexicoTime(scan.scanned_at)}</span>
                                                                 
                                                                 {/* Delete Button */}
                                                                 <button 
                                                                    onClick={() => handleDeleteScan(scan.id)}
                                                                    className="opacity-0 group-hover/scan:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                                                                    title="Eliminar registro"
                                                                 >
                                                                     <Trash2 className="h-3 w-3" />
                                                                 </button>

                                                                 {hasDuplicate && idx === 0 && (
                                                                     <div className="absolute -top-2 -right-2 text-orange-500 bg-white rounded-full shadow-sm" title="Registro duplicado este día">
                                                                         <AlertTriangle className="h-4 w-4 fill-orange-100" />
                                                                     </div>
                                                                 )}
                                                             </div>
                                                         ))}
                                                     </div>
                                                 ) : (
                                                     <div className="flex justify-center text-gray-300">
                                                         <XCircle className="h-5 w-5" />
                                                     </div>
                                                 )}
                                             </td>
                                         );
                                     })}
                                 </tr>
                             );
                         })
                     )}
                 </tbody>
             </table>
         </div>
      </div>
    </div>
  );
}
