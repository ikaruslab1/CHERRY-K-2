'use client';

import { useEffect, useState } from 'react';
import { LandingBlock } from '@/types';
import { Calendar, Clock, MapPin, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export function AgendaBlock({ block, conferenceId }: { block: LandingBlock; conferenceId?: string }) {
  const { title, activities = [] } = block.content;
  const [events, setEvents] = useState<any[]>(activities);
  const [loading, setLoading] = useState(!!conferenceId);

  useEffect(() => {
    async function fetchEvents() {
      if (!conferenceId) return;
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, location, type, date')
          .eq('conference_id', conferenceId)
          .order('date', { ascending: true });

        if (data && data.length > 0) {
          const mappedEvents = data.map((e) => {
            const dateObj = new Date(e.date);
            const timeStr = dateObj.toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
              timeZone: 'America/Mexico_City'
            });
            return {
              title: e.title,
              type: e.type,
              time: timeStr,
              location: e.location,
              duration: '60 min', // Generic duration or map from data if available
            };
          });
          setEvents(mappedEvents);
        }
      } catch (err) {
        console.error('Error fetching events for AgendaBlock:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [conferenceId]);

  const [isBannerOpen, setIsBannerOpen] = useState(false);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col items-center mb-16 text-center">
           <Calendar className="w-8 h-8 text-[#adacac] mb-4" />
           <h2 className="text-4xl font-bold text-gray-900 tracking-tighter">
             {title || 'Cronograma del Evento'}
           </h2>
        </div>

        <div className="space-y-4">
          {events.length > 0 ? (
            <>
              {events.map((activity: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="flex gap-6 p-6 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 group"
                >
                  <div className="w-24 flex-shrink-0 pt-1 text-center border-r border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase">Inicio</p>
                    <p className="text-xl font-black text-gray-900">{activity.time}</p>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                       <span className="px-2 py-0.5 bg-black text-white text-[9px] font-bold rounded uppercase">
                         {activity.type || 'Sesión'}
                       </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {activity.title}
                    </h3>
                    <div className="flex items-center gap-4 text-gray-400">
                       <div className="flex items-center gap-1.5 text-[11px] font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{activity.duration || '60 min'}</span>
                       </div>
                       <div className="flex items-center gap-1.5 text-[11px] font-medium">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{activity.location || 'Sala Principal'}</span>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="mt-8 border border-gray-200 rounded-[2.5rem] overflow-hidden bg-gray-100">
                <button 
                  onClick={() => setIsBannerOpen(!isBannerOpen)}
                  className="w-full px-12 py-3 flex items-center justify-between group hover:bg-gray-200/50 transition-colors"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-black transition-colors">
                    Información sobre asistencia e inscripciones
                  </span>
                  <div className={`w-8 h-8 rounded-full border border-black/10 flex items-center justify-center transition-all bg-black text-white ${isBannerOpen ? 'rotate-180' : 'group-hover:scale-110'}`}>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                <AnimatePresence>
                  {isBannerOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                      <div className="px-12 pb-12 space-y-8 text-center border-t border-gray-200/50 pt-8 mt-[-1px]">
                        <p className="text-gray-400 text-[13px] max-w-xl mx-auto leading-relaxed font-medium italic">
                          "Para garantizar una experiencia completa y personalizada durante el evento, te invitamos a acceder a tu cuenta. Al iniciar sesión en nuestro portal, podrás consultar el desglose detallado de cada sesión, inscribirte oficialmente en las actividades de tu interés y gestionar tu asistencia de manera automática para la obtención de tus certificados de participación."
                        </p>
                        <div className="flex justify-center">
                          <button 
                            onClick={() => {
                              document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className="text-[11px] font-black uppercase tracking-[0.2em] text-[#373737] hover:text-black transition-all flex items-center gap-3 group"
                          >
                            <span className="border-b-2 border-transparent group-hover:border-black pb-1">Ingresar al Portal</span>
                            <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-400 italic">
              Agenda por definir...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
