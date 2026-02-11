'use client';

import { useState, useEffect } from 'react';
import { metricsService, EventAttendee, AttendanceDetail, InterestedUser } from '@/services/metricsService';
import { Event } from '@/types';
import { Button } from '@/components/ui/Button';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { ArrowLeft, Trash2, AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react';
import { formatMexicoTime, formatMexicoDate } from '@/lib/dateUtils';
import { supabase } from '@/lib/supabase';

interface EventMetricsDetailProps {
  eventId: string;
  onBack: () => void;
}

export function EventMetricsDetail({ eventId, onBack }: EventMetricsDetailProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([]);
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

            // Fetch Interested Users
            const interestedData = await metricsService.getEventInterestedUsers(eventId);
            setInterestedUsers(interestedData);
        }
    } catch (error) {
        console.error("Error loading event details", error);
    } finally {
        setLoading(false);
    }
  };



  const handleDownloadAttendeesCSV = () => {
    if (!event || attendees.length === 0) return;

    const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Rol', 'Grado', 'Asistencia'];
    const rows = attendees.map(a => [
        a.user.id,
        a.user.first_name,
        a.user.last_name,
        a.user.email || '',
        a.user.role,
        a.user.degree || '',
        a.status // 'complete', 'partial', 'absent'
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    downloadCSV(csvContent, `${event.title}_asistentes.csv`);
  };

  const handleDownloadInterestedCSV = () => {
    if (!event || interestedUsers.length === 0) return;

    const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Rol', 'Grado', 'Teléfono', 'Género', 'Fecha Interés'];
    const rows = interestedUsers.map(i => [
        i.user.id,
        i.user.first_name,
        i.user.last_name,
        i.user.email || '',
        i.user.role,
        i.user.degree || '',
        // @ts-ignore - phone/gender might be missing from type definition but query fetches it
        i.user.phone || '',
        // @ts-ignore
        i.user.gender || '',
        formatMexicoDate(i.interested_at) + ' ' + formatMexicoTime(i.interested_at)
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    downloadCSV(csvContent, `${event.title}_interesados.csv`);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

      {/* Attendees Section */}
      <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#373737]">Asistencia ({attendees.length})</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadAttendeesCSV}
            disabled={attendees.length === 0}
            className="gap-2 text-gray-600"
          >
              <Download className="h-4 w-4" />
              Descargar CSV
          </Button>
      </div>

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


      {/* Interested Users Section */}
      <div className="flex items-center justify-between pt-4">
          <h3 className="text-lg font-semibold text-[#373737]">Interesados ({interestedUsers.length})</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadInterestedCSV}
            disabled={interestedUsers.length === 0}
            className="gap-2 text-gray-600"
          >
              <Download className="h-4 w-4" />
              Descargar CSV
          </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                 <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                     <tr>
                         <th className="px-6 py-4">Usuario</th>
                         <th className="px-6 py-4">Email</th>
                         <th className="px-6 py-4">Fecha de Interés</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                     {interestedUsers.length === 0 ? (
                         <tr>
                             <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                                 No hay usuarios interesados registrados.
                             </td>
                         </tr>
                     ) : (
                         interestedUsers.map((item) => (
                             <tr key={item.user_id} className="hover:bg-gray-50/50 transition-colors">
                                 <td className="px-6 py-4">
                                     <div className="flex flex-col">
                                         <span className="font-bold text-[#373737]">
                                             {item.user.first_name} {item.user.last_name}
                                         </span>
                                         <span className="text-xs text-gray-400 font-mono">
                                             {item.user.degree} • {item.user.role === 'owner' ? 'Admin' : item.user.role}
                                         </span>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4 text-gray-600">
                                     {item.user.email}
                                 </td>
                                 <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                     {formatMexicoDate(item.interested_at)} {formatMexicoTime(item.interested_at)}
                                 </td>
                             </tr>
                         ))
                     )}
                 </tbody>
             </table>
         </div>
      </div>
    </div>
  );
}
