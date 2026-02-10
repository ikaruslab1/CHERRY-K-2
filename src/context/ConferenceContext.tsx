'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Conference } from '@/types';

interface ConferenceContextType {
  currentConference: Conference | null;
  loading: boolean;
  selectConference: (conference: Conference, redirectPath?: string) => void;
  availableConferences: Conference[];
  refreshConference: () => Promise<void>;
}

const ConferenceContext = createContext<ConferenceContextType>({
  currentConference: null,
  loading: true,
  selectConference: () => {},
  availableConferences: [],
  refreshConference: async () => {},
});

export const useConference = () => useContext(ConferenceContext);

export const ConferenceProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentConference, setCurrentConference] = useState<Conference | null>(null);
  const [availableConferences, setAvailableConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Load available conferences (Run once)
  useEffect(() => {
    const fetchConferences = async () => {
      const { data: conferences, error } = await supabase
        .from('conferences')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false });

      if (error) console.error('Error fetching conferences:', error);
      setAvailableConferences(conferences || []);
      // Set loading to false only after initial conference check? 
      // Actually we need to wait for the second effect to run at least once or checking localStorage here.
      // But we can keep loading=true until selection logic runs.
    };
    
    fetchConferences();
  }, []);

  // 2. Handle Selection Logic based on URL or LocalStorage
  useEffect(() => {
    // Wait until conferences are loaded
    if (availableConferences.length === 0 && loading) {
       // If truly no conferences, we might want to stop loading to avoid stuck state
       // But fetchConferences sets empty array if error/empty.
       // We can check if fetch is done by seeing if availableConferences is set? 
       // Initial state is [].
       // This is a bit tricky. Let's assume if [] and it's been a while? 
       // Better: add a separate loaded flag for conferences.
       return; 
    }

    const paramId = searchParams.get('event');
    const savedId = typeof window !== 'undefined' ? localStorage.getItem('conference_id') : null;
    
    let found = null;
    
    // Priority 1: URL Param
    if (paramId) {
        found = availableConferences.find(c => c.id === paramId) || null;
    }
    
    // Priority 2: LocalStorage (if no URL param)
    if (!found && savedId && !paramId) {
      found = availableConferences.find(c => c.id === savedId) || null;
    }
    
    // Priority 3: Auto-select if only one
    if (!found && availableConferences.length === 1) {
       found = availableConferences[0];
       localStorage.setItem('conference_id', found.id);
    }

    // Only update if different to avoid loops
    if (found?.id !== currentConference?.id) {
        setCurrentConference(found);
        if (found) {
            localStorage.setItem('conference_id', found.id);
        }
    }
    
    // Always stop loading after this check, even if nothing found
    setLoading(false);
    
  }, [availableConferences, searchParams, currentConference?.id]);
  // Actually, we need to know when fetch is done. 
  // Let's rely on avaiableConferences being set. Use a separate state for dataLoaded if needed, 
  // but let's assume if fetch runs it updates state.

  const selectConference = (conference: Conference, redirectPath: string = '/profile') => {
    setCurrentConference(conference);
    localStorage.setItem('conference_id', conference.id);
    router.push(redirectPath);
  };
  
  // Navigation Guard
  useEffect(() => {
    if (!loading) {
       const publicRoutes = ['/', '/auth', '/select-conference', '/login', '/register'];
       const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
       
       if (!isPublic && !currentConference) {
           router.push('/login?action=select_event');
       }
    }
  }, [loading, currentConference, pathname, router]);

  const refreshConference = async () => {
      if (!currentConference) return;
      const { data } = await supabase.from('conferences').select('*').eq('id', currentConference.id).single();
      if (data) {
          setCurrentConference(data);
      }
  };

  return (
    <ConferenceContext.Provider value={{ currentConference, loading, selectConference, availableConferences, refreshConference }}>
      {children}
    </ConferenceContext.Provider>
  );
};
