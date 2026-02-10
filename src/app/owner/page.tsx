'use client';

import { useEffect, useState } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ResponsiveNav } from '@/components/layout/ResponsiveNav';
import { SidebarAwareContainer } from '@/components/layout/SidebarAwareContainer';
import { User, LogOut, LayoutDashboard, Upload, X } from 'lucide-react';
import { Conference } from '@/types';
import { useConference } from '@/context/ConferenceContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PRESET_LOGOS } from '@/lib/constants';

export default function OwnerDashboard() {
  const { isAuthorized } = useRoleAuth(['owner']);
  const router = useRouter();
  
  const handleSignOut = async () => {
      await supabase.auth.signOut();
      router.push('/');
  };

  const navItems = [
      { 
          id: 'profile', 
          label: 'Volver al Perfil', 
          icon: <User className="w-5 h-5" />, 
          show: true,
          onClick: () => router.push('/profile')
      },
      {
          id: 'owner',
          label: 'Panel Owner',
          icon: <LayoutDashboard className="w-5 h-5" />,
          show: true
      }
  ];

  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectConference } = useConference();

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newConf, setNewConf] = useState<{
    title: string;
    description: string;
    event_type: string;
    institution_name: string;
    department_name: string;
    accent_color: { type: 'solid' | 'gradient'; value: string };
    badge_icon: { type: 'preset' | 'custom' | 'default'; value: string };
  }>({ 
    title: '', 
    description: '',
    event_type: 'Congreso',
    institution_name: '',
    department_name: '',
    accent_color: { type: 'solid', value: '#DBF227' },
    badge_icon: { type: 'default', value: '' }
  });

  const EVENT_TYPES = ['Congreso', 'Seminario', 'Coloquio', 'Evento especial'];
  
  const [showBadgeIconModal, setShowBadgeIconModal] = useState(false);
  const [uploadingBadgeIcon, setUploadingBadgeIcon] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
       fetchConferences();
    };
    checkUser();
  }, [isAuthorized]);

  const fetchConferences = async () => {
    const { data, error } = await supabase
      .from('conferences')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setConferences(data);
    setLoading(false);
  };

  const handleSave = async () => {
     if (!newConf.title) return;

     const payload = {
         title: newConf.title,
         description: newConf.description,
         event_type: newConf.event_type,
         institution_name: newConf.institution_name,
         department_name: newConf.department_name,
         accent_color: newConf.accent_color,
         badge_icon: newConf.badge_icon
     };

     // Debug: Log the payload to verify gradient is being saved correctly
     console.log('💾 Saving conference with payload:', payload);
     console.log('🎨 Accent color config:', payload.accent_color);

     if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('conferences')
          .update(payload)
          .eq('id', editingId);

        if (!error) {
           setConferences(conferences.map(c => 
              c.id === editingId ? { ...c, ...payload } : c
           ));
           resetForm();
        } else {
           alert('Error al actualizar: ' + error.message);
        }
     } else {
        // Create new
        const { data, error } = await supabase
          .from('conferences')
          .insert([{
             ...payload,
             start_date: new Date().toISOString(), 
             end_date: new Date().toISOString(), 
             is_active: false
          }])
          .select();

        if (data) {
           setConferences([data[0], ...conferences]);
           resetForm();
        } else if (error) {
           alert('Error al crear evento: ' + error.message);
        }
     }
  };

  const resetForm = () => {
     setIsCreating(false);
     setEditingId(null);
     setNewConf({ 
        title: '', 
        description: '',
        event_type: 'Congreso',
        institution_name: '',
        department_name: '',
        accent_color: { type: 'solid', value: '#DBF227' },
        badge_icon: { type: 'default', value: '' }
     });
  };

  const startEdit = (conf: Conference) => {
     setNewConf({ 
        title: conf.title, 
        description: conf.description,
        event_type: conf.event_type || 'Congreso',
        institution_name: conf.institution_name || '',
        department_name: conf.department_name || '',
        accent_color: conf.accent_color || { type: 'solid', value: '#DBF227' },
        badge_icon: conf.badge_icon || { type: 'default', value: '' }
     });
     setEditingId(conf.id);
     setIsCreating(true);
  };

  const handleBadgeIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    
    // Validate MIME type or extension for SVG
    if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
      alert('El archivo debe ser un SVG.');
      return;
    }

    const fileName = `conferences/badge_icons/${Date.now()}_${file.name}`;

    setUploadingBadgeIcon(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('events')
        .getPublicUrl(fileName);
      
      setNewConf({
        ...newConf,
        badge_icon: { type: 'custom', value: publicUrl }
      });
      setShowBadgeIconModal(false);

    } catch (error) {
      console.error('Error uploading badge icon:', error);
      alert('Error al subir el icono. Intenta de nuevo.');
    } finally {
      setUploadingBadgeIcon(false);
    }
  };


  const toggleActive = async (id: string, currentState: boolean) => {
      const { error } = await supabase
        .from('conferences')
        .update({ is_active: !currentState })
        .eq('id', id);
        
      if (!error) {
          setConferences(conferences.map(c => 
             c.id === id ? { ...c, is_active: !currentState } : c
          ));
      } else {
         alert('Error al actualizar estado: ' + error.message);
      }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!isAuthorized) return <div className="p-8 text-center">Acceso denegado. Se requiere rol Owner.</div>;

  return (
    <SidebarAwareContainer className="min-h-screen bg-white relative">
      {/* Background Grid Pattern - Subtle dark dots */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #000000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <ResponsiveNav 
          items={navItems}
          activeTab="owner"
          setActiveTab={() => {}}
          handleSignOut={handleSignOut}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-20 text-black">
        <motion.header 
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-10 border-l-[6px] border-[var(--color-acid)] pl-8"
        >
          <div className="space-y-4">
            <div className="space-y-0">
              <span className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px]">PLATFORM_MANAGEMENT_V2.0</span>
              <h1 className="text-6xl md:text-8xl font-black text-black tracking-tighter uppercase leading-[0.85]">
                PLATFORM <br /> 
                <span className="text-[var(--color-acid)] brightness-90">OWNER</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> SISTEMA OPERATIVO</span>
               <span>//</span>
               <span>{conferences.length} EVENTOS TOTALES</span>
            </div>
          </div>
          
          <motion.button 
             whileHover={{ scale: 1.05, backgroundColor: "#000000", color: "#ffffff" }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setIsCreating(true)}
             className="group relative bg-[var(--color-acid)] text-black px-10 py-6 font-black uppercase tracking-tighter text-sm transition-all duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden"
          >
             <div className="relative z-10 flex items-center gap-3">
               <span className="text-2xl leading-none">+</span> NUEVO PROYECTO
             </div>
             <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </motion.button>
        </motion.header>

        <AnimatePresence>
          {isCreating && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 20 }}
              className="bg-white border-2 border-black/10 mb-12 relative shadow-2xl overflow-hidden"
            >
              {/* Decorative side bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-black" />
              
              <div className="p-8 md:p-12 space-y-10">
                <div className="flex items-center justify-between border-b border-black/10 pb-6">
                  <div className="space-y-1">
                    <h2 className="text-3xl font-black text-black uppercase">
                      {editingId ? 'EDITAR' : 'CONFIGURAR'} <span className="text-[var(--color-acid)] brightness-90">PROYECTO</span>
                    </h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">INGRESAR METADATOS TÉCNICOS</p>
                  </div>
                  <button onClick={resetForm} className="text-gray-400 hover:text-black font-black text-xs transition-colors border-b border-gray-400 hover:border-black">
                    ESC_CANCELAR
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1 h-1 bg-[var(--color-acid)]" /> CATEGORÍA_EVENTO
                      </label>
                      <select 
                          className="w-full bg-gray-50 border-b-2 border-black/10 p-4 text-black font-bold appearance-none outline-none focus:border-[var(--color-acid)] transition-all text-lg"
                          value={newConf.event_type}
                          onChange={e => setNewConf({...newConf, event_type: e.target.value})}
                      >
                          {EVENT_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                          ))}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1 h-1 bg-[var(--color-acid)]" /> TITULAR_PROYECTO
                      </label>
                      <input 
                          type="text" 
                          placeholder="ASIGNAR NOMBRE..." 
                          className="w-full bg-gray-50 border-b-2 border-black/10 p-4 text-black font-bold outline-none focus:border-[var(--color-acid)] placeholder:text-gray-300 transition-all text-xl"
                          value={newConf.title}
                          onChange={e => setNewConf({...newConf, title: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1 h-1 bg-[var(--color-acid)]" /> ENTIDAD_PRESIDENTA
                      </label>
                      <input 
                          type="text" 
                          placeholder="INSTITUCIÓN / ORGANISMO..." 
                          className="w-full bg-gray-50 border-b-2 border-black/10 p-4 text-black font-bold outline-none focus:border-[var(--color-acid)] placeholder:text-gray-300 transition-all text-xl"
                          value={newConf.institution_name}
                          onChange={e => setNewConf({...newConf, institution_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1 h-1 bg-[var(--color-acid)]" /> DEPTO_RESPONSABLE
                      </label>
                      <input 
                          type="text" 
                          placeholder="DIVISIÓN ACADÉMICA..." 
                          className="w-full bg-gray-50 border-b-2 border-black/10 p-4 text-black font-bold outline-none focus:border-[var(--color-acid)] placeholder:text-gray-300 transition-all text-xl"
                          value={newConf.department_name}
                          onChange={e => setNewConf({...newConf, department_name: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Branding Section */}
                <div className="border-t border-black/5 pt-8 mt-8">
                  <h3 className="text-lg font-black text-black uppercase mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 bg-[var(--color-acid)]" />
                    IDENTIDAD_VISUAL
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Accent Color */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1 h-1 bg-[var(--color-acid)]" /> COLOR_ACENTO
                      </label>
                      
                      {/* Type Selector */}
                      <div className="flex gap-2 mb-4">
                        <button
                          type="button"
                          onClick={() => setNewConf({...newConf, accent_color: { type: 'solid', value: '#DBF227' }})}
                          className={`flex-1 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${newConf.accent_color.type === 'solid' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          Sólido
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewConf({...newConf, accent_color: { type: 'gradient', value: 'linear-gradient(135deg, #DBF227 0%, #c6e025 100%)' }})}
                          className={`flex-1 px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all ${newConf.accent_color.type === 'gradient' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          Gradiente
                        </button>
                      </div>

                      {newConf.accent_color.type === 'solid' ? (
                        <div className="flex gap-4 items-center">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-black/10">
                            <input 
                              type="color" 
                              value={newConf.accent_color.value}
                              onChange={(e) => setNewConf({...newConf, accent_color: { type: 'solid', value: e.target.value }})}
                              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0"
                            />
                          </div>
                          <div className="flex-1">
                            <input 
                              type="text"
                              value={newConf.accent_color.value}
                              onChange={(e) => setNewConf({...newConf, accent_color: { type: 'solid', value: e.target.value }})}
                              className="w-full bg-gray-50 border-b-2 border-black/10 p-3 text-black font-mono font-bold outline-none focus:border-[var(--color-acid)] uppercase transition-all"
                              placeholder="#DBF227"
                            />
                            <p className="text-[9px] text-gray-400 mt-2 font-medium">
                              Color sólido usado en toda la aplicación
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Gradient Preview */}
                          <div 
                            className="w-full h-20 rounded-xl shadow-lg border-2 border-black/10"
                            style={{ background: newConf.accent_color.value }}
                          />
                          
                          {/* Preset Gradients */}
                          <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Gradientes Predefinidos</label>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { name: 'Lime', value: 'linear-gradient(135deg, #DBF227 0%, #c6e025 100%)' },
                                { name: 'Sunset', value: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)' },
                                { name: 'Ocean', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                                { name: 'Fire', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
                                { name: 'Forest', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
                                { name: 'Purple', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
                                { name: 'Gold', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
                                { name: 'Night', value: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' }
                              ].map((preset) => (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => setNewConf({...newConf, accent_color: { type: 'gradient', value: preset.value }})}
                                  className={`h-12 rounded-lg border-2 transition-all ${newConf.accent_color.value === preset.value ? 'border-black scale-105' : 'border-gray-200 hover:border-gray-400'}`}
                                  style={{ background: preset.value }}
                                  title={preset.name}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Custom Gradient Input */}
                          <div>
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-2">Gradiente Personalizado (CSS)</label>
                            <textarea
                              value={newConf.accent_color.value}
                              onChange={(e) => setNewConf({...newConf, accent_color: { type: 'gradient', value: e.target.value }})}
                              className="w-full bg-gray-50 border-2 border-black/10 p-3 text-black font-mono text-xs outline-none focus:border-[var(--color-acid)] transition-all rounded-lg resize-none"
                              placeholder="linear-gradient(135deg, #DBF227 0%, #c6e025 100%)"
                              rows={2}
                            />
                            <p className="text-[9px] text-gray-400 mt-2 font-medium">
                              Usa sintaxis CSS de gradiente (linear-gradient, radial-gradient, etc.)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Badge Icon */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1 h-1 bg-[var(--color-acid)]" /> ICONO_GAFETE
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowBadgeIconModal(true)}
                        className="w-full bg-gray-50 border-2 border-dashed border-black/10 p-6 hover:border-[var(--color-acid)] hover:bg-gray-100 transition-all rounded-lg group"
                      >
                        {newConf.badge_icon.type !== 'default' && newConf.badge_icon.value ? (
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white rounded-lg border border-black/10 p-2 flex items-center justify-center">
                              <img 
                                src={newConf.badge_icon.type === 'preset' ? `/assets/${newConf.badge_icon.value}.svg` : newConf.badge_icon.value} 
                                alt="Badge Icon" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-black text-black uppercase">Icono Seleccionado</p>
                              <p className="text-[10px] text-gray-400 font-medium mt-1">
                                {newConf.badge_icon.type === 'preset' ? newConf.badge_icon.value.toUpperCase() : 'Personalizado'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-[var(--color-acid)]/20 transition-colors">
                              <Upload className="w-8 h-8 text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-black transition-colors">
                              Seleccionar Icono
                            </p>
                          </div>
                        )}
                      </button>
                      <p className="text-[9px] text-gray-400 font-medium">
                        Icono mostrado en el reverso del gafete
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-1 h-1 bg-[var(--color-acid)]" /> BREVARIO_ADMINISTRATIVO
                  </label>
                  <textarea 
                      placeholder="NOTAS DE ADMINISTRACIÓN INTERNA..." 
                      className="w-full bg-gray-50 border-b-2 border-black/10 p-4 text-black font-bold outline-none focus:border-[var(--color-acid)] placeholder:text-gray-300 min-h-[120px] transition-all text-lg resize-none"
                      value={newConf.description}
                      onChange={e => setNewConf({...newConf, description: e.target.value})}
                  />
                </div>

                <div className="flex justify-end pt-8">
                  <motion.button 
                    whileHover={{ x: 10, backgroundColor: "#000000", color: "#ffffff" }}
                    onClick={handleSave} 
                    className="relative bg-white text-black px-16 py-6 font-black uppercase tracking-tighter transition-all border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.05)]"
                  >
                    GUARDAR_CAMBIOS_V2.BIN →
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          layout
          className="grid grid-cols-1 gap-8"
        >
          {conferences.map((conf, index) => (
            <motion.div 
              key={conf.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-white border border-black/10 p-8 md:p-12 hover:border-[var(--color-acid)]/50 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-xl"
            >
              <div className="absolute top-0 left-0 w-[4px] h-0 group-hover:h-full bg-[var(--color-acid)] transition-all duration-300" />
              
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 relative z-10">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <span className="text-[9px] font-black bg-black text-white px-3 py-1.5 uppercase tracking-[0.3em] leading-none">
                      {conf.event_type || 'CONGRESO'}
                    </span>
                    {conf.is_active ? 
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-[var(--color-acid)] shadow-[0_0_10px_#D9F528]" />
                         <span className="text-black text-[9px] font-black uppercase tracking-[0.3em]">EN_LINEA_ACTIVO</span>
                       </div> : 
                       <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-gray-300" />
                         <span className="text-gray-400 text-[9px] font-black uppercase tracking-[0.3em]">OFFLINE_INACTIVO</span>
                       </div>
                    }
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-4xl md:text-5xl font-black text-black uppercase leading-[0.9] group-hover:text-[var(--color-acid)] transition-colors tracking-tighter">
                      {conf.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-gray-400 font-bold uppercase text-[9px] tracking-[0.2em]">
                      <span className="bg-black/5 px-2 py-1 text-black">REF_{conf.id.slice(0,8)}</span>
                      <span>//</span>
                      <span className="flex items-center gap-2">ESTABLECIDO: {new Date(conf.created_at || '').toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}</span>
                    </div>
                  </div>

                  <p className="text-gray-500 text-base md:text-lg max-w-2xl font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                    {conf.description || 'SISTEMA_SIN_DESCRIPCIÓN_ADICIONAL.'}
                  </p>
                  
                  {conf.institution_name && (
                    <div className="flex items-start gap-4 pt-2">
                       <div className="w-px h-full min-h-[40px] bg-black/10" />
                       <div className="flex flex-col gap-1">
                          <span className="text-black text-xs font-black uppercase tracking-widest">{conf.institution_name}</span>
                          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">{conf.department_name}</span>
                       </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex gap-4 w-full lg:w-auto">
                  <motion.button 
                     whileHover={{ y: -4, backgroundColor: "#D9F528", borderColor: "#D9F528", color: "#000000" }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => selectConference(conf, '/admin')}
                     className="px-8 py-4 bg-black text-white font-black uppercase tracking-tighter text-[11px] transition-all text-center border-2 border-black"
                  >
                     SISTEMA
                  </motion.button>
                  <motion.button 
                     whileHover={{ y: -4, backgroundColor: "#000000", color: "#ffffff" }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => startEdit(conf)}
                     className="px-8 py-4 border-2 border-black text-black font-black uppercase tracking-tighter text-[11px] transition-all text-center"
                  >
                     EDITAR
                  </motion.button>
                  <motion.button 
                     whileHover={{ y: -4 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={() => toggleActive(conf.id, conf.is_active)}
                     className={`px-8 py-4 font-black uppercase tracking-tighter text-[11px] transition-all text-center border-2 ${
                       conf.is_active 
                       ? 'border-red-600/30 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600' 
                       : 'border-green-600/30 text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600'
                     }`}
                  >
                     {conf.is_active ? 'DESACTIVAR' : 'ACTIVAR'}
                  </motion.button>
                </div>
              </div>
              
              {/* Decorative Blueprint Lines */}
              <div className="absolute bottom-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <div className="text-[40px] font-black leading-none tracking-tighter uppercase select-none text-black">
                  SEC_{index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        
        {conferences.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-40 text-center border-2 border-dashed border-black/5"
          >
             <p className="text-gray-300 font-black uppercase tracking-[1em] text-xs">NO_EVENTS_FOUND_IN_SERVER</p>
          </motion.div>
        )}
      </div>
      
      {/* Badge Icon Selection Modal */}
      <AnimatePresence>
        {showBadgeIconModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowBadgeIconModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="font-black text-xl text-black uppercase">Seleccionar Icono</h3>
                <button 
                  onClick={() => setShowBadgeIconModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Current Selection & Remove Option */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Estado actual:</span>
                    {newConf.badge_icon.type !== 'default' && newConf.badge_icon.value ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                        Seleccionado
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full font-bold">
                        Por defecto
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => {
                      setNewConf({...newConf, badge_icon: { type: 'default', value: '' }});
                      setShowBadgeIconModal(false);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Remover
                  </button>
                </div>

                {/* Presets Grid */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Iconos Disponibles</label>
                  <div className="grid grid-cols-5 gap-3">
                    {PRESET_LOGOS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setNewConf({...newConf, badge_icon: { type: 'preset', value: preset }});
                          setShowBadgeIconModal(false);
                        }}
                        className={`aspect-square rounded-xl border-2 p-2 hover:border-[#DBF227] hover:bg-gray-50 transition-all flex items-center justify-center ${newConf.badge_icon.type === 'preset' && newConf.badge_icon.value === preset ? 'border-[#DBF227] bg-yellow-50' : 'border-gray-100'}`}
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
                  <label className="block">
                    <input 
                      type="file" 
                      accept="image/svg+xml,.svg" 
                      className="hidden"
                      onChange={handleBadgeIconUpload}
                      disabled={uploadingBadgeIcon}
                    />
                    <div className="w-full border-dashed border-2 border-gray-200 h-16 hover:border-[#DBF227] hover:bg-yellow-50/50 text-gray-500 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm font-bold">
                        {uploadingBadgeIcon ? 'Subiendo...' : 'Seleccionar archivo SVG'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarAwareContainer>
  );
}
