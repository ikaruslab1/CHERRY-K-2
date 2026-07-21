'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore if called from server component
          }
        },
      },
    }
  );
}

/**
 * Inserts or updates an attendee's rating for a specific event.
 * Enforced by database RLS (only verified attendees who scanned QR can rate).
 */
export async function submitRating(
  eventId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'La calificación debe estar entre 1 y 5 estrellas.' };
    }

    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Sesión inválida o expirada.' };
    }

    const { error } = await supabase
      .from('event_ratings')
      .upsert(
        {
          event_id: eventId,
          user_id: user.id,
          rating,
          comment: comment || null
        },
        { onConflict: 'event_id, user_id' }
      );

    if (error) {
      console.error('[submitRating] Error:', error.message);
      // Friendly message for RLS violation
      if (error.message.includes('row-level security policy')) {
        return { 
          success: false, 
          error: 'No puedes calificar este evento. Solo los asistentes con asistencia registrada pueden dar retroalimentación.' 
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[submitRating] Exception:', err);
    return { success: false, error: err.message || 'Error al enviar la calificación.' };
  }
}

/**
 * Gets the average rating and count of ratings for an event.
 */
export async function getEventRatingStats(
  eventId: string
): Promise<{ success: boolean; data?: { average: number; count: number }; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from('event_ratings')
      .select('rating')
      .eq('event_id', eventId);

    if (error) {
      console.error('[getEventRatingStats] Error:', error.message);
      return { success: false, error: error.message };
    }

    const count = data.length;
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;

    return { success: true, data: { average, count } };
  } catch (err: any) {
    console.error('[getEventRatingStats] Exception:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetches ratings and comments for events where the current user is a speaker.
 */
export async function getSpeakerRatings(
  conferenceId: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Sesión inválida.' };
    }

    // Query event_ratings joining event_speakers where user_id matches speaker ID
    const { data, error } = await supabase
      .from('event_ratings')
      .select(`
        id,
        rating,
        comment,
        created_at,
        events!inner (
          id,
          title,
          conference_id,
          event_speakers!inner (
            user_id
          )
        )
      `)
      .eq('events.conference_id', conferenceId)
      .eq('events.event_speakers.user_id', user.id);

    if (error) {
      console.error('[getSpeakerRatings] Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[getSpeakerRatings] Exception:', err);
    return { success: false, error: err.message };
  }
}
