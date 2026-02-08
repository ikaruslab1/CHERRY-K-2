'use server';

import { createClient } from '@supabase/supabase-js';
import { sendPushToUser } from '@/lib/notifications';

// Use service role to bypass RLS and read global event configs/attendance
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkAndNotifyCertificate(userId: string, eventId: string) {
  try {
    // 1. Get Event Details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('title, duration_days, gives_certificate')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Event fetch error inside notify:', eventError);
      return;
    }

    if (!event.gives_certificate) return;

    // 2. Count Attendance
    const { count, error: countError } = await supabaseAdmin
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (countError) {
      console.error('Attendance count error:', countError);
      return;
    }

    const currentCount = count || 0;
    const required = event.duration_days || 1;

    // 3. Check Condition
    // If this function is called AFTER the insert, currentCount should include the new one.
    // We send notification ONLY if they just met the requirement.
    // i.e., currentCount === required. 
    // If they have more, they already got it. (Unless we want to re-notify? No).
    
    if (currentCount === required) {
        // 4. Send Push
        await sendPushToUser(userId, {
            title: '¡Felicidades! 🎉',
            body: `Has completado tu asistencia al evento "${event.title}". Tu constancia ya está disponible.`,
            url: `/profile/certificates` // Redirect to certificates view
        });
    }

  } catch (error) {
    console.error('Error in checkAndNotifyCertificate:', error);
  }
}
