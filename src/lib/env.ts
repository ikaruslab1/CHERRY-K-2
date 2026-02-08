// Environment configuration for client-side access
export const env = {
  NEXT_PUBLIC_VAPID_KEY: process.env.NEXT_PUBLIC_VAPID_KEY || '',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;
