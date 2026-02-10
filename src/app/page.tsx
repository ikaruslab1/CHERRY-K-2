import { cookies } from 'next/headers';
import { createServerClient, CookieOptions } from '@supabase/ssr';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    return redirect('/profile');
  }

  // Redirect to login page, preserving any query parameters
  const searchParams = await props.searchParams;
  let queryString = '';
  if (searchParams) {
      queryString = new URLSearchParams(
          Object.entries(searchParams).reduce((acc, [key, value]) => {
              if (typeof value === 'string') acc[key] = value;
              else if (Array.isArray(value)) acc[key] = value.join(',');
              return acc;
          }, {} as Record<string, string>)
      ).toString();
  }
  const destination = queryString ? `/login?${queryString}` : '/login';
  
  return redirect(destination);
}
