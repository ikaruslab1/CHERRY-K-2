import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import { LandingRenderer } from '@/components/landing/LandingRenderer';
import { ConferenceLandingConfig } from '@/types';

export const revalidate = 60; // Revalidate every minute

interface Props {
  params: {
    conferenceId: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { conferenceId } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );
  const { data: conference } = await supabase
    .from('conferences')
    .select('title, description, custom_landing_enabled')
    .eq('id', conferenceId)
    .single();

  if (!conference || !conference.custom_landing_enabled) {
    return {
      title: 'Evento no encontrado',
      robots: 'noindex, nofollow',
    };
  }

  return {
    title: conference.title,
    description: conference.description,
    robots: 'noindex',
  };
}

export default async function EventLandingPage({ params }: Props) {
  const { conferenceId } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  // Fetch conference config from Supabase
  const { data: conference, error } = await supabase
    .from('conferences')
    .select('*')
    .eq('id', conferenceId)
    .single();

  if (error || !conference || !conference.custom_landing_enabled) {
    const { redirect } = await import('next/navigation');
    return redirect('/');
  }

  const config = conference.conference_landing_config as ConferenceLandingConfig | null;

  return <LandingRenderer config={config} conference={conference} />;
}
