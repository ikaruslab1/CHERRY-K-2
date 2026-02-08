import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { Certificate } from '@/types/certificates';
import { CertificateCard } from '../CertificateCard';

interface CertificateListProps {
  title: string;
  description: string;
  certificates: Certificate[];
  onView: (cert: Certificate) => void;
  formatDate: (date: string) => string;
  type: 'attendee' | 'speaker' | 'staff' | 'organizer';
  delay?: number;
}

export function CertificateList({ 
  title, 
  description, 
  certificates, 
  onView, 
  formatDate, 
  type,
  delay = 0 
}: CertificateListProps) {
    
  if (certificates.length === 0 && type !== 'attendee') {
      return null;
  }

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
    >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                 <h2 className="text-2xl font-bold text-[#373737]">{title}</h2>
                 <p className="text-gray-500">{description}</p>
            </div>
        </div>
        
        {certificates.length === 0 ? (
           <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
               <p className="text-gray-500 font-medium">No tienes constancias disponibles aún.</p>
               <p className="text-sm text-gray-400">Participa en eventos que otorguen constancia para verlas aquí.</p>
           </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => {
                    let isAvailable = true;
                    let unavailableMessage = "";
                    const now = new Date();

                    if (type === 'speaker') {
                        const eventDate = new Date(cert.events.date);
                        isAvailable = now > eventDate;
                        unavailableMessage = "Al finalizar el evento";
                    } else if (type === 'staff') {
                         const availableDate = new Date(cert.scanned_at);
                         isAvailable = now > availableDate;
                         unavailableMessage = "Al finalizar todo el evento";
                    }

                    return (
                        <div key={cert.id} className="relative group">
                            <CertificateCard 
                                cert={cert as any} 
                                onView={(c: any) => isAvailable ? onView(c) : null} 
                                formatDate={formatDate}
                            />
                            {!isAvailable && (
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl border border-dashed border-gray-300">
                                    <div className="text-center p-4">
                                        <p className="text-sm font-bold text-gray-500 mb-1">Disponible próximamente</p>
                                        <p className="text-xs text-gray-400">{unavailableMessage}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
    </motion.div>
  );
}
