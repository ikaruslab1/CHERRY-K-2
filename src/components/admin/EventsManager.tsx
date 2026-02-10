'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Trash, Edit, Plus, Eye, Printer, X, Users } from 'lucide-react';
import { createPortal } from 'react-dom';
import { CertificateContent, Certificate } from '@/components/profile/CertificateContent';
import { CertificatePreview } from '@/components/profile/CertificatePreview';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { Event, UserProfile } from '@/types';
import { EventForm } from '@/components/admin/EventForm';
import { useConference } from '@/context/ConferenceContext';
import { formatMexicoDate } from '@/lib/dateUtils';


export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const { currentConference } = useConference();

  const fetchEvents = async () => {
    if (!currentConference) return;
    setLoading(true);
    
    // Fetch events with speakers
    const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('conference_id', currentConference.id)
        .order('date');
    
    if (eventsData) {
        // Fetch speakers for each event
        const eventsWithSpeakers = await Promise.all(
            eventsData.map(async (event) => {
                const { data: eventSpeakers } = await supabase
                    .from('event_speakers')
                    .select(`
                        user_id,
                        profiles:user_id (
                            id,
                            first_name,
                            last_name,
                            degree,
                            gender
                        )
                    `)
                    .eq('event_id', event.id);
                
                return {
                    ...event,
                    speakers: eventSpeakers
                        ?.filter((es: any) => es.profiles !== null) // Filter out null profiles
                        .map((es: any) => ({
                            id: es.profiles.id,
                            first_name: es.profiles.first_name,
                            last_name: es.profiles.last_name,
                            degree: es.profiles.degree,
                            gender: es.profiles.gender
                        })) || []
                };
            })
        );
        
        setEvents(eventsWithSpeakers as Event[]);
    }
    
    setLoading(false);
  };

  const fetchUsers = async () => {
      if (currentConference) {
          const { data, error } = await supabase.rpc('get_users_for_conference', {
              p_conference_id: currentConference.id
          });
          if (!error && data) {
              setUsers(data as UserProfile[]);
              return;
          }
      }

      // Fallback
      const { data } = await supabase.from('profiles').select('id, first_name, last_name, degree, is_owner, gender').order('first_name');
      if (data) {
          const mapped = (data as any[]).map(u => ({
              ...u,
              role: u.is_owner ? 'owner' : 'user'
          }));
          const sorted = (mapped as UserProfile[]).sort((a, b) => {
              if (a.role === 'ponente' && b.role !== 'ponente') return -1;
              if (a.role !== 'ponente' && b.role === 'ponente') return 1;
              return 0;
          });
          setUsers(sorted);
      }
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, [currentConference]);

  const onSubmit = async (data: any) => {
    if (!currentConference) {
        alert("Error de sesión: No hay congreso seleccionado.");
        return;
    }
    try {
        console.log('EventsManager onSubmit data:', data);
        console.log('Speaker IDs to save:', data.speakerIds);
        
        const eventData = {
            title: data.title,
            description: data.description,
            location: data.location,
            date: data.date,
            type: data.type,
            speaker_id: data.speakerIds?.[0] || null, // First speaker as primary (legacy)
            image_url: data.image_url || null,
            duration_days: data.duration_days,
            gives_certificate: data.gives_certificate,
            auto_attendance: data.auto_attendance,
            auto_attendance_limit: data.auto_attendance_limit,
            tags: data.tags,
            custom_links: data.custom_links || [],
            conference_id: currentConference?.id
        };

        let eventId: string;

        if (isEditing) {
            const { error } = await supabase.from('events').update(eventData).eq('id', isEditing.id);
            if (error) throw error;
            eventId = isEditing.id;
            
            // Delete old speakers
            const { error: deleteError } = await supabase.from('event_speakers').delete().eq('event_id', eventId);
            if (deleteError) {
                console.error('Error deleting speakers:', deleteError);
                throw deleteError;
            }
        } else {
            const { data: newEvent, error } = await supabase.from('events').insert(eventData).select().single();
            if (error) throw error;
            eventId = newEvent.id;
        }

        // Insert new speakers
        if (data.speakerIds && data.speakerIds.length > 0) {
            const speakerRecords = data.speakerIds.map((userId: string) => ({
                event_id: eventId,
                user_id: userId
            }));
            
            const { error: speakersError } = await supabase
                .from('event_speakers')
                .insert(speakerRecords);
            
            if (speakersError) throw speakersError;
        }

        setIsEditing(null);
        setIsCreating(false);
        fetchEvents();
    } catch (error: any) {
        console.error('Error saving event:', error);
        alert('Error al guardar el evento: ' + (error.message || 'Verifica los datos'));
    }
  };

  const deleteEvent = async (id: string) => {
      if (confirm("¿Eliminar evento?")) {
          await supabase.from('events').delete().eq('id', id);
          fetchEvents();
      }
  };

  const startEdit = (event: Event) => {
      setIsEditing(event);
      setIsCreating(true);
  };

  const handleOpenCertificate = (event: Event) => {
      if (!event.speaker_id || !currentConference) return;
      
      const speaker = users.find(u => u.id === event.speaker_id);
      if (!speaker) {
          alert("No se encontró la información del ponente.");
          return;
      }

      const cert: Certificate = {
          id: `SPK-${event.id}`,
          scanned_at: event.date,
          events: {
              ...event,
              conference_id: currentConference.id, 
              conferences: {
                  title: currentConference.title,
                  institution_name: currentConference.institution_name || 'FES Acatlán',
                  department_name: currentConference.department_name || 'UNAM', // Fallback
                  certificate_config: currentConference.certificate_config
              }
          } as any,
          profiles: {
              first_name: speaker.first_name,
              last_name: speaker.last_name,
              degree: speaker.degree,
              gender: speaker.gender || null
          },
          isSpeaker: true
      };
      
      setSelectedCertificate(cert);
  };

  const handlePrintCertificate = () => {
      if (!selectedCertificate) return;
      const originalTitle = document.title;
      const certId = selectedCertificate.id.split('-').pop()?.toUpperCase() || selectedCertificate.id;
      const fullName = `${selectedCertificate.profiles.first_name} ${selectedCertificate.profiles.last_name}`;
      document.title = `${certId} - ${fullName}`;
      window.print();
      document.title = originalTitle;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-center gap-4">
             <h3 className="text-xl font-bold text-[#373737]">Gestión de Eventos</h3>
        </div>
        
        <div className="flex justify-between items-center">
            <Button onClick={() => { setIsCreating(true); setIsEditing(null); }} className="bg-[#373737] text-white hover:bg-black">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
            </Button>
        </div>
      </div>



      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/50 animate-in fade-in duration-300">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* Progress Bar Detail */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                    <div className="h-full bg-[#DBF227] w-1/3 rounded-r-full" />
                </div>

                <div className="p-5 xs:p-6 md:p-8 pt-6 xs:pt-8 md:pt-10">
                    <div className="mb-6 xs:mb-8">
                        <h2 className="text-2xl xs:text-3xl font-bold text-[#373737] mt-1 xs:mt-2 leading-tight">
                            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
                        </h2>
                        <p className="text-gray-500 mt-1 xs:mt-2 text-xs xs:text-sm">
                            Llena los detalles para agregar una actividad a la agenda oficial.
                        </p>
                    </div>

                    <EventForm
                        initialData={isEditing}
                        isEditing={!!isEditing}
                        users={users}
                        onSubmit={onSubmit}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
          {loading ? (
             <ContentPlaceholder type="grid" count={3} />
          ) : (
          <>
            {events.map(event => (
              <div key={event.id} className="bg-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center group transition-all gap-4 border border-gray-100 shadow-sm hover:shadow-md">
                  <div className="w-full sm:flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{event.type}</span>
                        <span className="text-xs text-gray-400 font-mono">{formatMexicoDate(event.date, {weekday: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <h4 className="font-bold text-lg text-[#373737] leading-tight mb-1">{event.title}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#DBF227] shrink-0"></span> 
                          <span className="truncate">{event.location}</span>
                        </p>
                        {event.speakers && event.speakers.length > 0 && (
                          <span className="text-[10px] font-bold text-[#aacc00] bg-[#DBF227]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.speakers.length} ponente{event.speakers.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-50 pt-3 sm:pt-0">
                      {event.speaker_id && (
                          <Button size="sm" variant="ghost" onClick={() => handleOpenCertificate(event)} className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl" title="Ver Constancia de Ponente">
                              <Eye className="h-4 w-4" />
                          </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => startEdit(event)} className="text-gray-400 hover:text-[#373737] hover:bg-gray-100 rounded-xl">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => deleteEvent(event.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                  </div>
              </div>
            ))}
          </>
          )}
      </div>


      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 sm:p-4 overflow-hidden print:hidden">
            <div className="bg-white sm:rounded-xl shadow-2xl w-full max-w-6xl flex flex-col h-full sm:h-[90vh]">
                
                {/* Modal Toolbar */}
                <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Vista Previa de Constancia (Ponente)</h3>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm" onClick={handlePrintCertificate} className="gap-2 text-black hover:text-black">
                             <Printer className="h-4 w-4" />
                             <span className="hidden sm:inline">Imprimir</span>
                         </Button>
                         <button 
                            onClick={() => setSelectedCertificate(null)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                        >
                             <X className="h-5 w-5" />
                         </button>
                    </div>
                </div>

                {/* Scaled View Area */}
                <div className="flex-1 overflow-hidden bg-gray-900/90 relative flex items-center justify-center p-2 sm:p-8 min-w-0 min-h-0">
                    <CertificatePreview certificate={selectedCertificate} />
                </div>
            </div>

            {/* PRINT PORTAL */}
            {typeof window !== 'undefined' && createPortal(
                <div id="print-portal" className="print-only">
                    <CertificateContent certificate={selectedCertificate} />
                </div>,
                document.body
            )}
        </div>
      )}
    </div>
  );
}
