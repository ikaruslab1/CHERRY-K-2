'use client';

import { useState } from 'react';
import { RegistrationEmailConfig } from '@/types';
import { PRESET_LOGOS } from '@/lib/constants';
import { EMAIL_PLACEHOLDERS, FONT_FAMILY_OPTIONS, FONT_SIZE_OPTIONS } from '@/constants/email';
import { AgendaEventItem } from '@/lib/emailCompiler';
import { 
  Type, 
  Palette, 
  Image as ImageIcon, 
  Calendar, 
  Sliders, 
  ShieldCheck, 
  MousePointerClick, 
  Globe, 
  Plus, 
  Trash2, 
  Tag, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Layout,
  Layers,
  Sparkles
} from 'lucide-react';

interface EmailEditorSidebarProps {
  config: RegistrationEmailConfig;
  onChange: (newConfig: RegistrationEmailConfig) => void;
  agendaEvents: AgendaEventItem[];
  accentColor?: string;
}

export function EmailEditorSidebar({
  config,
  onChange,
  agendaEvents = [],
  accentColor = '#d9383a',
}: EmailEditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<'meta' | 'typography' | 'content' | 'logos' | 'agenda' | 'extra'>('content');
  const [activeTextEditorTab, setActiveTextEditorTab] = useState<'wysiwyg' | 'raw'>('wysiwyg');

  const updateConfig = (patch: Partial<RegistrationEmailConfig>) => {
    onChange({
      ...config,
      ...patch,
    });
  };

  const updateStyles = (patch: Partial<RegistrationEmailConfig['styles']>) => {
    onChange({
      ...config,
      styles: {
        ...config.styles,
        ...patch,
      },
    });
  };

  const updateHeaderBanner = (patch: Partial<NonNullable<RegistrationEmailConfig['header_banner']>>) => {
    onChange({
      ...config,
      header_banner: {
        ...(config.header_banner || { show: true }),
        ...patch,
      },
    });
  };

  const updateCredentialsBox = (patch: Partial<NonNullable<RegistrationEmailConfig['credentials_box']>>) => {
    onChange({
      ...config,
      credentials_box: {
        ...(config.credentials_box || { show: true }),
        ...patch,
      },
    });
  };

  const updateAgendaSection = (patch: Partial<NonNullable<RegistrationEmailConfig['agenda_section']>>) => {
    onChange({
      ...config,
      agenda_section: {
        ...(config.agenda_section || { show: true }),
        ...patch,
      },
    });
  };

  const updateCtaButton = (patch: Partial<NonNullable<RegistrationEmailConfig['cta_button']>>) => {
    onChange({
      ...config,
      cta_button: {
        ...(config.cta_button || { show: true }),
        ...patch,
      },
    });
  };

  const updateFooter = (patch: Partial<NonNullable<RegistrationEmailConfig['footer']>>) => {
    onChange({
      ...config,
      footer: {
        ...(config.footer || {}),
        ...patch,
      },
    });
  };

  const insertPlaceholderIntoBody = (placeholderKey: string) => {
    const currentBody = config.body_html || '';
    updateConfig({
      body_html: currentBody + ` ${placeholderKey}`,
    });
  };

  const toggleEventInAgenda = (eventId: string) => {
    const currentIds = config.agenda_section?.selected_event_ids || [];
    const exists = currentIds.includes(eventId);
    const newIds = exists
      ? currentIds.filter(id => id !== eventId)
      : [...currentIds, eventId];

    updateAgendaSection({ selected_event_ids: newIds });
  };

  return (
    <div className="w-full lg:w-[460px] bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden">
      {/* Sidebar Navigation Tabs */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'content'
              ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          style={activeTab === 'content' ? { borderLeft: `3px solid ${accentColor}` } : {}}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Texto y Tags</span>
        </button>

        <button
          onClick={() => setActiveTab('logos')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'logos'
              ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          style={activeTab === 'logos' ? { borderLeft: `3px solid ${accentColor}` } : {}}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Logos</span>
        </button>

        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'agenda'
              ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          style={activeTab === 'agenda' ? { borderLeft: `3px solid ${accentColor}` } : {}}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Agenda</span>
        </button>

        <button
          onClick={() => setActiveTab('typography')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'typography'
              ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          style={activeTab === 'typography' ? { borderLeft: `3px solid ${accentColor}` } : {}}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Estilos</span>
        </button>

        <button
          onClick={() => setActiveTab('extra')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'extra'
              ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
          style={activeTab === 'extra' ? { borderLeft: `3px solid ${accentColor}` } : {}}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Bloques Extra</span>
        </button>
      </div>

      {/* Tab Panels Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* TAB 1: TEXTO Y PLACEHOLDERS */}
        {activeTab === 'content' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Subject & Preheader Header */}
            <div className="space-y-4 bg-gray-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Asunto y Preencabezado</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Asunto del Correo
                  </label>
                  <input
                    type="text"
                    value={config.subject || ''}
                    onChange={(e) => updateConfig({ subject: e.target.value })}
                    placeholder="Ej: ¡Bienvenido a {{evento}}, {{nombre}}!"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Preencabezado (Snippet de Vista Previa)
                  </label>
                  <input
                    type="text"
                    value={config.preheader || ''}
                    onChange={(e) => updateConfig({ preheader: e.target.value })}
                    placeholder="Ej: Revisa tus credenciales de acceso..."
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              </div>
            </div>

            {/* Quick Placeholders Toolbar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Insertar Placeholders Dinámicos
                </label>
                <span className="text-[10px] text-gray-400 font-medium">Haz clic para agregar al texto</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {EMAIL_PLACEHOLDERS.map((ph) => (
                  <button
                    key={ph.key}
                    type="button"
                    onClick={() => insertPlaceholderIntoBody(ph.key)}
                    className="px-2.5 py-1 text-[11px] font-mono font-semibold bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-lg transition-all border border-gray-200 dark:border-zinc-700 cursor-pointer active:scale-95 flex items-center gap-1"
                    title={ph.description}
                  >
                    <span>{ph.key}</span>
                    <Plus className="w-3 h-3 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                Cuerpo del Correo (HTML / Mensaje de Bienvenida)
              </label>
              <textarea
                value={config.body_html || ''}
                onChange={(e) => updateConfig({ body_html: e.target.value })}
                rows={10}
                placeholder="Escribe el mensaje de bienvenida aquí. Puedes usar etiquetas HTML como <p>, <strong>, <a>, <ul>, etc."
                className="w-full p-3 text-xs font-mono bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white leading-relaxed"
              />
              <p className="text-[11px] text-gray-500">
                Soporta formato HTML completo y placeholders dinámicos como <code className="bg-gray-100 dark:bg-zinc-800 px-1 rounded text-black dark:text-white">{"{{nombre}}"}</code>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: LOGOS DEL SISTEMA */}
        {activeTab === 'logos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Selector de Logotipos Institucionales</span>
              </h4>
              <p className="text-xs text-gray-500">
                Selecciona un logotipo precargado en el sistema (UNAM, Facultades) o proporciona una URL personalizada para el encabezado del correo.
              </p>
            </div>

            {/* Logo Type Switcher */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
              {(['preset', 'custom', 'text', 'none'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    updateConfig({
                      logo: {
                        ...(config.logo || { height: 48, alignment: 'center', value: '' }),
                        type,
                      },
                    })
                  }
                  className={`py-1.5 text-xs font-bold uppercase rounded-lg transition-all capitalize ${
                    config.logo?.type === type
                      ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {type === 'preset' ? 'Precargados' : type === 'custom' ? 'URL' : type === 'text' ? 'Texto' : 'Sin logo'}
                </button>
              ))}
            </div>

            {/* Preset Logos Grid */}
            {config.logo?.type === 'preset' && (
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                  Logos Precargados del Sistema
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_LOGOS.map((preset) => {
                    const logoUrl = `/assets/${preset}.svg`;
                    const isSelected = config.logo?.value === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          updateConfig({
                            logo: {
                              ...(config.logo || { height: 48, alignment: 'center' }),
                              type: 'preset',
                              value: preset,
                            },
                          })
                        }
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer bg-white dark:bg-zinc-900 ${
                          isSelected
                            ? 'border-black dark:border-white shadow-md scale-[1.02]'
                            : 'border-gray-200 dark:border-zinc-800 hover:border-gray-400'
                        }`}
                      >
                        <img src={logoUrl} alt={preset} className="h-8 max-w-full object-contain" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                          {preset}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom URL Option */}
            {config.logo?.type === 'custom' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  URL de Imagen del Logo
                </label>
                <input
                  type="url"
                  value={config.logo?.value || ''}
                  onChange={(e) =>
                    updateConfig({
                      logo: {
                        ...(config.logo || { height: 48, alignment: 'center' }),
                        type: 'custom',
                        value: e.target.value,
                      },
                    })
                  }
                  placeholder="https://ejemplo.com/logo.png"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:outline-none"
                />
              </div>
            )}

            {/* Text Logo Option */}
            {config.logo?.type === 'text' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Texto del Encabezado / Marca
                </label>
                <input
                  type="text"
                  value={config.logo?.value || ''}
                  onChange={(e) =>
                    updateConfig({
                      logo: {
                        ...(config.logo || { height: 48, alignment: 'center' }),
                        type: 'text',
                        value: e.target.value,
                      },
                    })
                  }
                  placeholder="Ej: 🍒 Cherry Eventos"
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:outline-none"
                />
              </div>
            )}

            {/* Logo Sizing & Alignment */}
            {config.logo?.type !== 'none' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Alto del Logo (px)
                  </label>
                  <input
                    type="number"
                    min={24}
                    max={120}
                    value={config.logo?.height || 48}
                    onChange={(e) =>
                      updateConfig({
                        logo: {
                          ...(config.logo || { type: 'preset', value: 'unam' }),
                          height: parseInt(e.target.value) || 48,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Alineación
                  </label>
                  <select
                    value={config.logo?.alignment || 'center'}
                    onChange={(e) =>
                      updateConfig({
                        logo: {
                          ...(config.logo || { type: 'preset', value: 'unam' }),
                          alignment: e.target.value as any,
                        },
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SELECTOR DE AGENDA */}
        {activeTab === 'agenda' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span>Selector de Eventos de la Agenda</span>
                </h4>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.agenda_section?.show ?? true}
                    onChange={(e) => updateAgendaSection({ show: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Selecciona las actividades o ponencias del evento global que deseas destacar en el correo de registro del usuario.
              </p>
            </div>

            {config.agenda_section?.show && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Título de la Sección de Agenda
                  </label>
                  <input
                    type="text"
                    value={config.agenda_section?.title || ''}
                    onChange={(e) => updateAgendaSection({ title: e.target.value })}
                    placeholder="Ej: Eventos Destacados de la Agenda"
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                    Eventos Disponibles en el Evento Global ({agendaEvents.length})
                  </label>

                  {agendaEvents.length === 0 ? (
                    <div className="p-4 bg-gray-50 dark:bg-zinc-900 text-center rounded-xl border border-dashed border-gray-300 dark:border-zinc-800 text-xs text-gray-500">
                      No hay eventos creados en la agenda del evento aún.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {agendaEvents.map((evt) => {
                        const isChecked = config.agenda_section?.selected_event_ids?.includes(evt.id);
                        return (
                          <div
                            key={evt.id}
                            onClick={() => toggleEventInAgenda(evt.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isChecked
                                ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-sm'
                                : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300'
                            }`}
                          >
                            <div className="mt-0.5">
                              <input
                                type="checkbox"
                                checked={!!isChecked}
                                onChange={() => {}} // handled by row click
                                className="rounded border-gray-300 text-black focus:ring-black"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                  {evt.type || 'Actividad'}
                                </span>
                                {evt.date && (
                                  <span className="text-[10px] font-mono text-gray-400">
                                    {evt.date}
                                  </span>
                                )}
                              </div>
                              <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {evt.title}
                              </h5>
                              {evt.location && (
                                <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                  📍 {evt.location}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ESTILOS & TIPOGRAFÍA */}
        {activeTab === 'typography' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>Personalización Visual y Tipográfica</span>
            </h4>

            {/* Typography Family */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Familia de Tipografía
              </label>
              <select
                value={config.styles?.font_family || 'sans-serif'}
                onChange={(e) => updateStyles({ font_family: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl focus:outline-none"
              >
                {FONT_FAMILY_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Tamaño del Texto Base
              </label>
              <div className="grid grid-cols-3 gap-2">
                {FONT_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => updateStyles({ font_size_body: size.value })}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      config.styles?.font_size_body === size.value
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {size.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme Inputs */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800">
              <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase">
                Paleta de Colores
              </label>

              <div className="grid grid-cols-2 gap-4">
                {/* Accent Color */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Color de Acento
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.accent_color || accentColor}
                      onChange={(e) => updateStyles({ accent_color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.styles?.accent_color || accentColor}
                      onChange={(e) => updateStyles({ accent_color: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs font-mono bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg uppercase"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Color de Texto
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.text_color || '#1a1a1a'}
                      onChange={(e) => updateStyles({ text_color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.styles?.text_color || '#1a1a1a'}
                      onChange={(e) => updateStyles({ text_color: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs font-mono bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg uppercase"
                    />
                  </div>
                </div>

                {/* Outer Background Color */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Fondo Exterior
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.background_color || '#f8fafc'}
                      onChange={(e) => updateStyles({ background_color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.styles?.background_color || '#f8fafc'}
                      onChange={(e) => updateStyles({ background_color: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs font-mono bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg uppercase"
                    />
                  </div>
                </div>

                {/* Card Background Color */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Fondo de Tarjeta
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.styles?.card_background || '#ffffff'}
                      onChange={(e) => updateStyles({ card_background: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="text"
                      value={config.styles?.card_background || '#ffffff'}
                      onChange={(e) => updateStyles({ card_background: e.target.value })}
                      className="w-full px-2.5 py-1 text-xs font-mono bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Border Radius Options */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Redondeo de Bordes de Tarjeta
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Plano (0px)', value: '0px' },
                  { label: 'Suave (8px)', value: '8px' },
                  { label: 'Moderno (16px)', value: '16px' },
                  { label: 'Curvo (24px)', value: '24px' },
                ].map((radius) => (
                  <button
                    key={radius.value}
                    type="button"
                    onClick={() => updateStyles({ border_radius: radius.value })}
                    className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${
                      config.styles?.border_radius === radius.value
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {radius.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BLOQUES EXTRA & ELEMENTOS PROFUNDOS */}
        {activeTab === 'extra' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" style={{ color: accentColor }} />
              <span>Elementos Estructurales Personalizables</span>
            </h4>

            {/* HEADER BANNER */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Layout className="w-3.5 h-3.5 text-gray-500" /> Banner de Encabezado
                </span>
                <input
                  type="checkbox"
                  checked={config.header_banner?.show ?? true}
                  onChange={(e) => updateHeaderBanner({ show: e.target.checked })}
                  className="rounded border-gray-300 text-black"
                />
              </div>

              {config.header_banner?.show && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                      Título del Banner
                    </label>
                    <input
                      type="text"
                      value={config.header_banner?.title || ''}
                      onChange={(e) => updateHeaderBanner({ title: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                      Subtítulo del Banner
                    </label>
                    <input
                      type="text"
                      value={config.header_banner?.subtitle || ''}
                      onChange={(e) => updateHeaderBanner({ subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CREDENTIALS BOX */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-500" /> Caja de Credenciales
                </span>
                <input
                  type="checkbox"
                  checked={config.credentials_box?.show ?? true}
                  onChange={(e) => updateCredentialsBox({ show: e.target.checked })}
                  className="rounded border-gray-300 text-black"
                />
              </div>

              {config.credentials_box?.show && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                      Título de la Caja
                    </label>
                    <input
                      type="text"
                      value={config.credentials_box?.title || ''}
                      onChange={(e) => updateCredentialsBox({ title: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.credentials_box?.show_username ?? true}
                        onChange={(e) => updateCredentialsBox({ show_username: e.target.checked })}
                      />
                      <span>Mostrar Usuario</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.credentials_box?.show_password ?? true}
                        onChange={(e) => updateCredentialsBox({ show_password: e.target.checked })}
                      />
                      <span>Mostrar ID / Password</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.credentials_box?.show_role ?? true}
                        onChange={(e) => updateCredentialsBox({ show_role: e.target.checked })}
                      />
                      <span>Mostrar Rol</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.credentials_box?.show_email ?? true}
                        onChange={(e) => updateCredentialsBox({ show_email: e.target.checked })}
                      />
                      <span>Mostrar Correo</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* CTA BUTTON */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <MousePointerClick className="w-3.5 h-3.5 text-gray-500" /> Botón de Acción Principal (CTA)
                </span>
                <input
                  type="checkbox"
                  checked={config.cta_button?.show ?? true}
                  onChange={(e) => updateCtaButton({ show: e.target.checked })}
                  className="rounded border-gray-300 text-black"
                />
              </div>

              {config.cta_button?.show && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                      Texto del Botón
                    </label>
                    <input
                      type="text"
                      value={config.cta_button?.text || ''}
                      onChange={(e) => updateCtaButton({ text: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                      Enlace de Destino (URL)
                    </label>
                    <input
                      type="text"
                      value={config.cta_button?.url || ''}
                      onChange={(e) => updateCtaButton({ url: e.target.value })}
                      placeholder="https://scherry.click"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER & SOCIAL LINKS */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/60 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-gray-500" /> Pie de Página y Redes Sociales
              </span>
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Texto de Pie de Página
                  </label>
                  <input
                    type="text"
                    value={config.footer?.text || ''}
                    onChange={(e) => updateFooter({ text: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Derechos de Autor (Copyright)
                  </label>
                  <input
                    type="text"
                    value={config.footer?.copyright_text || ''}
                    onChange={(e) => updateFooter({ copyright_text: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
