'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from "@supabase/ssr"; // Import for server action
import { cookies } from "next/headers"; // Import for server action
import { Client } from "@upstash/qstash";

// Use service role to bypass RLS and read global event configs/attendance
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


// REFACTORED: subscribeToNotifications (Originally API Route)
export async function subscribeToNotifications(subscription: any, userAgent: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
             try {
               cookiesToSet.forEach(({ name, value, options }) =>
                 cookieStore.set(name, value, options)
               )
             } catch {}
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    
    // Auth Check
    if (!session) {
      console.error('[subscribeToNotifications] Unauthorized attempt');
      return { success: false, error: 'Unauthorized' };
    }

    // Validation
    if (!subscription || !subscription.endpoint || !subscription.keys) {
        console.error('[subscribeToNotifications] Invalid subscription data');
        return { success: false, error: 'Invalid subscription data' };
    }

    // Database Operation
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { 
          user_id: session.user.id, 
          subscription: subscription,
          user_agent: userAgent
        },
        { onConflict: 'user_id, subscription' }
      );

    if (error) {
       console.error('[subscribeToNotifications] Supabase upsert error:', error);
       return { success: false, error: 'Database error' };
    }

    return { success: true };

  } catch (error) {
    console.error('[subscribeToNotifications] Server Action Exception:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}


export async function checkAndNotifyCertificate(userId: string, eventId: string) {
  console.log(`[checkAndNotifyCertificate] Starting for User: ${userId}, Event: ${eventId}`);
  
  if (!process.env.QSTASH_TOKEN) {
    console.error('[checkAndNotifyCertificate] CRITICAL: QSTASH_TOKEN is missing in environment variables.');
    return;
  }

  const qstash = new Client({ token: process.env.QSTASH_TOKEN });

  try {
    // 1. Get Event Details
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('title, duration_days, gives_certificate')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('[checkAndNotifyCertificate] Event fetch error:', eventError);
      return;
    }

    console.log(`[checkAndNotifyCertificate] Event details:`, { 
        title: event.title, 
        gives_certificate: event.gives_certificate,
        duration_days: event.duration_days 
    });

    if (!event.gives_certificate) {
        console.log('[checkAndNotifyCertificate] Event does not give certificate. Skipping.');
        return;
    }

    // 2. Count Attendance
    // We check exact count against the required days.
    const { count, error: countError } = await supabaseAdmin
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('event_id', eventId);

    if (countError) {
      console.error('[checkAndNotifyCertificate] Attendance count error:', countError);
      return;
    }

    const currentCount = count || 0;
    const required = event.duration_days || 1;

    console.log(`[checkAndNotifyCertificate] Attendance check: ${currentCount}/${required}`);

    // 3. Check Condition
    if (currentCount === required) {
        console.log('[checkAndNotifyCertificate] Condition met. Publishing to QStash...');
        
        // 4. Publish to QStash
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000';

        const destinationUrl = `${baseUrl}/api/qstash/certificate`;
        console.log(`[checkAndNotifyCertificate] Destination URL: ${destinationUrl}`);

        const result = await qstash.publishJSON({
            url: destinationUrl,
            body: {
                userId,
                title: '¡Felicidades! 🎉',
                body: `Has completado tu asistencia al evento "${event.title}". Tu constancia ya está disponible.`,
                url: `/profile/certificates`
            }
        });
        
        console.log('[checkAndNotifyCertificate] QStash Publish Result:', result);
    } else {
        console.log('[checkAndNotifyCertificate] Condition NOT met. No notification sent.');
    }

  } catch (error) {
    console.error('[checkAndNotifyCertificate] COMPLETE FAILURE:', error);
  }
}
