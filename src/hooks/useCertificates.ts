import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Certificate } from '@/types/certificates';

interface UseCertificatesReturn {
  loading: boolean;
  attendeeCertificates: Certificate[];
  speakerCertificates: Certificate[];
  staffCertificates: Certificate[];
  organizerCertificates: Certificate[];
  refresh: () => Promise<void>;
}

export function useCertificates(conferenceId: string | undefined): UseCertificatesReturn {
  const [loading, setLoading] = useState(true);
  const [attendeeCertificates, setAttendeeCertificates] = useState<Certificate[]>([]);
  const [speakerCertificates, setSpeakerCertificates] = useState<Certificate[]>([]);
  const [staffCertificates, setStaffCertificates] = useState<Certificate[]>([]);
  const [organizerCertificates, setOrganizerCertificates] = useState<Certificate[]>([]);

  const fetchCertificates = useCallback(async () => {
    if (!conferenceId) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      // Fetch Conference Data for Context (Title, etc.)
      const { data: conferenceData } = await supabase
        .from('conferences')
        .select('*')
        .eq('id', conferenceId)
        .single();

      if (!conferenceData) return;

      // --- ATTENDEE CERTIFICATES ---
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
              department_name,
              certificate_config
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
        .eq('events.conference_id', conferenceId)
        .not('scanned_at', 'is', null);

      if (error) {
          console.error("Error fetching attendance:", error);
      } else {
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
          setAttendeeCertificates(validCertificates);
      }

      // --- SPEAKER CERTIFICATES ---
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
              department_name,
              certificate_config
            )
        `)
        .eq('speaker_id', user.id)
        .eq('conference_id', conferenceId);

      if (speakerError) {
          console.error("Error fetching speaker events:", speakerError);
      } else {
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
      }

      // --- STAFF CERTIFICATES ---
      if (profileData?.role === 'staff') {
          const { data: allConferenceEvents, error: eventsError } = await supabase
              .from('events')
              .select('date, duration_days')
              .eq('conference_id', conferenceId)
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
              maxEndDate.setHours(23, 59, 59, 999);

              const staffCert: Certificate = {
                  id: `STAFF-${conferenceId}-${user.id}`,
                  scanned_at: maxEndDate.toISOString(),
                  events: {
                      id: `LOGISTICS-${conferenceId}`,
                      title: conferenceData.title,
                      date: maxEndDate.toISOString(),
                      type: "Logística",
                      location: "FES Acatlán",
                      description: "Participación en la logística del evento",
                      gives_certificate: true,
                      duration_days: 1,
                      conference_id: conferenceId,
                      conferences: {
                          title: conferenceData.title,
                          institution_name: conferenceData.institution_name || 'FES Acatlán',
                          department_name: conferenceData.department_name || 'UNAM',
                          certificate_config: conferenceData.certificate_config
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
          } else {
             setStaffCertificates([]);
          }
      } else {
          setStaffCertificates([]);
      }


      // --- ORGANIZER CERTIFICATES ---
      if (profileData?.role === 'admin' || profileData?.role === 'owner') {
           const organizerCert: Certificate = {
              id: `ORG-${conferenceId}-${user.id}`,
              scanned_at: conferenceData.start_date,
              events: {
                  id: `ORGANIZATION-${conferenceId}`,
                  title: conferenceData.title,
                  date: conferenceData.end_date,
                  type: "Organización",
                  location: "FES Acatlán",
                  description: "Organización y gestión del evento",
                  gives_certificate: true,
                  duration_days: 1,
                  conference_id: conferenceId,
                  conferences: {
                      title: conferenceData.title,
                      institution_name: conferenceData.institution_name || 'FES Acatlán',
                      department_name: conferenceData.department_name || 'UNAM',
                      certificate_config: conferenceData.certificate_config
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
      } else {
          setOrganizerCertificates([]);
      }

    } catch (error) {
      console.error('Error in useCertificates:', error);
    } finally {
      setLoading(false);
    }
  }, [conferenceId]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return {
    loading,
    attendeeCertificates,
    speakerCertificates,
    staffCertificates,
    organizerCertificates,
    refresh: fetchCertificates
  };
}
