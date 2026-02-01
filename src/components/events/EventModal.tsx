'use client';

import { X, Calendar, MapPin, User, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Event } from '@/types';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  isAttended: boolean;
  isInterested: boolean;
  onToggleInterest: (eventId: string) => void;
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
  onToggleInterest 
}: EventModalProps) {
  const [show, setShow] = useState(isOpen);


  useEffect(() => {
    setShow(isOpen);
  }, [isOpen]);



  if (!event || !show) return null;

  const eventDate = new Date(event.date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        
        {/* Header Image Area - Fixed Height */}
        <div className="relative h-40 shrink-0 bg-[#1a1a2e]">
          <Image 
            src={event.image_url || "/assets/event-header.png"}
            alt="Event Header"
            fill
            className="object-cover opacity-90"
            priority
            unoptimized={!!event.image_url}
            sizes="(max-width: 640px) 100vw, 520px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 transition-colors backdrop-blur-md z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Type Tag */}
          <div className="absolute top-4 right-4 z-10">
            <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
              {event.type}
            </span>
          </div>
          
           {/* Date Overlay - Bottom Left of Image */}
           <div className="absolute bottom-4 left-6 text-white z-10">
             <div className="flex items-center gap-2">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1.5 flex flex-col items-center justify-center min-w-[3.5rem]">
                    <span className="text-[10px] uppercase font-bold text-white/80">
                        {eventDate.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
                    </span>
                    <span className="text-xl font-bold leading-none">
                        {(() => {
                          const duration = event.duration_days || 1;
                          if (duration > 1) {
                            const endDate = new Date(eventDate);
                            endDate.setDate(eventDate.getDate() + (duration - 1));
                            return `${eventDate.getDate()} - ${endDate.getDate()}`;
                          }
                          return eventDate.getDate();
                        })()}
                    </span>
                </div>
                <div className="flex flex-col">
                     <span className="text-sm font-medium text-white/90">
                        {(() => {
                          const duration = event.duration_days || 1;
                          const startDay = eventDate.toLocaleDateString('es-ES', { weekday: 'long' });
                          
                          if (duration > 1) {
                            const endDate = new Date(eventDate);
                            endDate.setDate(eventDate.getDate() + (duration - 1));
                            const endDay = endDate.toLocaleDateString('es-ES', { weekday: 'long' });
                            return `${startDay} - ${endDay}`;
                          }
                          
                          return startDay;
                        })()}
                     </span>
                     <span className="text-xs text-white/70 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                         {eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                     </span>
                </div>
             </div>
           </div>


        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Header Section: Title & Tags */}
          <div className="space-y-3">
             <h2 className="text-2xl font-bold text-[#373737] leading-tight">
               {event.title}
             </h2>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                    #{tag}
                    </span>
                ))}
                </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#373737]">Acerca del evento</h4>
            <div 
                className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1"
                dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
          
           {/* Information Section */}
           <div className="pt-4 border-t border-gray-100 space-y-4">
               {/* Location */}
               <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-[#373737]">Ubicación</h4>
                        <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
               </div>

               {/* Speaker */}
               {event.speaker && (
                   <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-[#373737]">
                              {(() => {
                                const type = event.type || '';
                                const gender = event.speaker?.gender || 'Neutro';
                                
                                if (type === 'Taller') return 'Tallerista';
                                if (type === 'Conferencia') return 'Conferencista';
                                if (type === 'Conferencia Magistral') return 'Conferencista Magistral';
                                if (type === 'Ponencia') return 'Ponente';
                                
                                if (type === 'Actividad') {
                                  if (gender === 'Masculino') return 'Encargado';
                                  if (gender === 'Femenino') return 'Encargada';
                                  return 'Encargade';
                                }
                                
                                return 'Ponente'; // Default fallback
                              })()}
                            </h4>
                            <p className="text-sm text-gray-600">
                                 {getDegreeAbbr(event.speaker.degree)} {event.speaker.first_name} {event.speaker.last_name}
                            </p>
                        </div>
                   </div>
                )}
           </div>
        </div>

         {/* Fixed Footer for Action */}
         <div className="p-4 border-t border-gray-100 bg-white shrink-0">
            {isAttended ? (
              <div className="w-full py-3 px-4 text-sm font-bold text-[#373737] bg-[#DBF227]/20 border border-[#DBF227] rounded-xl flex items-center justify-center gap-2 cursor-default">
                <CheckCircle2 className="h-4 w-4 text-[#373737]" />
                Asistencia confirmada
              </div>
            ) : (
              <Button 
                  onClick={() => onToggleInterest(event.id)}
                  variant={isInterested ? "secondary" : "primary"}
                  className={`w-full py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.98] rounded-xl ${
                    isInterested 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                      : 'bg-[#373737] hover:bg-[#222] text-white'
                  }`}
              >
                  {isInterested ? "Ya no me interesa" : "Me interesa asistir"}
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
