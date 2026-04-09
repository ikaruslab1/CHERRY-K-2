'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Deletes a user entirely from Auth and their profile (cascade).
 * Only callable server-side; use from admin/owner context.
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('deleteUser error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('deleteUser exception:', err);
    return { success: false, error: err.message || 'Error desconocido al eliminar usuario' };
  }
}

/**
 * Updates editable profile fields (first_name, last_name, degree, gender).
 */
export async function updateUserProfile(
  userId: string,
  data: { first_name: string; last_name: string; degree: string; gender: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        degree: data.degree,
        gender: data.gender,
      })
      .eq('id', userId);

    if (error) {
      console.error('updateUserProfile error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('updateUserProfile exception:', err);
    return { success: false, error: err.message || 'Error al actualizar perfil' };
  }
}
