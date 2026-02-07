'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';

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
      // 1. Load from cache first for offline support
      const cachedProfile = localStorage.getItem('offline_user_profile');
      if (cachedProfile) {
        try {
          setProfile(JSON.parse(cachedProfile));
          setLoading(false);
        } catch (e) {
          console.error("Failed to parse cached profile", e);
        }
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (profileData) {
            setProfile(profileData);
            // Update cache
            localStorage.setItem('offline_user_profile', JSON.stringify(profileData));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error in loadProfile or offline:', error);
        // If no cache and error, stop loading state
        setLoading(false); 
      }
    };

    loadProfile();
  }, []);

  // Removed blocking loader to allow immediate smooth rendering
  // Use a consistent container for both loading and content to prevent layout shifts
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-6rem)] w-full py-8 animate-in fade-in duration-700">
        {loading ? null : profile ? (
            <ProfileCard profile={profile} />
        ) : null}
    </div>
  );
}
