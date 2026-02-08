import { cookies } from 'next/headers';
import { createServerClient, CookieOptions } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import HomeClientView from '@/views/HomeClientView';
import { Conference } from '@/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
           try {
             cookiesToSet.forEach(({ name, value, options }) =>
               cookieStore.set(name, value, options)
             )
           } catch {
             // The `setAll` method was called from a Server Component.
             // This can be ignored if you have middleware refreshing user sessions.
           }
        },
      },
    }
  );

  // 1. Server-side Session Check (Fast Redirect)
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    redirect('/profile');
  }

  // 2. Fetch Data (No Waterfall)
  const { data: conferences } = await supabase
    .from('conferences')
    .select('*')
    .eq('is_active', true)
    .order('start_date', { ascending: false });

  return <HomeClientView initialConferences={(conferences as Conference[]) || []} />;
}
