import { Calendar, Clock, Tag, CheckCircle2, Medal } from 'lucide-react';
import { Event } from '@/types';

interface AgendaItemProps {
    event: Event;
    attendanceCount: number;
    isAttended: boolean;
    isInterested: boolean;
    searchQuery: string;
    onClick: (event: Event) => void;
}

export function AgendaItem({ event, attendanceCount, isAttended, isInterested, searchQuery, onClick }: AgendaItemProps) {
    const eventDate = new Date(event.date);
    const duration = event.duration_days || 1;

    // Determine styles based on status
    // Priority: Attended > Interested > Default
    let gradientStyles = "from-gray-100/50 via-white to-white";
    let borderStyle = "bg-gray-200";

    if (isAttended) {
        gradientStyles = "from-[#DBF227]/30 via-white/80 to-white";
        borderStyle = "bg-[#DBF227]";
    } else if (isInterested) {
        gradientStyles = "from-[#373737]/15 via-white/80 to-white";
        borderStyle = "bg-[#373737]";
    }

    const formatDateRange = () => {
        // Standard format: "mié. 25 oct." or similar depending on browser
        const startStr = eventDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

        if (duration > 1) {
            const endDate = new Date(eventDate);
            endDate.setDate(eventDate.getDate() + (duration - 1));

            const startDayStr = eventDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
            const endDayStr = endDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
            const monthStr = eventDate.toLocaleDateString('es-ES', { month: 'short' });

            return `${startDayStr} - ${endDayStr}, ${monthStr}`;
        }

        return startStr;
    };

    return (
        <button
            onClick={() => onClick(event)}
            className="group relative w-full overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:border-gray-200 hover:shadow-md"
        >
            {/* Left Indicator Strip */}
            <div className={`absolute bottom-0 left-0 top-0 w-1.5 ${borderStyle} transition-colors`} />

            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${gradientStyles} opacity-100 transition-all`} />

            {/* Content Container */}
            <div className="relative flex flex-col gap-3 p-5 pl-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6">

                {/* Main Info */}
                <div className="flex flex-1 flex-col items-start gap-2">
                    {/* Tags & Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md border border-gray-200 bg-white/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 backdrop-blur-sm">
                            {event.type}
                        </span>

                        {event.gives_certificate && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200/10 border border-gray-200/50 px-2.5 py-1 text-[10px] font-bold text-[#373737] shadow-sm">
                                <Medal className="h-3 w-3" /> Otorga constancia
                            </span>
                        )}

                        {/* Search Match Tags */}
                        {event.tags && event.tags.length > 0 && searchQuery && (
                            <>
                                {event.tags
                                    .filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                                    .map(tag => (
                                        <span key={tag} className="inline-flex items-center rounded-md bg-[#DBF227]/20 border border-[#DBF227]/30 px-2 py-0.5 text-[10px] font-bold text-[#373737]">
                                            <Tag className="w-3 h-3 mr-1 opacity-50" /> {tag}
                                        </span>
                                    ))
                                }
                            </>
                        )}
                        {isAttended && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DBF227] px-2.5 py-1 text-[10px] font-bold text-[#373737] shadow-sm">
                                <CheckCircle2 className="h-3 w-3" /> Asistido
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#373737] transition-colors group-hover:text-black">
                        {event.title}
                    </h3>
                </div>

                {/* Date & Time */}
                <div className="flex shrink-0 flex-row items-center gap-4 text-xs font-medium uppercase tracking-wide text-gray-400 sm:flex-col sm:items-end sm:gap-1">
                    {/* Progress Bar for Multi-day Events */}
                    {duration > 1 && attendanceCount > 0 && (
                        <div className="w-full sm:w-24 flex flex-col items-end gap-1 mb-2">
                            <div className="text-[10px] font-bold text-[#373737] normal-case">
                                {attendanceCount}/{duration} Asistencias
                            </div>
                            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                                <div
                                    className="h-full bg-[#DBF227] transition-all duration-500"
                                    style={{ width: `${Math.min((attendanceCount / duration) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDateRange()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>
                            {eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
}
