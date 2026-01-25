'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { Button } from '@/components/ui/Button';
import { Loader2, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

interface Profile {
  id: string;
  short_id: string;
  first_name: string;
  last_name: string;
  degree: string;
  gender: string;
  role: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  type: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<Set<string>>(new Set());
  const [interests, setInterests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

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
    };

    loadData();
  }, [router]);

  const toggleInterest = async (eventId: string) => {
    if (!profile) return;
    
    const isInterested = interests.has(eventId);
    let error;

    if (isInterested) {
      const { error: err } = await supabase
        .from('event_interests')
        .delete()
        .eq('user_id', profile.id)
        .eq('event_id', eventId);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('event_interests')
        .insert({ user_id: profile.id, event_id: eventId });
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-slate-950 text-white pb-24">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
           <h1 className="text-xl font-bold">Mi Perfil</h1>
           <Button variant="ghost" onClick={async () => {
             await supabase.auth.signOut();
             router.push('/');
           }} className="text-red-400 hover:text-red-300 hover:bg-red-950/30">
             Cerrar Sesión
           </Button>
        </div>

        {/* Identidad Digital */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-500">
          <ProfileCard profile={profile} />
        </section>

        {/* Agenda */}
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
           <h2 className="text-2xl font-bold flex items-center gap-2">
             <Calendar className="h-6 w-6 text-indigo-500" />
             Agenda del Evento
           </h2>
           
           {events.length === 0 ? (
             <p className="text-slate-500 italic">No hay eventos programados aún.</p>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {events.map((event) => {
                 const isAttended = attendance.has(event.id);
                 const isInterested = interests.has(event.id);

                 return (
                   <div key={event.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-indigo-500/50 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-1 rounded-full font-medium border border-indigo-500/20">
                          {event.type}
                        </span>
                        {isAttended && (
                          <span className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded-full border border-green-500/20">
                            <CheckCircle2 className="h-3 w-3" /> Asistencia Agendada
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-400 transition-colors">{event.title}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-sm font-mono text-slate-300">
                           {new Date(event.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </div>
                        <Button 
                          onClick={() => toggleInterest(event.id)}
                          variant={isInterested ? "primary" : "secondary"}
                          size="sm"
                          className={isInterested ? "bg-indigo-600" : ""}
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
      </div>
    </main>
  );
}
