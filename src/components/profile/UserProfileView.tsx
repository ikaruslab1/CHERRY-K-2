'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  short_id: string;
  first_name: string;
  last_name: string;
  degree: string;
  gender: string;
  role: string;
}

export function UserProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);
        setLoading(false);
      } catch (error) {
        console.error('Error in loadProfile:', error);
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Removed blocking loader to allow immediate smooth rendering
  /*if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-[#373737]">
        <Loader2 className="h-8 w-8 animate-spin text-[#DBF227]" />
      </div>
    );
  }*/

  if (!profile && !loading) return null; // Only return null if done loading and no profile (error case)

  // Use a slight fade-in for the content itself if desired, or rely on parent
  return (
    <div className="flex justify-center items-center py-8 animate-in fade-in duration-700">
        {profile ? <ProfileCard profile={profile} /> : null}
    </div>
  );
}
