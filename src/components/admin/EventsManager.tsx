'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Trash, Edit, Plus, Eye, Printer, X, Users, GraduationCap, ChevronDown, Save, Info, Copy } from 'lucide-react';
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
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [speakerSelection, setSpeakerSelection] = useState<{event: Event, speakers: any[]} | null>(null);
  
  // Global attendance certificate state
  const [showGlobalCertSection, setShowGlobalCertSection] = useState(false);
  const [givesGlobalCert, setGivesGlobalCert] = useState(false);
  const [globalCertThreshold, setGlobalCertThreshold] = useState(1);
  const [deliverGlobalCert, setDeliverGlobalCert] = useState(false);
  const [savingGlobalCert, setSavingGlobalCert] = useState(false);

  const { currentConference, refreshConference } = useConference();

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
    // Sync global cert config from conference
    if (currentConference) {
      setGivesGlobalCert(currentConference.gives_global_certificate || false);
      setGlobalCertThreshold(currentConference.global_certificate_threshold || 1);
      setDeliverGlobalCert(currentConference.deliver_global_certificate || false);
    }
  }, [currentConference]);

  const saveGlobalCertSettings = async () => {
    if (!currentConference) return;
    setSavingGlobalCert(true);
    try {
      const { error } = await supabase
        .from('conferences')
        .update({
          gives_global_certificate: givesGlobalCert,
          global_certificate_threshold: globalCertThreshold,
          deliver_global_certificate: deliverGlobalCert,
        })
        .eq('id', currentConference.id);
      if (error) throw error;
      if (refreshConference) await refreshConference();
    } catch (err: any) {
      alert('Error al guardar configuración: ' + (err.message || 'Error desconocido'));
    } finally {
      setSavingGlobalCert(false);
    }
  };

  const onSubmit = async (data: any) => {
     if (!currentConference) {
        alert("Error de sesión: No hay congreso seleccionado.");
        return;
    }
    try {
        console.log('EventsManager onSubmit data:', data);
        
        const eventData = {
            title: data.title,
            title_en: data.title_en,
            description: data.description,
            description_en: data.description_en,
            location: data.location,
            location_en: data.location_en,
            date: data.date,
            type: data.type,
            type_en: data.type_en,
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

        if (isEditMode && selectedEvent) {
            const { error } = await supabase.from('events').update(eventData).eq('id', selectedEvent.id);
            if (error) throw error;
            eventId = selectedEvent.id;
            
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

        setSelectedEvent(null);
        setIsEditMode(false);
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
      setSelectedEvent(event);
      setIsEditMode(true);
      setIsCreating(true);
  };

  const startDuplicate = (event: Event) => {
      setSelectedEvent(event);
      setIsEditMode(false);
      setIsCreating(true);
  };

  const generateAndShowCertificate = async (event: Event, speaker: any) => {
      if (!currentConference) return;

      // Fetch fresh configuration to ensure we show the latest saved version
      const { data: confData } = await supabase
          .from('conferences')
          .select('title, institution_name, department_name, certificate_config')
          .eq('id', currentConference.id)
          .single();
        
      const freshConf = confData || currentConference;

      const cert: Certificate = {
          id: `SPK-${event.id}-${speaker.id || 'LEGACY'}`,
          scanned_at: event.date,
          events: {
              ...event,
              conference_id: currentConference.id, 
              conferences: {
                  title: freshConf.title,
                  institution_name: freshConf.institution_name || 'FES Acatlán',
                  department_name: freshConf.department_name || 'UNAM', // Fallback
                  certificate_config: freshConf.certificate_config
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
      setSpeakerSelection(null);
  };

  const handleOpenCertificate = (event: Event) => {
      if (!currentConference) return;
      
      const speakers = event.speakers && event.speakers.length > 0 ? event.speakers : null;

      if (!speakers) {
          // Fallback to legacy speaker_id check
          if (event.speaker_id) {
              const speaker = users.find(u => u.id === event.speaker_id);
              if (speaker) {
                  generateAndShowCertificate(event, speaker);
              } else {
                  alert("No se encontró la información del ponente.");
              }
              return;
          }
           alert("No hay ponentes asignados a este evento.");
           return;
      }

      if (speakers.length === 1) {
          generateAndShowCertificate(event, speakers[0]);
      } else {
          setSpeakerSelection({ event, speakers });
      }
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
            <Button onClick={() => { setIsCreating(true); setSelectedEvent(null); setIsEditMode(false); }} className="bg-[#373737] text-white hover:bg-black">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
            </Button>
        </div>
      </div>

      {/* Global Attendance Certificate Panel */}
      <div 
        className="rounded-2xl border transition-all duration-300 overflow-hidden"
        style={{ 
          borderColor: givesGlobalCert ? 'var(--color-acid)' : 'rgb(229 231 235)',
          backgroundColor: givesGlobalCert ? 'rgb(var(--color-acid-rgb) / 0.05)' : 'white'
        }}
      >
        <button
          type="button"
          onClick={() => setShowGlobalCertSection(!showGlobalCertSection)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ 
                backgroundColor: givesGlobalCert ? 'var(--color-acid)' : 'rgb(243 244 246)',
                color: givesGlobalCert ? 'var(--color-acid-text)' : 'rgb(107 114 128)'
              }}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#373737]">Constancia General de Participación</p>
              <p className="text-xs text-gray-500">
                {givesGlobalCert
                  ? `Activa — se requieren ${globalCertThreshold} evento${globalCertThreshold !== 1 ? 's' : ''} por asistencia`
                  : 'No se otorga constancia por asistencia general al congreso'
                }
              </p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showGlobalCertSection ? 'rotate-180' : ''}`} />
        </button>

        {showGlobalCertSection && (
          <div className="px-4 pb-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="h-px bg-gray-100" />

            {/* Toggle Switch */}
            <div 
              className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-300"
              style={{ 
                backgroundColor: givesGlobalCert ? 'rgb(var(--color-acid-rgb) / 0.2)' : 'rgb(249 250 251 / 0.5)',
                borderColor: givesGlobalCert ? 'var(--color-acid)' : 'rgb(243 244 246)'
              }}
            >
              <div className="flex-1">
                <label className="text-sm font-bold text-[#373737] block">Dar constancias por asistencia total al congreso</label>
                <p className={`text-xs transition-colors ${givesGlobalCert ? 'text-gray-600' : 'text-gray-400'}`}>
                  Activa si los asistentes pueden ganar una constancia por participar en múltiples eventos del congreso.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={givesGlobalCert}
                  onChange={(e) => setGivesGlobalCert(e.target.checked)}
                  className="sr-only peer"
                />
                <div 
                  className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors"
                  style={{ 
                    backgroundColor: givesGlobalCert ? 'var(--color-acid)' : undefined,
                    boxShadow: givesGlobalCert ? '0 0 0 4px rgb(var(--color-acid-rgb) / 0.2)' : undefined
                  }}
                ></div>
              </label>
            </div>

            {/* Threshold Input + Deliver Toggle - shown when enabled */}
            {givesGlobalCert && (
              <div className="animate-in slide-in-from-top-2 duration-300 space-y-3">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100 text-blue-800 text-xs">
                  <Info size={14} className="shrink-0 mt-0.5" />
                  <p>
                    Este contador es <strong>por congreso</strong>. Cada congreso activo lleva la cuenta de asistencias de forma independiente.
                  </p>
                </div>
                <label className="text-sm font-bold text-[#373737] block">
                  Número mínimo de eventos con asistencia registrada:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={globalCertThreshold}
                    onChange={(e) => setGlobalCertThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-28 px-4 py-3 rounded-xl border border-gray-200 text-[#373737] text-center font-bold focus:outline-none transition-all bg-gray-50/50 text-lg"
                    style={{ 
                      boxShadow: '0 0 0 2px var(--color-acid)'
                    }}
                  />
                  <p className="text-sm text-gray-500">
                    evento{globalCertThreshold !== 1 ? 's' : ''} con asistencia marcada para obtener la constancia
                  </p>
                </div>

                {/* Sub-option: Entregar constancia */}
                <div 
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all duration-300"
                  style={{ 
                    backgroundColor: deliverGlobalCert ? 'rgb(var(--color-acid-rgb) / 0.1)' : 'rgb(249 250 251)',
                    borderColor: deliverGlobalCert ? 'var(--color-acid)' : 'rgb(229 231 235)'
                  }}
                >
                  <div className="flex-1">
                    <label className="text-sm font-bold text-[#373737] block">Entregar constancia general</label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {deliverGlobalCert
                        ? 'Los usuarios podrán descargar su constancia directamente desde su perfil.'
                        : 'Se mostrará un aviso de que la constancia será enviada a su correo electrónico.'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deliverGlobalCert}
                      onChange={(e) => setDeliverGlobalCert(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div 
                      className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors"
                      style={{ 
                        backgroundColor: deliverGlobalCert ? 'var(--color-acid)' : undefined,
                        boxShadow: deliverGlobalCert ? '0 0 0 4px rgb(var(--color-acid-rgb) / 0.2)' : undefined
                      }}
                    ></div>
                  </label>
                </div>
              </div>
            )}

            <Button
              onClick={saveGlobalCertSettings}
              disabled={savingGlobalCert}
              className="w-full sm:w-auto bg-[#373737] text-white hover:bg-black gap-2"
            >
              {savingGlobalCert ? (
                <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> Guardando...</span>
              ) : (
                <><Save className="w-4 h-4" /> Guardar Configuración</>
              )}
            </Button>
          </div>
        )}
      </div>



      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/50 animate-in fade-in duration-300">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* Progress Bar Detail */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                    <div 
                      className="h-full w-1/3 rounded-r-full" 
                      style={{ backgroundColor: 'var(--color-acid)' }}
                    />
                </div>

                <div className="p-5 xs:p-6 md:p-8 pt-6 xs:pt-8 md:pt-10">
                    <div className="mb-6 xs:mb-8">
                        <h2 className="text-2xl xs:text-3xl font-bold text-[#373737] mt-1 xs:mt-2 leading-tight">
                            {isEditMode ? 'Editar Evento' : selectedEvent ? 'Duplicar Evento' : 'Crear Nuevo Evento'}
                        </h2>
                        <p className="text-gray-500 mt-1 xs:mt-2 text-xs xs:text-sm">
                            Llena los detalles para agregar una actividad a la agenda oficial.
                        </p>
                    </div>

                    <EventForm
                        initialData={selectedEvent}
                        isEditing={isEditMode}
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
              <div key={event.id} className="bg-white p-4 xs:p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center group transition-all gap-3 xs:gap-4 border border-gray-200 shadow-sm hover:shadow-md">
                  <div className="w-full sm:flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{event.type}</span>
                        <span className="text-xs text-gray-400 font-mono">{formatMexicoDate(event.date, {weekday: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <h4 className="font-bold text-base xs:text-lg text-gray-900 leading-tight mb-1">{event.title}</h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs xs:text-sm text-gray-500 flex items-center gap-1.5 truncate max-w-full">
                          <span 
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: 'var(--color-acid)' }}
                          ></span> 
                          <span className="truncate">{event.location}</span>
                        </p>
                        {event.speakers && event.speakers.length > 0 && (
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0"
                            style={{ 
                              backgroundColor: 'rgb(var(--color-acid-rgb) / 0.1)',
                              color: 'var(--color-acid-text)'
                            }}
                          >
                            <Users className="h-3 w-3" />
                            {event.speakers.length} ponente{event.speakers.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-2.5 sm:pt-0 shrink-0">
                      {(event.speaker_id || (event.speakers && event.speakers.length > 0)) && (
                          <Button size="sm" variant="ghost" onClick={() => handleOpenCertificate(event)} className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl" title="Ver Constancia de Ponente">
                              <Eye className="h-4 w-4" />
                          </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => startDuplicate(event)} className="text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl" title="Duplicar Evento">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(event)} className="text-gray-400 hover:text-[#373737] hover:bg-gray-100 rounded-xl" title="Editar Evento">
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

      {/* Speaker Selection Modal */}
      {speakerSelection && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-700">Seleccionar Ponente</h3>
                    <button 
                        onClick={() => setSpeakerSelection(null)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {speakerSelection.speakers.map((speaker, idx) => (
                        <button
                            key={speaker.id || idx}
                            onClick={() => generateAndShowCertificate(speakerSelection.event, speaker)}
                            className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-3 group border-b border-gray-50 last:border-0"
                        >
                            <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                                {speaker.first_name?.[0]}{speaker.last_name?.[0]}
                            </div>
                            <div>
                                <p className="font-medium text-gray-700 group-hover:text-gray-900">
                                    {speaker.first_name} {speaker.last_name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {speaker.degree || 'Sin grado'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">Selecciona un ponente para ver su constancia</p>
                </div>
            </div>
        </div>
      )}


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
