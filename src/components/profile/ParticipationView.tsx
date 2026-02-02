'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, MapPin, Tag, Medal, User } from 'lucide-react';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { Event } from '@/types';
import { EventModal } from '@/components/events/EventModal';

export function ParticipationView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data } = await supabase
          .from('events')
          .select('id, title, description, location, date, type, tags, image_url, gives_certificate, duration_days, speaker:profiles!speaker_id(first_name, last_name, degree, gender)')
          .eq('speaker_id', user.id)
          .order('date', { ascending: true });

        if (data) {
          const formattedEvents = data.map((e: any) => ({
            ...e,
            speaker: Array.isArray(e.speaker) ? e.speaker[0] : e.speaker
          }));
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
          Eventos en los que participas como ponente, tallerista o conferencista.
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
            
            return (
              <button 
                key={event.id} 
                onClick={() => setSelectedEvent(event)}
                className="group relative w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Accent Line */}
                <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#DBF227] transition-colors" />
                
                {/* Content Container */}
                <div className="relative flex flex-col gap-4 p-5 pl-7 md:flex-row md:items-center md:justify-between md:gap-6">
                  
                  {/* Main Info */}
                  <div className="flex flex-1 flex-col items-start gap-2.5">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {event.type}
                      </span>
                      
                      {event.gives_certificate && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DBF227]/10 border border-[#DBF227]/20 px-2.5 py-1 text-[10px] font-bold text-[#373737]">
                            <Medal className="h-3 w-3" /> Otorga constancia
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="line-clamp-2 text-lg xs:text-xl font-bold leading-snug text-[#373737] group-hover:text-black">
                      {event.title}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 text-[#DBF227]" />
                        {event.location}
                    </div>
                  </div>

                  {/* Date & Time Box */}
                  <div className="flex shrink-0 w-full md:w-auto flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:gap-1 bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-xl border md:border-none border-gray-100">
                    <div className="flex items-center gap-2 text-[#373737] font-bold">
                      <Calendar className="h-4 w-4 text-gray-400 md:hidden" />
                      <span className="capitalize">
                        {eventDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <Clock className="h-4 w-4 md:hidden" />
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

      {/* Detail Modal - Using existing component */}
      <EventModal 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isAttended={false} // Speaker view doesn't need personal attendance tracking usually, or unrelated
        isInterested={false} // Speaker is obviously interested
        onToggleInterest={() => {}} // No interest toggling for own event in this view
        hideActionButtons={true} // New prop suggestion to hide "Add to agenda" buttons if desired, but default is fine too.
      />
    </section>
  );
}
