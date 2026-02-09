import { Eye, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Certificate {
    id: string;
    scanned_at: string;
    events: {
      id: string;
      title: string;
      date: string;
      type: string;
      location: string;
      description: string;
      [key: string]: any; // Allow other props like conference_id
    };
    profiles: {
        first_name: string;
        last_name: string;
        degree: string | null;
        gender: string | null;
    }
  }

interface CertificateCardProps {
    cert: Certificate;
    onView: (cert: Certificate) => void;
    formatDate: (date: string) => string;
}

export function CertificateCard({ cert, onView, formatDate }: CertificateCardProps) {
    return (
        <div className="bg-white border boundary-gray-200 rounded-xl p-4 md:p-5 hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-acid)]/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-3">
                <div className="space-y-2">
                    <div className="flex justify-between items-start">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[var(--color-acid)]/20 text-yellow-800">
                            {cert.events.type || 'Evento'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono pt-0.5">
                            {formatDate(cert.events.date)}
                        </span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-[#373737] leading-tight line-clamp-2 min-h-[2.5rem]" title={cert.events.title}>
                        {cert.events.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{cert.events.location || 'FES Acatlán'}</span>
                    </div>
                </div>
                
                <Button 
                    onClick={() => onView(cert)}
                    className="w-full mt-2 bg-[#373737] hover:bg-[#2a2a2a] text-white flex items-center justify-center gap-2 text-xs md:text-sm h-9 md:h-10"
                >
                    <Eye className="h-3.5 w-3.5" />
                    Visualizar
                </Button>
            </div>
        </div>
    );
}

// Re-export interface if needed, or better, move to types.
// For now I'm duplicating or I should import from types ideally.
// But Certificate interface is specific here with the joins.
// I will keep it internal here or move to types.
// The main types file doesn't have this nested structure. 
// I'll leave it as is for now.
