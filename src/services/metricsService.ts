import { supabase } from '@/lib/supabase';
import { Event, UserProfile } from '@/types';

export interface EventMetricSummary {
  event_id: string;
  title: string;
  date: string;
  total_interested: number;
  total_attended: number;
  unique_attendees: number;
  duration_days: number;
}

export interface AttendanceDetail {
  id: string; // ID of the attendance record (for deletion)
  user_id: string;
  scanned_at: string;
  user?: UserProfile;
}

export interface EventAttendee {
  user_id: string;
  user: UserProfile;
  scans: AttendanceDetail[];
  days_attended: number[]; // Array of logical days attended (1, 2, etc.)
  status: 'complete' | 'partial' | 'absent'; // Logic to be defined
}

export interface InterestedUser {
  user_id: string;
  user: UserProfile;
  interested_at: string;
}

export const metricsService = {
  /**
   * Obtiene un resumen de métricas para todos los eventos de una conferencia.
   */
  async getEventMetrics(conferenceId: string): Promise<EventMetricSummary[]> {
    try {
      // Intentar usar RPC optimizado primero
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_event_metrics_summary', {
        p_conference_id: conferenceId
      });

      if (!rpcError && rpcData) {
          return rpcData;
      }

      if (rpcError) {
          console.warn('RPC get_event_metrics_summary failed (likely not exists), falling back to client-side loop.', rpcError.message);
      }

      // --- FALLBACK LEGACY LOOP ---
      console.log('Using fallback event metrics fetching...');
      // 1. Fetch Events
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, title, date, duration_days')
        .eq('conference_id', conferenceId)
        .order('date', { ascending: true });

      if (eventsError) throw eventsError;
      
      const metrics: EventMetricSummary[] = [];

      for (const event of events) {
        // Interest Count
        const { count: interestCount, error: interestError } = await supabase
          .from('event_interests') 
          .select('user_id', { count: 'exact', head: true })
          .eq('event_id', event.id);

        // Attendance Count (Raw scans)
         const { data: scans, error: attendanceError } = await supabase
          .from('attendance')
          .select('user_id')
          .eq('event_id', event.id);

        if (interestError) console.error('Error fetching interest for event', event.id, interestError);
        if (attendanceError) console.error('Error fetching attendance for event', event.id, attendanceError);

        const uniqueUsers = new Set(scans?.map((s: any) => s.user_id));

        metrics.push({
          event_id: event.id,
          title: event.title,
          date: event.date,
          total_interested: interestCount || 0,
          total_attended: scans?.length || 0,
          unique_attendees: uniqueUsers.size,
          duration_days: event.duration_days || 1
        });
      }

      return metrics;
    } catch (error) {
      console.error('Error in getEventMetrics:', error);
      return [];
    }
  },

  /**
   * Obtiene el detalle de asistencia de un evento específico, incluyendo usuarios y sus escaneos.
   */
  async getEventAttendanceDetails(eventId: string, eventDate: string): Promise<EventAttendee[]> {
      try {
          // Intentar usar RPC optimizado - DISABLED FOR DEBUGGING/FIXING
          // const { data: rpcData, error: rpcError } = await supabase.rpc('get_event_attendance_details', {
          //     p_event_id: eventId
          // });

          const rpcData = null; // Force null
          const rpcError = { message: "Disabled" }; // Force error-like behavior

          if (!rpcError && rpcData) { 
             // ... unreachable ...
          }
          
          /*
          if (!rpcError && rpcData) {
              // Normalize start date to a comparable ISO string (YYYY-MM-DD)
              // The event date is stored as date string (YYYY-MM-DD) which assumes local time (Mexico)
              const startDayStr = eventDate;

              rpcData.forEach((row: any) => {
                   if (!attendeesMap.has(row.user_id)) {
                       attendeesMap.set(row.user_id, {
                           user_id: row.user_id,
                           user: {
                               id: row.user_id,
                               first_name: row.first_name,
                               last_name: row.last_name,
                               role: row.user_role || row.role, // Support aliased column
                               degree: row.degree,
                               email: row.email,
                               short_id: '', 
                               is_owner: (row.user_role || row.role) === 'owner'
                           } as any,
                           scans: [],
                           days_attended: [],
                           status: 'absent'
                       });
                   }

                   const attendee = attendeesMap.get(row.user_id)!;
                   
                   // Add scan regardless of date logic (Agenda logic)
                   attendee.scans.push({
                       id: row.attendance_id,
                       user_id: row.user_id,
                       scanned_at: row.scanned_at
                   });

                   // Simply track unique days loosely for UI if possible, else rely on scan count
                   // We won't filter out based on dayNumber <= 0 anymore
                   const scanDate = new Date(row.scanned_at);
                   const startDate = new Date(eventDate);
                   
                   // Rough calculation for column placement (optional)
                   const diffTime = scanDate.getTime() - startDate.getTime();
                   const dayNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                   
                   // Just push it, we don't strict filter
                   if (!attendee.days_attended.includes(dayNumber)) {
                        attendee.days_attended.push(dayNumber);
                   }
              });

               // Determine status based on COUNT (Agenda logic)
               // Duration needs to be fetched or passed. We'll use a heuristic here, 
               // but the UI has the real duration to decide "Complete" vs "Partial".
               attendeesMap.forEach(attendee => {
                    // We just return 'partial' if they have scans. 
                    // The UI will upgrade to 'complete' if scans.length >= duration.
                    attendee.status = attendee.scans.length > 0 ? 'partial' : 'absent';
                    attendee.days_attended.sort((a, b) => a - b);
               });

               return Array.from(attendeesMap.values());
          }
          */

          if (rpcError) {
             // console.warn('RPC get_event_attendance_details failed, falling back to client-side logic.', rpcError.message);
          }

          // --- FALLBACK LEGACY JOIN ---
          // 1. Get all scans for this event
          const { data: scans, error: scansError } = await supabase
              .from('attendance')
              .select('id, user_id, scanned_at')
              .eq('event_id', eventId)
              .order('scanned_at', { ascending: true });
          
          if (scansError) throw scansError;

          if (!scans || scans.length === 0) return [];

          // 2. Extract unique user IDs
          const userIds = Array.from(new Set(scans.map((s: any) => s.user_id)));

          // 3. Fetch User Profiles
          // Note: 'role' might not exist directly on profiles table if using conference_roles. 
          // We will fetch is_owner and basics.
          const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email, degree, is_owner')
              .in('id', userIds);

          if (profilesError) throw profilesError;

          // 4. Map profiles to attendance data
          const attendeesMap = new Map<string, EventAttendee>();

          // Initialize map with profiles
          profiles?.forEach((profile: any) => {
              // Fallback role logic if not joined with conference_roles
              const computedRole = profile.is_owner ? 'owner' : 'user'; 
              
              attendeesMap.set(profile.id, {
                  user_id: profile.id,
                  user: {
                      ...profile,
                      role: computedRole
                  },
                  scans: [],
                  days_attended: [],
                  status: 'absent'
              });
          });

          scans.forEach((scan: any) => {
              const attendee = attendeesMap.get(scan.user_id);
              if (attendee) {
                  attendee.scans.push({
                      id: scan.id,
                      user_id: scan.user_id,
                      scanned_at: scan.scanned_at
                  });

                   // Simple Day calc for columns
                   const scanDate = new Date(scan.scanned_at);
                   const startDate = new Date(eventDate);
                   const diffTime = scanDate.getTime() - startDate.getTime();
                   const dayNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                   if (!attendee.days_attended.includes(dayNumber)) {
                       attendee.days_attended.push(dayNumber);
                   }
              }
          });

           attendeesMap.forEach(attendee => {
                attendee.status = attendee.scans.length > 0 ? 'partial' : 'absent'; 
                attendee.days_attended.sort((a, b) => a - b);
           });

          return Array.from(attendeesMap.values());

      } catch (error) {
          console.error('Error fetching event attendance details:', error);
          return [];
      }
  },

  /**
   * Obtiene la lista de usuarios interesados en un evento.
   */
  async getEventInterestedUsers(eventId: string): Promise<InterestedUser[]> {
      try {
          // Specify the foreign key if needed, or rely on auto-detection if unique
          // "user:profiles!event_interests_user_id_fkey" forces the join on that FK.
          const { data, error } = await supabase
              .from('event_interests')
              .select(`
                  created_at,
                  user:profiles!event_interests_user_id_fkey (
                      id,
                      first_name,
                      last_name,
                      email,
                      degree,
                      gender,
                      phone,
                      is_owner
                  )
              `)
              .eq('event_id', eventId)
              .order('created_at', { ascending: false });

          if (error) {
              console.error("Error query interested:", error);
              return [];
          }
          
          return (data || []).map((item: any) => ({
              user_id: item.user?.id,
              user: {
                  ...item.user,
                  role: item.user?.is_owner ? 'owner' : 'user'
              },
              interested_at: item.created_at,
          }));
      } catch (error) {
          console.error("Error fetching interested users:", error);
          return [];
      }
  },

  /**
   * Elimina un registro de asistencia específico.
   */
  async deleteAttendanceRecord(attendanceId: string): Promise<boolean> {
      try {
          const { error } = await supabase
              .from('attendance')
              .delete()
              .eq('id', attendanceId);

          if (error) throw error;
          return true;
      } catch (error) {
          console.error('Error deleting attendance record:', error);
          return false;
      }
  }
};
