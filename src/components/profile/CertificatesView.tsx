'use client';

import { useState } from 'react';
import { useConference } from '@/context/ConferenceContext';
import { CertificateList } from './certificates/CertificateList';
import { CertificateModal } from './certificates/CertificateModal';
import { useCertificates } from '@/hooks/useCertificates';
import { Certificate } from '@/types/certificates';
import { Loader2, Award, CheckCircle2, Mail, Info } from 'lucide-react';

export function CertificatesView() {
  const { currentConference } = useConference();
  const { 
      loading, 
      attendeeCertificates, 
      speakerCertificates, 
      staffCertificates, 
      organizerCertificates,
      globalCertificate,
      globalAttendanceProgress,
  } = useCertificates(currentConference?.id);
  
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Check if the admin wants to deliver the cert directly or via email
  const deliverGlobalCert = currentConference?.deliver_global_certificate ?? false;

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
       {/* Global Attendance Certificate Section */}
       {globalAttendanceProgress && (
         <div 
           className="rounded-2xl border p-5 space-y-3 transition-colors duration-300"
           style={{ 
             borderColor: 'rgb(var(--color-acid-rgb) / 0.4)',
             background: 'linear-gradient(to bottom right, rgb(var(--color-acid-rgb) / 0.1), transparent)'
           }}
         >
           <div className="flex items-center gap-3">
             <div 
               className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: 'rgb(var(--color-acid-rgb) / 0.2)' }}
             >
               <Award className="w-5 h-5" style={{ color: 'var(--color-acid-text, #373737)' }} />
             </div>
             <div>
               <h3 className="font-bold text-sm text-gray-900">Constancia de Participación General</h3>
               <p className="text-xs text-gray-500">
                 Asiste a {globalAttendanceProgress.required} eventos para obtener tu constancia general del congreso
               </p>
             </div>
             {globalCertificate && (
               <div className="ml-auto">
                 <CheckCircle2 className="w-6 h-6 text-green-500" />
               </div>
             )}
           </div>

           {/* Progress Bar */}
           <div className="space-y-1.5">
             <div className="flex justify-between text-xs font-medium">
               <span className="text-gray-600">Progreso</span>
               <span className="text-gray-800">
                 {globalAttendanceProgress.current} / {globalAttendanceProgress.required} eventos
               </span>
             </div>
             <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
               <div 
                 className="h-full rounded-full transition-all duration-500"
                 style={{ 
                    width: `${Math.min(100, (globalAttendanceProgress.current / globalAttendanceProgress.required) * 100)}%`,
                    backgroundColor: 'var(--color-acid)'
                 }}
               />
             </div>
           </div>

           {/* Earned Certificate or Email Banner */}
           {globalCertificate && (
             <>
               {deliverGlobalCert ? (
                 <CertificateList
                   title=""
                   description=""
                   certificates={[globalCertificate]}
                   onView={setSelectedCertificate}
                   formatDate={formatDate}
                   type="attendee"
                 />
               ) : (
                 /* Email banner: constancia will be sent via email */
                 <div 
                   className="rounded-xl border p-4 space-y-2 animate-in fade-in duration-300"
                   style={{
                     background: 'linear-gradient(135deg, rgb(var(--color-acid-rgb) / 0.12), rgb(var(--color-acid-rgb) / 0.05))',
                     borderColor: 'rgb(var(--color-acid-rgb) / 0.35)'
                   }}
                 >
                   <div className="flex items-start gap-3">
                     <div 
                       className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                       style={{ backgroundColor: 'rgb(var(--color-acid-rgb) / 0.25)' }}
                     >
                       <Mail className="w-4 h-4" style={{ color: 'var(--color-acid-text, #373737)' }} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-sm text-gray-900">¡Felicidades, cumpliste el requisito!</p>
                       <p className="text-xs text-gray-600 mt-0.5">
                         Tu constancia general de participación te será enviada al correo electrónico con el que te registraste:
                       </p>
                       <div 
                         className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold"
                         style={{ 
                           backgroundColor: 'rgb(var(--color-acid-rgb) / 0.2)',
                           color: 'var(--color-acid-text, #373737)'
                         }}
                       >
                         <Mail className="w-3.5 h-3.5 shrink-0" />
                         <span className="truncate">{/* email will be pulled from auth */}
                           {(globalCertificate as any)?._userEmail || 'tu correo registrado'}
                         </span>
                       </div>
                       <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                         <Info className="w-3 h-3 shrink-0" />
                         Si no recibes el correo en los próximos días, contacta al equipo organizador.
                       </p>
                     </div>
                   </div>
                 </div>
               )}
             </>
           )}
         </div>
       )}

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
