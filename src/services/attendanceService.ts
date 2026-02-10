import { supabase } from '@/lib/supabase';

export interface IParticipant {
  id: string; // UUID from profiles
  short_id: string;
  first_name: string;
  last_name: string;
  role: string;
  degree: string;
  status?: 'registered' | 'confirmed' | 'rejected' | 'pending';
  last_attendance?: string;
  avatar_url?: string;
}

export const attendanceService = {
  /**
   * Obtiene la información del participante basado en el código escaneado (short_id).
   * @param qrCode String escaneado del QR (se espera que sea el short_id o un JSON parseable)
   */
  async getParticipantByQR(qrCode: string, conferenceId?: string): Promise<IParticipant | null> {
    try {
      let shortId = qrCode;
      try {
        const parsed = JSON.parse(qrCode);
        if (parsed.id) shortId = parsed.id;
      } catch (e) {}

      // Query profiles first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, short_id, first_name, last_name, degree, is_owner')
        .eq('short_id', shortId)
        .single();

      if (profileError || !profile) {
        console.error('[attendanceService] Error fetching participant profile:', profileError);
        return null;
      }

      console.log(`[attendanceService] Found profile: ${profile.id}, is_owner: ${profile.is_owner}`);

      // Determine synthesized role
      let effectiveRole = profile.is_owner ? 'owner' : 'user';

      if (!profile.is_owner && conferenceId) {
        console.log(`[attendanceService] Fetching role for user ${profile.id} in conference ${conferenceId}`);
        const { data: localRole, error: roleError } = await supabase
          .from('conference_roles')
          .select('role')
          .eq('user_id', profile.id)
          .eq('conference_id', conferenceId)
          .maybeSingle();
        
        if (roleError) console.error('[attendanceService] Role fetch error:', roleError);
        
        if (localRole?.role) {
          console.log(`[attendanceService] Found local role: ${localRole.role}`);
          effectiveRole = localRole.role;
        } else {
          console.log('[attendanceService] No local role found, staying as user');
        }
      }

      return {
        id: profile.id,
        short_id: profile.short_id || '',
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: effectiveRole,
        degree: profile.degree || '',
        status: 'pending'
      };

    } catch (error) {
      console.error('Unexpected error in getParticipantByQR:', error);
      return null;
    }
  },

  /**
   * Registra la asistencia del usuario en la actividad seleccionada.
   */
  async confirmAttendance(userId: string, activityId: string): Promise<{ success: boolean; message: string }> {
    try {
        // Se ha eliminado la restricción de registro único para permitir múltiples asistencias (ej. eventos de varios días)
        // Validation logic removed per user request

        const { error } = await supabase
            .from('attendance')
            .insert({
                user_id: userId,
                event_id: activityId,
                scanned_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error confirming attendance:', error);
            return { success: false, message: 'Error al guardar en base de datos.' };
        }

        return { success: true, message: 'Asistencia confirmada exitosamente.' };
    } catch (error) {
        console.error('Unexpected error in confirmAttendance:', error);
        return { success: false, message: 'Error inesperado al confirmar asistencia.' };
    }
  },

  /**
   * Obtiene eventos activos para el selector (utilidad extra para el dropdown)
   */
  async getActiveEvents(conferenceId: string) {
    const { data, error } = await supabase
        .from('events')
        .select('id, title, type, date')
        .eq('conference_id', conferenceId)
        .order('date', { ascending: true });
    
    if (error) return [];
    return data || [];
  }
};
