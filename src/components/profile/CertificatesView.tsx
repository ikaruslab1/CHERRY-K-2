'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, Printer, X, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

import { CertificateCard } from './CertificateCard';
import { CertificateContent } from './CertificateContent';
import { CertificatePreview } from './CertificatePreview';

// Extend the local interface or import if possible. 
// For now, extending to match CertificateContent's expectation
export interface Certificate {
    id: string; // attendance id OR event id for speakers
    scanned_at: string; // OR event date for speakers
    events: {
      id: string;
      title: string;
      date: string; // Timestamptz
      type: string;
      location: string;
      description: string;
      gives_certificate?: boolean;
      duration_days?: number;
      conference_id: string;
      conferences?: {
          title: string;
          institution_name: string;
          department_name: string;
      };
      
      certificate_config?: any; 
    };
    profiles: {
        first_name: string;
        last_name: string;
        degree: string | null;
        gender: string | null;
    }
    isSpeaker?: boolean;
    isStaff?: boolean;
    isOrganizer?: boolean;
}


import { useConference } from '@/context/ConferenceContext';

export function CertificatesView() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [speakerCertificates, setSpeakerCertificates] = useState<Certificate[]>([]);
  const [staffCertificates, setStaffCertificates] = useState<Certificate[]>([]);
  const [organizerCertificates, setOrganizerCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const { currentConference } = useConference();

  useEffect(() => {
    if (currentConference) {
        fetchCertificates();
    }
  }, [currentConference]);

  const fetchCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (!currentConference) return;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          scanned_at,
          events!inner (
            id,
            title,
            date,
            type,
            location,
            description,
            gives_certificate,
            duration_days,
            conference_id,
            conferences (
              title,
              institution_name,
              department_name
            ),
            certificate_config
          ),
          profiles:user_id (
            first_name,
            last_name,
            degree,
            gender
          )
        `)
        .eq('user_id', user.id)
        .eq('events.gives_certificate', true)
        .eq('events.conference_id', currentConference.id)
        .not('scanned_at', 'is', null);

      if (error) throw error;

      // Group attendance by event
      const attendanceByEvent = (data as any[]).reduce((acc, curr) => {
        const eventId = curr.events.id;
        if (!acc[eventId]) {
          acc[eventId] = [];
        }
        acc[eventId].push(curr);
        return acc;
      }, {} as Record<string, any[]>);

      const validCertificates: Certificate[] = [];

      Object.values(attendanceByEvent).forEach((attendances: any) => {
          const event = attendances[0].events;
          const requiredDays = event.duration_days || 1;
          
          // Only grant certificate if attendance count meets duration requirement
          if (attendances.length >= requiredDays) {
              // Use the most recent attendance record for the certificate
              attendances.sort((a: any, b: any) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());
              validCertificates.push(attendances[0]);
          }
      });

      setCertificates(validCertificates);

      // --- FETCH SPEAKER CERTIFICATES ---
      const { data: speakerEvents, error: speakerError } = await supabase
        .from('events')
        .select(`
            id,
            title,
            date,
            type,
            location,
            description,
            gives_certificate,
            duration_days,
            conference_id,
            conferences (
              title,
              institution_name,
              department_name
            )
        `)
        .eq('speaker_id', user.id)
        .eq('conference_id', currentConference.id); // Removed gives_certificate check so speakers always see their events? Or should they only get certs if gives_certificate is true? 
        // User asked: "En la sección de constancias debe aparecer una nueva sección SOLO para personas seleccionadas... Se le debe otorgar una constancia especial... y cuantas y por cuales eventos va a recibir constancia"
        // I'll assume only if the event actually gives a certificate, although speakers usually get one regardless. 
        // But the constraint is "por las cuales va a recibir constancia". I'll keep gives_certificate=true for now or maybe checks.
        // Actually, usually speakers ALWAYS get a certificate. Let's assume gives_certificate applies to attendees. 
        // But for safety, I'll filter by gives_certificate OR just show all where they are speakers. 
        // Generally speaker certificates are standard. I'll include all events where they are speaker for now, 
        // or check if there is a specific flag. Let's stick to "gives_certificate" being true for the event as a conservative approach, 
        // or maybe all events the speaker is assigned to imply a certificate.
        // I will assume ALL assigned events generate a speaker certificate.

      if (speakerError) throw speakerError;

      // Transform speaker events into "Certificate" objects
      const speakerCerts: Certificate[] = (speakerEvents || []).filter((e: any) => e.gives_certificate).map(event => ({
        id: `SPK-${event.id}`, 
        scanned_at: event.date,
        events: event as any, 
        profiles: {
            first_name: profileData?.first_name || user.user_metadata?.first_name || '',
            last_name: profileData?.last_name || user.user_metadata?.last_name || '',
            degree: profileData?.degree || user.user_metadata?.degree || null,
            gender: profileData?.gender || user.user_metadata?.gender || null,
        },
        isSpeaker: true
      }));

      // Sort by date descending
      speakerCerts.sort((a, b) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());
      
      setSpeakerCertificates(speakerCerts);

      // --- STAFF CERTIFICATES ---
      if (profileData?.role === 'staff') {
          const { data: allConferenceEvents, error: eventsError } = await supabase
              .from('events')
              .select('date, duration_days')
              .eq('conference_id', currentConference.id)
              .order('date', { ascending: false });

          if (!eventsError && allConferenceEvents && allConferenceEvents.length > 0) {
              let maxEndDate = new Date(0);

              allConferenceEvents.forEach((evt: any) => {
                  const startDate = new Date(evt.date);
                  const duration = evt.duration_days || 1;
                  const endDate = new Date(startDate);
                  endDate.setDate(endDate.getDate() + (duration - 1));
                  
                  if (endDate > maxEndDate) {
                      maxEndDate = endDate;
                  }
              });

              // Adjust maxEndDate to cover the full last day (e.g. set to end of day)
              // maxEndDate.setHours(23, 59, 59, 999); 
              // Actually, simply strictly greater than the date object which represents the start of the day + duration is usually enough if we compare with now.
              // If duration is 1 day, date is 2023-10-10 10:00:00. End date is 2023-10-10 10:00:00.
              // If we want it to be available AFTER the event finishes, we should probably set it to the END of that day or event end time.
              // Let's assume end of the last day.
              maxEndDate.setHours(23, 59, 59, 999);

              const staffCert: Certificate = {
                  id: `STAFF-${currentConference.id}-${user.id}`,
                  scanned_at: maxEndDate.toISOString(),
                  events: {
                      id: `LOGISTICS-${currentConference.id}`,
                      title: currentConference.title, // "Semana del Diseño" instead of "Logística del Evento"
                      date: maxEndDate.toISOString(),
                      type: "Logística",
                      location: "FES Acatlán",
                      description: "Participación en la logística del evento",
                      gives_certificate: true,
                      duration_days: 1,
                      conference_id: currentConference.id,
                      conferences: {
                          title: currentConference.title,
                          institution_name: currentConference.institution_name || 'FES Acatlán',
                          department_name: currentConference.department_name || 'UNAM'
                      }
                  },
                  profiles: {
                      first_name: profileData?.first_name || user.user_metadata?.first_name || '',
                      last_name: profileData?.last_name || user.user_metadata?.last_name || '',
                      degree: profileData?.degree || user.user_metadata?.degree || null,
                      gender: profileData?.gender || user.user_metadata?.gender || null,
                  },
                  isStaff: true
              };
              
              setStaffCertificates([staffCert]);
          }
      }


      // --- ORGANIZER CERTIFICATES ---
      if (profileData?.role === 'admin' || profileData?.role === 'owner') {
          // Organizer certificate is always available
           const organizerCert: Certificate = {
              id: `ORG-${currentConference.id}-${user.id}`,
              scanned_at: currentConference.start_date, // Available from start
              events: {
                  id: `ORGANIZATION-${currentConference.id}`,
                  title: currentConference.title, // "Semana del Diseño" instead of "Organización del Evento"
                  date: currentConference.end_date, // Date displayed on certificate
                  type: "Organización",
                  location: "FES Acatlán",
                  description: "Organización y gestión del evento",
                  gives_certificate: true,
                  duration_days: 1,
                  conference_id: currentConference.id,
                  conferences: {
                      title: currentConference.title,
                      institution_name: currentConference.institution_name || 'FES Acatlán',
                      department_name: currentConference.department_name || 'UNAM'
                  }
              },
              profiles: {
                  first_name: profileData?.first_name || user.user_metadata?.first_name || '',
                  last_name: profileData?.last_name || user.user_metadata?.last_name || '',
                  degree: profileData?.degree || user.user_metadata?.degree || null,
                  gender: profileData?.gender || user.user_metadata?.gender || null,
              },
              isOrganizer: true
          };
          
          setOrganizerCertificates([organizerCert]);
      }


    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (cert: Certificate) => {
    const originalTitle = document.title;
    const certId = cert.id.split('-').pop()?.toUpperCase() || cert.id;
    const fullName = `${cert.profiles.first_name} ${cert.profiles.last_name}`;
    document.title = `${certId} - ${fullName}`;
    window.print();
    document.title = originalTitle;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ATTENDEE CERTIFICATES SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                 <h2 className="text-2xl font-bold text-[#373737]">Mis Constancias</h2>
                 <p className="text-gray-500">Descarga tus constancias de asistencia a los eventos.</p>
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
                {certificates.map((cert) => (
                    <CertificateCard 
                      key={cert.id} 
                      cert={cert as any} 
                      onView={setSelectedCertificate as any} 
                      formatDate={formatDate}
                    />
                ))}
            </div>
        )}
      </motion.div>

        {/* SPEAKER CERTIFICATES SECTION */}
        {speakerCertificates.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#373737]">Constancias de Ponente</h2>
                        <p className="text-gray-500">Certificados por impartir conferencias y actividades.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {speakerCertificates.map((cert) => {
                        const eventDate = new Date(cert.events.date);
                        const now = new Date();
                        const isAvailable = now > eventDate;
                        
                        return (
                             <div key={cert.id} className="relative group">
                                <CertificateCard 
                                    cert={cert as any} 
                                    onView={(c) => isAvailable ? setSelectedCertificate(c as any) : null} 
                                    formatDate={formatDate}
                                />
                                {!isAvailable && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl border border-dashed border-gray-300">
                                        <div className="text-center p-4">
                                            <p className="text-sm font-bold text-gray-500 mb-1">Disponible próximamente</p>
                                            <p className="text-xs text-gray-400">Al finalizar el evento</p>
                                        </div>
                                    </div>
                                )}
                             </div>
                        );
                    })}
                </div>
            </motion.div>
        )}

        {/* STAFF CERTIFICATES SECTION */}
        {staffCertificates.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#373737]">Constancia de Staff</h2>
                        <p className="text-gray-500">Certificado por participación en la logística del evento.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffCertificates.map((cert) => {
                        const availableDate = new Date(cert.scanned_at);
                        const now = new Date();
                        const isAvailable = now > availableDate;
                        
                        return (
                             <div key={cert.id} className="relative group">
                                <CertificateCard 
                                    cert={cert as any} 
                                    onView={(c) => isAvailable ? setSelectedCertificate(c as any) : null} 
                                    formatDate={formatDate}
                                />
                                {!isAvailable && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl border border-dashed border-gray-300">
                                        <div className="text-center p-4">
                                            <p className="text-sm font-bold text-gray-500 mb-1">Disponible próximamente</p>
                                            <p className="text-xs text-gray-400">Al finalizar todo el evento</p>
                                        </div>
                                    </div>
                                )}
                             </div>
                        );
                    })}
                </div>
            </motion.div>
        )}

        {/* ORGANIZER CERTIFICATES SECTION */}
        {organizerCertificates.length > 0 && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#373737]">Constancia de Organizador</h2>
                        <p className="text-gray-500">Certificado por liderazgo y organización del evento.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {organizerCertificates.map((cert) => (
                         <div key={cert.id} className="relative group">
                            <CertificateCard 
                                cert={cert as any} 
                                onView={setSelectedCertificate as any} 
                                formatDate={formatDate}
                            />
                         </div>
                    ))}
                </div>
            </motion.div>
        )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-hidden">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col h-[90vh]">
                
                {/* Modal Toolbar */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="font-semibold text-gray-700">Vista Previa de Constancia</h3>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={() => handlePrint(selectedCertificate)} className="gap-2">
                             <Printer className="h-4 w-4" />
                             Imprimir
                         </Button>
                         <button 
                            onClick={() => setSelectedCertificate(null)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                        >
                             <X className="h-5 w-5" />
                         </button>
                    </div>
                </div>

                {/* Scaled View Area */}
                <div className="flex-1 overflow-hidden bg-gray-900/90 relative flex items-center justify-center p-4 md:p-8">
                    <CertificatePreview certificate={selectedCertificate} />
                </div>
            </div>

            {/* PRINT PORTAL - Renders outside the react root for cleaner printing */}
            {typeof window !== 'undefined' && createPortal(
                <div id="print-portal" className="print-only">
                    <CertificateContent certificate={selectedCertificate} />
                </div>,
                document.body
            )}
        </div>
      )}
    </div>
  );
}
