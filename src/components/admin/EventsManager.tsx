'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash, Edit, Plus, X } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    type: string;
}

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isEditing, setIsEditing] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<Event>();

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('date');
    setEvents(data || []);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onSubmit = async (data: any) => {
    if (isEditing) {
        await supabase.from('events').update(data).eq('id', isEditing.id);
    } else {
        await supabase.from('events').insert(data);
    }
    setIsEditing(null);
    setIsCreating(false);
    reset();
    fetchEvents();
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
      setValue('title', event.title);
      setValue('description', event.description);
      setValue('location', event.location);
      setValue('date', new Date(event.date).toISOString().slice(0, 16));
      setValue('type', event.type);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Agenda</h3>
        <Button onClick={() => { setIsCreating(true); setIsEditing(null); reset(); }}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
        </Button>
      </div>

      {isCreating && (
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 animate-in fade-in slide-in-from-top-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <Input {...register('title', { required: true })} placeholder="Título" />
                      <Input {...register('type')} placeholder="Tipo (Conferencia, Taller...)" />
                  </div>
                  <textarea 
                    {...register('description')} 
                    placeholder="Descripción" 
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                  />
                  <div className="grid grid-cols-2 gap-4">
                      <Input {...register('location')} placeholder="Lugar" />
                      <Input {...register('date')} type="datetime-local" className="text-white" />
                  </div>
                  <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                      <Button type="submit">Guardar</Button>
                  </div>
              </form>
          </div>
      )}

      <div className="grid grid-cols-1 gap-4">
          {events.map(event => (
              <div key={event.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center group hover:bg-white/10 transition-all border border-white/10">
                  <div>
                      <h4 className="font-bold text-lg">{event.title}</h4>
                      <p className="text-sm text-slate-400">{new Date(event.date).toLocaleString()} | {event.location}</p>
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full mt-1 inline-block">{event.type}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(event)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => deleteEvent(event.id)}><Trash className="h-4 w-4" /></Button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}
