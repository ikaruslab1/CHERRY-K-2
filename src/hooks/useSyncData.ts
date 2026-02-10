import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { db, LocalTicket, LocalAgendaItem, LocalProfile } from '@/lib/db';
import { useConference } from '@/context/ConferenceContext';

export function useSyncData() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { currentConference } = useConference();

  useEffect(() => {
    const sync = async () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return;

      try {
        setIsSyncing(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsSyncing(false);
            return;
        }

        // 1. Sync Profile & Role Hierarchy
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          let effectiveRole = profile.role;

          // Si no es owner y hay una conferencia activa, buscar el rol local
          if (profile.role !== 'owner' && currentConference) {
            const { data: localRole } = await supabase
              .from('conference_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('conference_id', currentConference.id)
              .single();
            
            if (localRole) {
              effectiveRole = localRole.role;
            } else {
              effectiveRole = 'user'; // Fallback si no tiene rol en este evento
            }
          }

          const localProfile: LocalProfile = {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
            role: effectiveRole, // Guardamos el rol efectivo para uso offline
            degree: profile.degree,
            short_id: profile.short_id,
            gender: profile.gender
          };
          await db.profile.put(localProfile);
        }

        // 2. Sync Agenda (Interests)
        const { data: interests } = await supabase
          .from('event_interests')
          .select('event_id, events(*)')
          .eq('user_id', user.id);
        
        if (interests) {
           const agendaItems: LocalAgendaItem[] = interests.map((i: any) => ({
             id: i.event_id,
             title: i.events?.title || 'Evento sin título',
             description: i.events?.description || '',
             date: i.events?.date || '',
             location: i.events?.location || '',
             type: i.events?.type || 'Evento',
             status: 'interested'
           }));
           await db.agenda.bulkPut(agendaItems);
        }

         // Sync Attendance (Tickets & Attending status)
        const { data: attendance } = await supabase
           .from('attendance')
           .select('event_id, scanned_at, events(*)')
           .eq('user_id', user.id);

        if (attendance) {
           const tickets: LocalTicket[] = attendance.map((a: any) => ({
             id: a.event_id, 
             event_id: a.event_id,
             user_id: user.id,
             status: 'valid',
             purchase_date: a.scanned_at,
             event_title: a.events?.title,
             event_date: a.events?.date,
             event_location: a.events?.location
           }));
           await db.tickets.bulkPut(tickets);
           
           const attendingItems: LocalAgendaItem[] = attendance.map((a: any) => ({
             id: a.event_id,
             title: a.events?.title || 'Evento sin título',
             description: a.events?.description || '',
             date: a.events?.date || '',
             location: a.events?.location || '',
             type: a.events?.type || 'Evento',
             status: 'attending'
           }));
           await db.agenda.bulkPut(attendingItems);
        }

        setLastSync(new Date());
        console.log('Online sync completed');
      } catch (error) {
        console.error('Sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    // Initial sync
    sync();

    // Listen for online status
    const handleOnline = () => sync();
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [currentConference?.id]);

  return { isSyncing, lastSync };
}
