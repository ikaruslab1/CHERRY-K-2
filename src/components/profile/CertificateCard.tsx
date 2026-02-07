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
        <div className="bg-white border boundary-gray-200 rounded-xl p-4 md:p-5 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#DBF227]/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DBF227]/20 text-yellow-800">
                            {cert.events.type || 'Evento'}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                            {formatDate(cert.events.date)}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#373737] leading-tight mb-2 line-clamp-2" title={cert.events.title}>
                        {cert.events.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{cert.events.location || 'FES Acatlán'}</span>
                    </div>
                </div>
                
                <Button 
                    onClick={() => onView(cert)}
                    className="w-full mt-2 bg-[#373737] hover:bg-[#2a2a2a] text-white flex items-center justify-center gap-2"
                >
                    <Eye className="h-4 w-4" />
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
