'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

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
    <div className="flex justify-center items-center min-h-[calc(100vh-6rem)] w-full py-8 animate-in fade-in duration-700">
        {profile ? (
            <ProfileCard profile={profile} />
        ) : null}
    </div>
  );
}
