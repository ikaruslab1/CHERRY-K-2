'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Conference } from '@/types';

interface ConferenceContextType {
  currentConference: Conference | null;
  loading: boolean;
  selectConference: (conference: Conference) => void;
  availableConferences: Conference[];
}

const ConferenceContext = createContext<ConferenceContextType>({
  currentConference: null,
  loading: true,
  selectConference: () => {},
  availableConferences: [],
});

export const useConference = () => useContext(ConferenceContext);

export const ConferenceProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentConference, setCurrentConference] = useState<Conference | null>(null);
  const [availableConferences, setAvailableConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load available conferences and restore session
    const init = async () => {
      // 1. Fetch active conferences
      const { data: conferences, error } = await supabase
        .from('conferences')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) console.error('Error fetching conferences:', error);
      const list = conferences || [];
      setAvailableConferences(list);

      // 2. Try to recover from localStorage
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('conference_id') : null;
      
      let found = null;
      if (savedId) {
        found = list.find(c => c.id === savedId) || null;
      }
      
      // If only one conference exists and no saved selection, might auto-select?
      // Better not force it unless specific requirement, but for migration UX it helps.
      if (!found && list.length === 1) {
         found = list[0];
         localStorage.setItem('conference_id', found.id);
      }

      setCurrentConference(found);
      setLoading(false);
    };
    
    init();
  }, []);

  const selectConference = (conference: Conference) => {
    setCurrentConference(conference);
    localStorage.setItem('conference_id', conference.id);
    router.push('/profile');
  };
  
  // Navigation Guard
  useEffect(() => {
    if (!loading) {
       const publicRoutes = ['/', '/auth', '/select-conference'];
       const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
       
       if (!isPublic && !currentConference) {
           router.push('/select-conference');
       }
    }
  }, [loading, currentConference, pathname, router]);

  return (
    <ConferenceContext.Provider value={{ currentConference, loading, selectConference, availableConferences }}>
      {children}
    </ConferenceContext.Provider>
  );
};
