import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import webPush from 'web-push';

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, keys } = await req.json();

    if (!endpoint || !keys) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const subscription = { endpoint, keys };

    // Set user agent
    const userAgent = req.headers.get('user-agent') || 'Unknown';

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
       console.error('Supabase error:', error);
       return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
