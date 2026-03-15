'use client';

import { LandingBlock } from '@/types';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function AgendaBlock({ block }: { block: LandingBlock }) {
  const { title, activities = [] } = block.content;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col items-center mb-16 text-center">
           <Calendar className="w-8 h-8 text-[#DBF227] mb-4" />
           <h2 className="text-4xl font-bold text-gray-900 tracking-tighter">
             {title || 'Cronograma del Evento'}
           </h2>
        </div>

        <div className="space-y-4">
          {activities.length > 0 ? activities.map((activity: any, idx: number) => (
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
                   <span className="px-2 py-0.5 bg-black text-[#DBF227] text-[9px] font-bold rounded uppercase">
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

              <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                 <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#DBF227] hover:text-black transition-colors">
                    +
                 </button>
              </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center text-gray-400 italic">
              Agenda por definir...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
