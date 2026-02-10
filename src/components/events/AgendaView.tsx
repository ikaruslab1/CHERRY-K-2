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
          .select('id, title, description, location, date, type, tags, image_url, gives_certificate, duration_days, custom_links, speaker:profiles!speaker_id(first_name, last_name, degree, gender)')
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
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08
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

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <section className="space-y-8">
      {/* Header Section - Clean and minimal */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-4 xs:flex-row xs:items-center xs:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[var(--color-acid)] rounded-lg">
              <Calendar className="h-6 w-6 xs:h-7 xs:w-7" style={{ color: 'var(--color-acid-text)' }} />
            </div>
            <div>
              <h2 className="text-2xl xs:text-3xl font-bold text-[#373737]">
                Agenda del Evento
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Explora y organiza tus actividades
              </p>
            </div>
          </div>
          
          {/* Search Bar - Clean */}
          <div className="relative w-full xs:w-72 sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-acid)] focus:border-transparent text-sm transition-all"
              placeholder="Buscar por nombre o etiqueta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Bar - Minimal */}
        {userId && events.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Interés</span>
              </div>
              <p className="text-xl font-bold text-[#373737]">{interests.size}</p>
            </div>
            
            <div className="bg-[var(--color-acid)]/50 border border-[var(--color-acid)] rounded-lg p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" style={{ color: 'var(--color-acid-text)' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-acid-text)' }}>Asistidos</span>
              </div>
              <p className="text-xl font-bold" style={{ color: 'var(--color-acid-text)' }}>
                {filteredEvents.filter(e => (attendance[e.id] || 0) >= (e.duration_days || 1)).length}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {filteredEvents.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50"
        >
          {events.length === 0 ? (
             <div className="flex flex-col items-center gap-3">
               <div className="p-4 bg-white rounded-full border border-gray-200">
                 <Calendar className="h-8 w-8 text-gray-400" />
               </div>
               <p className="text-gray-600 font-semibold">No hay eventos programados aún</p>
               <p className="text-gray-500 text-sm">Los eventos aparecerán aquí cuando se agreguen</p>
             </div>
          ) : (
             <div className="flex flex-col items-center gap-3">
                <div className="p-4 bg-white rounded-full border border-gray-200">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-semibold">No se encontraron eventos</p>
                <p className="text-sm text-gray-500">Intenta con otros términos de búsqueda</p>
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
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {/* Section Header - Minimal */}
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Star className="h-4 w-4 text-[#373737]" />
                      <h3 className="text-lg font-bold text-[#373737]">
                        De tu interés
                      </h3>
                      <span className="text-xs text-gray-500 ml-auto">
                        {interestedEvents.length}
                      </span>
                    </div>
                    {renderEventList(interestedEvents)}
                  </motion.div>
                )}

                {attendedEvents.length > 0 && (
                  <motion.div 
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-3"
                  >
                    {/* Section Header - Minimal */}
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <CheckCircle2 className="h-4 w-4 text-[var(--color-acid)]" />
                      <h3 className="text-lg font-bold text-[#373737]">
                        Completados
                      </h3>
                      <span className="text-xs text-gray-500 ml-auto">
                        {attendedEvents.length}
                      </span>
                    </div>
                    {renderEventList(attendedEvents)}
                  </motion.div>
                )}

                {otherEvents.length > 0 && (
                  <motion.div 
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-3"
                  >
                    {(interestedEvents.length > 0 || attendedEvents.length > 0) && (
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <h3 className="text-lg font-bold text-[#373737]">
                          Todos los eventos
                        </h3>
                        <span className="text-xs text-gray-500 ml-auto">
                          {otherEvents.length}
                        </span>
                      </div>
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
