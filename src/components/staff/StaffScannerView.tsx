'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { QRScanner } from '@/components/staff/QRScanner';
import { Loader2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
}

export function StaffScannerView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
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
    fetchEvents();
  }, []);

  if (loading) {
      return <Loader2 className="h-8 w-8 animate-spin text-[#DBF227]" />;
  }

  return (
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#373737]">Scanner de Asistencia</h2>
        
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-500">Seleccionar Evento</label>
            <select 
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl h-12 px-4 text-[#373737] focus:outline-none focus:ring-2 focus:ring-[#DBF227]"
            >
                {events.map(event => (
                    <option key={event.id} value={event.id}>
                        {event.title}
                    </option>
                ))}
            </select>
        </div>

        {selectedEventId ? (
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <QRScanner eventId={selectedEventId} />
            </div>
        ) : (
            <p className="text-center text-gray-500">Selecciona un evento para comenzar.</p>
        )}
      </div>
  );
}
