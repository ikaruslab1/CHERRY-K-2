'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Trash, Edit, Plus, X, Search, ChevronDown, Check } from 'lucide-react';
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
  const [eventType, setEventType] = useState('Conferencia Magistral');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const { register, handleSubmit, reset, setValue, control, watch } = useForm<Event>();
  
  // Custom Speaker Select State
  const [speakerSearch, setSpeakerSearch] = useState('');
  const [isSpeakerOpen, setIsSpeakerOpen] = useState(false);

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
    try {
        const eventData = {
            title: data.title,
            description: data.description,
            location: data.location,
            date: data.date,
            type: eventType,
            speaker_id: watch('speaker_id') || null,
            image_url: data.image_url || null,
            duration_days: data.duration_days,
            gives_certificate: data.gives_certificate,
            tags
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
        reset();
        setEventType('Conferencia Magistral');
        setValue('speaker_id', '');
        setTags([]);
        setTagInput('');
        setSpeakerSearch(''); // Reset speaker search
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
      setValue('title', event.title || '');
      setValue('description', event.description || '');
      setValue('location', event.location || '');
      setValue('date', event.date ? new Date(event.date).toISOString().slice(0, 16) : '');
      setValue('type', event.type || 'Conferencia Magistral');
      setValue('speaker_id', event.speaker_id || '');
      setEventType(event.type || 'Conferencia Magistral');
      setTags(event.tags || []);
      setValue('image_url', event.image_url || '');
      setValue('gives_certificate', event.gives_certificate || false);
      setValue('duration_days', event.duration_days || 1);
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
        <Button onClick={() => { setIsCreating(true); setIsEditing(null); reset(); setEventType('Conferencia Magistral'); setTags([]); }} className="bg-[#373737] text-white hover:bg-black">
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
                                    {['Conferencia Magistral', 'Conferencia', 'Ponencia', 'Taller', 'Actividad'].map(type => {
                                        const isSelected = eventType === type;
                                        
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setEventType(type)}
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

                        {/* Duration */}
                        <div className="space-y-2">
                             <label className="text-sm font-bold text-[#373737]">Duración (Días):</label>
                             <input 
                                {...register('duration_days', { valueAsNumber: true, min: 1 })}
                                type="number"
                                min="1"
                                defaultValue={1}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#373737] focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent bg-gray-50/50"
                            />
                        </div>

                         {/* Certificate Switch */}
                         <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${watch('gives_certificate') ? 'bg-[#DBF227]/20 border-[#DBF227]' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'}`}>
                            <div className="flex-1">
                                <label className="text-sm font-bold text-[#373737] block">Dar constancia</label>
                                <p className={`text-xs transition-colors ${watch('gives_certificate') ? 'text-gray-600' : 'text-gray-400'}`}>Activar si este evento otorga constancia de participación.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    {...register('gives_certificate')} 
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DBF227]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DBF227]"></div>
                            </label>
                        </div>

                        {/* Speaker Selection (Custom Combobox) */}
                        <div className="space-y-2 relative">
                            <label className="text-sm font-bold text-[#373737]">Ponente:</label>
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <input
                                        type="text"
                                        value={isSpeakerOpen ? speakerSearch : (users.find(u => u.id === watch('speaker_id')) ? `${users.find(u => u.id === watch('speaker_id'))?.first_name} ${users.find(u => u.id === watch('speaker_id'))?.last_name}` : '')}
                                        placeholder="Buscar ponente..."
                                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-[#373737] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent bg-gray-50/50 transition-all"
                                        onFocus={() => {
                                            const currentId = watch('speaker_id');
                                            const user = users.find(u => u.id === currentId);
                                            setSpeakerSearch(user ? `${user.first_name} ${user.last_name}` : '');
                                            setIsSpeakerOpen(true);
                                        }}
                                        onChange={(e) => {
                                            setSpeakerSearch(e.target.value);
                                            setIsSpeakerOpen(true);
                                        }}
                                        onBlur={() => {
                                            // Small delay to allow click event on options to fire
                                            setTimeout(() => setIsSpeakerOpen(false), 200);
                                        }}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                         {watch('speaker_id') && (
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setValue('speaker_id', '');
                                                    setSpeakerSearch('');
                                                }}
                                                className="p-1 hover:bg-gray-200 rounded-full text-gray-400"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                         )}
                                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isSpeakerOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {isSpeakerOpen && (
                                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                                        {(() => {
                                            const lowerQuery = speakerSearch.toLowerCase();
                                            const filtered = users.filter(u => 
                                                `${u.first_name} ${u.last_name}`.toLowerCase().includes(lowerQuery) || 
                                                u.email?.toLowerCase().includes(lowerQuery)
                                            );
                                            
                                            // Split into Ponentes and Others
                                            const ponentes = filtered.filter(u => u.role === 'ponente');
                                            const others = filtered.filter(u => u.role !== 'ponente');
                                            
                                            if (filtered.length === 0) {
                                                return <div className="p-4 text-center text-sm text-gray-400">No se encontraron usuarios.</div>;
                                            }

                                            return (
                                                <div className="py-2">
                                                    {ponentes.length > 0 && (
                                                        <div>
                                                            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0 backdrop-blur-sm">Ponentes</div>
                                                            {ponentes.map(user => (
                                                                <div 
                                                                    key={user.id}
                                                                    onMouseDown={() => {
                                                                        setValue('speaker_id', user.id);
                                                                        setSpeakerSearch('');
                                                                        setIsSpeakerOpen(false);
                                                                    }}
                                                                    className={`px-4 py-3 hover:bg-[#DBF227]/10 cursor-pointer flex items-center justify-between group transition-colors ${watch('speaker_id') === user.id ? 'bg-[#DBF227]/5' : ''}`}
                                                                >
                                                                    <div>
                                                                        <div className="font-bold text-[#373737] text-sm group-hover:text-black">{user.first_name} {user.last_name}</div>
                                                                        <div className="text-xs text-gray-400">{user.email}</div>
                                                                    </div>
                                                                    {watch('speaker_id') === user.id && <Check className="h-4 w-4 text-[#aacc00]" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {ponentes.length > 0 && others.length > 0 && (
                                                        <div className="h-px bg-gray-100 my-2 mx-4" />
                                                    )}

                                                    {others.length > 0 && (
                                                        <div>
                                                            {ponentes.length > 0 && <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0 backdrop-blur-sm">Otros Asistentes</div>}
                                                            {others.map(user => (
                                                                <div 
                                                                    key={user.id}
                                                                    onMouseDown={() => {
                                                                        setValue('speaker_id', user.id);
                                                                        setSpeakerSearch('');
                                                                        setIsSpeakerOpen(false);
                                                                    }}
                                                                     className={`px-4 py-3 hover:bg-[#DBF227]/10 cursor-pointer flex items-center justify-between group transition-colors ${watch('speaker_id') === user.id ? 'bg-[#DBF227]/5' : ''}`}
                                                                >
                                                                    <div>
                                                                        <div className="font-bold text-[#373737] text-sm group-hover:text-black">{user.first_name} {user.last_name}</div>
                                                                        <div className="text-xs text-gray-400">{user.email}</div>
                                                                    </div>
                                                                     {watch('speaker_id') === user.id && <Check className="h-4 w-4 text-[#aacc00]" />}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
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
