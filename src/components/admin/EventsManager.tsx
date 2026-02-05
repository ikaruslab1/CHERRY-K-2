'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Trash, Edit, Plus } from 'lucide-react';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { Event, UserProfile } from '@/types';
import { EventForm } from '@/components/admin/EventForm';
import { useConference } from '@/context/ConferenceContext';

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { currentConference } = useConference();

  const fetchEvents = async () => {
    if (!currentConference) return;
    setLoading(true);
    const { data } = await supabase
        .from('events')
        .select('*')
        .eq('conference_id', currentConference.id)
        .order('date');
    setEvents((data as Event[]) || []);
    setLoading(false);
  };

  const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*').order('first_name');
      if (data) {
          const sorted = (data as UserProfile[]).sort((a, b) => {
              if (a.role === 'ponente' && b.role !== 'ponente') return -1;
              if (a.role !== 'ponente' && b.role === 'ponente') return 1;
              return 0;
          });
          setUsers(sorted);
      }
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, [currentConference]);

  const onSubmit = async (data: any) => {
    if (!currentConference) {
        alert("Error de sesión: No hay congreso seleccionado.");
        return;
    }
    try {
        const eventData = {
            title: data.title,
            description: data.description,
            location: data.location,
            date: data.date,
            type: data.type,
            speaker_id: data.speaker_id || null,
            image_url: data.image_url || null,
            duration_days: data.duration_days,
            gives_certificate: data.gives_certificate,
            tags: data.tags,
            conference_id: currentConference?.id
        };

        if (isEditing) {
            const { error } = await supabase.from('events').update(eventData).eq('id', isEditing.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('events').insert(eventData);
            if (error) throw error;
        }

        setIsEditing(null);
        setIsCreating(false);
        fetchEvents();
    } catch (error: any) {
        console.error('Error saving event:', error);
        alert('Error al guardar el evento: ' + (error.message || 'Verifica los datos'));
    }
  };

  const deleteEvent = async (id: string) => {
      if (confirm("¿Eliminar evento?")) {
          await supabase.from('events').delete().eq('id', id);
          fetchEvents();
      }
  };

  const startEdit = (event: Event) => {
      setIsEditing(event);
      setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#373737]">Agenda del Evento</h3>
        <div className="flex justify-between items-center">
            <Button onClick={() => { setIsCreating(true); setIsEditing(null); }} className="bg-[#373737] text-white hover:bg-black">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
            </Button>
        </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/50 animate-in fade-in duration-300">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* Progress Bar Detail */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                    <div className="h-full bg-[#DBF227] w-1/3 rounded-r-full" />
                </div>

                <div className="p-5 xs:p-6 md:p-8 pt-6 xs:pt-8 md:pt-10">
                    <div className="mb-6 xs:mb-8">
                        <h2 className="text-2xl xs:text-3xl font-bold text-[#373737] mt-1 xs:mt-2 leading-tight">
                            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
                        </h2>
                        <p className="text-gray-500 mt-1 xs:mt-2 text-xs xs:text-sm">
                            Llena los detalles para agregar una actividad a la agenda oficial.
                        </p>
                    </div>

                    <EventForm
                        initialData={isEditing}
                        isEditing={!!isEditing}
                        users={users}
                        onSubmit={onSubmit}
                        onCancel={() => setIsCreating(false)}
                    />
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
          {loading ? (
             <ContentPlaceholder type="grid" count={3} />
          ) : (
          <>
            {events.map(event => (
              <div key={event.id} className="bg-white p-5 rounded-2xl flex flex-col xs:flex-row justify-between items-start xs:items-center group transition-all gap-4 xs:gap-0">
                  <div className="w-full xs:w-auto">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{event.type}</span>
                        <span className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString([], {weekday: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <h4 className="font-bold text-lg text-[#373737]">{event.title}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#DBF227]"></span> 
                        {event.location}
                      </p>
                  </div>
                  <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(event)} className="text-gray-400 hover:text-[#373737] hover:bg-gray-100 rounded-xl">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl" onClick={() => deleteEvent(event.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                  </div>
              </div>
            ))}
          </>
          )}
      </div>
    </div>
  );
}
