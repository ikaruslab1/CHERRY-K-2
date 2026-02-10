
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
          .from('event_interest') 
          .select('*', { count: 'exact', head: true })
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
          // Intentar usar RPC optimizado
          const { data: rpcData, error: rpcError } = await supabase.rpc('get_event_attendance_details', {
              p_event_id: eventId
          });

          if (!rpcError && rpcData) {
              const attendeesMap = new Map<string, EventAttendee>();
              const eventStartDate = new Date(eventDate);
              // Normalize start date to midnight for day calc
              const startDay = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());

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
                   
                   // Add scan
                   attendee.scans.push({
                       id: row.attendance_id,
                       user_id: row.user_id,
                       scanned_at: row.scanned_at
                   });

                   // Calculate Logical Day
                   const scanDate = new Date(row.scanned_at);
                   const scanDay = new Date(scanDate.getFullYear(), scanDate.getMonth(), scanDate.getDate());
                   const diffDays = Math.floor((scanDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
                   const dayNumber = diffDays + 1;

                   if (dayNumber > 0 && !attendee.days_attended.includes(dayNumber)) {
                       attendee.days_attended.push(dayNumber);
                   }
              });

               // Determine status
               attendeesMap.forEach(attendee => {
                    attendee.status = attendee.scans.length > 0 ? 'partial' : 'absent';
                    attendee.days_attended.sort((a, b) => a - b);
               });

               return Array.from(attendeesMap.values());
          }

          if (rpcError) {
             console.warn('RPC get_event_attendance_details failed, falling back to client-side logic.', rpcError.message);
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
          const { data: profiles, error: profilesError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, email, role, degree')
              .in('id', userIds);

          if (profilesError) throw profilesError;

          // 4. Map profiles to attendance data
          const attendeesMap = new Map<string, EventAttendee>();

          // Initialize map with profiles
          profiles?.forEach((profile: any) => {
              attendeesMap.set(profile.id, {
                  user_id: profile.id,
                  user: profile,
                  scans: [],
                  days_attended: [],
                  status: 'absent'
              });
          });

          // Process scans
          const eventStartDate = new Date(eventDate);
           // Normalize start date to midnight for day calc
          const startDay = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());
          
          scans.forEach((scan: any) => {
              const attendee = attendeesMap.get(scan.user_id);
              if (attendee) {
                  attendee.scans.push({
                      id: scan.id,
                      user_id: scan.user_id,
                      scanned_at: scan.scanned_at
                  });

                  // Calculate Logical Day
                  const scanDate = new Date(scan.scanned_at);
                  const scanDay = new Date(scanDate.getFullYear(), scanDate.getMonth(), scanDate.getDate());
                  
                  const diffDays = Math.floor((scanDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
                  const dayNumber = diffDays + 1; // 1-based index

                  if (dayNumber > 0 && !attendee.days_attended.includes(dayNumber)) {
                      attendee.days_attended.push(dayNumber);
                  }
              }
          });

          // Determine status
          /* 
            Logic: 
            - If days_attended.length >= duration_days -> 'complete'
            - If days_attended.length > 0 -> 'partial'
            - Else 'absent'
          */
          // We need the event duration to be passed down or fetched. 
          // For now, let's assume if they have at least 1 scan, it's 'partial' or 'complete' depending on context.
          // The caller component will refine this with the event's duration_days.
          
           attendeesMap.forEach(attendee => {
                attendee.status = attendee.scans.length > 0 ? 'partial' : 'absent'; // Preliminary
                attendee.days_attended.sort((a, b) => a - b);
           });

          return Array.from(attendeesMap.values());

      } catch (error) {
          console.error('Error fetching event attendance details:', error);
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
