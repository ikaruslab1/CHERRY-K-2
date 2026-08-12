import { 
  Calendar, Clock, Tag, CheckCircle2, Medal, Star, 
  FileText, FileSpreadsheet, Table, FileImage, Image as ImageIcon, 
  Presentation, MonitorPlay, FileCode, BookOpen, Library, 
  ClipboardList, GraduationCap, School, Award, FileBadge, 
  Bookmark, Download, Video, Camera, Cast, Radio, Link as LinkIcon, 
  ExternalLink, Mic, PlayCircle, Monitor, Laptop, 
  LocateFixed, Building2, Landmark, Users, User as UserIcon, 
  Contact, BadgeAlert, Info, HelpCircle, Share2, MessageCircle, 
  Mail, Printer, MessageSquare, Youtube, Facebook, Twitter, Instagram, 
  Linkedin, Github, Globe, MessageSquareQuote, Settings, Bell, Search, 
  Heart, Coffee, Briefcase, Home, MapPin
} from "lucide-react";
import { Event } from "@/types";
import { motion } from "framer-motion";
import { formatMexicoTime, formatMexicoDate } from "@/lib/dateUtils";
import { useLanguage } from '@/context/LanguageContext';
import { getTranslatedField } from '@/utils/i18nHelpers';

interface AgendaItemProps {
  event: Event;
  attendanceCount: number;
  isAttended: boolean;
  isInterested: boolean;
  searchQuery: string;
  onClick: (event: Event) => void;
}

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

export function AgendaItem({
  event,
  attendanceCount,
  isAttended,
  isInterested,
  searchQuery,
  onClick,
}: AgendaItemProps) {
  const { language, t } = useLanguage();
  const locale = language === 'es' ? 'es-MX' : 'en-US';
  const eventDate = new Date(event.date);
  const duration = event.duration_days || 1;

  // Clean, minimal styling - only acid green as accent
  let cardBg = "bg-white";
  let borderColor = "border-gray-200";
  let accentBar = "bg-gray-300";

  if (isAttended) {
    // Completed events: Acid green accent
    borderColor = "border-[var(--color-acid)]";
    accentBar = "bg-[var(--color-acid)]";
  } else if (isInterested) {
    // Interested events: Dark accent
    borderColor = "border-slate-500";
    accentBar = "bg-slate-500";
  }

  const formatDateRange = () => {
    const startStr = formatMexicoDate(eventDate, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }, locale);

    if (duration > 1) {
      const endDate = new Date(eventDate);
      endDate.setDate(eventDate.getDate() + (duration - 1));

      const startDayStr = formatMexicoDate(eventDate, {
        weekday: "short",
        day: "numeric",
      }, locale);
      const endDayStr = formatMexicoDate(endDate, {
        weekday: "short",
        day: "numeric",
      }, locale);
      const monthStr = formatMexicoDate(eventDate, {
        month: "short",
      }, locale);

      return `${startDayStr} - ${endDayStr}, ${monthStr}`;
    }

    return startStr;
  };

  // Dynamic styles based on state
  const isDark = false; // Always light theme - no dark card mode
  
  const containerBase = "group relative flex w-full flex-col sm:flex-row overflow-hidden rounded-2xl border transition-all duration-300";
  const containerStyles = isAttended 
    ? "bg-white border-[var(--color-acid)] shadow-sm" 
    : isInterested 
      ? "bg-white border-[var(--color-acid)]/40 shadow-sm hover:border-[var(--color-acid)] hover:shadow-md" 
      : "bg-white border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md";

  const stubStyles = isAttended
    ? "bg-[var(--color-acid)] text-[#121212]"
    : isInterested
      ? "bg-[var(--color-acid)]/10 text-gray-600 border-l border-[var(--color-acid)]/30"
      : "bg-gray-50 text-gray-500 border-l border-gray-200 border-dashed";

  return (
    <div className="relative w-full"> 
      {/* We use a div wrapper to handle the 'detachment' visual which might break the button container logic if we split them too far, 
          but for simplicity we keep the button semantic or structure. 
          Actually, let's keep it as a button but handle the stub animation internally. */}
      
      <motion.button
        onClick={() => onClick(event)}
        className={`${containerBase} ${containerStyles}`}
        layout
      >
        {/* Left Section - Main Content */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col gap-4 relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border bg-gray-900 text-white border-gray-900`}>
                      {getTranslatedField(event, 'type', language)}
                  </span>

                  {event.gives_certificate && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider border-gray-200 bg-gray-50 text-gray-600`}>
                          <Medal className="h-3 w-3" /> {t('agenda.certificate')}
                      </span>
                  )}
                  
                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && searchQuery && (
                    <>
                      {event.tags
                        .filter((tag) =>
                          tag.toLowerCase().includes(searchQuery.toLowerCase()),
                        )
                        .map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--color-acid)] text-[10px] font-bold uppercase text-black">
                             {tag}
                          </span>
                        ))}
                    </>
                  )}
              </div>

              {/* Progress for Multi-day Events */}
              {(event.duration_days || 1) > 1 && (
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-amber-50 border-amber-100 text-amber-700`}>
                      {attendanceCount >= (event.duration_days || 1) ? (
                         <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                         <Clock className="h-3.5 w-3.5" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                          {t('agenda.attendance_count')} {Math.min(attendanceCount, event.duration_days || 1)}/{event.duration_days || 1}
                      </span>
                  </div>
              )}

              {/* Interest Star Indicator (when active) */}
              {isInterested && !isAttended && (
                 <div className="bg-[var(--color-acid)] text-black p-1.5 rounded-full shadow-[0_0_10px_rgba(219,242,39,0.3)]">
                    <Star className="w-3 h-3 fill-black" />
                 </div>
              )}
          </div>

          <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-geist-sans">{formatMexicoTime(eventDate, locale)}</span>
              
              <h3 className={`pb-4 text-xl sm:text-2xl font-bold leading-tight tracking-tight text-[#121212]`}>
                  {getTranslatedField(event, 'title', language)}
              </h3>
              
              <div className="flex flex-col gap-1.5">
                  {event.location && (
                  <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mt-1 text-gray-400`}>
                      <MapPin className="h-3.5 w-3.5" />
                      {getTranslatedField(event, 'location', language)}
                  </div>
                )}
              </div>
          </div>

          {/* Links */}
          {event.custom_links && event.custom_links.length > 0 && (
              <div className="mt-auto pt-2 flex gap-2">
                  {event.custom_links.map((link, idx) => {
                      const IconComp = ICON_MAP[link.icon] || LinkIcon;
                      return (
                          <div key={idx} className={`p-1.5 rounded-lg border transition-colors border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black`} title={link.label}>
                              <IconComp size={14} />
                          </div>
                      );
                  })}
              </div>
          )}
        </div>

        {/* Perforation / Connector - Animated only if attended */}
        <div className={`hidden sm:flex flex-col items-center justify-between py-3 relative w-6 z-20`}>
           <div className={`absolute top-[-50%] bottom-[-50%] left-1/2 w-0 border-r-2 border-dashed border-gray-200`} />
           <div className={`absolute top-[-6px] left-[50%] translate-x-[-50%] h-3 w-3 rounded-full bg-[var(--background)] z-30`} />
           <div className={`absolute bottom-[-6px] left-[50%] translate-x-[-50%] h-3 w-3 rounded-full bg-[var(--background)] z-30`} />
        </div>

         {/* Mobile Perforation */}
        <div className="flex sm:hidden flex-row items-center justify-between px-3 relative h-6 w-full z-20">
           <div className={`absolute left-[-50%] right-[-50%] top-1/2 h-0 border-b-2 border-dashed border-gray-200`} />
           <div className={`absolute left-[-6px] top-[50%] translate-y-[-50%] h-3 w-3 rounded-full bg-[var(--background)] z-30`} />
           <div className={`absolute right-[-6px] top-[50%] translate-y-[-50%] h-3 w-3 rounded-full bg-[var(--background)] z-30`} />
        </div>

        {/* Right Section - Stub */}
        <motion.div 
          className={`
            relative w-full sm:w-48 p-5 flex flex-col items-center justify-center text-center gap-2
            ${stubStyles}
          `}
          animate={isAttended ? { 
            x: 8, 
            rotate: 2,
            y: 2,
            scale: 0.98,
            boxShadow: "2px 4px 12px rgba(0,0,0,0.1)"
          } : { x: 0, rotate: 0, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            {isAttended && (
                <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-5 h-5 text-black" />
                </div>
            )}
            
            <div className="flex flex-col items-center">
              <span className="font-mono text-[10px] uppercase opacity-60 mb-0.5">{t('agenda.time')}</span>
              <span className="text-2xl font-bold tracking-tight">
                  {formatMexicoTime(eventDate, locale)}
              </span>
            </div>
            
             <div className="w-8 h-[1px] bg-current opacity-20 my-1"></div>

             <div className="flex flex-col items-center">
               <span className="font-mono text-[10px] uppercase opacity-60">
                 {duration > 1 ? t('agenda.duration') : t('agenda.date')}
               </span>
               <span className="font-mono text-xs font-bold uppercase">
                  {formatDateRange()}
               </span>
             </div>
        </motion.div>
      </motion.button>
    </div>
  );
}

