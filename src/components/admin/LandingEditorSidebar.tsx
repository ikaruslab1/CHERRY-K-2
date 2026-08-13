'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ConferenceLandingConfig } from '@/types';
import { PRESET_LOGOS } from '@/lib/constants';
import { BLOCK_DEFAULTS, createBlockId, DEFAULT_LANDING_CONFIG } from '@/constants/landing';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  ChevronDown, 
  ChevronUp, 
  Layout, 
  Type, 
  Palette, 
  Layers, 
  MousePointer2, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2,
  Settings,
  AlertTriangle,
  Eye,
  EyeOff,
  GripVertical,
  Copy as CopyIcon,
  Calendar,
  Users,
  Upload,
  Image as ImageIcon,
  X,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight,
  Search,
  Grid,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

interface SidebarProps {
  config: ConferenceLandingConfig;
  onConfigChange: (config: ConferenceLandingConfig) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  onCopyLink: () => void;
  conferenceId?: string;
  certificateConfig?: any;
  enableTranslation?: boolean;
}

// Sub-component for Sortable Layer Item
function SortableLayerItem({ 
  block, 
  isActive, 
  onSelect, 
  onRemove, 
  onDuplicate, 
  onToggleVisibility 
}: { 
  block: any, 
  isActive: boolean, 
  onSelect: () => void,
  onRemove: () => void,
  onDuplicate: () => void,
  onToggleVisibility: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = {
    hero: Type,
    features: Layers,
    cta: MousePointer2,
    agenda: Calendar
  }[block.type as string] || Layout;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all cursor-default ${
        isActive 
          ? 'bg-black text-white border-black shadow-md' 
          : 'bg-white text-gray-700 border-gray-100 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 group-hover:text-gray-600">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold truncate uppercase tracking-tight">
          {block.type === 'cta' ? 'Links' : block.type} <span className="opacity-40 font-normal">#{block.id.slice(0,4)}</span>
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
        >
          {block.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
        >
          <CopyIcon className="w-3.5 h-3.5" />
        </button>
        {block.type !== 'auth' && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1.5 hover:bg-red-500 hover:text-white rounded-md transition-colors text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
function SortableRegistrationField({ 
  id, 
  item, 
  onUpdate, 
  onRemove,
  isFixed = false,
  showTranslations = false
}: { 
  id: string, 
  item: any, 
  onUpdate?: (updates: any) => void, 
  onRemove?: () => void,
  isFixed?: boolean,
  showTranslations?: boolean 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  if (isFixed) {
    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 opacity-60 ${isDragging ? 'ring-2 ring-black bg-white opacity-100 z-50' : ''}`}
      >
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black p-1">
          <Icons.GripVertical className="w-4 h-4" />
        </div>
        <div className="p-1.5 bg-white rounded-lg border border-gray-100">
          {id === 'nombre' && <Icons.User className="w-3 h-3 text-gray-400" />}
          {id === 'apellidos' && <Icons.User className="w-3 h-3 text-gray-400" />}
          {id === 'grado' && <Icons.BookOpen className="w-3 h-3 text-gray-400" />}
          {id === 'genero' && <Icons.Users className="w-3 h-3 text-gray-400" />}
          {id === 'email' && <Icons.Mail className="w-3 h-3 text-gray-400" />}
          {id === 'confirmEmail' && <Icons.Mail className="w-3 h-3 text-gray-400" />}
          {id === 'telefono' && <Icons.Phone className="w-3 h-3 text-gray-400" />}
        </div>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight flex-1">{item.label}</span>
        <Icons.Lock className="w-3 h-3 text-gray-300 mr-1" />
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`p-3 bg-white rounded-xl border border-gray-200 shadow-sm relative space-y-3 ${isDragging ? 'ring-2 ring-black border-transparent z-50' : ''}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-black p-1">
            <Icons.GripVertical className="w-4 h-4" />
          </div>
          <div className="p-1 px-2 bg-gray-50 rounded text-[9px] font-bold text-gray-400 flex items-center gap-1.5 border border-gray-100 uppercase tracking-tight">
            {item.type === 'text' && <Icons.Type className="w-2.5 h-2.5" />}
            {item.type === 'number' && <Icons.Hash className="w-2.5 h-2.5" />}
            {item.type === 'url' && <Icons.Link className="w-2.5 h-2.5" />}
            {item.type === 'checkbox' && <Icons.CheckSquare className="w-2.5 h-2.5" />}
            {item.type === 'dropdown' && <Icons.List className="w-2.5 h-2.5" />}
            {item.label || 'Campo Personalizado'}
          </div>
        </div>
        <button 
          onClick={onRemove}
          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
        >
          <Icons.Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tipo</label>
          <select 
            value={item.type || 'text'}
            onChange={(e) => onUpdate?.({ type: e.target.value })}
            className="w-full text-[10px] p-1.5 rounded-lg border border-gray-200 bg-white text-black outline-none h-8 font-medium"
          >
            <option value="text">Texto simple</option>
            <option value="number">Número</option>
            <option value="url">URL</option>
            <option value="checkbox">Checkbox</option>
            <option value="dropdown">Dropdown</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Título</label>
          <Input 
            value={item.label || ''}
            onChange={(e) => onUpdate?.({ label: e.target.value })}
            placeholder="Ej: Organización"
            className="text-[10px] h-8 bg-white text-black border-gray-200 font-medium"
          />
        </div>
      </div>
      
      {showTranslations && (
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Título (Inglés)</label>
          <Input 
            value={item.label_en || ''}
            onChange={(e) => onUpdate?.({ label_en: e.target.value })}
            placeholder="Ej: Organization"
            className="text-[10px] h-8 bg-white text-black border-blue-200 font-medium"
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1.5">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Placeholder {item.type === 'dropdown' && '(Opciones con coma)'}</label>
          <Input 
            value={item.placeholder || ''}
            onChange={(e) => onUpdate?.({ placeholder: e.target.value })}
            placeholder={item.type === 'dropdown' ? 'Ej: Opción 1, Opción 2' : item.type === 'checkbox' ? 'Texto secundario...' : "Ej: Escribe tu org..."}
            className="text-[10px] h-8 bg-white text-black border-gray-200 font-medium"
          />
        </div>
        <div className="space-y-1.5 shrink-0">
          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block text-right">Obligatorio</label>
          <div className="flex justify-end pt-1">
            <input 
              type="checkbox" 
              checked={item.required || false}
              onChange={(e) => onUpdate?.({ required: e.target.checked })}
              className="rounded text-black border-gray-300 focus:ring-black h-4 w-4"
            />
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-gray-50 rounded-lg space-y-2 border border-gray-100">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={item.banner_active || false}
            onChange={(e) => onUpdate?.({ banner_active: e.target.checked })}
            className="rounded text-black border-gray-300 focus:ring-black h-3 w-3"
          />
          <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Mostrar Banner Info</label>
        </div>
        
        {item.banner_active && (
          <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <Input 
              value={item.banner_text || ''}
              onChange={(e) => onUpdate?.({ banner_text: e.target.value })}
              placeholder="Texto del banner..."
              className="text-[10px] h-8 bg-white text-black border-gray-200 font-medium"
            />
            <select 
              value={item.banner_color || 'blue'}
              onChange={(e) => onUpdate?.({ banner_color: e.target.value })}
              className="w-full text-[10px] p-1.5 border border-gray-200 rounded-lg bg-white text-black outline-none h-8 font-medium"
            >
              <option value="blue">Azul (Informativo)</option>
              <option value="green">Verde (Éxito)</option>
              <option value="yellow">Amarillo (Advertencia)</option>
              <option value="red">Rojo (Importante)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export function LandingEditorSidebar({ 
  config, 
  onConfigChange, 
  enabled, 
  onEnabledChange, 
  onSave, 
  saving, 
  onCopyLink,
  conferenceId,
  certificateConfig,
  enableTranslation
}: SidebarProps) {
  const showTranslations = enabled && enableTranslation;
  const [activeBlockId, setActiveBlockId] = useState<string | null>(config.blocks?.[0]?.id || null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [expandedIconIdx, setExpandedIconIdx] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = config.blocks.findIndex((b) => b.id === active.id);
      const newIndex = config.blocks.findIndex((b) => b.id === over.id);
      onConfigChange({
        ...config,
        blocks: arrayMove(config.blocks, oldIndex, newIndex),
      });
    }
  };

  const addBlock = (type: any) => {
    const newBlock = {
      id: createBlockId(),
      type,
      ...BLOCK_DEFAULTS[type],
      is_visible: true
    };
    onConfigChange({
      ...config,
      blocks: [...config.blocks, newBlock]
    });
    setActiveBlockId(newBlock.id);
    setIsAddMenuOpen(false);
  };

  const removeBlock = (id: string) => {
    const block = config.blocks.find(b => b.id === id);
    if (block?.type === 'auth') return; // Bloque de auth es obligatorio

    onConfigChange({
      ...config,
      blocks: config.blocks.filter(b => b.id !== id)
    });
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const duplicateBlock = (id: string) => {
    const block = config.blocks.find(b => b.id === id);
    if (!block) return;
    const newBlock = { ...block, id: createBlockId() };
    const index = config.blocks.findIndex(b => b.id === id);
    const newBlocks = [...config.blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onConfigChange({ ...config, blocks: newBlocks });
  };

  const toggleVisibility = (id: string) => {
    onConfigChange({
      ...config,
      blocks: config.blocks.map(b => b.id === id ? { ...b, is_visible: !b.is_visible } : b)
    });
  };

  const updateBlockContent = (id: string, updates: any) => {
    onConfigChange({
      ...config,
      blocks: config.blocks.map(b => b.id === id ? { ...b, content: { ...b.content, ...updates } } : b)
    });
  };

  const updateGlobalStyle = (path: string, value: any) => {
    onConfigChange({
      ...config,
      global_styles: { ...config.global_styles, [path as keyof typeof config.global_styles]: value }
    });
  };

  const resetToDefault = () => {
    if (confirm('¿Restablecer diseño?')) {
      onConfigChange(DEFAULT_LANDING_CONFIG);
    }
  };

  const activeBlock = config.blocks?.find(b => b.id === activeBlockId);

  return (
    <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-gray-200 bg-white h-full flex flex-col shadow-xl z-20 relative">
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#373737] flex items-center justify-center">
            <Layout className="w-4 h-4 text-[#DBF227]" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-gray-800 tracking-tight">Personalización Modular</h2>
            <p className="text-[10px] text-gray-400">Editor basado en bloques dinámicos</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* LAYERS PANEL */}
        <div className="p-4 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-3 h-3" /> Capas de Estructura
            </h3>
            <div className="relative">
              <Button 
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                variant="outline" 
                size="sm" 
                className="h-7 px-2.5 text-[10px] text-black font-bold bg-white border-gray-200 hover:border-black shadow-sm"
              >
                <Plus className="w-3 h-3 mr-1.5" /> Añadir Bloque
              </Button>

              {isAddMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-[100] animate-in fade-in zoom-in-95 duration-200"
                  onMouseLeave={() => setIsAddMenuOpen(false)}
                >
                  <p className="px-3 py-2 text-[9px] font-bold text-gray-400 uppercase">Selecciona un bloque</p>
                  {(Object.keys(BLOCK_DEFAULTS) as any[]).filter(type => type !== 'auth').map(type => (
                    <button 
                      key={type}
                      onClick={() => addBlock(type)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        {type === 'hero' && <Type className="w-3 h-3" />}
                        {type === 'features' && <Layers className="w-3 h-3" />}
                        {type === 'cta' && <MousePointer2 className="w-3 h-3" />}
                        {type === 'agenda' && <Calendar className="w-3 h-3" />}
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 capitalize">{type === 'cta' ? 'Links' : type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={config.blocks?.map(b => b.id) || []} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {config.blocks?.map((block) => (
                  <SortableLayerItem 
                    key={block.id} 
                    block={block} 
                    isActive={activeBlockId === block.id}
                    onSelect={() => setActiveBlockId(block.id)}
                    onRemove={() => removeBlock(block.id)}
                    onDuplicate={() => duplicateBlock(block.id)}
                    onToggleVisibility={() => toggleVisibility(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* CONTENT EDITOR */}
        <div className="p-4 space-y-6 pb-32">
          {activeBlock ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50">
                  <div className="p-2 bg-gray-900 rounded-xl">
                    <Settings className="w-4 h-4 text-[#DBF227]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 uppercase">Editando {activeBlock.type === 'cta' ? 'Links' : activeBlock.type}</h4>
                    <p className="text-[10px] text-gray-400">ID: {activeBlock.id}</p>
                  </div>
               </div>

               {/* BLOCK SPECIFIC FIELDS */}
               {activeBlock.type === 'hero' && (
                 <div className="space-y-6">
                    {/* Logos Section */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2">
                        <Palette className="w-3 h-3" /> Logotipos Superiores
                      </label>
                      <div className="space-y-4">
                        {/* Selected Logos List */}
                        {(activeBlock.content.logos || []).length > 0 && (
                          <div className="space-y-2">
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Logos Seleccionados</p>
                             <div className="flex flex-wrap gap-2">
                                {(activeBlock.content.logos || []).map((logo: string, idx: number) => {
                                  const isPreset = PRESET_LOGOS.some(p => `/assets/${p}.svg` === logo);
                                  const label = isPreset ? logo.split('/').pop()?.replace('.svg', '') : 'Custom';
                                  
                                  return (
                                    <div key={idx} className="flex items-center gap-2 bg-white border border-gray-200 pl-2 pr-1 py-1 rounded-lg shadow-sm group">
                                      <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
                                      <span className="text-[10px] font-medium text-gray-600 truncate max-w-[80px] capitalize">{label}</span>
                                      <button 
                                        onClick={() => {
                                          const newLogos = activeBlock.content.logos.filter((_: any, i: number) => i !== idx);
                                          updateBlockContent(activeBlock.id, { logos: newLogos });
                                        }}
                                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  );
                                })}
                             </div>
                          </div>
                        )}

                        {/* System Library (Presets) */}
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-3">
                           <p className="text-[10px] font-bold text-gray-400 uppercase">Librería del Sistema</p>
                           <div className="grid grid-cols-5 gap-2">
                             {PRESET_LOGOS.map((preset) => {
                                const url = `/assets/${preset}.svg`;
                                const isSelected = activeBlock.content.logos?.includes(url);
                                
                                return (
                                  <button 
                                    key={preset}
                                    onClick={() => {
                                      let newLogos = [...(activeBlock.content.logos || [])];
                                      if (isSelected) {
                                        newLogos = newLogos.filter(logo => logo !== url);
                                      } else {
                                        newLogos.push(url);
                                      }
                                      updateBlockContent(activeBlock.id, { logos: newLogos });
                                    }}
                                    className={`aspect-square rounded-xl border-2 flex items-center justify-center p-2 transition-all hover:scale-105 ${isSelected ? 'border-[#DBF227] bg-[#DBF227]/5' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                                    title={preset}
                                  >
                                    <img src={url} alt={preset} className="max-w-full max-h-full object-contain" />
                                  </button>
                                );
                             })}
                           </div>
                           <p className="text-[9px] text-gray-400 leading-tight italic">
                             Selecciona los logotipos institucionales cargados en el sistema (UNAM, Facultades, etc.) para mostrarlos en el Hero.
                           </p>
                        </div>
                      </div>
                    </div>

                    {/* Typography & Colors */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Título Principal</label>
                        <Input 
                          value={activeBlock.content.title}
                          onChange={(e) => updateBlockContent(activeBlock.id, { title: e.target.value })}
                          className="text-xs h-9"
                        />
                        {showTranslations && (
                          <Input 
                            value={activeBlock.content.title_en || ''}
                            onChange={(e) => updateBlockContent(activeBlock.id, { title_en: e.target.value })}
                            className="text-xs h-9 border-blue-200 mt-2"
                            placeholder="Título Principal (Inglés)"
                          />
                        )}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <select 
                            value={activeBlock.content.title_font || 'sans'}
                            onChange={(e) => updateBlockContent(activeBlock.id, { title_font: e.target.value })}
                            className="p-1.5 text-[10px] border border-gray-200 rounded-lg bg-white"
                          >
                            <option value="sans">Geist Sans (Moderna)</option>
                            <option value="serif">Playfair Display (Elegante)</option>
                            <option value="mono">Geist Mono (Técnica)</option>
                            <option value="cursive">Dancing Script (Caligrafía)</option>
                          </select>
                          <Input 
                            type="color"
                            value={activeBlock.content.title_color || '#000000'}
                            onChange={(e) => updateBlockContent(activeBlock.id, { title_color: e.target.value })}
                            className="h-8 p-0 border-none bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Subtítulo</label>
                        <textarea 
                          value={activeBlock.content.subtitle}
                          onChange={(e) => updateBlockContent(activeBlock.id, { subtitle: e.target.value })}
                          rows={2}
                          className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-white outline-none resize-none"
                        />
                        {showTranslations && (
                          <textarea 
                            value={activeBlock.content.subtitle_en || ''}
                            onChange={(e) => updateBlockContent(activeBlock.id, { subtitle_en: e.target.value })}
                            rows={2}
                            placeholder="Subtítulo (Inglés)"
                            className="w-full p-2 text-xs border border-blue-200 rounded-lg bg-white outline-none resize-none mt-2"
                          />
                        )}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <select 
                            value={activeBlock.content.subtitle_font || 'sans'}
                            onChange={(e) => updateBlockContent(activeBlock.id, { subtitle_font: e.target.value })}
                            className="p-1.5 text-[10px] border border-gray-200 rounded-lg bg-white"
                          >
                            <option value="sans">Geist Sans (Moderna)</option>
                            <option value="serif">Playfair Display (Elegante)</option>
                            <option value="mono">Geist Mono (Técnica)</option>
                            <option value="cursive">Dancing Script (Caligrafía)</option>
                          </select>
                          <Input 
                            type="color"
                            value={activeBlock.content.subtitle_color || '#000000'}
                            onChange={(e) => updateBlockContent(activeBlock.id, { subtitle_color: e.target.value })}
                            className="h-8 p-0 border-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Main Background */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fondo del Hero</label>
                      <div className="flex gap-2 bg-gray-50/50 p-1.5 rounded-2xl border border-gray-100 shadow-inner">
                        {(['color', 'gradient', 'image'] as const).map(type => (
                          <button 
                            key={type}
                            onClick={() => updateBlockContent(activeBlock.id, { background_type: type })}
                            className={`flex-1 py-1.5 text-[9px] font-bold rounded-xl transition-all ${activeBlock.content.background_type === type ? 'bg-white shadow-sm text-black border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            {type === 'color' ? 'Sólido' : type === 'gradient' ? 'Degradado' : 'Imagen'}
                          </button>
                        ))}
                      </div>

                      {activeBlock.content.background_type === 'color' && (
                        <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                           <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-xl border-4 border-gray-50 shadow-inner ring-1 ring-black/5" 
                                style={{ backgroundColor: activeBlock.content.background_value || '#373737' }}
                              />
                              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-tighter">
                                {activeBlock.content.background_value || '#373737'}
                              </span>
                           </div>
                           <div className="relative">
                              <Input 
                                type="color"
                                value={activeBlock.content.background_value || '#373737'}
                                onChange={(e) => updateBlockContent(activeBlock.id, { background_value: e.target.value })}
                                className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer relative z-10 opacity-0"
                              />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                 <Plus className="w-4 h-4 text-[#DBF227]" />
                              </div>
                           </div>
                        </div>
                      )}

                      {activeBlock.content.background_type === 'gradient' && (
                        <div className="space-y-5 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-bold text-gray-400 uppercase">Inicio</label>
                                 <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                   <Input 
                                      type="color"
                                      value={activeBlock.content.gradient_start || '#373737'}
                                      onChange={(e) => updateBlockContent(activeBlock.id, { gradient_start: e.target.value })}
                                      className="w-7 h-7 p-0 border-none bg-transparent cursor-pointer"
                                   />
                                   <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-tighter">
                                      {activeBlock.content.gradient_start || '#373737'}
                                   </span>
                                 </div>
                              </div>
                              <div className="space-y-1.5">
                                 <label className="text-[9px] font-bold text-gray-400 uppercase">Fin</label>
                                 <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                   <Input 
                                      type="color"
                                      value={activeBlock.content.gradient_end || '#000000'}
                                      onChange={(e) => updateBlockContent(activeBlock.id, { gradient_end: e.target.value })}
                                      className="w-7 h-7 p-0 border-none bg-transparent cursor-pointer"
                                   />
                                   <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-tighter">
                                      {activeBlock.content.gradient_end || '#000000'}
                                   </span>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-3 pt-2 border-t border-gray-50">
                              <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center justify-between">
                                Dirección
                                <span className="text-[8px] font-black font-mono text-blue-500 uppercase tracking-widest">{activeBlock.content.gradient_direction || 'Standard'}</span>
                              </label>
                              <div className="grid grid-cols-4 gap-2">
                                {(['to right', 'to bottom right', 'to bottom', 'to bottom left', 'to left', 'to top left', 'to top', 'to top right'] as const).map((dir) => {
                                  const icons: any = {
                                    'to right': ArrowRight, 'to bottom right': ArrowDownRight, 'to bottom': ArrowDown, 'to bottom left': ArrowDownLeft,
                                    'to left': ArrowLeft, 'to top left': ArrowUpLeft, 'to top': ArrowUp, 'to top right': ArrowUpRight
                                  };
                                  const Icon = icons[dir];
                                  const isSelected = activeBlock.content.gradient_direction === dir || (!activeBlock.content.gradient_direction && dir === 'to bottom right');
                                  
                                  return (
                                    <button 
                                      key={dir}
                                      onClick={() => updateBlockContent(activeBlock.id, { gradient_direction: dir })}
                                      className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-center hover:scale-105 ${isSelected ? 'border-[#DBF227] bg-[#DBF227]/5 text-black shadow-inner shadow-[#DBF227]/10' : 'border-gray-100 bg-gray-50/30 text-gray-300 hover:border-gray-200'}`}
                                      title={dir}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </button>
                                  );
                                })}
                              </div>
                           </div>
                        </div>
                      )}

                      {activeBlock.content.background_type === 'image' && (
                        <div className="space-y-2">
                           <Input 
                            value={activeBlock.content.background_value}
                            onChange={(e) => updateBlockContent(activeBlock.id, { background_value: e.target.value })}
                            placeholder="URL de imagen industrial"
                            className="text-[10px] h-10 bg-white rounded-xl shadow-inner border-gray-100"
                           />
                           <p className="text-[8px] text-gray-400 px-2 italic font-medium leading-tight">Usa una URL de Unsplash (ej: https://unsplash.com/...) para una mejor resolución.</p>
                        </div>
                      )}
                    </div>

                    {/* Buttons Section (Centered) */}
                    {activeBlock.variant === 'centered' && (
                      <div className="space-y-3 border-t border-gray-100 pt-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-between">
                          Botones de Acción
                          <span className="text-[9px] font-normal lowercase">Máximo 3 recomendados</span>
                        </label>
                        <div className="space-y-3">
                          {activeBlock.content.buttons?.map((btn: any, idx: number) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 relative group">
                              <button 
                                onClick={() => {
                                  const newButtons = activeBlock.content.buttons.filter((_: any, i: number) => i !== idx);
                                  updateBlockContent(activeBlock.id, { buttons: newButtons });
                                }}
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Eliminar botón"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <Input 
                                  value={btn.label}
                                  onChange={(e) => {
                                    const newBtns = [...activeBlock.content.buttons];
                                    newBtns[idx] = { ...btn, label: e.target.value };
                                    updateBlockContent(activeBlock.id, { buttons: newBtns });
                                  }}
                                  placeholder="Texto"
                                  className="text-[10px] h-8 bg-white text-black"
                                />
                                <Input 
                                  type="color"
                                  value={btn.color || '#000000'}
                                  onChange={(e) => {
                                    const newBtns = [...activeBlock.content.buttons];
                                    newBtns[idx] = { ...btn, color: e.target.value };
                                    updateBlockContent(activeBlock.id, { buttons: newBtns });
                                  }}
                                  className="h-8 p-0 border-none bg-transparent"
                                />
                              </div>
                              <Input 
                                value={btn.url}
                                onChange={(e) => {
                                  const newBtns = [...activeBlock.content.buttons];
                                  newBtns[idx] = { ...btn, url: e.target.value };
                                  updateBlockContent(activeBlock.id, { buttons: newBtns });
                                }}
                                placeholder="URL (ej: #register o https://...)"
                                className="text-[10px] h-8 bg-white text-black"
                              />
                            </div>
                          ))}
                          <Button 
                            onClick={() => {
                              const newButtons = [...(activeBlock.content.buttons || []), { label: 'Nuevo Botón', url: '#', color: '#DBF227' }];
                              updateBlockContent(activeBlock.id, { buttons: newButtons });
                            }}
                            variant="outline" size="sm" className="w-full text-[10px] h-9 border-dashed text-black hover:bg-gray-50"
                          >
                            <Plus className="w-3 h-3 mr-2" /> Añadir Botón
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Split Variant Options */}
                    {activeBlock.variant === 'split' && (
                      <div className="space-y-4 border-t border-gray-100 pt-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Alineación de Texto</label>
                          <select 
                            value={activeBlock.content.split_alignment || 'left'}
                            onChange={(e) => updateBlockContent(activeBlock.id, { split_alignment: e.target.value })}
                            className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none"
                          >
                            <option value="left">Izquierda (Normal)</option>
                            <option value="right">Derecha (Invertido)</option>
                          </select>
                        </div>
                        <div className="space-y-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-inner">
                           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fondo de Área Lateral</label>
                           
                           <div className="flex gap-2 bg-white/50 p-1.5 rounded-xl border border-gray-100 shadow-sm mb-3">
                              {(['color', 'gradient', 'image'] as const).map(type => (
                                <button 
                                  key={type}
                                  onClick={() => updateBlockContent(activeBlock.id, { feature_area_background_type: type })}
                                  className={`flex-1 py-1 text-[8px] font-black rounded-lg transition-all ${activeBlock.content.feature_area_background_type === type ? 'bg-[#373737] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                  {type === 'color' ? 'SOL' : type === 'gradient' ? 'DEG' : 'IMG'}
                                </button>
                              ))}
                           </div>

                           {activeBlock.content.feature_area_background_type === 'color' && (
                             <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100">
                                <Input 
                                  type="color"
                                  value={activeBlock.content.feature_area_background_value || '#FFFFFF'}
                                  onChange={(e) => updateBlockContent(activeBlock.id, { feature_area_background_value: e.target.value })}
                                  className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
                                />
                                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">{activeBlock.content.feature_area_background_value || '#FFFFFF'}</span>
                             </div>
                           )}

                           {activeBlock.content.feature_area_background_type === 'gradient' && (
                             <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-white p-2 rounded-xl border border-gray-100 flex items-center gap-2">
                                    <Input 
                                      type="color"
                                      value={activeBlock.content.feature_area_gradient_start || '#FFFFFF'}
                                      onChange={(e) => updateBlockContent(activeBlock.id, { feature_area_gradient_start: e.target.value })}
                                      className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer"
                                    />
                                    <span className="text-[8px] font-mono text-gray-400">{activeBlock.content.feature_area_gradient_start || '#FFF'}</span>
                                  </div>
                                  <div className="bg-white p-2 rounded-xl border border-gray-100 flex items-center gap-2">
                                    <Input 
                                      type="color"
                                      value={activeBlock.content.feature_area_gradient_end || '#F8FAFC'}
                                      onChange={(e) => updateBlockContent(activeBlock.id, { feature_area_gradient_end: e.target.value })}
                                      className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer"
                                    />
                                    <span className="text-[8px] font-mono text-gray-400">{activeBlock.content.feature_area_gradient_end || '#F8F'}</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5 pt-1">
                                  {(['to right', 'to bottom right', 'to bottom', 'to bottom left', 'to left', 'to top left', 'to top', 'to top right'] as const).map((dir) => {
                                    const icons: any = {
                                      'to right': ArrowRight, 'to bottom right': ArrowDownRight, 'to bottom': ArrowDown, 'to bottom left': ArrowDownLeft,
                                      'to left': ArrowLeft, 'to top left': ArrowUpLeft, 'to top': ArrowUp, 'to top right': ArrowUpRight
                                    };
                                    const Icon = icons[dir];
                                    const isSelected = activeBlock.content.feature_area_gradient_direction === dir;
                                    return (
                                      <button 
                                        key={dir}
                                        onClick={() => updateBlockContent(activeBlock.id, { feature_area_gradient_direction: dir })}
                                        className={`p-1.5 rounded-lg border transition-all ${isSelected ? 'border-[#DBF227] bg-[#DBF227]/10' : 'border-gray-50 bg-white shadow-sm'}`}
                                      >
                                        <Icon className="w-3 h-3" />
                                      </button>
                                    );
                                  })}
                                </div>
                             </div>
                           )}

                           {activeBlock.content.feature_area_background_type === 'image' && (
                             <Input 
                                value={activeBlock.content.feature_area_background_value}
                                onChange={(e) => updateBlockContent(activeBlock.id, { feature_area_background_value: e.target.value })}
                                placeholder="URL de imagen"
                                className="text-[9px] h-8 bg-white"
                             />
                           )}
                        </div>
                      </div>
                    )}
                 </div>
               )}

                {activeBlock.type === 'features' && (
                  <div className="space-y-4">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-gray-400 uppercase">Título de Sección</label>
                       <Input 
                         value={activeBlock.content.title}
                         onChange={(e) => updateBlockContent(activeBlock.id, { title: e.target.value })}
                         className="text-xs text-black"
                       />
                       {showTranslations && (
                         <Input 
                           value={activeBlock.content.title_en || ''}
                           onChange={(e) => updateBlockContent(activeBlock.id, { title_en: e.target.value })}
                           className="text-xs text-black border-blue-200 mt-2"
                           placeholder="Título de Sección (Inglés)"
                         />
                       )}
                     </div>

                     <div className="grid grid-cols-2 gap-3 pb-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Alineación Tarjetas</label>
                        <select 
                          value={activeBlock.content.text_align || 'left'}
                          onChange={(e) => updateBlockContent(activeBlock.id, { text_align: e.target.value })}
                          className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-black transition-all text-black"
                        >
                          <option value="left">Izquierda</option>
                          <option value="center">Centro</option>
                          <option value="right">Derecha</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Alineación Cuadrícula</label>
                        <select 
                          value={activeBlock.content.grid_align || 'left'}
                          onChange={(e) => updateBlockContent(activeBlock.id, { grid_align: e.target.value })}
                          className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-black transition-all text-black"
                        >
                          <option value="left">Izquierda</option>
                          <option value="center">Centro</option>
                          <option value="right">Derecha</option>
                        </select>
                      </div>
                     </div>

                     <div className="space-y-3">
                       <label className="text-[10px] font-bold text-gray-400 uppercase">Ítems de Características</label>
                       {activeBlock.content.items?.map((item: any, idx: number) => (
                         <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 relative group">
                            <button 
                              onClick={() => {
                                const newItems = [...activeBlock.content.items];
                                newItems.splice(idx, 1);
                                updateBlockContent(activeBlock.id, { items: newItems });
                              }}
                              className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <Input 
                              value={item.title}
                              onChange={(e) => {
                                const newItems = [...activeBlock.content.items];
                                newItems[idx] = { ...item, title: e.target.value };
                                updateBlockContent(activeBlock.id, { items: newItems });
                              }}
                              placeholder="Título"
                              className="text-[11px] font-bold h-8 bg-white text-black"
                            />
                            {showTranslations && (
                              <Input 
                                value={item.title_en || ''}
                                onChange={(e) => {
                                  const newItems = [...activeBlock.content.items];
                                  newItems[idx] = { ...item, title_en: e.target.value };
                                  updateBlockContent(activeBlock.id, { items: newItems });
                                }}
                                placeholder="Título (Inglés)"
                                className="text-[11px] font-bold h-8 bg-white text-black border-blue-200"
                              />
                            )}
                            <textarea 
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...activeBlock.content.items];
                                newItems[idx] = { ...item, description: e.target.value };
                                updateBlockContent(activeBlock.id, { items: newItems });
                              }}
                              rows={2}
                              className="w-full p-2 text-[10px] border border-gray-200 rounded-lg bg-white outline-none resize-none text-black"
                              placeholder="Descripción..."
                            />
                            {showTranslations && (
                              <textarea 
                                value={item.description_en || ''}
                                onChange={(e) => {
                                  const newItems = [...activeBlock.content.items];
                                  newItems[idx] = { ...item, description_en: e.target.value };
                                  updateBlockContent(activeBlock.id, { items: newItems });
                                }}
                                rows={2}
                                className="w-full p-2 text-[10px] border border-blue-200 rounded-lg bg-white outline-none resize-none text-black"
                                placeholder="Descripción (Inglés)..."
                              />
                            )}
                            
                            <div className="pt-2">
                               <button 
                                 onClick={() => setExpandedIconIdx(expandedIconIdx === idx ? null : idx)}
                                 className="w-full flex items-center justify-between p-2.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all text-[10px] font-bold text-gray-500 uppercase"
                               >
                                 <span className="flex items-center gap-2">
                                   <Grid className="w-3.5 h-3.5 text-black" /> Personalizar Icono
                                 </span>
                                 {expandedIconIdx === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                               </button>

                               {expandedIconIdx === idx && (
                                 <div className="mt-2 p-3 bg-white rounded-2xl border border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                   <div className="space-y-2">
                                     <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                                       <Search className="w-3 h-3" /> Selecciona un Icono
                                     </label>
                                     <div className="grid grid-cols-7 gap-1.5 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                       {[
                                         'Zap', 'Target', 'Users', 'Globe', 'Shield', 'Trophy', 
                                         'Star', 'Heart', 'CheckCircle', 'Award', 'Lightbulb', 'Rocket', 
                                         'TrendingUp', 'Settings', 'Lock', 'Phone', 'Mail', 'Calendar', 
                                         'MapPin', 'Music', 'Camera', 'Video', 'Mic', 'Headphones',
                                         'Cpu', 'Database', 'Cloud', 'Chrome', 'Github', 'Twitter',
                                         'Linkedin', 'Youtube', 'Briefcase', 'BookOpen', 'GraduationCap', 'Coffee',
                                         'Utensils', 'Pizza', 'GlassWater', 'Anchor', 'Compass', 'Flag',
                                         'Bell', 'MessageSquare', 'Share2', 'ZapOff', 'Sun', 'Moon',
                                         'Activity', 'Airplay', 'Aperture', 'Archive', 'AtSign', 'BarChart', 
                                         'Battery', 'Bluetooth', 'Book', 'Bookmark', 'Box', 'Cast', 
                                         'Check', 'Clipboard', 'Clock', 'Code', 'Command', 'Copy', 
                                         'CreditCard', 'Crop', 'Crosshair', 'Disc', 'DollarSign', 'Download', 
                                         'Droplet', 'Edit', 'Eye', 'Facebook', 'FastForward', 'Feather', 
                                         'Figma', 'File', 'Film', 'Filter', 'Folder', 'Framer', 
                                         'Frown', 'Gift', 'GitBranch', 'GitCommit', 'GitMerge', 'GitPullRequest', 
                                         'HardDrive', 'Hash', 'Hexagon', 'Home', 'Image', 'Inbox', 
                                         'Info', 'Instagram', 'Key', 'LifeBuoy', 'Link', 'List', 
                                         'Loader', 'LogIn', 'LogOut', 'Map', 'Maximize', 'Meh', 
                                         'Menu', 'MessageCircle', 'Minimize', 'Minus', 'Monitor', 'Octagon', 
                                         'Package', 'Paperclip', 'Pause', 'PenTool', 'Percent', 'PieChart', 
                                         'Play', 'Pocket', 'Power', 'Printer', 'Radio', 'RefreshCcw', 
                                         'Repeat', 'Rewind', 'Rss', 'Scissors', 'Send', 'Server', 
                                         'Share', 'ShoppingBag', 'ShoppingCart', 'Shuffle', 'Sidebar', 
                                         'SkipBack', 'SkipForward', 'Slack', 'Slash', 'Sliders', 'Smartphone', 
                                         'Smile', 'Speaker', 'Square', 'StopCircle', 'Sunrise', 'Sunset', 
                                         'Tablet', 'Tag', 'Terminal', 'Thermometer', 'ThumbsDown', 'ThumbsUp', 
                                         'ToggleLeft', 'ToggleRight', 'Tool', 'Trash', 'Trello', 'TrendingDown', 
                                         'Triangle', 'Truck', 'Tv', 'Twitch', 'Umbrella', 'Underline', 
                                         'Unlock', 'User', 'Voicemail', 'Volume', 'Watch', 'Wifi', 
                                         'Wind', 'ZoomIn', 'ZoomOut'
                                       ].map((iconName) => {
                                         const IconComp = (Icons as any)[iconName] || Icons.HelpCircle;
                                         const isSelected = item.icon === iconName || (!item.icon && iconName === 'Zap');
                                         
                                         return (
                                           <button
                                             key={iconName}
                                             onClick={() => {
                                               const newItems = [...activeBlock.content.items];
                                               newItems[idx] = { ...item, icon: iconName };
                                               updateBlockContent(activeBlock.id, { items: newItems });
                                             }}
                                             className={`aspect-square rounded-lg border flex items-center justify-center transition-all hover:scale-110 ${
                                               isSelected 
                                                 ? 'border-black bg-black text-white shadow-lg' 
                                                 : 'border-transparent bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'
                                             }`}
                                             title={iconName}
                                           >
                                             <IconComp className="w-3.5 h-3.5" />
                                           </button>
                                         );
                                       })}
                                     </div>
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                                     <div className="space-y-1.5">
                                       <label className="text-[8px] text-gray-400 uppercase font-bold px-1">Color Icono</label>
                                       <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                         <Input 
                                           type="color"
                                           value={item.icon_color || '#DBF227'}
                                           onChange={(e) => {
                                             const newItems = [...activeBlock.content.items];
                                             newItems[idx] = { ...item, icon_color: e.target.value };
                                             updateBlockContent(activeBlock.id, { items: newItems });
                                           }}
                                           className="h-5 w-5 p-0 border-none bg-transparent cursor-pointer rounded"
                                         />
                                         <span className="text-[9px] font-mono text-gray-400 truncate">{item.icon_color || '#DBF227'}</span>
                                       </div>
                                     </div>
                                     <div className="space-y-1.5">
                                       <label className="text-[8px] text-gray-400 uppercase font-bold px-1">Fondo Icono</label>
                                       <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                         <Input 
                                           type="color"
                                           value={item.icon_bg_color || '#000000'}
                                           onChange={(e) => {
                                             const newItems = [...activeBlock.content.items];
                                             newItems[idx] = { ...item, icon_bg_color: e.target.value };
                                             updateBlockContent(activeBlock.id, { items: newItems });
                                           }}
                                           className="h-5 w-5 p-0 border-none bg-transparent cursor-pointer rounded"
                                         />
                                         <span className="text-[9px] font-mono text-gray-400 truncate">{item.icon_bg_color || '#000000'}</span>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               )}
                            </div>
                         </div>
                       ))}
                       <Button 
                         onClick={() => {
                           const newItems = [...(activeBlock.content.items || []), { title: 'Nueva Característica', description: '', icon: 'Zap' }];
                           updateBlockContent(activeBlock.id, { items: newItems });
                         }}
                         variant="outline" size="sm" className="w-full border-dashed py-4 h-auto text-[10px] font-bold bg-white text-black"
                       >
                          <Plus className="w-3 h-3 mr-2" /> Añadir Item
                       </Button>
                     </div>
                  </div>
                )}

               {activeBlock.type === 'auth' && (
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Título del Portal (Registro)</label>
                      <Input 
                        value={activeBlock.content.title}
                        onChange={(e) => updateBlockContent(activeBlock.id, { title: e.target.value })}
                        className="text-xs"
                        placeholder="Ej: Bienvenido de nuevo"
                      />
                      {showTranslations && (
                        <Input 
                          value={activeBlock.content.title_en || ''}
                          onChange={(e) => updateBlockContent(activeBlock.id, { title_en: e.target.value })}
                          className="text-xs border-blue-200 mt-2"
                          placeholder="Título del Portal (Inglés)"
                        />
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Configuración de Campos (Registro)</label>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full font-bold text-gray-600">{(activeBlock.content.custom_inputs || []).length}/5 Extras</span>
                      </div>

                      {/* Unified Draggable Section */}
                      <DndContext 
                        sensors={sensors} 
                        collisionDetection={closestCenter} 
                        onDragEnd={(event) => {
                          const { active, over } = event;
                          if (over && active.id !== over.id) {
                            const fixedIds = ['nombre', 'apellidos', 'grado', 'genero', 'email', 'confirmEmail', 'telefono'];
                            const customInputs = activeBlock.content.custom_inputs || [];
                            
                            // Create a combined list of IDs to find current order
                            // We use activeBlock.content.fields_order if it exists, or a default order
                            const currentOrder = activeBlock.content.fields_order || [...fixedIds, ...customInputs.map((ci: any) => ci.id)];
                            
                            const oldIndex = currentOrder.indexOf(active.id);
                            const newIndex = currentOrder.indexOf(over.id);
                            
                            const newOrder = arrayMove(currentOrder, oldIndex, newIndex);
                            updateBlockContent(activeBlock.id, { fields_order: newOrder });
                          }
                        }}
                        modifiers={[restrictToVerticalAxis]}
                      >
                        <SortableContext 
                          items={activeBlock.content.fields_order || ['nombre', 'apellidos', 'grado', 'genero', 'email', 'confirmEmail', 'telefono', ...(activeBlock.content.custom_inputs || []).map((ci: any) => ci.id)]} 
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {(activeBlock.content.fields_order || ['nombre', 'apellidos', 'grado', 'genero', 'email', 'confirmEmail', 'telefono', ...(activeBlock.content.custom_inputs || []).map((ci: any) => ci.id)]).map((fieldId: string) => {
                              const fixedFields: Record<string, any> = {
                                nombre: { label: 'Nombre' },
                                apellidos: { label: 'Apellidos' },
                                grado: { label: 'Grado Académico' },
                                genero: { label: 'Género' },
                                email: { label: 'Email' },
                                confirmEmail: { label: 'Confirmar Email' },
                                telefono: { label: 'Teléfono' },
                              };

                              if (fixedFields[fieldId]) {
                                return (
                                  <SortableRegistrationField 
                                    key={fieldId}
                                    id={fieldId}
                                    item={fixedFields[fieldId]}
                                    isFixed={true}
                                  />
                                );
                              }

                              const customInput = (activeBlock.content.custom_inputs || []).find((ci: any) => ci.id === fieldId);
                              if (customInput) {
                                const idx = activeBlock.content.custom_inputs.indexOf(customInput);
                                return (
                                  <SortableRegistrationField 
                                    key={fieldId}
                                    id={fieldId}
                                    item={customInput}
                                    showTranslations={showTranslations}
                                    onUpdate={(updates) => {
                                      const newInputs = [...activeBlock.content.custom_inputs];
                                      newInputs[idx] = { ...customInput, ...updates };
                                      updateBlockContent(activeBlock.id, { custom_inputs: newInputs });
                                    }}
                                    onRemove={() => {
                                      const newInputs = activeBlock.content.custom_inputs.filter((_: any, i: number) => i !== idx);
                                      const newOrder = (activeBlock.content.fields_order || []).filter((id: string) => id !== fieldId);
                                      updateBlockContent(activeBlock.id, { 
                                        custom_inputs: newInputs,
                                        fields_order: newOrder
                                      });
                                    }}
                                  />
                                );
                              }
                              return null;
                            })}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>

                    {(activeBlock.content.custom_inputs || []).length < 5 && (
                      <Button 
                        onClick={() => {
                          const newId = `input-${Math.random().toString(36).substr(2, 9)}`;
                          const newInputs = [...(activeBlock.content.custom_inputs || []), { 
                            id: newId,
                            type: 'text', 
                            label: 'Nuevo Campo', 
                            placeholder: '',
                            banner_active: false,
                            banner_color: 'blue' 
                          }];
                          const newOrder = [...(activeBlock.content.fields_order || ['nombre', 'apellidos', 'grado', 'genero', 'email', 'confirmEmail', 'telefono', ...((activeBlock.content.custom_inputs || []).map((ci: any) => ci.id))]), newId];
                          updateBlockContent(activeBlock.id, { 
                            custom_inputs: newInputs,
                            fields_order: newOrder
                          });
                        }}
                        variant="outline" size="sm" className="w-full border-dashed py-4 h-auto text-[10px] font-bold bg-white text-black hover:bg-gray-50 mt-4"
                      >
                        <Icons.Plus className="w-3 h-3 mr-2" /> Agregar Campo Personalizado
                      </Button>
                    )}
                  </div>
               )}

               {activeBlock.type === 'cta' && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Título de Sección</label>
                        <Input 
                          value={activeBlock.content.title}
                          onChange={(e) => updateBlockContent(activeBlock.id, { title: e.target.value })}
                          className="text-xs bg-gray-50 text-black border-gray-200"
                        />
                        {showTranslations && (
                          <Input 
                            value={activeBlock.content.title_en || ''}
                            onChange={(e) => updateBlockContent(activeBlock.id, { title_en: e.target.value })}
                            className="text-xs bg-gray-50 text-black border-blue-200 mt-2"
                            placeholder="Título de Sección (Inglés)"
                          />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Subtítulo</label>
                        <textarea 
                          value={activeBlock.content.subtitle || ''}
                          onChange={(e) => updateBlockContent(activeBlock.id, { subtitle: e.target.value })}
                          rows={2}
                          className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-black outline-none resize-none"
                        />
                        {showTranslations && (
                          <textarea 
                            value={activeBlock.content.subtitle_en || ''}
                            onChange={(e) => updateBlockContent(activeBlock.id, { subtitle_en: e.target.value })}
                            rows={2}
                            placeholder="Subtítulo (Inglés)"
                            className="w-full p-2 text-xs border border-blue-200 rounded-lg bg-gray-50 text-black outline-none resize-none mt-2"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-gray-400 uppercase">Alineación Texto</label>
                         <select 
                           value={activeBlock.content.text_align || 'center'}
                           onChange={(e) => updateBlockContent(activeBlock.id, { text_align: e.target.value })}
                           className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 text-black outline-none"
                         >
                           <option value="left">Izquierda</option>
                           <option value="center">Centro</option>
                           <option value="right">Derecha</option>
                         </select>
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-gray-400 uppercase">Alineación Botones</label>
                         <select 
                           value={activeBlock.content.button_align || 'center'}
                           onChange={(e) => updateBlockContent(activeBlock.id, { button_align: e.target.value })}
                           className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 text-black outline-none"
                         >
                           <option value="left">Izquierda</option>
                           <option value="center">Centro</option>
                           <option value="right">Derecha</option>
                         </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-2 border-b border-gray-100">
                      <div className="space-y-1.5 mb-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Color de Fondo</label>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                          <Input 
                            type="color"
                            value={activeBlock.content.background_color || '#000000'}
                            onChange={(e) => updateBlockContent(activeBlock.id, { background_color: e.target.value })}
                            className="h-6 w-6 p-0 border-none bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[10px] font-mono text-black">{activeBlock.content.background_color || '#000000'}</span>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Color de Textos</label>
                        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                          <Input 
                            type="color"
                            value={activeBlock.content.text_color || '#FFFFFF'}
                            onChange={(e) => updateBlockContent(activeBlock.id, { text_color: e.target.value })}
                            className="h-6 w-6 p-0 border-none bg-transparent cursor-pointer rounded"
                          />
                          <span className="text-[10px] font-mono text-black">{activeBlock.content.text_color || '#FFFFFF'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-between">
                        Botones
                      </label>
                      <div className="space-y-3">
                        {activeBlock.content.buttons?.map((btn: any, idx: number) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 relative group">
                            <button 
                              onClick={() => {
                                const newButtons = activeBlock.content.buttons.filter((_: any, i: number) => i !== idx);
                                updateBlockContent(activeBlock.id, { buttons: newButtons });
                              }}
                              className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex gap-2 mb-2 pr-6">
                              <Input 
                                value={btn.label}
                                onChange={(e) => {
                                  const newBtns = [...activeBlock.content.buttons];
                                  newBtns[idx] = { ...btn, label: e.target.value };
                                  updateBlockContent(activeBlock.id, { buttons: newBtns });
                                }}
                                placeholder="Texto"
                                className="text-[10px] h-8 bg-gray-100 text-black border-gray-200 flex-1"
                              />
                            </div>
                            {showTranslations && (
                              <div className="flex gap-2 mb-2 pr-6">
                                <Input 
                                  value={btn.label_en || ''}
                                  onChange={(e) => {
                                    const newBtns = [...activeBlock.content.buttons];
                                    newBtns[idx] = { ...btn, label_en: e.target.value };
                                    updateBlockContent(activeBlock.id, { buttons: newBtns });
                                  }}
                                  placeholder="Texto (Inglés)"
                                  className="text-[10px] h-8 bg-gray-100 text-black border-blue-200 flex-1"
                                />
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 mb-2">
                               <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                                 <Input 
                                   type="color"
                                   value={btn.color || '#FFFFFF'}
                                   onChange={(e) => {
                                     const newBtns = [...activeBlock.content.buttons];
                                     newBtns[idx] = { ...btn, color: e.target.value };
                                     updateBlockContent(activeBlock.id, { buttons: newBtns });
                                   }}
                                   className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer"
                                 />
                                 <span className="text-[9px] font-mono text-black">Fondo</span>
                               </div>
                               <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
                                 <Input 
                                   type="color"
                                   value={btn.text_color || '#000000'}
                                   onChange={(e) => {
                                     const newBtns = [...activeBlock.content.buttons];
                                     newBtns[idx] = { ...btn, text_color: e.target.value };
                                     updateBlockContent(activeBlock.id, { buttons: newBtns });
                                   }}
                                   className="w-5 h-5 p-0 border-none bg-transparent cursor-pointer"
                                 />
                                 <span className="text-[9px] font-mono text-black">Texto</span>
                               </div>
                            </div>
                            <Input 
                              value={btn.url}
                              onChange={(e) => {
                                const newBtns = [...activeBlock.content.buttons];
                                newBtns[idx] = { ...btn, url: e.target.value };
                                updateBlockContent(activeBlock.id, { buttons: newBtns });
                              }}
                              placeholder="URL (ej: #register, http://...)"
                              className="text-[10px] h-8 bg-gray-100 text-black border-gray-200"
                            />
                          </div>
                        ))}
                        <Button 
                          onClick={() => {
                            const newButtons = [...(activeBlock.content.buttons || []), { label: 'Nuevo Botón', url: '#', color: '#000000', text_color: '#FFFFFF' }];
                            updateBlockContent(activeBlock.id, { buttons: newButtons });
                          }}
                          variant="outline" size="sm" className="w-full text-[10px] h-9 border-dashed text-black hover:bg-gray-50 bg-white"
                        >
                          <Plus className="w-3 h-3 mr-2" /> Añadir Botón
                        </Button>
                      </div>
                    </div>
                  </div>
               )}

               {/* VARIANT SELECTOR */}
               {activeBlock.type !== 'features' && activeBlock.type !== 'cta' && activeBlock.type !== 'agenda' && activeBlock.type !== 'auth' && (
                 <div className="space-y-1.5 pt-4 border-t border-gray-50">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Diseño de Bloque (Layout)</label>
                    <select 
                      value={activeBlock.variant}
                      onChange={(e) => {
                        onConfigChange({
                          ...config,
                          blocks: config.blocks.map(b => b.id === activeBlock!.id ? { ...b, variant: e.target.value } : b)
                        });
                      }}
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-black transition-all"
                    >
                      <option value="centered">Centrado (Default)</option>
                      <option value="split">Dividido (Split)</option>
                      <option value="minimal">Minimalista</option>
                    </select>
                 </div>
               )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <MousePointer2 className="w-8 h-8 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Selecciona un bloque<br/>para editar</p>
            </div>
          )}

        </div>

      </div>

      {/* Sidebar Footer */}
      <div className="p-4 pt-2 bg-white/80 backdrop-blur-md border-t border-gray-100 flex flex-col gap-2">
        {/* Toggle Public Visibility (Legacy or general setting) */}
        <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl mb-2">
          <div>
              <p className="text-[10px] font-bold text-blue-900">Landing Activa</p>
              <p className="text-[9px] text-blue-600">Visible para el público</p>
           </div>
           

           <label className="relative inline-flex items-center cursor-pointer">
              <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={enabled}
                  onChange={(e) => onEnabledChange(e.target.checked)}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
           </label>
        </div>

        {enabled && (
          <div className="px-3 py-3 bg-blue-50 border border-blue-100 rounded-2xl mb-2 animate-in fade-in slide-in-from-top-1 duration-300 space-y-3">
             <div className="flex gap-2">
                <Icons.Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-[10px] leading-relaxed text-blue-700 font-medium">
                  Este es el enlace para acceder de forma rápida y personalizada al index de tu evento.
                </p>
             </div>

             <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-blue-400 uppercase px-1">Enlace del Evento</label>
                <div 
                  onClick={onCopyLink}
                   className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-all group overflow-hidden"
                >
                  <div className="flex-1 overflow-x-auto custom-scrollbar-hide whitespace-nowrap mr-2">
                    <span className="text-[10px] text-blue-900 font-mono">
                      {typeof window !== 'undefined' ? `${window.location.origin}/event/${conferenceId}` : '...'}
                    </span>
                  </div>
                  <CopyIcon className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600 shrink-0" />
                </div>
             </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={resetToDefault}
            variant="outline" 
            className="flex-1 h-11 text-[11px] font-bold border-gray-200 text-gray-500 hover:text-black"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
          </Button>
          <Button 
            onClick={onSave}
            disabled={saving}
            className="flex-[2] h-11 text-[11px] font-bold bg-[#373737] hover:bg-black text-white shadow-lg shadow-gray-200"
          >
            {saving ? (
              <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5 animate-spin" /> ...</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> Guardar</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
