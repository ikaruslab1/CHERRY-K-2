'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Upload, X, Save, RefreshCw, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import { CertificateContent } from '@/components/profile/CertificateContent';
import type { Certificate } from '@/components/profile/CertificateContent';
import { useConference } from '@/context/ConferenceContext';

interface CertificateDesignerProps {
    eventId?: string; // Optional, if modifying a specific event
    initialConfig: any;
    onSave: (config: any) => Promise<void>;
}

export function CertificateDesigner({ eventId, initialConfig, onSave }: CertificateDesignerProps) {
    const { currentConference } = useConference();
    
    const [config, setConfig] = useState(initialConfig || {
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
        qr_position: 'bottom-right'
    });

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewRole, setPreviewRole] = useState<'attendee'|'speaker'|'staff'>('attendee');
    const [scale, setScale] = useState(0.6); // Default scale
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profiles, setProfiles] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfiles = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, degree, role')
                .order('first_name');
            if (data) setProfiles(data);
        };
        fetchProfiles();
    }, []);

    // Dummy certificate for preview
    const previewCertificate: Certificate = {
        id: 'PREVIEW-123456',
        scanned_at: new Date().toISOString(),
        events: {
            id: eventId || 'evt-preview',
            title: 'Evento de Prueba',
            date: new Date().toISOString(),
            type: 'Conferencia',
            location: 'Auditorio Principal',
            description: 'Descripción del evento de prueba.',
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
        } catch (error) {
            console.error(error);
            alert('Error al guardar');
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
                                     <div className="mt-4 relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                         <img src={config.background_url} alt="Background Preview" className="w-full h-32 object-cover" />
                                         <button 
                                            onClick={() => setConfig({...config, background_url: undefined, mode: 'template_v1'})}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                            title="Eliminar fondo"
                                         >
                                             <X className="w-4 h-4" />
                                         </button>
                                         <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center">Vista Previa</div>
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
                                    className="w-full p-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#DBF227] focus:border-transparent outline-none"
                                >
                                    <option value="sans">Geist Sans (Moderna)</option>
                                    <option value="serif">Playfair Display (Elegante)</option>
                                    <option value="mono">Geist Mono (Técnica)</option>
                                    <option value="cursive">Great Vibes (Caligrafía)</option>
                                </select>
                            </div>

                            {config.mode === 'custom_background' && (
                                <>
                                    <div className="animate-in fade-in slide-in-from-left-2">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Alineación de Texto</label>
                                        <div className="flex bg-white p-1 rounded-lg border border-gray-200">
                                            {['left', 'center', 'right'].map((align) => (
                                                <button 
                                                    key={align}
                                                    onClick={() => updateStyle('text_alignment', align)}
                                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${config.styles?.text_alignment === align ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                                                >
                                                    {align === 'left' ? 'Izq' : align === 'center' ? 'Cen' : 'Der'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="animate-in fade-in slide-in-from-left-2">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="block text-xs font-semibold text-gray-500">Posición Vertical</label>
                                            <span className="text-[10px] font-mono bg-gray-200 px-1.5 rounded">{config.styles?.content_vertical_position}</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100" 
                                            defaultValue={parseInt(config.styles?.content_vertical_position || "40")}
                                            onChange={(e) => updateStyle('content_vertical_position', `${e.target.value}%`)}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#DBF227]"
                                        />
                                    </div>
                                </>
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
                                    className="bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ponente</label>
                                <Input 
                                    value={config.texts?.speaker || ''}
                                    onChange={(e) => updateText('speaker', e.target.value)}
                                    placeholder="Por impartir..."
                                    className="bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Staff</label>
                                <Input 
                                    value={config.texts?.staff || ''}
                                    onChange={(e) => updateText('staff', e.target.value)}
                                    placeholder="Por su apoyo..."
                                    className="bg-white"
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
                                                            degree: selectedProfile ? selectedProfile.degree : ''
                                                        };
                                                        
                                                        // Also ensure signer_count is updated or we just rely on signers array length in consumer?
                                                        // We'll set signer_count to 3 effectively or max index + 1?
                                                        // For compatibility, let's update signer_count to match the highest index filled + 1?
                                                        // For now, let's just save.
                                                        setConfig({...config, signers: newSigners});
                                                    }}
                                                    className="w-full p-2 border rounded text-xs bg-gray-50 outline-none focus:border-[#DBF227]"
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
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
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
                             <button
                                onClick={() => setPreviewRole('staff')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${previewRole === 'staff' ? 'bg-white shadow text-black' : 'text-gray-400 hover:text-gray-600'}`}
                             >
                                 Staff
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
                                <CertificateContent certificate={previewCertificate} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
