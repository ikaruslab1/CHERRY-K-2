'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useConference } from '@/context/ConferenceContext';
import { ConferenceLandingConfig } from '@/types';
import { DEFAULT_LANDING_CONFIG } from '@/constants/landing';
import { LandingEditorSidebar } from './LandingEditorSidebar';
import { LandingPreview } from './LandingPreview';
import { Palette, Loader2, Save, AlertTriangle, ZoomIn, ZoomOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LandingEditor() {
  const { currentConference, refreshConference } = useConference();
  const [config, setConfig] = useState<ConferenceLandingConfig>(DEFAULT_LANDING_CONFIG);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (currentConference) {
      if (currentConference.conference_landing_config) {
        const currentConfig = currentConference.conference_landing_config as any;
        
        // MIGRATION LOGIC: If it doesn't have 'blocks', it's the old format
        if (!currentConfig.blocks) {
          console.log("Migrating legacy landing config to modular format...");
          const migrated: ConferenceLandingConfig = {
            blocks: [
              {
                id: 'hero-migrated',
                type: 'hero',
                variant: 'centered',
                is_visible: true,
                content: {
                  title: currentConfig.hero?.title || '',
                  subtitle: currentConfig.hero?.subtitle || '',
                  gradient_start: currentConfig.hero?.gradient_start || '#FFFFFF',
                  gradient_end: currentConfig.hero?.gradient_end || '#CCEAFF',
                }
              },
              {
                id: 'features-migrated',
                type: 'features',
                variant: 'grid',
                is_visible: true,
                content: {
                  items: currentConfig.features || []
                }
              },
              {
                id: 'cta-migrated',
                type: 'cta',
                variant: 'standard',
                is_visible: true,
                content: {
                  login_label: currentConfig.cta?.login_label || 'Iniciar sesión',
                  register_label: currentConfig.cta?.register_label || 'Registrarse',
                }
              }
            ],
            global_styles: {
              primary_color: currentConfig.colors?.primary || '#373737',
              accent_color: currentConfig.colors?.accent || '#DBF227',
              font_family: currentConfig.typography?.font_family || 'inter',
            }
          };
          setConfig(migrated);
        } else {
          setConfig(currentConfig as ConferenceLandingConfig);
        }
      } else {
        setConfig(DEFAULT_LANDING_CONFIG);
      }
      setEnabled(!!currentConference.custom_landing_enabled);
      setLoading(false);
    }
  }, [currentConference]);

  const handleSave = async () => {
    if (!currentConference) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('conferences')
        .update({
          conference_landing_config: config,
          custom_landing_enabled: enabled,
        })
        .eq('id', currentConference.id);

      if (error) throw error;
      
      await refreshConference();
      alert('Configuración guardada correctamente');
    } catch (err) {
      console.error('Error saving landing config:', err);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!currentConference) return;
    const url = `${window.location.origin}/event/${currentConference.id}`;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-50 overflow-hidden relative">
      {/* Mobile/Tablet Warning Overlay */}
      <div className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Editor no optimizado para móviles</h2>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          El editor de landing requiere una pantalla más amplia para gestionar el diseño y la vista previa en tiempo real.
        </p>
        <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
          Resolución recomendada: 1280px+
        </div>
      </div>

      {/* Sidebar Controls */}
      <LandingEditorSidebar 
        config={config} 
        onConfigChange={setConfig}
        enabled={enabled}
        onEnabledChange={setEnabled}
        onSave={handleSave}
        saving={saving}
        onCopyLink={handleCopyLink}
        conferenceId={currentConference?.id}
      />

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
        {/* Preview Toolbar */}
        <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-sm text-gray-700">Vista Previa en Tiempo Real</h3>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg gap-1 border border-gray-200">
               <button 
                 onClick={() => setZoom(prev => Math.max(0.2, prev - 0.1))}
                 className="p-1.5 hover:bg-white rounded-md text-gray-500 hover:text-black transition-all"
                 title="Alejar"
               >
                 <ZoomOut className="w-3.5 h-3.5" />
               </button>
               <button 
                 onClick={() => setZoom(1)}
                 className="px-2 text-[10px] font-bold text-gray-400 hover:text-black transition-all"
                 title="Restablecer Zoom"
               >
                 {Math.round(zoom * 100)}%
               </button>
               <button 
                 onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                 className="p-1.5 hover:bg-white rounded-md text-gray-500 hover:text-black transition-all"
                 title="Acercar"
               >
                 <ZoomIn className="w-3.5 h-3.5" />
               </button>
            </div>

            {/* View Selectors */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[
                { id: 'desktop', label: 'Escritorio' },
                { id: 'tablet', label: 'Tablet' },
                { id: 'mobile', label: 'Móvil' }
              ].map((v) => (
                <button 
                  key={v.id}
                  onClick={() => {
                    setActiveView(v.id as any);
                    setZoom(1); // Reset zoom on view change to fit
                  }}
                  className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeView === v.id ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scaled Preview */}
        <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[#f0f0f0] custom-scrollbar">
          <LandingPreview 
            config={config} 
            conference={currentConference!} 
            view={activeView} 
            zoom={zoom}
          />
        </div>
      </div>
    </div>
  );
}
