'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface PublicAgendaProps {
    conferenceId: string;
    title?: string;
}

export function PublicAgenda({ conferenceId, title }: PublicAgendaProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      if (!conferenceId) return;
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            id, title, location, type, date,
            event_speakers(
              profiles(first_name, last_name, degree)
            )
          `)
          .eq('conference_id', conferenceId)
          .order('date', { ascending: true });

        if (data) {
          const mappedEvents = data.map((e: any) => {
            const dateObj = new Date(e.date);
            const timeStr = dateObj.toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'America/Mexico_City'
            });

            // Get speaker names
            const speakerProfiles = e.event_speakers?.map((es: any) => es.profiles).filter(Boolean) || [];
            let speakerName = 'Por definir ponente';
            
            if (speakerProfiles.length > 0) {
              speakerName = speakerProfiles.map((p: any) => 
                `${p.degree ? p.degree + ' ' : ''}${p.first_name} ${p.last_name}`
              ).join(', ');
            }

            return {
              title: e.title,
              type: e.type,
              time: timeStr,
              location: e.location,
              speaker: speakerName,
            };
          });
          setEvents(mappedEvents);
        }
      } catch (err) {
        console.error('Error fetching public events:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [conferenceId]);

  if (loading) {
    return (
        <div className="p-8 flex justify-center items-center h-48">
            <Calendar className="animate-spin text-gray-300 w-8 h-8" />
        </div>
    );
  }

  return (
    <div className="bg-white px-2 py-4 md:px-6 md:py-8 max-w-4xl mx-auto selection:bg-[#DBF227]">
        {title && (
            <div className="flex flex-col items-center mb-12 text-center">
                <Calendar className="w-8 h-8 text-[#adacac] mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 tracking-tighter">
                    {title}
                </h2>
            </div>
        )}

        <div className="space-y-4">
          {events.length > 0 ? (
            events.map((activity: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex gap-4 md:gap-6 p-5 md:p-6 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 group"
                >
                  <div className="w-16 md:w-24 flex-shrink-0 flex flex-col items-center justify-center border-r border-gray-200 pr-4 md:pr-6">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Inicio</p>
                    <p className="text-lg md:text-xl font-black text-gray-900 leading-none mt-1">{activity.time}</p>
                  </div>
                  
                  <div className="flex-1 space-y-2 pl-2">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold rounded uppercase">
                         {activity.type || 'Sesión'}
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-black transition-colors">
                      {activity.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-gray-400">
                       <div className="flex items-center gap-1.5 text-[11px] font-medium">
                          <Users className="w-3.5 h-3.5" />
                          <span className={`${activity.speaker === 'Por definir ponente' ? 'italic opacity-60' : ''}`}>
                            {activity.speaker}
                          </span>
                       </div>
                       <div className="flex items-center gap-1.5 text-[11px] font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{activity.location || 'Sala Principal'}</span>
                       </div>
                    </div>
                  </div>
                </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400 italic bg-gray-50 rounded-3xl">
              Agenda por definir...
            </div>
          )}
        </div>
    </div>
  );
}
