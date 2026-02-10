'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, X, Save, RefreshCw, Eye, ZoomIn, ZoomOut, Plus, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image';
import { CertificateContent } from '@/components/profile/CertificateContent';
import type { Certificate } from '@/components/profile/CertificateContent';
import { useConference } from '@/context/ConferenceContext';
import { PRESET_LOGOS } from '@/lib/constants';

interface CertificateDesignerProps {
    eventId?: string; // Optional, if modifying a specific event
    initialConfig: any;
    onSave: (config: any) => Promise<void>;
}

export function CertificateDesigner({ eventId, initialConfig, onSave }: CertificateDesignerProps) {
    const { currentConference } = useConference();
    
    const [config, setConfig] = useState(() => {
        const defaults = {
            mode: 'template_v1', // default
            styles: {
                text_color: '#000000',
                accent_color: '#dbf227',
                font_family: 'sans',
                text_alignment: 'center',
                content_vertical_position: '40%'
            },
            texts: {
               attendee: "Por su asistencia al evento",
               speaker: "Por impartir la conferencia:",
               staff: "Por su valiosa participación en la logística del evento:",
               organizer: "Por su liderazgo en la organización del evento:"
            },
            show_qr: true,
            qr_position: 'bottom-right',
            logos: [
                { type: 'preset', value: 'unam' },
                { type: 'preset', value: 'fesa' },
                { type: 'none', value: '' }
            ]
        };
        // Merge defaults with initialConfig, ensuring deep merge for objects if needed, 
        // but for now simple spread is okay if initialConfig has the full shape.
        // If initialConfig is present but missing logos, we default them.
        return {
            ...defaults,
            ...initialConfig,
            styles: { ...defaults.styles, ...initialConfig?.styles },
            texts: { ...defaults.texts, ...initialConfig?.texts },
            logos: initialConfig?.logos || defaults.logos
        };
    });

    const [uploading, setUploading] = useState(false);
    const [logoUploading, setLogoUploading] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [previewRole, setPreviewRole] = useState<'attendee'|'speaker'|'staff'>('attendee');
    const [scale, setScale] = useState(0.6); // Default scale
    const fileInputRef = useRef<HTMLInputElement>(null);
    const logoInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [exampleEvents, setExampleEvents] = useState<any[]>([]);
    const [selectedExampleEventId, setSelectedExampleEventId] = useState<string>('');
    const [activeLogoSlot, setActiveLogoSlot] = useState<number | null>(null);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);

    const handleElementUpdate = (id: string, updates: any) => {
        const currentElements = config.elements || {};
        const newElements = {
            ...currentElements,
            [id]: {
                ...(currentElements[id] || {}),
                ...updates
            }
        };
        setConfig({ ...config, elements: newElements });
    };

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Profiles
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, degree, role, gender')
                .order('first_name');
            if (profilesData) setProfiles(profilesData);

            // Fetch Events for Example Selector
            if (currentConference) {
                const { data: eventsData } = await supabase
                    .from('events')
                    .select('id, title, date, type, location, description')
                    .eq('conference_id', currentConference.id)
                    .order('date', { ascending: true });
                if (eventsData) setExampleEvents(eventsData);
            }
        };
        fetchData();
    }, [currentConference]);

    // Determine event data for preview
    const selectedEvent = exampleEvents.find(e => e.id === selectedExampleEventId);
    
    // Dummy certificate for preview
    const previewCertificate: Certificate = {
        id: 'PREVIEW-123456',
        scanned_at: selectedEvent ? selectedEvent.date : new Date().toISOString(),
        events: {
            id: selectedEvent ? selectedEvent.id : (eventId || 'evt-preview'),
            title: selectedEvent ? selectedEvent.title : 'Evento de Prueba',
            date: selectedEvent ? selectedEvent.date : new Date().toISOString(),
            type: selectedEvent ? selectedEvent.type : 'Conferencia',
            location: selectedEvent ? selectedEvent.location : 'Auditorio Principal',
            description: selectedEvent ? selectedEvent.description : 'Descripción del evento de prueba.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            start_time: '09:00',
            end_time: '11:00',
            status: 'active',
            capacity: 100,
            image_url: null,
            event_type: (selectedEvent?.type as any) || 'conference', 
            global_event_id: null,
            conference_id: currentConference?.id || '',
            conferences: {
                title: currentConference?.title || 'XI Congreso Internacional',
                institution_name: currentConference?.institution_name || 'Universidad Ejemplo',
                department_name: currentConference?.department_name || 'Facultad de Diseño',
                certificate_config: config
            },
            certificate_config: config
        },
        profiles: {
            first_name: 'Juan',
            last_name: 'Pérez García',
            degree: 'Licenciatura',
            gender: 'Masculino'
        },
        isSpeaker: previewRole === 'speaker',
        isStaff: previewRole === 'staff',
        isOrganizer: false
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const pathRef = eventId || `temp_${Date.now()}`;
        const fileName = `certificates/${pathRef}/background_${Date.now()}.${fileExt}`;

        setUploading(true);
        try {
            const { error: uploadError } = await supabase.storage
                .from('events') 
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('events')
                .getPublicUrl(fileName);

            setConfig({
                ...config,
                mode: 'custom_background',
                background_url: publicUrl
            });

        } catch (error) {
            console.error('Error uploading background:', error);
            alert('Error al subir la imagen. Intenta de nuevo.');
        } finally {
            setUploading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        
        // Validate MIME type or extension for SVG
        if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
            alert('El archivo debe ser un SVG.');
            return;
        }

        const pathRef = eventId || `temp_${Date.now()}`;
        const fileName = `certificates/${pathRef}/logo_${slotIndex}_${Date.now()}.svg`;

        setLogoUploading(slotIndex);
        try {
            const { error: uploadError } = await supabase.storage
                .from('events') 
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('events')
                .getPublicUrl(fileName);
            
            const newLogos = [...(config.logos || [])];
            newLogos[slotIndex] = { type: 'custom', value: publicUrl };
            
            setConfig({
                ...config,
                logos: newLogos
            });
            setActiveLogoSlot(null); // Close selection

        } catch (error) {
            console.error('Error uploading logo:', error);
            alert('Error al subir el logo. Intenta de nuevo.');
        } finally {
            setLogoUploading(null);
        }
    };

    const updateStyle = (key: string, value: string) => {
        setConfig({
            ...config,
            styles: { ...config.styles, [key]: value }
        });
    };

    const updateText = (key: string, value: string) => {
        setConfig({
            ...config,
            texts: { ...config.texts, [key]: value }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(config);
            alert('Diseño guardado correctamente');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error al guardar el diseño');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8 bg-gray-50 h-full">
            
            {/* Left Panel: Controls - Independent Scroll */}
            <div className="lg:col-span-1 border-r border-gray-200 bg-white h-full flex flex-col shadow-xl z-20 overflow-hidden relative">
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 pb-24">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-bold text-xl text-gray-800">Editor de Constancia</h2>
                    </div>

                    <div className="space-y-6">
                         {/* Mode Selection */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Modo de Diseño</label>
                            <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                                <button 
                                    onClick={() => setConfig({...config, mode: 'template_v1'})}
                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${config.mode === 'template_v1' ? 'bg-[#373737] text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Predeterminado
                                </button>
                                <button 
                                    onClick={() => setConfig({...config, mode: 'custom_background'})}
                                    className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${config.mode === 'custom_background' ? 'bg-[#373737] text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    Personalizado
                                </button>
                            </div>
                        </div>

                        {/* Template Selection - Only for Default Mode */}
                        {config.mode === 'template_v1' && (
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Plantilla</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Classic/Legacy Template */}
                                        <button 
                                            onClick={() => setConfig({...config, template_id: 'legacy'})}
                                            className={`relative group p-2 rounded-lg text-left shadow-sm transition-all ${(!config.template_id || config.template_id === 'legacy') ? 'border-2 border-[#DBF227] bg-white ring-1 ring-[#DBF227]/20' : 'border border-gray-200 bg-white hover:border-gray-300'}`}
                                        >
                                            <div className="h-16 bg-[#1a1a1a] w-full rounded mb-2 overflow-hidden relative border border-gray-100">
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-gray-400 font-serif">CONSTANCIA</div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-800">Original</span>
                                                {(!config.template_id || config.template_id === 'legacy') && <div className="w-2 h-2 rounded-full bg-[#DBF227]"></div>}
                                            </div>
                                        </button>
                                        
                                        {/* Elegant/Classic Template */}
                                        <button 
                                            onClick={() => setConfig({...config, template_id: 'classic'})}
                                            className={`relative group p-2 rounded-lg text-left shadow-sm transition-all ${config.template_id === 'classic' ? 'border-2 border-[#DBF227] bg-white ring-1 ring-[#DBF227]/20' : 'border border-gray-200 bg-white hover:border-gray-300'}`}
                                        >
                                            <div className="h-16 bg-white w-full rounded mb-2 overflow-hidden relative border border-gray-200 p-2 flex flex-col items-center justify-center">
                                                <div className="w-[80%] h-[1px] bg-gray-300 mb-1"></div>
                                                <div className="text-[6px] text-gray-600 font-serif uppercase tracking-widest">Certificate</div>
                                                <div className="w-[80%] h-[1px] bg-gray-300 mt-1"></div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-800">Elegante</span>
                                                {config.template_id === 'classic' && <div className="w-2 h-2 rounded-full bg-[#DBF227]"></div>}
                                            </div>
                                        </button>
                                        
                                        {/* Modern Template */}
                                        <button 
                                            onClick={() => setConfig({...config, template_id: 'modern'})}
                                            className={`relative group p-2 rounded-lg text-left shadow-sm transition-all ${config.template_id === 'modern' ? 'border-2 border-[#DBF227] bg-white ring-1 ring-[#DBF227]/20' : 'border border-gray-200 bg-white hover:border-gray-300'}`}
                                        >
                                            <div className="h-16 bg-white w-full rounded mb-2 overflow-hidden relative border border-gray-200 flex">
                                                <div className="w-4 h-full bg-gradient-to-b from-blue-100 to-purple-100"></div>
                                                <div className="flex-1 p-1">
                                                     <div className="h-1 w-1/2 bg-black mb-1"></div>
                                                     <div className="h-1 w-3/4 bg-gray-200"></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-800">Moderno</span>
                                                {config.template_id === 'modern' && <div className="w-2 h-2 rounded-full bg-[#DBF227]"></div>}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                         {/* Logo Configuration */}
                         <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4 animate-in fade-in duration-500">
                             <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                 <span className="w-1.5 h-4 bg-[#DBF227] rounded-full"></span>
                                 Logos del Encabezado
                             </h3>
                             <p className="text-[10px] text-gray-500">
                                 Selecciona hasta 3 logos. Los logos personalizados deben ser preferentemente SVGs en color negro sólido.
                             </p>
                             
                             <div className="grid grid-cols-3 gap-3">
                                 {[0, 1, 2].map((slotIndex) => {
                                     const logo = (config.logos && config.logos[slotIndex]) || { type: 'none', value: '' };
                                     const isActive = activeLogoSlot === slotIndex;
                                     const logoUrl = logo.type === 'preset' ? `/assets/${logo.value}.svg` : logo.value;

                                     return (
                                         <div key={slotIndex} className="relative">
                                             <button
                                                 onClick={() => setActiveLogoSlot(isActive ? null : slotIndex)}
                                                 className={`w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all p-2 bg-white relative overflow-hidden ${isActive ? 'border-[#DBF227] ring-1 ring-[#DBF227]' : 'border-gray-200 hover:border-gray-300'}`}
                                             >
                                                 {logo.type !== 'none' && logo.value ? (
                                                     <>
                                                        <div className="relative w-full h-full p-1">
                                                            <NextImage src={logoUrl} alt="Logo" fill className="object-contain" sizes="64px" />
                                                        </div>
                                                    </>
                                                 ) : (
                                                     <>
                                                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                             <Plus className="w-4 h-4" />
                                                         </div>
                                                         <span className="text-[9px] text-gray-400 font-medium">Vacío</span>
                                                     </>
                                                 )}
                                                 <div className="absolute top-1 left-1 text-[8px] font-bold text-gray-300 bg-white/80 px-1 rounded">
                                                     #{slotIndex + 1}
                                                 </div>
                                             </button>


                                         </div>
                                     );
                                 })}
                             </div>
                         </div>

                        {/* Background Upload - Only for Custom Mode */}
                        {config.mode === 'custom_background' && (
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Imagen de Fondo</label>
                                <div className="flex gap-2 items-center">
                                     <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full bg-white border-dashed border-2 border-gray-300 hover:border-[#DBF227] hover:bg-blue-50/10 text-gray-500"
                                     >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {uploading ? 'Subiendo...' : 'Subir Fondo (JPG/PNG)'}
                                     </Button>
                                     <input 
                                        ref={fileInputRef}
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden"
                                        onChange={handleFileUpload}
                                     />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 text-center">Recomendado: 3300x2550px (300dpi Carta Horizontal)</p>
                                 
                                 {config.background_url && (
                                     <div className="mt-4 relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm w-full h-32">
                                         <NextImage src={config.background_url} alt="Background Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
                                         <button 
                                            onClick={() => setConfig({...config, background_url: undefined, mode: 'template_v1'})}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
                                            title="Eliminar fondo"
                                         >
                                             <X className="w-4 h-4" />
                                         </button>
                                         <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center font-medium backdrop-blur-sm">Vista Previa</div>
                                     </div>
                                 )}
                            </div>
                        )}

                        {/* Styles Configuration - Always Visible */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4 animate-in fade-in duration-500">
                            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-[#DBF227] rounded-full"></span>
                                Estilos
                            </h3>
                            
                            {config.mode !== 'custom_background' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Color Texto</label>
                                            <div className="flex gap-2 items-center">
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-gray-200">
                                                    <input 
                                                        type="color" 
                                                        value={config.styles?.text_color || '#000000'}
                                                        onChange={(e) => updateStyle('text_color', e.target.value)}
                                                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0"
                                                    />
                                                </div>
                                                <input 
                                                    value={config.styles?.text_color || '#000000'}
                                                    onChange={(e) => updateStyle('text_color', e.target.value)}
                                                    className="uppercase text-xs font-mono w-20 p-1.5 border rounded"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Color Acento</label>
                                            <div className="flex gap-2 items-center">
                                                <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm border border-gray-200">
                                                        <input 
                                                        type="color" 
                                                        value={config.styles?.accent_color || '#dbf227'}
                                                        onChange={(e) => updateStyle('accent_color', e.target.value)}
                                                        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0"
                                                    />
                                                </div>
                                                <input 
                                                        value={config.styles?.accent_color || '#dbf227'}
                                                        onChange={(e) => updateStyle('accent_color', e.target.value)}
                                                        className="uppercase text-xs font-mono w-20 p-1.5 border rounded"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tipografía</label>
                                        <select 
                                            value={config.styles?.font_family || 'sans'}
                                            onChange={(e) => updateStyle('font_family', e.target.value)}
                                            className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#DBF227] focus:border-transparent outline-none text-black"
                                        >
                                            <option value="sans">Geist Sans (Moderna)</option>
                                            <option value="serif">Playfair Display (Elegante)</option>
                                            <option value="mono">Geist Mono (Técnica)</option>
                                            <option value="cursive">Dancing Script (Caligrafía)</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {config.mode === 'custom_background' && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mt-4 animate-in fade-in slide-in-from-left-2">
                                    <h4 className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">Editor de Elementos</h4>
                                    <p className="text-[10px] text-blue-600 mb-3 leading-relaxed">
                                        Haz clic en los elementos del diseño para seleccionarlos y arrástralos para moverlos.
                                    </p>
                                    
                                    {selectedElement ? (
                                        <div className="animate-in fade-in slide-in-from-right-2 bg-white p-3 rounded border border-blue-100 shadow-sm">
                                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                                <span className="text-xs font-bold text-gray-700 capitalize">{selectedElement}</span>
                                                <button onClick={() => setSelectedElement(null)} className="text-[10px] text-gray-400 hover:text-gray-600 underline">Deseleccionar</button>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                
                                                {/* Scale Control (Always Visible) */}
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 mb-1">Escala</label>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-mono text-gray-400">0.5x</span>
                                                        <input 
                                                            type="range" 
                                                            min="0.5" 
                                                            max="3" 
                                                            step="0.1"
                                                            value={config.elements?.[selectedElement]?.scale || 1}
                                                            onChange={(e) => handleElementUpdate(selectedElement, { scale: parseFloat(e.target.value) })}
                                                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#DBF227]"
                                                        />
                                                        <span className="text-[10px] font-mono w-8 text-right font-bold text-gray-600">
                                                            {(config.elements?.[selectedElement]?.scale || 1).toFixed(1)}x
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Text Properties (Only for text elements) */}
                                                {['name', 'eventTitle', 'roleText', 'contextText', 'date', 'id'].includes(selectedElement) && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 mb-1">Fuente</label>
                                                                <select 
                                                                    value={config.elements?.[selectedElement]?.fontFamily || 'inherit'}
                                                                    onChange={(e) => handleElementUpdate(selectedElement, { fontFamily: e.target.value })}
                                                                    className="w-full p-1.5 border rounded text-xs bg-gray-50 outline-none focus:border-[#DBF227]"
                                                                >
                                                                    <option value="inherit">Heredar</option>
                                                                    <option value="sans">Geist Sans</option>
                                                                    <option value="serif">Playfair Display</option>
                                                                    <option value="mono">Geist Mono</option>
                                                                    <option value="cursive">Dancing Script</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 mb-1">Color</label>
                                                                <div className="flex gap-2 items-center">
                                                                    <input 
                                                                        type="color" 
                                                                        value={config.elements?.[selectedElement]?.color || config.styles?.text_color || '#000000'}
                                                                        onChange={(e) => handleElementUpdate(selectedElement, { color: e.target.value })}
                                                                        className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0"
                                                                    />
                                                                    <div className="text-[10px] font-mono uppercase bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                                                        {config.elements?.[selectedElement]?.color || 'AUTO'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Alineación</label>
                                                            <div className="flex bg-gray-50 p-1 rounded border border-gray-200">
                                                                {['left', 'center', 'right'].map((align) => (
                                                                    <button 
                                                                        key={align}
                                                                        onClick={() => handleElementUpdate(selectedElement, { textAlign: align })}
                                                                        className={`flex-1 py-1 text-[10px] font-medium rounded capitalize transition-all ${config.elements?.[selectedElement]?.textAlign === align ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                                                    >
                                                                        {align === 'left' ? 'Izq' : align === 'center' ? 'Cen' : 'Der'}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 mb-1">Peso</label>
                                                                <select 
                                                                    value={config.elements?.[selectedElement]?.fontWeight || 'inherit'}
                                                                    onChange={(e) => handleElementUpdate(selectedElement, { fontWeight: e.target.value })}
                                                                    className="w-full p-1.5 border rounded text-xs bg-gray-50 outline-none focus:border-[#DBF227]"
                                                                >
                                                                    <option value="inherit">Heredar</option>
                                                                    <option value="300">Ligero</option>
                                                                    <option value="400">Normal</option>
                                                                    <option value="600">Semibold</option>
                                                                    <option value="700">Bold</option>
                                                                    <option value="900">Heavy</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 mb-1">Estilo</label>
                                                                <div className="flex bg-gray-50 p-1 rounded border border-gray-200 gap-1">
                                                                    <button 
                                                                        onClick={() => handleElementUpdate(selectedElement, { fontStyle: config.elements?.[selectedElement]?.fontStyle === 'italic' ? 'normal' : 'italic' })}
                                                                        className={`flex-1 py-1 text-sm font-serif italic rounded transition-all ${config.elements?.[selectedElement]?.fontStyle === 'italic' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                                                        title="Cursiva"
                                                                    >
                                                                        I
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleElementUpdate(selectedElement, { textDecoration: config.elements?.[selectedElement]?.textDecoration === 'underline' ? 'none' : 'underline' })}
                                                                        className={`flex-1 py-1 text-sm font-sans underline rounded transition-all ${config.elements?.[selectedElement]?.textDecoration === 'underline' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                                                        title="Subrayado"
                                                                    >
                                                                        U
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="block text-[10px] font-bold text-gray-400">Ancho Máximo (Quiebre)</label>
                                                                <span className="text-[10px] font-mono font-bold text-gray-600">
                                                                    {config.elements?.[selectedElement]?.maxWidth ? `${config.elements?.[selectedElement]?.maxWidth}px` : 'Auto'}
                                                                </span>
                                                            </div>
                                                            <input 
                                                                type="range" 
                                                                min="200" 
                                                                max="1000" 
                                                                step="10"
                                                                value={config.elements?.[selectedElement]?.maxWidth || 800}
                                                                onChange={(e) => handleElementUpdate(selectedElement, { maxWidth: parseInt(e.target.value) })}
                                                                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#DBF227]"
                                                            />
                                                        </div>

                                                        <div>
                                                            <div className="flex justify-between mb-1">
                                                                <label className="block text-[10px] font-bold text-gray-400">Espaciado</label>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2 rounded border border-gray-200">
                                                                <div>
                                                                    <label className="block text-[9px] text-gray-400 mb-0.5">Interlineado</label>
                                                                    <input 
                                                                        type="number" 
                                                                        step="0.1"
                                                                        min="0.8"
                                                                        max="3"
                                                                        value={config.elements?.[selectedElement]?.lineHeight || '1.1'}
                                                                        onChange={(e) => handleElementUpdate(selectedElement, { lineHeight: e.target.value })}
                                                                        className="w-full p-1 border rounded text-xs outline-none focus:border-[#DBF227]"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[9px] text-gray-400 mb-0.5">Tracking (px)</label>
                                                                    <input 
                                                                        type="number" 
                                                                         step="0.5"
                                                                         min="-2"
                                                                         max="20"
                                                                        value={parseFloat(config.elements?.[selectedElement]?.letterSpacing || '0')}
                                                                        onChange={(e) => handleElementUpdate(selectedElement, { letterSpacing: `${e.target.value}px` })}
                                                                        className="w-full p-1 border rounded text-xs outline-none focus:border-[#DBF227]"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}

                                                {/* Graphical Properties (Logos & Signatures) */}
                                                {(selectedElement === 'logos' || selectedElement === 'signatures') && (
                                                    <>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Contraste (Color)</label>
                                                            <div className="flex bg-gray-50 p-1 rounded border border-gray-200">
                                                                <button 
                                                                    onClick={() => handleElementUpdate(selectedElement, { contrast: 'black' })}
                                                                    className={`flex-1 py-1 text-[10px] font-medium rounded capitalize transition-all ${(!config.elements?.[selectedElement]?.contrast || config.elements?.[selectedElement]?.contrast === 'black') ? 'bg-black text-white shadow' : 'text-gray-400 hover:text-gray-600'}`}
                                                                >
                                                                    Negro (Original)
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleElementUpdate(selectedElement, { contrast: 'white' })}
                                                                    className={`flex-1 py-1 text-[10px] font-medium rounded capitalize transition-all ${config.elements?.[selectedElement]?.contrast === 'white' ? 'bg-white text-black border border-gray-200 shadow' : 'text-gray-400 hover:text-gray-600'}`}
                                                                >
                                                                    Blanco / Invertido
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {selectedElement === 'logos' && (
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 mb-1">Disposición</label>
                                                                <div className="flex bg-gray-50 p-1 rounded border border-gray-200">
                                                                    <button 
                                                                        onClick={() => handleElementUpdate(selectedElement, { direction: 'horizontal' })}
                                                                        className={`flex-1 py-1 text-[10px] font-medium rounded capitalize transition-all ${(!config.elements?.[selectedElement]?.direction || config.elements?.[selectedElement]?.direction === 'horizontal') ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                                                    >
                                                                        Horizontal
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleElementUpdate(selectedElement, { direction: 'vertical' })}
                                                                        className={`flex-1 py-1 text-[10px] font-medium rounded capitalize transition-all ${config.elements?.[selectedElement]?.direction === 'vertical' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                                                                    >
                                                                        Vertical
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-gray-400 italic text-center py-4 border border-dashed border-blue-200 rounded bg-white/50">
                                            Ningún elemento seleccionado
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Texts Configuration - Always Visible */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4 animate-in fade-in duration-500 delay-100">
                            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-[#DBF227] rounded-full"></span>
                                Textos Variables
                            </h3>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Asistente</label>
                                <Input 
                                    value={config.texts?.attendee || ''}
                                    onChange={(e) => updateText('attendee', e.target.value)}
                                    placeholder="Por su asistencia..."
                                    className="bg-white text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ponente</label>
                                <Input 
                                    value={config.texts?.speaker || ''}
                                    onChange={(e) => updateText('speaker', e.target.value)}
                                    placeholder="Por impartir..."
                                    className="bg-white text-black"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contexto Global</label>
                                <Input 
                                    value={config.texts?.context || ''}
                                    onChange={(e) => updateText('context', e.target.value)}
                                    placeholder="En el marco del / de / la..."
                                    className="bg-white text-black"
                                />
                            </div>
                        </div>

                            {/* Signers Configuration (Replaces QR) */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4 animate-in fade-in duration-500 delay-200">
                                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-[#DBF227] rounded-full"></span>
                                    Firmantes
                                </h3>
                                
                                {/* Number of Signers */}
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-semibold text-gray-500">No. de firmantes</label>
                                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                                        {[1, 2, 3].map(num => (
                                            <button 
                                                key={num}
                                                onClick={() => {
                                                    const currentSigners = config.signers || [];
                                                    // Ensure array length matches count
                                                    const newSigners = Array(num).fill(null).map((_, i) => currentSigners[i] || { role: 'Jefa de carrera', profile_id: '' });
                                                    setConfig({...config, signer_count: num, signers: newSigners});
                                                }}
                                                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors ${config.signer_count === num ? 'bg-[#DBF227] text-black' : 'hover:bg-gray-100 text-gray-600'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Signer Slots */}
                                {Array.from({ length: config.signer_count || 1 }).map((_, idx) => {
                                    const signer = (config.signers && config.signers[idx]) || {};
                                    return (
                                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Firmante {idx + 1}</span>
                                            </div>
                                            
                                            {/* Profile Selector */}
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-400 mb-1">Nombre</label>
                                                <select
                                                    value={signer.profile_id || ''}
                                                    onChange={(e) => {
                                                        const selectedProfile = profiles.find(p => p.id === e.target.value);
                                                        const newSigners = [...(config.signers || [])];
                                                        // Ensure array is initialized up to this index if it wasn't
                                                        if (!newSigners[idx]) newSigners[idx] = {};
                                                        
                                                        // Update slot
                                                        newSigners[idx] = {
                                                            ...newSigners[idx],
                                                            profile_id: e.target.value,
                                                            name: selectedProfile ? `${selectedProfile.first_name} ${selectedProfile.last_name}` : '',
                                                            degree: selectedProfile ? selectedProfile.degree : '',
                                                            gender: selectedProfile ? selectedProfile.gender : ''
                                                        };
                                                        
                                                        // Also ensure signer_count is updated or we just rely on signers array length in consumer?
                                                        // We'll set signer_count to 3 effectively or max index + 1?
                                                        // For compatibility, let's update signer_count to match the highest index filled + 1?
                                                        // For now, let's just save.
                                                        setConfig({...config, signers: newSigners});
                                                    }}
                                                    className="w-full p-2 border rounded text-xs bg-gray-50 outline-none focus:border-[#DBF227] text-black"
                                                >
                                                    <option value="">Seleccionar participante...</option>
                                                    {profiles.map(p => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.first_name} {p.last_name} ({p.role})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Role Input */}
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-400 mb-1">Cargo</label>
                                                <Input 
                                                    value={signer.role || ''}
                                                    onChange={(e) => {
                                                        const newSigners = [...(config.signers || [])];
                                                        if (!newSigners[idx]) newSigners[idx] = {};
                                                        newSigners[idx].role = e.target.value;
                                                        setConfig({...config, signers: newSigners});
                                                    }}
                                                    placeholder="Ej. Director General"
                                                    className="h-8 text-xs text-black"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Example Activity Selector */}
                            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mt-1">
                                        <Eye className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm">Vista Previa con Datos Reales</h3>
                                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                                            Selecciona una actividad de la agenda para ver cómo luciría su constancia. 
                                            <span className="block font-semibold text-blue-600 mt-1">Nota: Esto es solo un ejemplo visual. El diseño se aplicará a todas las constancias del evento.</span>
                                        </p>
                                    </div>
                                </div>

                                <select 
                                    value={selectedExampleEventId}
                                    onChange={(e) => setSelectedExampleEventId(e.target.value)}
                                    className="w-full p-2 border rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                                >
                                    <option value="">-- Usar datos de prueba --</option>
                                    {exampleEvents.map(evt => (
                                        <option key={evt.id} value={evt.id}>
                                            {evt.title} ({new Date(evt.date).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                    </div>
                </div>

                {/* Fixed Footer with Save Button */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white/95 backdrop-blur z-20">
                    <Button 
                        onClick={handleSave} 
                        className="w-full bg-[#373737] hover:bg-black text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        disabled={saving}
                    >
                        {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar Diseño
                    </Button>
                </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="lg:col-span-2 bg-gray-100 flex flex-col h-full overflow-hidden relative">
                {/* Preview Controls */}
                <div className="p-4 bg-white/80 backdrop-blur-md border-b border-gray-200 flex justify-between items-center z-10 sticky top-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:block">Vista Previa:</span>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                             <button
                                onClick={() => setPreviewRole('attendee')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${previewRole === 'attendee' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                             >
                                 Asistente
                             </button>
                             <button
                                onClick={() => setPreviewRole('speaker')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${previewRole === 'speaker' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                             >
                                 Ponente
                             </button>
                        </div>
                    </div>
                    
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                        <button 
                            onClick={() => setScale(s => Math.max(0.2, s - 0.1))}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-xs font-mono w-12 text-center text-gray-600">{Math.round(scale * 100)}%</span>
                        <button 
                             onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
                             className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Preview Canvas with Scroll */}
                <div className="flex-1 overflow-auto bg-[#e5e5e5] relative">
                    <div className="absolute inset-0 z-0 opacity-40 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    
                    {/* Centering Wrapper that grows with content */}
                    <div className="min-w-full min-h-full flex items-center justify-center p-8 md:p-12">
                        <div 
                            style={{ 
                                width: `calc(279.4mm * ${scale})`,
                                height: `calc(215.9mm * ${scale})`,
                                transition: 'width 0.2s, height 0.2s',
                                position: 'relative'
                            }}
                        >
                            <div 
                                style={{ 
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top left',
                                    width: '279.4mm',
                                    height: '215.9mm',
                                }}
                                className="shadow-2xl bg-white transition-transform duration-200"
                            >
                                <CertificateContent 
                                    certificate={previewCertificate} 
                                    isDesigner={true}
                                    onElementSelect={setSelectedElement}
                                    onElementUpdate={handleElementUpdate}
                                    selectedElement={selectedElement}
                                    zoomScale={scale}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Logo Selection Modal */}
            {activeLogoSlot !== null && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setActiveLogoSlot(null)}
                >
                    <div 
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800">Seleccionar Logo #{activeLogoSlot + 1}</h3>
                            <button 
                                onClick={() => setActiveLogoSlot(null)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Current Selection & Remove Option */}
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-500">Estado actual:</span>
                                    {config.logos && config.logos[activeLogoSlot]?.type !== 'none' ? (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                            Seleccionado
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                                            Vacío
                                        </span>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => {
                                        const newLogos = [...(config.logos || [])];
                                        newLogos[activeLogoSlot] = { type: 'none', value: '' };
                                        setConfig({...config, logos: newLogos});
                                        setActiveLogoSlot(null);
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                    Remover Logo
                                </button>
                            </div>

                            {/* Presets Grid */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Logos Disponibles</label>
                                <div className="grid grid-cols-5 gap-3">
                                    {PRESET_LOGOS.map((preset) => (
                                        <button
                                            key={preset}
                                            onClick={() => {
                                                const newLogos = [...(config.logos || [])];
                                                newLogos[activeLogoSlot] = { type: 'preset', value: preset };
                                                setConfig({...config, logos: newLogos});
                                                setActiveLogoSlot(null);
                                            }}
                                            className={`aspect-square rounded-xl border-2 p-2 hover:border-[#DBF227] hover:bg-gray-50 transition-all flex items-center justify-center ${config.logos?.[activeLogoSlot]?.type === 'preset' && config.logos?.[activeLogoSlot]?.value === preset ? 'border-[#DBF227] bg-yellow-50' : 'border-gray-100'}`}
                                            title={preset}
                                        >
                                            <img src={`/assets/${preset}.svg`} alt={preset} className="w-full h-full object-contain" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Upload */}
                            <div className="border-t border-gray-100 pt-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Subir SVG Personalizado</label>
                                <Button 
                                    variant="outline" 
                                    className="w-full border-dashed border-2 h-12 hover:border-[#DBF227] hover:bg-yellow-50/50 text-gray-500"
                                    onClick={() => logoInputRefs.current[activeLogoSlot]?.click()}
                                    disabled={logoUploading === activeLogoSlot}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {logoUploading === activeLogoSlot ? 'Subiendo...' : 'Seleccionar archivo SVG'}
                                </Button>
                                <input 
                                    ref={el => { logoInputRefs.current[activeLogoSlot] = el }}
                                    type="file" 
                                    accept="image/svg+xml,.svg" 
                                    className="hidden"
                                    onChange={(e) => handleLogoUpload(e, activeLogoSlot)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
