'use client';

import { useState } from 'react';
import { ConferenceLandingConfig } from '@/types';
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
  Copy,
  Settings,
  AlertTriangle,
  Eye,
  EyeOff,
  GripVertical,
  Copy as CopyIcon,
  Calendar,
  Users
} from 'lucide-react';
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
    speakers: Users,
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
          {block.type} <span className="opacity-40 font-normal">#{block.id.slice(0,4)}</span>
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

export function LandingEditorSidebar({ 
  config, 
  onConfigChange, 
  enabled, 
  onEnabledChange, 
  onSave, 
  saving, 
  onCopyLink 
}: SidebarProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(config.blocks?.[0]?.id || null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

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
                  {(Object.keys(BLOCK_DEFAULTS) as any[]).map(type => (
                    <button 
                      key={type}
                      onClick={() => addBlock(type)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        {type === 'hero' && <Type className="w-3 h-3" />}
                        {type === 'features' && <Layers className="w-3 h-3" />}
                        {type === 'cta' && <MousePointer2 className="w-3 h-3" />}
                        {type === 'speakers' && <Users className="w-3 h-3" />}
                        {type === 'agenda' && <Calendar className="w-3 h-3" />}
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 capitalize">{type}</span>
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
                    <h4 className="text-xs font-bold text-gray-800 uppercase">Editando {activeBlock.type}</h4>
                    <p className="text-[10px] text-gray-400">ID: {activeBlock.id}</p>
                  </div>
               </div>

               {/* BLOCK SPECIFIC FIELDS */}
               {activeBlock.type === 'hero' && (
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Título Principal</label>
                      <Input 
                        value={activeBlock.content.title}
                        onChange={(e) => updateBlockContent(activeBlock.id, { title: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Subtítulo</label>
                      <textarea 
                        value={activeBlock.content.subtitle}
                        onChange={(e) => updateBlockContent(activeBlock.id, { subtitle: e.target.value })}
                        rows={3}
                        className="w-full p-3 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-black outline-none transition-all resize-none"
                      />
                    </div>
                 </div>
               )}

               {activeBlock.type === 'features' && (
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Título de Sección</label>
                      <Input 
                        value={activeBlock.content.title}
                        onChange={(e) => updateBlockContent(activeBlock.id, { title: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Ítems de Características</label>
                      {activeBlock.content.items?.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 relative group">
                           <button 
                             onClick={() => {
                               const newItems = activeBlock.content.items.filter((_: any, i: number) => i !== idx);
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
                             className="text-[11px] font-bold h-8 bg-white"
                           />
                           <textarea 
                             value={item.description}
                             onChange={(e) => {
                               const newItems = [...activeBlock.content.items];
                               newItems[idx] = { ...item, description: e.target.value };
                               updateBlockContent(activeBlock.id, { items: newItems });
                             }}
                             rows={2}
                             className="w-full p-2 text-[10px] border border-gray-200 rounded-lg bg-white outline-none resize-none"
                             placeholder="Descripción..."
                           />
                        </div>
                      ))}
                      <Button 
                        onClick={() => {
                          const newItems = [...(activeBlock.content.items || []), { title: 'Nueva Característica', description: '', icon: 'Zap' }];
                          updateBlockContent(activeBlock.id, { items: newItems });
                        }}
                        variant="outline" size="sm" className="w-full border-dashed py-4 h-auto text-[10px] font-bold bg-white"
                      >
                         <Plus className="w-3 h-3 mr-2" /> Añadir Item
                      </Button>
                    </div>
                 </div>
               )}

               {activeBlock.type === 'auth' && (
                 <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Título del Portal</label>
                      <Input 
                        value={activeBlock.content.title}
                        onChange={(e) => updateBlockContent(activeBlock.id, { title: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Subtítulo del Portal</label>
                      <textarea 
                        value={activeBlock.content.subtitle}
                        onChange={(e) => updateBlockContent(activeBlock.id, { subtitle: e.target.value })}
                        rows={3}
                        className="w-full p-3 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-black outline-none transition-all resize-none"
                      />
                    </div>
                 </div>
               )}

               {activeBlock.type === 'cta' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Título de Acción</label>
                      <Input 
                        value={activeBlock.content.title}
                        onChange={(e) => updateBlockContent(activeBlock.id, { title: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Etiqueta Registro</label>
                          <Input 
                            value={activeBlock.content.register_label}
                            onChange={(e) => updateBlockContent(activeBlock.id, { register_label: e.target.value })}
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Etiqueta Login</label>
                          <Input 
                            value={activeBlock.content.login_label}
                            onChange={(e) => updateBlockContent(activeBlock.id, { login_label: e.target.value })}
                            className="text-xs"
                          />
                        </div>
                    </div>
                  </div>
               )}

               {/* VARIANT SELECTOR */}
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <MousePointer2 className="w-8 h-8 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Selecciona un bloque<br/>para editar</p>
            </div>
          )}

          {/* GLOBAL STYLES */}
          <div className="pt-8 border-t border-gray-100">
             <div className="px-1 mb-4 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-gray-400" />
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estilos Globales</h3>
             </div>
             <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Primario</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={config.global_styles?.primary_color || '#373737'}
                      onChange={(e) => updateGlobalStyle('primary_color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none"
                    />
                    <span className="text-[10px] font-mono text-gray-500">{config.global_styles?.primary_color}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Acento</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={config.global_styles?.accent_color || '#DBF227'}
                      onChange={(e) => updateGlobalStyle('accent_color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-none"
                    />
                    <span className="text-[10px] font-mono text-gray-500">{config.global_styles?.accent_color}</span>
                  </div>
                </div>
             </div>
          </div>
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
