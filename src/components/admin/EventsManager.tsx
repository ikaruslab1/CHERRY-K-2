'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash, Edit, Plus, X } from 'lucide-react';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Controller } from 'react-hook-form';

import { Event, UserProfile } from '@/types';

export function EventsManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [eventType, setEventType] = useState('Conferencia magistral');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const { register, handleSubmit, reset, setValue, control, watch } = useForm<Event>();

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*').order('date');
    setEvents((data as Event[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

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
     setValue('type', eventType);
  }, [eventType, setValue]);

  const onSubmit = async (data: any) => {
    const eventData = { ...data, tags };
    if (isEditing) {
        await supabase.from('events').update(eventData).eq('id', isEditing.id);
    } else {
        await supabase.from('events').insert(eventData);
    }
    setIsEditing(null);
    setIsCreating(false);
    setIsCreating(false);
    reset();
    setEventType('Conferencia magistral');
    setTags([]);
    setTagInput('');
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
      setValue('title', event.title || '');
      setValue('description', event.description || '');
      setValue('location', event.location || '');
      setValue('date', event.date ? new Date(event.date).toISOString().slice(0, 16) : '');
      setValue('type', event.type || 'Conferencia magistral');
      setValue('speaker_id', event.speaker_id || '');
      setEventType(event.type || 'Conferencia magistral');
      setTags(event.tags || []);
      setValue('image_url', event.image_url || '');
  };

  const addTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter' && e.key !== ',') return;
    
    if (e) e.preventDefault();
    
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#373737]">Agenda del Evento</h3>
      <div className="flex justify-between items-center">
        <Button onClick={() => { setIsCreating(true); setIsEditing(null); reset(); setEventType('Conferencia magistral'); setTags([]); }} className="bg-[#373737] text-white hover:bg-black">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Evento
        </Button>
      </div>
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 relative max-h-[90vh] flex flex-col">
                
                {/* Progress Bar Detail */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                    <div className="h-full bg-[#DBF227] w-1/3 rounded-r-full" />
                </div>

                <div className="p-5 xs:p-6 md:p-8 pt-6 xs:pt-8 md:pt-10">
                    <div className="mb-6 xs:mb-8">
                        <span className="text-gray-400 text-[10px] xs:text-xs font-bold uppercase tracking-wider">Paso 1/2</span>
                        <h2 className="text-2xl xs:text-3xl font-bold text-[#373737] mt-1 xs:mt-2 leading-tight">
                            {isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}
                        </h2>
                        <p className="text-gray-500 mt-1 xs:mt-2 text-xs xs:text-sm">
                            Llena los detalles para agregar una actividad a la agenda oficial.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto max-h-[60vh] px-1 -mx-1">
                        
                        {/* Type Selection Pills */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-[#373737]">Tipo de Actividad:</label>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-wrap gap-2">
                                    {['Conferencia magistral', 'Charla', 'Taller', 'Otro'].map(type => {
                                        const predefined = ['Conferencia magistral', 'Charla', 'Taller'];
                                        const isSelected = type === 'Otro' 
                                            ? !predefined.includes(eventType) 
                                            : eventType === type;
                                        
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    if (type === 'Otro') setEventType('');
                                                    else setEventType(type);
                                                }}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                                    isSelected 
                                                    ? 'bg-[#DBF227]/20 border-[#DBF227] text-[#373737]' 
                                                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                {isSelected && <span className="mr-2 text-[#aacc00]">●</span>}
                                                {type}
                                            </button>
                                        );
                                    })}
                                </div>
                                {['Conferencia magistral', 'Charla', 'Taller'].includes(eventType) ? null : (
                                    <input 
                                        type="text"
                                        value={eventType || ''}
                                        onChange={(e) => setEventType(e.target.value)}
                                        placeholder="Escribe el tipo de actividad..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#373737] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent transition-all bg-gray-50/50 animate-in fade-in slide-in-from-top-2"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#373737]">Título:</label>
                            <input 
                                {...register('title', { required: true })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#373737] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent transition-all bg-gray-50/50"
                                placeholder="Ej. Keynote: Futuro de la Tecnología"
                            />
                        </div>

                        {/* Image URL Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#373737]">URL de Imagen de Portada (Opcional):</label>
                            <input 
                                {...register('image_url')}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#373737] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent transition-all bg-gray-50/50"
                                placeholder="Ej. https://ejemplo.com/imagen.jpg"
                            />
                        </div>

                        {/* Tags Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#373737]">Etiquetas (Tags):</label>
                            <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus-within:ring-2 focus-within:ring-[#DBF227] focus-within:border-transparent transition-all flex flex-wrap gap-2 items-center">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-white border border-gray-200 text-[#373737] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 animate-in zoom-in-50 duration-200">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500">
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                                <div className="flex-grow flex items-center gap-2 min-w-[120px]">
                                    <input 
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={addTag}
                                        className="bg-transparent border-none outline-none text-sm text-[#373737] placeholder-gray-400 w-full"
                                        placeholder="Escribe un tag..."
                                    />
                                    <button 
                                        type="button" 
                                        onClick={addTag}
                                        disabled={!tagInput.trim()}
                                        className="p-1 rounded-full bg-gray-200 text-gray-500 hover:bg-[#DBF227] hover:text-[#373737] disabled:opacity-50 disabled:hover:bg-gray-200 disabled:hover:text-gray-500 transition-colors"
                                        title="Agregar etiqueta"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Escribe y presiona Enter o el botón + para agregar.</p>
                        </div>

                         {/* Description */}
                         <div className="space-y-2">
                             <Controller
                                name="description"
                                control={control}
                                defaultValue=""
                                rules={{ 
                                    maxLength: { value: 200, message: "La descripción no puede exceder 200 caracteres" } 
                                }}
                                render={({ field: { value, onChange } }) => (
                                    <RichTextEditor
                                        label="Descripción:"
                                        value={value || ''}
                                        onChange={(val) => {
                                            // Optional: Enforce strict limit logic here if we wanted to prevent typing
                                            // But for now we rely on the visual counter + form validation or just allowing it but showing red.
                                            // The user asked for a counter/limit. Limiting INPUT is harder in ContentEditable properly.
                                            // We will pass the value.
                                            onChange(val);
                                        }}
                                        maxLength={200}
                                        placeholder="Breve descripción de la actividad..."
                                    />
                                )}
                             />
                         </div>

                {/* Location & Date */}
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-[#373737]">Ubicación:</label>
                                 <input 
                                    {...register('location')}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#373737] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent bg-gray-50/50"
                                    placeholder="Ej. Auditorio A"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-sm font-bold text-[#373737]">Horario:</label>
                                 <input 
                                    {...register('date')}
                                    type="datetime-local"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#373737] focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent bg-gray-50/50"
                                />
                             </div>
                        </div>

                        {/* Speaker Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[#373737]">Ponente:</label>
                            <select
                                {...register('speaker_id')}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#373737] focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent bg-gray-50/50 appearance-none"
                            >
                                <option value="">Seleccionar Ponente (Opcional)</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.role === 'ponente' ? '🎤 ' : ''} {user.first_name} {user.last_name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-6 flex flex-col-reverse xs:flex-row justify-between items-center border-t border-gray-100 mt-8 gap-3 xs:gap-0">
                            <button 
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="w-full xs:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                                Cancelar
                            </button>
                             <button 
                                type="submit"
                                className="w-full xs:w-auto px-8 py-3 rounded-xl text-sm font-bold bg-[#DBF227] text-[#373737] hover:bg-[#d4e626] hover:shadow-lg hover:shadow-[#DBF227]/20 transition-all transform hover:-translate-y-0.5"
                            >
                                {isEditing ? 'Guardar Cambios' : 'Crear Evento'}
                            </button>
                        </div>
                    </form>
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
