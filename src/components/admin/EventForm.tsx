import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { SpeakerSelector } from '@/components/admin/SpeakerSelector';
import { Event, UserProfile } from '@/types';

interface EventFormProps {
    initialData: Event | null;
    isEditing: boolean;
    users: UserProfile[];
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export function EventForm({ initialData, isEditing, users, onSubmit, onCancel }: EventFormProps) {
    const { register, handleSubmit, reset, setValue, control, watch } = useForm<Event>();
    const [eventType, setEventType] = useState('Conferencia Magistral');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setValue('title', initialData.title || '');
            setValue('description', initialData.description || '');
            setValue('location', initialData.location || '');
            setValue('date', initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : '');
            setValue('type', initialData.type || 'Conferencia Magistral');
            setValue('speaker_id', initialData.speaker_id || '');
            setValue('image_url', initialData.image_url || '');
            setValue('gives_certificate', initialData.gives_certificate || false);
            setValue('duration_days', initialData.duration_days || 1);
            
            setEventType(initialData.type || 'Conferencia Magistral');
            setTags(initialData.tags || []);
        } else {
            reset();
            setEventType('Conferencia Magistral');
            setTags([]);
            setValue('speaker_id', '');
            setValue('duration_days', 1);
        }
    }, [initialData, reset, setValue]);

    useEffect(() => {
        setValue('type', eventType);
    }, [eventType, setValue]);

    const handleFormSubmit = async (data: any) => {
        await onSubmit({ ...data, type: eventType, tags });
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 overflow-y-auto max-h-[60vh] px-1 -mx-1">
            
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
            <SpeakerSelector 
                users={users}
                selectedSpeakerId={watch('speaker_id') || null}
                onSelect={(id) => setValue('speaker_id', id)}
            />

            <div className="pt-6 flex flex-col-reverse xs:flex-row justify-between items-center border-t border-gray-100 mt-8 gap-3 xs:gap-0">
                <button 
                    type="button"
                    onClick={onCancel}
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
    );
}
