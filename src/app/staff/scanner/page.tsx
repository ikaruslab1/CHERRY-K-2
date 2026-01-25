'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { QRScanner } from '@/components/staff/QRScanner';
import { Loader2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
}

export default function StaffScannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
        router.push('/profile'); // Redirect unauthorized back to profile
        return;
      }

      setAuthorized(true);

      // Fetch Events
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title')
        .order('date', { ascending: true });
      
      setEvents(eventsData || []);
      if (eventsData && eventsData.length > 0) {
        setSelectedEventId(eventsData[0].id);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen flex flex-col items-center p-4 bg-slate-950 text-white">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Scanner de Asistencia</h1>
        
        <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Seleccionar Evento</label>
            <select 
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg h-12 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {events.map(event => (
                    <option key={event.id} value={event.id} className="bg-slate-900 text-white">
                        {event.title}
                    </option>
                ))}
            </select>
        </div>

        {selectedEventId ? (
            <QRScanner eventId={selectedEventId} />
        ) : (
            <p className="text-center text-slate-500">Selecciona un evento para comenzar.</p>
        )}
      </div>
    </main>
  );
}
