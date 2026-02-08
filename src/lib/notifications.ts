import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Lazy initialization flag
let vapidInitialized = false;

function ensureVapidInitialized() {
  if (!vapidInitialized) {
    // Only initialize VAPID details when actually needed (at runtime, not build time)
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.VAPID_SUBJECT) {
      console.warn('VAPID keys are missing!');
    }
    
    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
      process.env.NEXT_PUBLIC_VAPID_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    );
    
    vapidInitialized = true;
  }
}

export async function sendPushToUser(userId: string, payload: { title: string, body: string, url?: string }) {
  // Initialize VAPID details on first use
  ensureVapidInitialized();
  try {
    // Get user subscriptions
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('id, subscription')
      .eq('user_id', userId);

    if (error || !subscriptions) {
      console.error('Error fetching subscriptions:', error);
      return;
    }

    const payloadString = JSON.stringify(payload);

    const promises = subscriptions.map((sub: any) => 
      webPush.sendNotification(sub.subscription, payloadString)
        .catch(async (err: any) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription gone, remove from DB
            console.log(`Subscription ${sub.id} gone, deleting...`);
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          } else {
             console.error('Error sending push:', err);
          }
        })
    );

    await Promise.all(promises);
  } catch (err: any) {
    console.error('Global error sending push:', err);
  }
}

export async function sendPushToMultipleUsers(userIds: string[], payload: { title: string, body: string, url?: string }) {
    // For bulk sending, iterate or batch. careful with Vercel limits.
    // Ideally use Edge Function for this part.
    // For now simple loop.
    for (const userId of userIds) {
        await sendPushToUser(userId, payload);
    }
}
