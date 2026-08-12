'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  short_id: string;
  first_name: string;
  last_name: string;
  degree: string;
  gender: string;
  role: string;
  email?: string;
}

export function UserProfileView() {
  const [userId, setUserId] = useState<string | null>(null);
  const [directProfile, setDirectProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);

      // Check IndexedDB first; if missing, fetch directly from Supabase for instant Gafete rendering
      const localP = await db.profile.get(user.id);
      if (localP) {
        setDirectProfile({
          id: localP.id,
          first_name: localP.first_name,
          last_name: localP.last_name,
          role: localP.role,
          email: localP.email,
          short_id: localP.short_id || '',
          degree: localP.degree || '',
          gender: localP.gender || ''
        });
      } else {
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (p) {
          const fetchedProfile: Profile = {
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            role: p.is_owner ? 'owner' : 'user',
            email: p.email,
            short_id: p.short_id || '',
            degree: p.degree || '',
            gender: p.gender || ''
          };
          setDirectProfile(fetchedProfile);

          // Save to Dexie so future views are offline-ready
          db.profile.put({
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email,
            role: p.is_owner ? 'owner' : 'user',
            is_owner: p.is_owner,
            degree: p.degree,
            short_id: p.short_id,
            gender: p.gender
          }).catch(console.error);
        }
      }
    };

    getUser();
  }, []);

  const liveProfile = useLiveQuery(
    async () => {
        if (!userId) return null;
        const p = await db.profile.get(userId);
        if (!p) return null;

        return {
            id: p.id,
            first_name: p.first_name,
            last_name: p.last_name,
            role: p.role,
            email: p.email,
            short_id: p.short_id || '',
            degree: p.degree || '',
            gender: p.gender || ''
        } as Profile;
    },
    [userId]
  );

  const activeProfile = liveProfile || directProfile;

  return (
    <div className="flex relative justify-center items-center w-full py-2 xs:py-4 md:py-8 min-h-[70vh] md:min-h-[calc(100vh-12rem)] animate-in fade-in duration-700">
        {/* Glow backdrop using the conference accent gradient */}
        <div 
          className="absolute w-[280px] h-[280px] xs:w-[350px] xs:h-[350px] rounded-full blur-[80px] xs:blur-[100px] opacity-15 pointer-events-none -z-10 transition-all duration-500"
          style={{ background: 'var(--color-acid-gradient)' }}
        />
        {activeProfile ? (
            <ProfileCard profile={activeProfile} />
        ) : (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-acid)]" />
              <p className="text-xs text-gray-400 font-medium">Cargando gafete...</p>
            </div>
        )}
    </div>
  );
}
