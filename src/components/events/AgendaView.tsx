'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, Tag, CheckCircle2, Search } from 'lucide-react';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';

import { Event } from '@/types';
import { EventModal } from './EventModal';

export function AgendaView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<Set<string>>(new Set());
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const filteredEvents = events.filter(event => {
    const query = searchQuery.toLowerCase();
    const titleMatch = event.title?.toLowerCase().includes(query);
    const tagMatch = event.tags && Array.isArray(event.tags) 
      ? event.tags.some(tag => tag.toLowerCase().includes(query))
      : false;
    return titleMatch || tagMatch;
  });
  const [userId, setUserId] = useState<string | null>(null);
  
  // State for the modal
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let eventsQuery = supabase
          .from('events')
          .select('id, title, description, location, date, type, tags, image_url, speaker:profiles!speaker_id(first_name, last_name, degree)')
          .order('date', { ascending: true });

        if (!user) {
          const { data: eventsData } = await eventsQuery;
          const formattedEvents = (eventsData || []).map((e: any) => ({
            ...e,
            speaker: Array.isArray(e.speaker) ? e.speaker[0] : e.speaker
          }));
          setEvents(formattedEvents);
          setLoading(false);
          return;
        }

        setUserId(user.id);

        const [eventsResponse, attendanceResponse, interestsResponse] = await Promise.all([
          eventsQuery,
          supabase
            .from('attendance')
            .select('event_id')
            .eq('user_id', user.id),
          supabase
            .from('event_interests')
            .select('event_id')
            .eq('user_id', user.id)
        ]);

        if (eventsResponse.data) {
          const formattedEvents = (eventsResponse.data as any[]).map(e => ({
            ...e,
            speaker: Array.isArray(e.speaker) ? e.speaker[0] : e.speaker
          }));
          setEvents(formattedEvents);
        }
        
        if (attendanceResponse.data) {
          setAttendance(new Set(attendanceResponse.data.map(a => a.event_id)));
        }

        if (interestsResponse.data) {
          setInterests(new Set(interestsResponse.data.map(i => i.event_id)));
        }

      } catch (error) {
        console.error('Error loading agenda:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleInterest = async (eventId: string) => {
    if (!userId) return;
    
    const isInterested = interests.has(eventId);
    let error;

    if (isInterested) {
      const { error: err } = await supabase
        .from('event_interests')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('event_interests')
        .insert({ user_id: userId, event_id: eventId });
      error = err;
    }

    if (!error) {
      const newInterests = new Set(interests);
      if (isInterested) newInterests.delete(eventId);
      else newInterests.add(eventId);
      setInterests(newInterests);
    }
  };

  if (loading) {
    return <ContentPlaceholder type="grid" count={4} />;
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
        <h2 className="text-xl xs:text-2xl font-bold flex items-center gap-2 text-[#373737]">
          <Calendar className="h-5 w-5 xs:h-6 xs:w-6" />
          Agenda del Evento
        </h2>
        
        {/* Search Bar */}
        <div className="relative w-full xs:w-64 sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-100 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#DBF227] focus:border-transparent sm:text-sm transition-all shadow-sm hover:shadow-md"
            placeholder="Buscar por nombre o etiqueta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
          {events.length === 0 ? (
             <p className="text-gray-400 italic">No hay eventos programados aún.</p>
          ) : (
             <div className="flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-gray-300" />
                <p className="text-gray-500 font-medium">No se encontraron eventos</p>
                <p className="text-sm text-gray-400">Intenta con otros términos de búsqueda.</p>
             </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEvents.map((event) => {
            const eventDate = new Date(event.date);
            const isAttended = attendance.has(event.id);
            const isInterested = interests.has(event.id);

            // Determine styles based on status
            // Priority: Attended > Interested > Default
            let gradientStyles = "from-gray-100/50 via-white to-white";
            let borderStyle = "bg-gray-200";
            
            if (isAttended) {
               gradientStyles = "from-[#DBF227]/30 via-white/80 to-white";
               borderStyle = "bg-[#DBF227]";
            } else if (isInterested) {
               gradientStyles = "from-[#373737]/15 via-white/80 to-white";
               borderStyle = "bg-[#373737]";
            }

            return (
              <button 
                key={event.id} 
                onClick={() => setSelectedEvent(event)}
                className="group relative w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
              >
                {/* Left Indicator Strip */}
                <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${borderStyle} transition-colors`} />
                
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${gradientStyles} opacity-100 transition-all`} />
                
                {/* Content Container */}
                <div className="relative flex flex-col gap-3 p-5 pl-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  
                  {/* Main Info */}
                  <div className="flex flex-1 flex-col items-start gap-2">
                    {/* Tags & Status */}
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="inline-flex items-center rounded-md border border-gray-200 bg-white/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 backdrop-blur-sm">
                        {event.type}
                      </span>
                      {/* Search Match Tags */}
                      {event.tags && event.tags.length > 0 && searchQuery && (
                          <>
                           {event.tags
                                .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(tag => (
                                    <span key={tag} className="inline-flex items-center rounded-md bg-[#DBF227]/20 border border-[#DBF227]/30 px-2 py-0.5 text-[10px] font-bold text-[#373737]">
                                        <Tag className="w-3 h-3 mr-1 opacity-50"/> {tag}
                                    </span>
                                ))
                           }
                          </>
                      )}
                      {isAttended && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DBF227] px-2.5 py-1 text-[10px] font-bold text-[#373737] shadow-sm">
                          <CheckCircle2 className="h-3 w-3" /> Asistido
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#373737] transition-colors group-hover:text-black">
                      {event.title}
                    </h3>
                  </div>

                  {/* Date & Time */}
                  <div className="flex shrink-0 flex-row items-center gap-4 text-xs font-medium uppercase tracking-wide text-gray-400 sm:flex-col sm:items-end sm:gap-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {eventDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      <span>
                        {eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail Model */}
      <EventModal 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isAttended={selectedEvent ? attendance.has(selectedEvent.id) : false}
        isInterested={selectedEvent ? interests.has(selectedEvent.id) : false}
        onToggleInterest={toggleInterest}
      />
    </section>
  );
}
