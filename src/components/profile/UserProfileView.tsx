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

  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const profile = useLiveQuery(
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

  return (
    <div className="flex relative justify-center items-center w-full py-2 xs:py-4 md:py-8 min-h-[70vh] md:min-h-[calc(100vh-12rem)] animate-in fade-in duration-700">
        {/* Glow backdrop using the conference accent gradient */}
        <div 
          className="absolute w-[280px] h-[280px] xs:w-[350px] xs:h-[350px] rounded-full blur-[80px] xs:blur-[100px] opacity-15 pointer-events-none -z-10 transition-all duration-500"
          style={{ background: 'var(--color-acid-gradient)' }}
        />
        {profile ? (
            <ProfileCard profile={profile} />
        ) : (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-acid)]" />
              <p className="text-xs text-gray-400 font-medium">Cargando gafete...</p>
            </div>
        )}
    </div>
  );
}
