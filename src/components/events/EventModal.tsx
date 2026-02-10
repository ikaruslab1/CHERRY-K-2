'use client';

import { X, Calendar, MapPin, User, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Event } from '@/types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatMexicoTime, formatMexicoDate } from '@/lib/dateUtils';

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  isAttended: boolean;
  isInterested: boolean;
  onToggleInterest: (eventId: string) => void;
  hideActionButtons?: boolean;
}

// Helper to abbreviate degrees
const getDegreeAbbr = (degree?: string) => {
  if (!degree) return '';
  const lower = degree.toLowerCase();
  
  if (lower.includes('doctor')) return 'Dr.';
  if (lower.includes('maestr') || lower.includes('magister')) return 'Mtro.';
  if (lower.includes('licencia')) return 'Lic.';
  if (lower.includes('ingenier')) return 'Ing.';
  if (lower.includes('arquitect')) return 'Arq.';
  
  return degree;
};

export function EventModal({ 
  event, 
  isOpen, 
  onClose, 
  isAttended, 
  isInterested,
  onToggleInterest,
  hideActionButtons
}: EventModalProps) {

  if (!event) return null;

  const eventDate = new Date(event.date);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
      
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Card - Light Theme (Swiss Style) */}
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[85vh] overflow-hidden rounded-none"
      >
        
        {/* Header Image Area - Full Clarity */}
        <div className="relative h-64 shrink-0 bg-gray-100">
          <Image 
            src={event.image_url || "/assets/event-header.png"}
            alt="Event Header"
            fill
            className="object-cover"
            priority
            unoptimized={!!event.image_url}
            sizes="(max-width: 640px) 100vw, 600px"
          />
          {/* Subtle Gradient from bottom for text readability if needed */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Type Badge (Top Right) */}
          <div className="absolute top-4 right-4 z-20">
            <div className="bg-white text-black border border-gray-200 text-xs font-bold uppercase tracking-widest px-4 py-2 shadow-sm">
              {event.type}
            </div>
          </div>
          
           {/* Close Button (Top Left) */}
           <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-white text-black hover:bg-black hover:text-white transition-colors z-20 rounded-full shadow-lg"
          >
            <X className="h-5 w-5" />
          </motion.button>
          
           {/* Date Block - floating over image */}
           <div className="absolute bottom-4 left-6 z-20 flex items-end gap-4">
              <div className="flex flex-col bg-white p-3 shadow-lg min-w-[80px] text-center border-t-4 border-[var(--color-acid)]">
                 <span className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-0.5">
                    {formatMexicoDate(eventDate, { month: 'short' }).replace('.', '')}
                 </span>
                 <span className="text-3xl font-bold text-black tracking-tighter leading-none font-geist-sans">
                    {(() => {
                        const duration = event.duration_days || 1;
                        if (duration > 1) {
                            const endDate = new Date(eventDate);
                            endDate.setDate(eventDate.getDate() + (duration - 1));
                            return `${eventDate.getDate()}-${endDate.getDate()}`;
                        }
                        return eventDate.getDate();
                    })()}
                 </span>
              </div>
           </div>
        </div>

        {/* Content Body - White Background, Black Text */}
        <div className="flex-1 overflow-y-scroll p-8 space-y-8 custom-scrollbar bg-white">
          
          {/* Title & Tags */}
          <div className="space-y-4">
             <h2 className="text-3xl md:text-4xl font-bold text-black leading-[0.95] tracking-tight uppercase break-words text-balance">
               {event.title}
             </h2>

            {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 uppercase tracking-widest border border-gray-200 hover:bg-[var(--color-acid)] hover:text-black hover:border-transparent transition-colors">
                      #{tag}
                    </span>
                ))}
                </div>
            )}
          </div>

          <div className="h-px w-full bg-gray-100" />

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Location */}
               <div className="flex gap-4 group">
                    <div className="p-3 bg-gray-50 text-black border border-gray-100 h-fit">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ubicación</h4>
                        <p className="text-base text-black font-medium group-hover:underline decoration-[var(--color-acid)] decoration-2 underline-offset-4 transition-all">
                            {event.location}
                        </p>
                    </div>
               </div>

               {/* Speaker */}
               {event.speaker && (
                   <div className="flex gap-4">
                        <div className="p-3 bg-gray-50 text-black border border-gray-100 h-fit">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                              {(() => {
                                const type = event.type || '';
                                return type === 'Taller' ? 'Tallerista' : 'Speaker';
                              })()}
                            </h4>
                            <p className="text-base text-black font-medium">
                                 {getDegreeAbbr(event.speaker.degree)} {event.speaker.first_name} {event.speaker.last_name}
                            </p>
                        </div>
                   </div>
                )}
                
                {/* Time */}
                <div className="flex gap-4">
                    <div className="p-3 bg-gray-50 text-black border border-gray-100 h-fit">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Horario</h4>
                        <p className="text-base text-black font-medium">
                            {formatMexicoTime(eventDate)}
                        </p>
                    </div>
                </div>
          </div>

          <div className="h-px w-full bg-gray-100" />

          {/* Description */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sobre la actividad</h4>
            <div 
                className="text-gray-600 text-base leading-relaxed prose prose-neutral max-w-none font-geist-sans"
                dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
          
        </div>

         {/* Fixed Footer - White */}
         {!hideActionButtons && (
          <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10">
            {isAttended ? (
              <div className="w-full py-4 text-sm font-bold text-black bg-gray-100 border border-gray-200 flex items-center justify-center gap-3 uppercase tracking-widest cursor-default">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Asistencia confirmada
              </div>
            ) : (
              <Button 
                  onClick={() => onToggleInterest(event.id)}
                  className={`w-full h-14 text-sm tracking-[0.15em] uppercase font-bold transition-all ${
                    isInterested 
                      ? "bg-white text-red-500 border-2 border-red-100 hover:bg-red-50 hover:border-red-200"
                      : "bg-black text-white hover:bg-[var(--color-acid)] hover:text-black hover:shadow-xl border border-transparent hover:border-black/10"
                  }`}
              >
                  {isInterested ? "Remover de mi agenda" : "Me interesa asistir"}
              </Button>
            )}
        </div>
        )}
      </motion.div>
    </div>
  );
}
