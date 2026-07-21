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
  Heart, Star, Coffee, Briefcase, Home, ZoomIn, ZoomOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Event } from '@/types';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatMexicoTime, formatMexicoDate } from '@/lib/dateUtils';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslatedField } from '@/utils/i18nHelpers';
import { supabase } from '@/lib/supabase';
import { submitRating } from '@/actions/ratings';

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  isAttended: boolean;
  isInterested: boolean;
  onToggleInterest: (eventId: string) => void;
  onMarkAttendance?: (eventId: string) => void;
  hideActionButtons?: boolean;
  attendanceCount?: number;
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
  hideActionButtons,
  attendanceCount
}: EventModalProps) {
  const { language, t } = useLanguage();
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  const [zoomedImageSrc, setZoomedImageSrc] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Rating and Feedback States
  const [userRating, setUserRating] = useState<number>(0);
  const [userComment, setUserComment] = useState<string>('');
  const [ratingLoaded, setRatingLoaded] = useState<boolean>(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRating() {
      if (!event || !isOpen || !isAttended) {
        setRatingLoaded(false);
        setUserRating(0);
        setUserComment('');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('event_ratings')
        .select('rating, comment')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setUserRating(data.rating);
        setUserComment(data.comment || '');
      }
      setRatingLoaded(true);
    }
    loadRating();
  }, [event?.id, isOpen, isAttended]);

  const handleSaveRating = async () => {
    if (userRating < 1 || !event) return;
    setSubmittingRating(true);
    setSubmitError(null);
    const res = await submitRating(event.id, userRating, userComment);
    setSubmittingRating(false);
    if (!res.success) {
      setSubmitError(res.error || 'Ocurrió un error al guardar la calificación');
    }
  };

  useEffect(() => {
    const handleDescriptionClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.classList.contains('zoomable-image')) {
        setZoomedImageSrc((target as HTMLImageElement).src);
        setZoomLevel(1);
      }
    };

    const container = document.getElementById('event-description-container');
    if (container) {
      container.addEventListener('click', handleDescriptionClick);
      return () => container.removeEventListener('click', handleDescriptionClick);
    }
  }, [event?.description, isOpen]);

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
        className="relative w-full max-w-2xl bg-white shadow-2xl flex flex-col h-[95vh] sm:h-[90vh] overflow-hidden rounded-t-3xl sm:rounded-2xl"
      >
        
        {/* Header Image Area - Full Clarity */}
        <div 
          className="relative h-64 shrink-0 overflow-hidden"
          style={{ backgroundColor: !event.image_url ? 'var(--color-acid)' : '#f3f4f6' }}
        >
          {event.image_url ? (
            <Image 
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              priority
              unoptimized
              sizes="(max-width: 640px) 100vw, 600px"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <div 
                className="p-4 rounded-full border-2 border-[var(--color-acid-text)] opacity-10 flex items-center justify-center"
              >
                <ImageIcon size={48} className="text-[var(--color-acid-text)]" />
              </div>
              <span className="text-[10px] font-black text-[var(--color-acid-text)] uppercase tracking-[0.3em] opacity-30">
                {getTranslatedField(event, 'type', language)}
              </span>
            </div>
          )}
          {/* Subtle Gradient from bottom for text readability if needed */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Type Badge (Top Right) */}
          <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
            <div className="bg-white text-black border border-gray-200 text-xs font-bold uppercase tracking-widest px-4 py-2 shadow-sm">
              {getTranslatedField(event, 'type', language)}
            </div>
            
            {/* Multi-day Progress Badge */}
            {(event.duration_days || 1) > 1 && (
               <div className="bg-amber-500/90 backdrop-blur-sm text-white border border-amber-400/50 text-xs font-bold uppercase tracking-widest px-4 py-2 shadow-sm flex items-center gap-2 transition-all hover:bg-amber-600">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Progreso: {Math.min(attendanceCount || 0, event.duration_days || 1)}/{event.duration_days}</span>
               </div>
            )}
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
                          {formatMexicoDate(eventDate, { month: 'short' }, locale).replace('.', '')}
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
                          <Clock className="h-3 w-3" /> {t('event.time')}
                       </span>
                       <span className="text-xl font-bold text-[#373737] tracking-tight leading-none font-geist-sans">
                          {formatMexicoTime(eventDate, locale)}
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
               {getTranslatedField(event, 'title', language)}
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
          {getTranslatedField(event, 'description', language) && (
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('event.about')}</h4>
                <div 
                    id="event-description-container"
                    className="text-gray-600 text-base leading-relaxed prose prose-neutral max-w-none font-geist-sans"
                    dangerouslySetInnerHTML={{ __html: getTranslatedField(event, 'description', language) }}
                />
            </div>
          )}

          {/* Calificación / Retroalimentación */}
          {isAttended && ratingLoaded && (
             <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl space-y-4 animate-in fade-in duration-300">
                 <div className="flex items-center justify-between">
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                         Califica esta actividad
                     </h4>
                     {userRating > 0 && (
                         <span className="text-[10px] bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                             Guardado
                         </span>
                     )}
                 </div>
                 
                 <p className="text-xs text-gray-500">
                     Tu opinión nos ayuda a mejorar los próximos eventos. La calificación es anónima.
                 </p>

                 {/* Stars Selector */}
                 <div className="flex gap-2 justify-center py-2">
                     {[1, 2, 3, 4, 5].map((star) => (
                         <button
                             key={star}
                             type="button"
                             onClick={() => setUserRating(star)}
                             className="transition-transform active:scale-90 hover:scale-110 focus:outline-none cursor-pointer"
                         >
                             <Star 
                                 className={cn(
                                     "w-8 h-8",
                                     star <= userRating 
                                         ? "text-amber-400 fill-amber-400" 
                                         : "text-gray-300"
                                 )} 
                             />
                         </button>
                     ))}
                 </div>

                 {/* Comment Box */}
                 {userRating > 0 && (
                     <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                         <textarea
                             value={userComment}
                             onChange={(e) => setUserComment(e.target.value)}
                             placeholder="Escribe un comentario breve sobre la ponencia (opcional)..."
                             rows={2}
                             className="w-full text-sm p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#DBF227] transition-all resize-none text-black"
                             maxLength={500}
                         />
                         
                         {submitError && (
                             <p className="text-xs text-red-500 font-medium">{submitError}</p>
                         )}

                         <Button
                             onClick={handleSaveRating}
                             disabled={submittingRating}
                             className="w-full bg-black text-white hover:bg-[var(--color-acid)] hover:text-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                         >
                             {submittingRating ? 'Guardando...' : 'Enviar Retroalimentación'}
                         </Button>
                     </div>
                 )}
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
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('event.location')}</h4>
                         <p className="text-base text-black font-medium group-hover:underline decoration-[var(--color-acid)] decoration-2 underline-offset-4 transition-all">
                             {getTranslatedField(event, 'location', language)}
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
                {t('event.attendance_confirmed')}
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
                  {isInterested ? t('event.remove_interested_btn') : t('event.interested_btn')}
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
                                    {t('event.mark_attendance_btn')}
                                </Button>
                            );
                        } else if (now < eventStart) {
                            return (
                                <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">
                                    {t('event.auto_attendance_soon')}
                                </p>
                            );
                        } else {
                            return (
                                <p className="text-[10px] text-center text-red-400 font-bold uppercase tracking-widest">
                                    {t('event.auto_attendance_expired')}
                                </p>
                            );
                        }
                    })()}
                </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Fullscreen Image Overlay */}
      {zoomedImageSrc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95">
          {/* Close button */}
          <button 
            onClick={() => setZoomedImageSrc(null)}
            className="absolute top-6 right-6 z-[210] p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Zoom controls menu */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 p-3 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 opacity-30 hover:opacity-100 transition-opacity z-[210] shadow-2xl group">
            <button 
              onClick={() => setZoomLevel(prev => Math.max(0.2, prev - 0.25))}
              className="p-3 bg-white/5 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="Alejar"
            >
               <ZoomOut className="w-6 h-6" />
            </button>
            <span className="text-white font-mono font-bold w-12 text-center text-sm">
                {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={() => setZoomLevel(prev => Math.min(4, prev + 0.25))}
              className="p-3 bg-white/5 hover:bg-white/20 rounded-xl text-white transition-colors"
              title="Acercar"
            >
               <ZoomIn className="w-6 h-6" />
            </button>
          </div>

          {/* Draggable/Zoomable Image Area */}
          <div className="w-full h-full overflow-auto flex items-center justify-center custom-scrollbar" onClick={(e) => {
              if (e.target === e.currentTarget) setZoomedImageSrc(null);
          }}>
              <img 
                src={zoomedImageSrc} 
                className="max-w-none transition-transform duration-200 ease-out origin-center"
                style={{ transform: `scale(${zoomLevel})` }}
                alt="Zoomed"
              />
          </div>
        </div>
      )}

    </div>
  );
}
