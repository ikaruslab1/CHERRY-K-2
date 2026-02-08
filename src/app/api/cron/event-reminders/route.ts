import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Using the admin client (service role if configured differently, but lib/supabase usually is public/anon). 
// WAIT: lib/supabase is client-side. I need a Service Role client for Cron to read all data and not be blocked by RLS of a random user.

import { createClient } from '@supabase/supabase-js';
import { sendPushToUser } from '@/lib/notifications';

// Create a service role client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Verify Cron secret if needed (Vercel Cron)
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
    const twentyMinutesLater = new Date(now.getTime() + 20 * 60 * 1000);

    // Get events starting soon
    const { data: events, error: eventsError } = await supabaseAdmin
      .from('events')
      .select('id, title, date')
      .gt('date', tenMinutesLater.toISOString())
      .lt('date', twentyMinutesLater.toISOString());

    if (eventsError) throw eventsError;

    if (!events || events.length === 0) {
      return NextResponse.json({ message: 'No events starting soon' });
    }

    let notifiedCount = 0;

    for (const event of events) {
      // Get interested users
      const { data: interests, error: interestsError } = await supabaseAdmin
        .from('event_interests')
        .select('user_id')
        .eq('event_id', event.id);

      if (interestsError) {
        console.error(`Error fetching interests for event ${event.id}:`, interestsError);
        continue;
      }

      if (!interests || interests.length === 0) continue;

      // Send push to each user
      for (const interest of interests) {
        await sendPushToUser(interest.user_id, {
          title: '¡Tu evento está por comenzar!',
          body: `El evento "${event.title}" comienza en 10 minutos.`,
          url: `/profile/events/${event.id}` // Link to event details
        });
        notifiedCount++;
      }
    }

    return NextResponse.json({ success: true, notified: notifiedCount });
  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
