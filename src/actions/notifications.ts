'use server';

import { createClient } from '@supabase/supabase-js';
import { Client } from "@upstash/qstash";

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

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
    if (currentCount === required) {
        // 4. Publish to QStash
        // Use NEXT_PUBLIC_VERCEL_URL or VERCEL_URL if available, otherwise localhost for dev?
        // In Vercel, VERCEL_URL is set but without protocol.
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000';

        await qstash.publishJSON({
            url: `${baseUrl}/api/qstash/certificate`,
            body: {
                userId,
                title: '¡Felicidades! 🎉',
                body: `Has completado tu asistencia al evento "${event.title}". Tu constancia ya está disponible.`,
                url: `/profile/certificates`
            }
        });
    }

  } catch (error) {
    console.error('Error in checkAndNotifyCertificate:', error);
  }
}
