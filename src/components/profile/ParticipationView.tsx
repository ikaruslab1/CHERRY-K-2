'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, MapPin, Tag, Medal, User, Star, MessageSquare, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { Event } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpeakerEvent extends Event {
  attendees_scanned?: number;
  ratingAvg?: number;
  ratingCount?: number;
  comments?: string[];
}

export function ParticipationView() {
  const [events, setEvents] = useState<SpeakerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch events where the user is the speaker
        const { data: eventsData } = await supabase
          .from('events')
          .select(`
            id, title, description, location, date, type, tags, image_url, 
            gives_certificate, duration_days, conference_id,
            speaker:profiles!speaker_id(first_name, last_name, degree, gender),
            event_speakers(
              profiles(id, first_name, last_name, degree, gender)
            )
          `)
          .eq('speaker_id', user.id)
          .order('date', { ascending: true });

        if (eventsData && eventsData.length > 0) {
          const eventIds = eventsData.map(e => e.id);

          // Fetch attendance logs for these events
          const { data: attendanceData } = await supabase
            .from('attendance')
            .select('event_id')
            .in('event_id', eventIds)
            .not('scanned_at', 'is', null);

          // Fetch rating data for these events
          const { data: ratingData } = await supabase
            .from('event_ratings')
            .select('event_id, rating, comment')
            .in('event_id', eventIds);

          // Map aggregates
          const attendanceMap: Record<string, number> = {};
          (attendanceData || []).forEach(a => {
            attendanceMap[a.event_id] = (attendanceMap[a.event_id] || 0) + 1;
          });

          const ratingsMap: Record<string, { ratings: number[]; comments: string[] }> = {};
          (ratingData || []).forEach(r => {
            if (!ratingsMap[r.event_id]) {
              ratingsMap[r.event_id] = { ratings: [], comments: [] };
            }
            ratingsMap[r.event_id].ratings.push(r.rating);
            if (r.comment) {
              ratingsMap[r.event_id].comments.push(r.comment);
            }
          });

          const formattedEvents = eventsData.map((e: any) => {
            const speakers = e.event_speakers?.map((es: any) => es.profiles).filter(Boolean) || [];
            if (speakers.length === 0 && e.speaker) {
                speakers.push(Array.isArray(e.speaker) ? e.speaker[0] : e.speaker);
            }

            const ratingsInfo = ratingsMap[e.id] || { ratings: [], comments: [] };
            const ratingCount = ratingsInfo.ratings.length;
            const ratingAvg = ratingCount > 0 ? parseFloat((ratingsInfo.ratings.reduce((a, b) => a + b, 0) / ratingCount).toFixed(1)) : 0;

            return {
               ...e,
               speaker: Array.isArray(e.speaker) ? e.speaker[0] : e.speaker,
               speakers,
               attendees_scanned: attendanceMap[e.id] || 0,
               ratingAvg,
               ratingCount,
               comments: ratingsInfo.comments
            };
          });

          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Error loading participation events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  if (loading) {
    return <ContentPlaceholder type="grid" count={2} />;
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl xs:text-2xl font-bold flex items-center gap-2 text-[#373737]">
          <User className="h-5 w-5 xs:h-6 xs:w-6" />
          Mi Participación
        </h2>
        <p className="text-gray-500 text-sm">
          Consulta las estadísticas, asistencias y comentarios de los asistentes en tus ponencias.
        </p>
      </div>
      
      {events.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center gap-4">
           <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-gray-400" />
           </div>
           <div>
               <p className="text-gray-500 font-medium text-lg">No tienes actividades asignadas</p>
               <p className="text-sm text-gray-400 mt-1">Tus participaciones aparecerán aquí cuando seas asignado a un evento.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => {
            const eventDate = new Date(event.date);
            const isExpanded = expandedEventId === event.id;
            
            return (
              <div 
                key={event.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300"
              >
                <button 
                  onClick={() => toggleExpand(event.id)}
                  className="group relative w-full text-left pl-7 pr-6 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6"
                >
                  {/* Accent Line */}
                  <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#DBF227] transition-colors" />
                  
                  {/* Main Info */}
                  <div className="flex flex-1 flex-col items-start gap-2">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {event.type}
                      </span>
                      
                      {event.ratingCount && event.ratingCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-600">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> 
                            {event.ratingAvg} ({event.ratingCount})
                        </span>
                      ) : null}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg xs:text-xl font-bold leading-snug text-[#373737] group-hover:text-black">
                      {event.title}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 text-[#DBF227]" />
                        {event.location}
                    </div>
                  </div>

                  {/* Date & Time Box */}
                  <div className="flex shrink-0 items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                    <div className="flex flex-row md:flex-col items-start md:items-end gap-1 font-medium text-sm text-gray-500">
                      <span className="capitalize font-bold text-[#373737]">
                        {eventDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span>
                        {eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:text-black transition-colors">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {/* Collapsable Feedback Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="border-t border-gray-100 bg-gray-50/30 overflow-hidden"
                    >
                      <div className="p-6 space-y-6">
                        {/* Stats Dashboard Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asistencia</p>
                              <p className="text-xl font-black text-black">{event.attendees_scanned} escaneados</p>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Calificación Promedio</p>
                              <p className="text-xl font-black text-black">
                                {event.ratingCount && event.ratingCount > 0 
                                  ? `${event.ratingAvg} / 5 (${event.ratingCount} opiniones)`
                                  : 'Sin calificaciones aún'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Comments / Feedback List */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            Comentarios de los Asistentes
                          </h4>
                          
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {event.comments && event.comments.length > 0 ? (
                              event.comments.map((comment, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed shadow-sm">
                                  "{comment}"
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-gray-400 italic py-4 text-center bg-white rounded-xl border border-gray-100">
                                No se han recibido comentarios escritos para este evento.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

