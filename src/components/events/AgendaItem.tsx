import { Calendar, Clock, Tag, CheckCircle2, Medal, Star } from "lucide-react";
import { Event } from "@/types";
import { motion } from "framer-motion";

interface AgendaItemProps {
  event: Event;
  attendanceCount: number;
  isAttended: boolean;
  isInterested: boolean;
  searchQuery: string;
  onClick: (event: Event) => void;
}

export function AgendaItem({
  event,
  attendanceCount,
  isAttended,
  isInterested,
  searchQuery,
  onClick,
}: AgendaItemProps) {
  const eventDate = new Date(event.date);
  const duration = event.duration_days || 1;

  // Clean, minimal styling - only acid green as accent
  let cardBg = "bg-white";
  let borderColor = "border-gray-200";
  let accentBar = "bg-gray-300";

  if (isAttended) {
    // Completed events: Acid green accent
    borderColor = "border-[#DBF227]";
    accentBar = "bg-[#DBF227]";
  } else if (isInterested) {
    // Interested events: Dark accent
    borderColor = "border-slate-500";
    accentBar = "bg-slate-500";
  }

  const formatDateRange = () => {
    const startStr = eventDate.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    if (duration > 1) {
      const endDate = new Date(eventDate);
      endDate.setDate(eventDate.getDate() + (duration - 1));

      const startDayStr = eventDate.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
      });
      const endDayStr = endDate.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
      });
      const monthStr = eventDate.toLocaleDateString("es-ES", {
        month: "short",
      });

      return `${startDayStr} - ${endDayStr}, ${monthStr}`;
    }

    return startStr;
  };

  return (
    <motion.button
      onClick={() => onClick(event)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`group relative w-full overflow-hidden rounded-xl border-2 ${borderColor} ${cardBg} text-left shadow-sm hover:shadow-lg transition-all duration-200`}
    >
      {/* Left Accent Bar - Clean and simple */}
      <div
        className={`absolute bottom-0 left-0 top-0 w-1 ${accentBar} transition-all duration-200`}
      />

      {/* Content Container */}
      <div className="relative flex flex-col gap-3 p-4 pl-5 sm:p-5 sm:pl-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Main Info */}
        <div className="flex flex-1 flex-col items-start gap-2 sm:gap-3">
          {/* Tags & Status - Minimal design */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-gray-300 bg-gray-50 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-600">
              {event.type}
            </span>

            {event.gives_certificate && (
              <span className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-gray-600">
                <Medal className="h-3 w-3" /> Constancia
              </span>
            )}

            {/* Search Match Tags */}
            {event.tags && event.tags.length > 0 && searchQuery && (
              <>
                {event.tags
                  .filter((tag) =>
                    tag.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center rounded-md bg-[#DBF227]/20 border border-[#DBF227] px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#373737]"
                    >
                      <Tag className="w-3 h-3 mr-1" /> {tag}
                    </motion.span>
                  ))}
              </>
            )}
            
            {isAttended && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#DBF227] border border-[#DBF227] px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-black">
                <CheckCircle2 className="h-3 w-3" /> Completado
              </span>
            )}

            {isInterested && !isAttended && (
              <span className="inline-flex items-center gap-1 rounded-md border border-[#373737] bg-white px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-[#373737]">
                <Star className="h-3 w-3" /> Me interesa
              </span>
            )}
          </div>

          {/* Title - Clean and bold */}
          <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-snug text-[#373737] transition-colors duration-200 group-hover:text-black">
            {event.title}
          </h3>
        </div>

        {/* Date & Time - Responsive Layout */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 sm:gap-2.5 min-w-[130px] w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 mt-1 sm:mt-0">
          
          {/* Progress Bar for Multi-day Events - Only on Desktop for simplicity or integrated differently */}
          {duration > 1 && attendanceCount > 0 && (
            <div className="hidden sm:flex w-full flex-col items-end gap-1.5">
              <div className="text-xs font-bold text-[#373737]">
                <span className="text-[#DBF227]">{attendanceCount}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-gray-500">{duration}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((attendanceCount / duration) * 100, 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full bg-[#DBF227]"
                />
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-mono uppercase tracking-wide">{formatDateRange()}</span>
          </div>
          
          {/* Time */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-mono">
              {eventDate.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
