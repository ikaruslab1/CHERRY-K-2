'use client';

import { useEffect, useState } from 'react';
import { 
  X, Calendar, MapPin, User, CheckCircle2, Clock, 
  FileText, FileSpreadsheet, Table, FileImage, Image as ImageIcon, 
  Presentation, MonitorPlay, FileCode, BookOpen, Library, 
  ClipboardList, GraduationCap, School, Award, FileBadge, 
  Bookmark, Download, Video, Camera, Cast, Radio, Link as LinkIcon, 
  ExternalLink, Mic, PlayCircle, Monitor, Laptop, 
  LocateFixed, Building2, Landmark, Users, User as UserIcon, 
  Contact, BadgeAlert, Info, HelpCircle, Share2, MessageCircle, 
  Mail, Printer, MessageSquare, Youtube, Facebook, Twitter, Instagram, 
  Linkedin, Github, Globe, MessageSquareQuote, Settings, Bell, Search, 
  Heart, Star, Coffee, Briefcase, Home
} from 'lucide-react';
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
  onMarkAttendance?: (eventId: string) => void;
  hideActionButtons?: boolean;
}

const getDegreeAbbr = (degree?: string, gender?: string) => {
  if (!degree) return '';
  const lower = degree.toLowerCase();
  const isFemale = gender?.toLowerCase() === 'femenino' || gender?.toLowerCase() === 'mujer';
  
  if (lower.includes('doctor')) return isFemale ? 'Dra.' : 'Dr.';
  if (lower.includes('maestr')) return isFemale ? 'Mtra.' : 'Mtro.';
  if (lower.includes('licencia')) return 'Lic.';
  if (lower.includes('ingenier')) return isFemale ? 'Ing.' : 'Ing.'; // Ing. is usually neutral or Ing./Inga. but standard is Ing.
  if (lower.includes('arquitect')) return 'Arq.';
  if (lower.includes('profesor')) return isFemale ? 'Profa.' : 'Prof.';
  if (lower.includes('estudiante') || lower.includes('alumno')) return ''; // No prefix for students

  return degree;
};

const ICON_MAP: Record<string, any> = {
  'file-text': FileText,
  'file-pdf': FileText,
  'file-spreadsheet': FileSpreadsheet,
  'table': Table,
  'file-image': FileImage,
  'image': ImageIcon,
  'presentation': Presentation,
  'projection-screen': MonitorPlay,
  'file-code': FileCode,
  'book-open': BookOpen,
  'library': Library,
  'clipboard-list': ClipboardList,
  'graduation-cap': GraduationCap,
  'academic-cap': School,
  'award': Award,
  'certificate': FileBadge,
  'bookmark': Bookmark,
  'download': Download,
  'video': Video,
  'video-camera': Camera,
  'cast': Cast,
  'broadcast': Radio,
  'link': LinkIcon,
  'external-link': ExternalLink,
  'microphone': Mic,
  'play-circle': PlayCircle,
  'monitor': Monitor,
  'desktop': Laptop,
  'calendar': Calendar,
  'clock': Clock,
  'map-pin': MapPin,
  'location': LocateFixed,
  'building': Building2,
  'landmark': Landmark,
  'users': Users,
  'user': UserIcon,
  'id-card': Contact,
  'badge': BadgeAlert,
  'info': Info,
  'info-circle': Info,
  'help-circle': HelpCircle,
  'question-mark': HelpCircle,
  'share-2': Share2,
  'message-square': MessageSquare,
  'chat': MessageCircle,
  'mail': Mail,
  'printer': Printer,
  'zoom': Video,
  'moodle': GraduationCap,
  'classroom': School,
  'youtube': Youtube,
  'facebook': Facebook,
  'twitter': Twitter,
  'instagram': Instagram,
  'linkedin': Linkedin,
  'github': Github,
  'globe': Globe,
  'quote': MessageSquareQuote,
  'settings': Settings,
  'bell': Bell,
  'search': Search,
  'heart': Heart,
  'star': Star,
  'coffee': Coffee,
  'work': Briefcase,
  'home': Home,
};

export function EventModal({ 
  event, 
  isOpen, 
  onClose, 
  isAttended, 
  isInterested,
  onToggleInterest,
  onMarkAttendance,
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
          
           {/* Date & Time Block - Unified & Polished */}
           <div className="absolute bottom-0 left-6 z-20 transform translate-y-1/4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex bg-white">
              {/* Accent Strip */}
              <div className="w-1.5 bg-[var(--color-acid)]"></div>
              
              <div className="flex divide-x divide-gray-100">
                  {/* Date Part */}
                  <div className="p-3 px-5 flex flex-col items-center justify-center bg-white">
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                          {formatMexicoDate(eventDate, { month: 'short' }).replace('.', '')}
                       </span>
                       <span className="text-3xl font-black text-[#373737] tracking-tight leading-none font-geist-sans">
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

                  {/* Time Part */}
                  <div className="p-3 px-5 flex flex-col justify-center items-start min-w-[110px] bg-white">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> Hora
                       </span>
                       <span className="text-xl font-bold text-[#373737] tracking-tight leading-none font-geist-sans">
                          {formatMexicoTime(eventDate)}
                       </span>
                  </div>
              </div>
           </div>
        </div>

        {/* Content Body - White Background, Black Text */}
        <div className="flex-1 overflow-y-scroll p-8 pt-12 space-y-8 custom-scrollbar bg-white">
          
          {/* Title & Tags */}
          <div className="space-y-4">
             <h2 className="text-3xl md:text-4xl font-bold text-black leading-[0.95] tracking-tight uppercase break-words text-balance">
               {event.title}
             </h2>

            {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                {event.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1 uppercase tracking-widest border border-gray-200 hover:bg-[var(--color-acid)] hover:text-[var(--color-acid-text)] hover:border-transparent transition-colors">
                      #{tag}
                    </span>
                ))}
                </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sobre la actividad</h4>
                <div 
                    className="text-gray-600 text-base leading-relaxed prose prose-neutral max-w-none font-geist-sans"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                />
            </div>
          )}

          {/* Custom Links */}
          {event.custom_links && event.custom_links.length > 0 && (
            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recursos y Enlaces</h4>
              <div className="grid grid-cols-1 gap-3">
                {event.custom_links.map((link, idx) => {
                  const IconComp = ICON_MAP[link.icon] || LinkIcon;
                  return (
                    <a 
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 hover:border-[var(--color-acid)] hover:bg-white transition-all group"
                    >
                      <div className="p-2 bg-white border border-gray-100 group-hover:bg-[var(--color-acid)] group-hover:text-[var(--color-acid-text)] transition-colors">
                        <IconComp size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-black uppercase tracking-wider">{link.label}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[250px] font-mono">{link.url}</p>
                      </div>
                      <ExternalLink size={14} className="text-gray-300 group-hover:text-[var(--color-acid-text)] transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

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
               {/* Speakers */}
               {(event.speakers && event.speakers.length > 0) ? (
                   <div className="flex gap-4 md:col-span-2">
                        <div className="p-3 bg-gray-50 text-black border border-gray-100 h-fit shrink-0">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                              {(() => {
                                  const type = (event.type || '').toLowerCase();
                                  const count = event.speakers.length;
                                  
                                  if (type.includes('conferencia')) return count > 1 ? 'Conferencistas' : 'Conferencista';
                                  if (type.includes('ponencia')) return count > 1 ? 'Ponentes' : 'Ponente';
                                  if (type.includes('taller')) return count > 1 ? 'Talleristas' : 'Tallerista';
                                  if (type.includes('actividad')) return 'Preside'; // Fixed static label as requested
                                  
                                  return count > 1 ? 'Ponentes' : 'Ponente';
                              })()}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {event.speakers.map((speaker, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-2 border border-transparent hover:bg-gray-50 hover:border-gray-100 rounded-lg transition-colors group">
                                         <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200 group-hover:bg-[#DBF227] group-hover:text-black group-hover:border-transparent transition-colors">
                                            {speaker.first_name?.[0]}{speaker.last_name?.[0]}
                                         </div>
                                         <div className="min-w-0">
                                            <p className="text-sm font-bold text-black leading-tight text-balance">
                                                {getDegreeAbbr(speaker?.degree, speaker?.gender)} {speaker.first_name} {speaker.last_name}
                                            </p>
                                         </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                   </div>
               ) : event.speaker && (
                   <div className="flex gap-4">
                        <div className="p-3 bg-gray-50 text-black border border-gray-100 h-fit">
                            <User className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                              {(() => {
                                  const type = (event.type || '').toLowerCase();
                                  if (type.includes('conferencia')) return 'Conferencista';
                                  if (type.includes('ponencia')) return 'Ponente';
                                  if (type.includes('taller')) return 'Tallerista';
                                  if (type.includes('actividad')) return 'Preside';
                                  return 'Speaker';
                              })()}
                            </h4>
                            <p className="text-base text-black font-medium">
                                 {getDegreeAbbr(event.speaker.degree, event.speaker.gender)} {event.speaker.first_name} {event.speaker.last_name}
                            </p>
                        </div>
                   </div>
                )}
                

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
                      : "bg-black text-white hover:bg-[var(--color-acid)] hover:text-[var(--color-acid-text)] hover:shadow-xl border border-transparent hover:border-black/10"
                  }`}
              >
                  {isInterested ? "Remover de mi agenda" : "Me interesa asistir"}
              </Button>
            )}

            {/* Auto-attendance Button */}
            {!isAttended && event.auto_attendance && onMarkAttendance && (
                <div className="mt-4">
                    {(() => {
                        const now = new Date();
                        const eventStart = new Date(event.date);
                        const limitMinutes = event.auto_attendance_limit || 60;
                        const eventEndLimit = new Date(eventStart.getTime() + limitMinutes * 60000);
                        const isActive = now >= eventStart && now <= eventEndLimit;

                        if (isActive) {
                            return (
                                <Button 
                                    onClick={() => onMarkAttendance(event.id)}
                                    className="w-full h-12 text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200/50 flex items-center justify-center gap-2 uppercase tracking-widest transition-all animate-pulse-subtle"
                                >
                                    <CheckCircle2 className="h-5 w-5" />
                                    Pasar asistencia ahora
                                </Button>
                            );
                        } else if (now < eventStart) {
                            return (
                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                                    La auto-asistencia se activará al iniciar el evento
                                </p>
                            );
                        } else {
                            return (
                                <p className="text-[10px] text-center text-red-400 font-bold uppercase tracking-widest">
                                    El tiempo de auto-asistencia ha expirado
                                </p>
                            );
                        }
                    })()}
                </div>
            )}
        </div>
        )}
      </motion.div>
    </div>
  );
}
