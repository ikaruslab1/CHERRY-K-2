'use client';

import { useState } from 'react';
import { useConference } from '@/context/ConferenceContext';
import { CertificateList } from './certificates/CertificateList';
import { CertificateModal } from './certificates/CertificateModal';
import { useCertificates } from '@/hooks/useCertificates';
import { Certificate } from '@/types/certificates';
import { Loader2 } from 'lucide-react';

export function CertificatesView() {
  const { currentConference } = useConference();
  const { 
      loading, 
      attendeeCertificates, 
      speakerCertificates, 
      staffCertificates, 
      organizerCertificates 
  } = useCertificates(currentConference?.id);
  
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <CertificateList 
          title="Mis Constancias"
          description="Descarga tus constancias de asistencia a los eventos."
          certificates={attendeeCertificates}
          onView={setSelectedCertificate}
          formatDate={formatDate}
          type="attendee"
       />

       <CertificateList 
          title="Constancias de Ponente"
          description="Certificados por impartir conferencias y actividades."
          certificates={speakerCertificates}
          onView={setSelectedCertificate}
          formatDate={formatDate}
          type="speaker"
          delay={0.1}
       />

       <CertificateList 
          title="Constancia de Staff"
          description="Certificado por participación en la logística del evento."
          certificates={staffCertificates}
          onView={setSelectedCertificate}
          formatDate={formatDate}
          type="staff"
          delay={0.2}
       />

       <CertificateList 
          title="Constancia de Organizador"
          description="Certificado por liderazgo y organización del evento."
          certificates={organizerCertificates}
          onView={setSelectedCertificate}
          formatDate={formatDate}
          type="organizer"
          delay={0.1}
       />

       <CertificateModal 
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
       />
    </div>
  );
}
