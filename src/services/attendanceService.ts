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
  async getParticipantByQR(qrCode: string): Promise<IParticipant | null> {
    try {
      // Intentar parsear si es JSON (formato antiguo/completo) o usar string directo (short_id)
      let shortId = qrCode;
      try {
        const parsed = JSON.parse(qrCode);
        if (parsed.id) shortId = parsed.id;
      } catch (e) {
        // No es JSON, asumimos que es el short_id directo
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, short_id, first_name, last_name, role, degree')
        .eq('short_id', shortId)
        .single();

      if (error || !data) {
        console.error('Error fetching participant:', error);
        return null;
      }

      return {
        id: data.id,
        short_id: data.short_id,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        degree: data.degree,
        status: 'pending' // Estado inicial para la vista
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
  async getActiveEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('id, title, type, date')
        .order('date', { ascending: true });
    
    if (error) return [];
    return data || [];
  }
};
