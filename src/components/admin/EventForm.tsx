import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
    Plus, X, FileText, FileSpreadsheet, Table, FileImage, Image, Presentation, MonitorPlay, FileCode, 
    BookOpen, Library, ClipboardList, GraduationCap, School, Award, FileBadge, Bookmark, 
    Download, Video, Camera, Cast, Radio, Link, ExternalLink, Mic, PlayCircle, Monitor, Laptop, 
    Calendar, Clock, MapPin, LocateFixed, Building2, Landmark, Users, User, Contact, BadgeAlert, 
    Info, HelpCircle, Share2, MessageCircle, Mail, Printer, ChevronDown, Check, MessageSquare,
    Youtube, Facebook, Twitter, Instagram, Linkedin, Github, Settings, Bell, Search, Heart, Star, 
    Coffee, Briefcase, Home, Globe, MessageSquareQuote, AlertTriangle
} from 'lucide-react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { useFieldArray } from 'react-hook-form';
import { SpeakerSelector } from '@/components/admin/SpeakerSelector';
import { Event, UserProfile } from '@/types';
import { formatToMexicoDateTimeLocal, parseMexicoDateTimeLocal } from '@/lib/dateUtils';

const ICON_CATEGORIES = [
    {
        name: 'Académicos',
        icons: [
            { label: 'Documento', icon: 'file-text', component: FileText },
            { label: 'PDF', icon: 'file-pdf', component: FileText },
            { label: 'Excel', icon: 'file-spreadsheet', component: FileSpreadsheet },
            { label: 'Tabla', icon: 'table', component: Table },
            { label: 'Imagen de Archivo', icon: 'file-image', component: FileImage },
            { label: 'Imagen', icon: 'image', component: Image },
            { label: 'Presentación', icon: 'presentation', component: Presentation },
            { label: 'Pantalla', icon: 'projection-screen', component: MonitorPlay },
            { label: 'Código', icon: 'file-code', component: FileCode },
            { label: 'Libro', icon: 'book-open', component: BookOpen },
            { label: 'Biblioteca', icon: 'library', component: Library },
            { label: 'Lista', icon: 'clipboard-list', component: ClipboardList },
            { label: 'Graduación', icon: 'graduation-cap', component: GraduationCap },
            { label: 'Académico', icon: 'academic-cap', component: School },
            { label: 'Premio', icon: 'award', component: Award },
            { label: 'Certificado', icon: 'certificate', component: FileBadge },
            { label: 'Marcador', icon: 'bookmark', component: Bookmark },
        ]
    },
    {
        name: 'Medios y Plataformas',
        icons: [
            { label: 'Zoom / Video', icon: 'zoom', component: Video },
            { label: 'Moodle / LMS', icon: 'moodle', component: GraduationCap },
            { label: 'Google Classroom', icon: 'classroom', component: School },
            { label: 'Youtube', icon: 'youtube', component: Youtube },
            { label: 'Facebook', icon: 'facebook', component: Facebook },
            { label: 'Twitter / X', icon: 'twitter', component: Twitter },
            { label: 'Instagram', icon: 'instagram', component: Instagram },
            { label: 'Linkedin', icon: 'linkedin', component: Linkedin },
            { label: 'Github', icon: 'github', component: Github },
            { label: 'Web / Global', icon: 'globe', component: Globe },
            { label: 'Video Sesión', icon: 'video', component: Video },
            { label: 'Transmisión', icon: 'broadcast', component: Radio },
            { label: 'Podcast / Mic', icon: 'microphone', component: Mic },
            { label: 'Chat / Mensaje', icon: 'chat', component: MessageCircle },
            { label: 'Cita', icon: 'quote', component: MessageSquareQuote },
            { label: 'Mail', icon: 'mail', component: Mail },
        ]
    },
    {
        name: 'Iconos Generales',
        icons: [
            { label: 'Link', icon: 'link', component: Link },
            { label: 'Link Externo', icon: 'external-link', component: ExternalLink },
            { label: 'Descarga', icon: 'download', component: Download },
            { label: 'Calendario', icon: 'calendar', component: Calendar },
            { label: 'Reloj', icon: 'clock', component: Clock },
            { label: 'Mapa', icon: 'map-pin', component: MapPin },
            { label: 'Ubicación', icon: 'location', component: LocateFixed },
            { label: 'Edificio', icon: 'building', component: Building2 },
            { label: 'Landmark', icon: 'landmark', component: Landmark },
            { label: 'Usuarios', icon: 'users', component: Users },
            { label: 'Usuario', icon: 'user', component: User },
            { label: 'ID Card', icon: 'id-card', component: Contact },
            { label: 'Badge', icon: 'badge', component: BadgeAlert },
            { label: 'Info', icon: 'info', component: Info },
            { label: 'Ayuda', icon: 'help-circle', component: HelpCircle },
            { label: 'Compartir', icon: 'share-2', component: Share2 },
            { label: 'Configuración', icon: 'settings', component: Settings },
            { label: 'Notificación', icon: 'bell', component: Bell },
            { label: 'Búsqueda', icon: 'search', component: Search },
            { label: 'Favorito', icon: 'heart', component: Heart },
            { label: 'Destacado', icon: 'star', component: Star },
            { label: 'Café / Break', icon: 'coffee', component: Coffee },
            { label: 'Maletín / Trabajo', icon: 'work', component: Briefcase },
            { label: 'Inicio', icon: 'home', component: Home },
            { label: 'Laptop', icon: 'desktop', component: Laptop },
            { label: 'Monitor', icon: 'monitor', component: Monitor },
            { label: 'Impresora', icon: 'printer', component: Printer },
        ]
    }
];

// Flat version for easy lookup
const ALL_ICONS = ICON_CATEGORIES.flatMap(cat => cat.icons);

interface EventFormProps {
    initialData: Event | null;
    isEditing: boolean;
    users: UserProfile[];
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
}

export function EventForm({ initialData, isEditing, users, onSubmit, onCancel }: EventFormProps) {
    const { register, handleSubmit, reset, setValue, control, watch } = useForm<Event>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "custom_links"
    });
    const [eventType, setEventType] = useState('Conferencia Magistral');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [openIconPicker, setOpenIconPicker] = useState<number | null>(null);
    const [autoAttendHours, setAutoAttendHours] = useState(1);
    const [autoAttendMins, setAutoAttendMins] = useState(0);

    useEffect(() => {
        if (initialData) {
            setValue('title', initialData.title || '');
            setValue('description', initialData.description || '');
            setValue('location', initialData.location || '');
            setValue('date', initialData.date ? formatToMexicoDateTimeLocal(initialData.date) : '');
            setValue('type', initialData.type || 'Conferencia Magistral');
            setValue('speaker_id', initialData.speaker_id || '');
            setValue('image_url', initialData.image_url || '');
            setValue('gives_certificate', initialData.gives_certificate || false);
            setValue('auto_attendance', initialData.auto_attendance || false);
            setValue('auto_attendance_limit', initialData.auto_attendance_limit || 60);
            setValue('duration_days', initialData.duration_days || 1);
            setValue('certificate_config', initialData.certificate_config || null);
            setValue('custom_links', initialData.custom_links || []);
            
            // Set local state for hours/mins
            const totalMins = initialData.auto_attendance_limit || 60;
            setAutoAttendHours(Math.floor(totalMins / 60));
            setAutoAttendMins(totalMins % 60);
            
            setEventType(initialData.type || 'Conferencia Magistral');
            setTags(initialData.tags || []);
        } else {
            reset();
            setEventType('Conferencia Magistral');
            setTags([]);
            setValue('speaker_id', '');
            setValue('duration_days', 1);
            setValue('custom_links', []);
        }
    }, [initialData, reset, setValue]);

    useEffect(() => {
        setValue('type', eventType);
    }, [eventType, setValue]);

    const handleFormSubmit = async (data: any) => {
        const formattedDate = data.date ? parseMexicoDateTimeLocal(data.date).toISOString() : null;
        const totalAutoMins = (autoAttendHours * 60) + autoAttendMins;
        await onSubmit({ 
            ...data, 
            date: formattedDate, 
            type: eventType, 
            tags,
            auto_attendance_limit: totalAutoMins
        });
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

             {/* Custom Links Section */}
             <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-[#373737]">Links Personalizados (Máx 3):</label>
                    {fields.length < 3 && (
                        <button 
                            type="button" 
                            onClick={() => append({ icon: 'link', label: '', url: '' })}
                            className="text-xs font-bold text-[#aacc00] hover:text-[#373737] flex items-center gap-1 transition-colors"
                        >
                            <Plus size={14} /> Agregar Link
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-start animate-in slide-in-from-left-2 duration-200">
                            {/* Icon Selector */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setOpenIconPicker(openIconPicker === index ? null : index)}
                                    className="p-3 rounded-xl border border-gray-200 bg-white hover:border-[#DBF227] transition-all text-[#373737] flex items-center justify-center min-w-[50px] h-[46px]"
                                    title="Seleccionar icono"
                                >
                                    {(() => {
                                        const iconVal = watch(`custom_links.${index}.icon`);
                                        const iconOption = ALL_ICONS.find(o => o.icon === iconVal) || ALL_ICONS[0]; 
                                        const IconComp = iconOption.component;
                                        return <IconComp size={20} />;
                                    })()}
                                    <ChevronDown size={12} className="ml-1 text-gray-400" />
                                </button>

                                {openIconPicker === index && (
                                    <div className="absolute top-full left-0 z-[100] mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-h-[350px] overflow-y-auto animate-in zoom-in-95 duration-200 custom-scrollbar">
                                        <div className="space-y-4">
                                            {ICON_CATEGORIES.map((category, catIdx) => (
                                                <div key={catIdx} className="space-y-2">
                                                    <div className="text-[10px] font-bold text-[#aacc00] uppercase tracking-widest px-1 flex items-center gap-2">
                                                        {category.name}
                                                        <div className="h-px flex-1 bg-gray-100" />
                                                    </div>
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {category.icons.map((opt, i) => {
                                                            const IconComp = opt.component;
                                                            const isSelected = watch(`custom_links.${index}.icon`) === opt.icon;
                                                            return (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setValue(`custom_links.${index}.icon`, opt.icon);
                                                                        setOpenIconPicker(null);
                                                                    }}
                                                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                                                        isSelected ? 'bg-[#DBF227] text-[#373737]' : 'hover:bg-gray-100 text-gray-500'
                                                                    }`}
                                                                    title={opt.label}
                                                                >
                                                                    <IconComp size={18} />
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <input 
                                    {...register(`custom_links.${index}.label` as const, { required: true })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#373737] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent transition-all bg-gray-50/50"
                                    placeholder="Texto del link (ej. Sesión Zoom)"
                                />
                                <input 
                                    {...register(`custom_links.${index}.url` as const, { required: true })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[#373737] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent transition-all bg-gray-50/50"
                                    placeholder="URL (ej. https://...)"
                                />
                            </div>

                            <button 
                                type="button" 
                                onClick={() => remove(index)}
                                className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ))}

                    {fields.length === 0 && (
                        <p className="text-xs text-gray-400 italic">No hay links personalizados agregados.</p>
                    )}
                </div>
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
             <div className="space-y-4">
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

                {/* Auto-attendance Switch */}
                <div className={`space-y-4 p-3 rounded-xl border transition-all duration-300 ${watch('auto_attendance') ? 'bg-amber-50 border-amber-200' : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="text-sm font-bold text-[#373737] block">Auto-asistencia</label>
                            <p className={`text-xs transition-colors ${watch('auto_attendance') ? 'text-amber-700' : 'text-gray-400'}`}>
                                Permitir que los asistentes marquen su propia asistencia desde el portal.
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                {...register('auto_attendance')} 
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                    </div>

                    {watch('auto_attendance') && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            <div className="flex gap-3 p-3 bg-amber-100/50 rounded-lg border border-amber-200 text-amber-800 text-xs items-start">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <p>
                                    <strong>Aviso de seguridad:</strong> Al activar esta opción, las personas podrán pasarse lista ellas solas. Esto puede representar una brecha de seguridad si no se supervisa. ¿Desea proceder?
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-amber-900">Tiempo límite de auto-asistencia:</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-1">
                                        <span className="text-[10px] text-amber-700 font-medium uppercase">Horas</span>
                                        <input 
                                            type="number"
                                            min="0"
                                            max="24"
                                            value={autoAttendHours}
                                            onChange={(e) => setAutoAttendHours(parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <span className="text-[10px] text-amber-700 font-medium uppercase">Minutos</span>
                                        <input 
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={autoAttendMins}
                                            onChange={(e) => setAutoAttendMins(parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-amber-600 italic">
                                    El botón de auto-asistencia estará activo durante {autoAttendHours > 0 ? `${autoAttendHours}h ` : ''}{autoAttendMins}m después del inicio del evento.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
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
