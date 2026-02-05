'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Search, Star, CheckCircle2 } from 'lucide-react';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { useConference } from '@/context/ConferenceContext';

import { Event } from '@/types';
import { EventModal } from './EventModal';
import { AgendaItem } from './AgendaItem';

import { motion, AnimatePresence } from 'framer-motion';

export function AgendaView() {
  const { currentConference } = useConference();
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<Record<string, number>>({});
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
        if (!currentConference) return;
        const { data: { user } } = await supabase.auth.getUser();
        
          let eventsQuery = supabase
          .from('events')
          .select('id, title, description, location, date, type, tags, image_url, gives_certificate, duration_days, speaker:profiles!speaker_id(first_name, last_name, degree, gender)')
          .eq('conference_id', currentConference?.id)
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
          const counts: Record<string, number> = {};
          attendanceResponse.data.forEach((a: any) => {
              counts[a.event_id] = (counts[a.event_id] || 0) + 1;
          });
          setAttendance(counts);
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
  }, [currentConference]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <section className="space-y-6">
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-10 rounded-2xl border border-dashed border-gray-300 bg-gray-50"
        >
          {events.length === 0 ? (
             <p className="text-gray-500 italic">No hay eventos programados aún.</p>
          ) : (
             <div className="flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-gray-400" />
                <p className="text-gray-600 font-medium">No se encontraron eventos</p>
                <p className="text-sm text-gray-500">Intenta con otros términos de búsqueda.</p>
             </div>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col gap-8">
          {(() => {
            const interestedEvents: Event[] = [];
            const attendedEvents: Event[] = [];
            const otherEvents: Event[] = [];

            filteredEvents.forEach((event) => {
              const attendanceCount = attendance[event.id] || 0;
              const duration = event.duration_days || 1;
              const isAttended = attendanceCount >= duration;
              const isInterested = interests.has(event.id);

              if (isAttended) {
                attendedEvents.push(event);
              } else if (isInterested) {
                interestedEvents.push(event);
              } else {
                otherEvents.push(event);
              }
            });

            const renderEventList = (eventsList: Event[]) => (
              <motion.div 
                className="flex flex-col gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence>
                  {eventsList.map((event) => {
                    const attendanceCount = attendance[event.id] || 0;
                    const duration = event.duration_days || 1;
                    const isAttended = attendanceCount >= duration;
                    const isInterested = interests.has(event.id);
                    
                    return (
                      <motion.div key={event.id} variants={itemVariants as any} layout>
                        <AgendaItem
                          event={event}
                          attendanceCount={attendanceCount}
                          isAttended={isAttended}
                          isInterested={isInterested}
                          searchQuery={searchQuery}
                          onClick={setSelectedEvent}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            );

            return (
              <>
                {interestedEvents.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                  >
                    <h3 className="text-lg font-semibold text-[#373737] flex items-center gap-2">
                       <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                       De tu interés
                    </h3>
                    {renderEventList(interestedEvents)}
                  </motion.div>
                )}

                {attendedEvents.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <h3 className="text-lg font-semibold text-[#373737] flex items-center gap-2">
                       <CheckCircle2 className="h-5 w-5 text-green-500" />
                       Completados
                    </h3>
                    {renderEventList(attendedEvents)}
                  </motion.div>
                )}

                {otherEvents.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    {(interestedEvents.length > 0 || attendedEvents.length > 0) && (
                      <h3 className="text-lg font-semibold text-[#373737] flex items-center gap-2">
                         <Calendar className="h-5 w-5 text-gray-400" />
                         Todos los eventos
                      </h3>
                    )}
                    {renderEventList(otherEvents)}
                  </motion.div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Detail Model */}
      <AnimatePresence>
        {selectedEvent && (
          <EventModal 
            event={selectedEvent}
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            isAttended={selectedEvent ? (attendance[selectedEvent.id] || 0) >= (selectedEvent.duration_days || 1) : false}
            isInterested={selectedEvent ? interests.has(selectedEvent.id) : false}
            onToggleInterest={toggleInterest}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
