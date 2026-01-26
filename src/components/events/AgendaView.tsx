'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Calendar, MapPin, CheckCircle2, Loader2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  type: string;
}

export function AgendaView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<Set<string>>(new Set());
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        // Fetch Events
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });
        setEvents(eventsData || []);

        // Fetch Attendance
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('event_id')
          .eq('user_id', user.id);
        if (attendanceData) {
          setAttendance(new Set(attendanceData.map(a => a.event_id)));
        }

        // Fetch Interests
        const { data: interestsData } = await supabase
          .from('event_interests')
          .select('event_id')
          .eq('user_id', user.id);
        if (interestsData) {
          setInterests(new Set(interestsData.map(i => i.event_id)));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading agenda:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleInterest = async (eventId: string) => {
    if (!userId) return;
    
    const isInterested = interests.has(eventId);
    let error;

    if (isInterested) {
      const { error: err } = await supabase
        .from('event_interests')
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('event_interests')
        .insert({ user_id: userId, event_id: eventId });
      error = err;
    }

    if (!error) {
      const newInterests = new Set(interests);
      if (isInterested) newInterests.delete(eventId);
      else newInterests.add(eventId);
      setInterests(newInterests);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#DBF227]" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-[#373737]">
        <Calendar className="h-6 w-6" />
        Agenda del Evento
      </h2>
      
      {events.length === 0 ? (
        <p className="text-gray-400 italic">No hay eventos programados aún.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const isAttended = attendance.has(event.id);
            const isInterested = interests.has(event.id);

            return (
              <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium border border-gray-200">
                    {event.type}
                  </span>
                  {isAttended && (
                    <span className="flex items-center gap-1 text-[#373737] text-xs font-bold bg-[#DBF227]/20 px-2 py-1 rounded-full border border-[#DBF227]/50">
                      <CheckCircle2 className="h-3 w-3" /> Asistencia Agendada
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#DBF227] transition-colors text-[#373737]">{event.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="text-sm font-mono text-gray-400">
                      {new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </div>
                  <Button 
                    onClick={() => toggleInterest(event.id)}
                    variant={isInterested ? "primary" : "secondary"}
                    size="sm"
                    className={isInterested ? "bg-[#373737] text-white" : ""}
                  >
                    {isInterested ? "Te interesa" : "Me interesa"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
