'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,     
  Palette,
  Image as ImageIcon,
  Loader2,
  X,
  Trash2,
  Upload
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  maxLength?: number;
  placeholder?: string;
}

const EditorContent = memo(({ 
  innerRef, 
  onInput, 
  onFocus, 
  onBlur, 
  onPaste, 
  className, 
  initialHtml 
}: {
  innerRef: React.RefObject<HTMLDivElement | null>;
  onInput: (e: React.FormEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
  className: string;
  initialHtml: string;
}) => {
  return (
    <div 
      ref={innerRef}
      className={className}
      contentEditable
      onInput={onInput}
      onFocus={onFocus}
      onBlur={onBlur}
      onPaste={onPaste}
      dangerouslySetInnerHTML={{ __html: initialHtml }}
    />
  );
}, (prevProps, nextProps) => {
    return prevProps.className === nextProps.className; 
});

EditorContent.displayName = 'EditorContent';

export function RichTextEditor({ 
  value, 
  onChange, 
  label, 
  maxLength = 1000,
  placeholder 
}: RichTextEditorProps) {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  
  // Image editing state
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingImageNode, setEditingImageNode] = useState<HTMLImageElement | null>(null);
  const [imgUrl, setImgUrl] = useState('');
  const [imgWidth, setImgWidth] = useState('100%');
  const [imgAlign, setImgAlign] = useState('center');
  const [imgDesc, setImgDesc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (contentEditableRef.current && contentEditableRef.current.innerHTML !== value) {
      if (document.activeElement === contentEditableRef.current) {
          // ignore
      } else {
        contentEditableRef.current.innerHTML = value;
        setCharCount(contentEditableRef.current.textContent?.length || 0);
      }
    } else if (contentEditableRef.current && value === '' && contentEditableRef.current.innerHTML !== '') {
         contentEditableRef.current.innerHTML = '';
         setCharCount(0);
    }
  }, [value]);
  
  useEffect(() => {
    if (contentEditableRef.current) {
         setCharCount(contentEditableRef.current.textContent?.length || 0);
    }
  }, []);

  useEffect(() => {
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG' && target.classList.contains('zoomable-image')) {
         const tImg = target as HTMLImageElement;
         setEditingImageNode(tImg);
         setImgUrl(tImg.src);
         
         const figure = tImg.closest('figure');
         if (figure) {
            setImgAlign(figure.style.textAlign || 'center');
            const figcap = figure.querySelector('figcaption');
            setImgDesc(figcap ? figcap.innerText : '');
            setImgWidth(tImg.style.width || '100%');
         } else {
            setImgAlign('center');
            setImgDesc('');
            setImgWidth(tImg.style.width || '100%');
         }
         setShowImageDialog(true);
      }
    };
    
    const el = contentEditableRef.current;
    if (el) {
       el.addEventListener('click', handleEditorClick);
       return () => el.removeEventListener('click', handleEditorClick);
    }
  }, []);

  const handleInput = useCallback(() => {
    if (contentEditableRef.current) {
      const html = contentEditableRef.current.innerHTML;
      const text = contentEditableRef.current.textContent || '';
      
      setCharCount(text.length);
      onChangeRef.current(html);
    }
  }, []);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const execCommand = (command: string, val: string | undefined = undefined) => {
    document.execCommand(command, false, val);
    if (contentEditableRef.current) {
        contentEditableRef.current.focus();
        handleInput(); 
    }
  };

  const addLink = () => {
    const url = prompt('Ingresa el URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };
  
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `editor_images/desc_${Date.now()}.${fileExt}`;

      setUploadingImage(true);
      try {
          const { error: uploadError } = await supabase.storage
              .from('events') 
              .upload(fileName, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
              .from('events')
              .getPublicUrl(fileName);

          setImgUrl(publicUrl);
          
          if (!editingImageNode) {
              setImgAlign('center');
              setImgWidth('100%');
              setImgDesc('');
          }

      } catch (error) {
          console.error('Error uploading image:', error);
          alert('Error al subir la imagen. Intenta de nuevo.');
      } finally {
          setUploadingImage(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const saveImage = () => {
      if (!imgUrl) return;

      const html = `
        <figure class="rich-text-image-container" style="text-align: ${imgAlign}; margin: 1rem 0; width: 100%;">
           <img src="${imgUrl}" style="width: ${imgWidth}; max-width: 100%; height: auto; border-radius: 0.5rem; cursor: pointer;" alt="${imgDesc || 'image'}" class="zoomable-image shadow-sm hover:shadow-md transition-shadow inline-block" />
           ${imgDesc ? `<figcaption style="font-size: 0.8rem; color: #666; margin-top: 0.5rem; font-style: italic;">${imgDesc}</figcaption>` : ''}
        </figure>
      `.trim();

      if (editingImageNode) {
          const figure = editingImageNode.closest('figure');
          if (figure) {
              figure.outerHTML = html;
          } else {
              editingImageNode.outerHTML = html;
          }
          handleInput();
      } else {
          if (contentEditableRef.current) {
              contentEditableRef.current.focus();
              const sel = window.getSelection();
              if (sel && savedRange) {
                  sel.removeAllRanges();
                  sel.addRange(savedRange);
              }
              execCommand('insertHTML', html + '<p><br></p>');
          }
      }

      closeImageDialog();
  };

  const deleteImage = () => {
      if (editingImageNode) {
          const figure = editingImageNode.closest('figure');
          if (figure) {
              figure.remove();
          } else {
              editingImageNode.remove();
          }
          handleInput();
      }
      closeImageDialog();
  };

  const closeImageDialog = () => {
      setShowImageDialog(false);
      setEditingImageNode(null);
      setSavedRange(null);
      setImgUrl('');
      setImgDesc('');
      setImgAlign('center');
      setImgWidth('100%');
  };

  const openImageDialog = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
          setSavedRange(sel.getRangeAt(0).cloneRange());
      } else {
          setSavedRange(null);
      }
      setShowImageDialog(true);
  };

  return (
    <div className="space-y-2 relative">
      {label && <label className="text-sm font-bold text-[#373737]">{label}</label>}
      
      <div className={twMerge(
        "rounded-xl border transition-all overflow-hidden bg-gray-50/50",
        isFocused ? "ring-2 ring-[#DBF227] border-transparent" : "border-gray-200"
      )}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-100/50">
          <ToolbarButton 
            onClick={() => execCommand('bold')} 
            icon={<Bold size={16} />} 
            title="Negrita" 
          />
          <ToolbarButton 
            onClick={() => execCommand('italic')} 
            icon={<Italic size={16} />} 
            title="Cursiva" 
          />
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <div className="relative group flex items-center justify-center p-1.5 rounded-md hover:bg-gray-200 transition-colors">
            <Palette size={16} className="text-gray-600" />
            <input 
                type="color" 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={(e) => execCommand('foreColor', e.target.value)}
                defaultValue="#000000"
                title="Color de texto"
            />
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <ToolbarButton 
            onClick={() => execCommand('justifyLeft')} 
            icon={<AlignLeft size={16} />} 
            title="Alinear Izquierda" 
          />
          <ToolbarButton 
            onClick={() => execCommand('justifyCenter')} 
            icon={<AlignCenter size={16} />} 
            title="Centrar" 
          />
          <ToolbarButton 
            onClick={() => execCommand('justifyRight')} 
            icon={<AlignRight size={16} />} 
            title="Alinear Derecha" 
          />

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <ToolbarButton 
            onClick={() => execCommand('insertUnorderedList')} 
            icon={<List size={16} />} 
            title="Lista" 
          />
          <ToolbarButton 
            onClick={() => addLink()} 
            icon={<LinkIcon size={16} />} 
            title="Hipervínculo" 
          />
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <ToolbarButton 
            onClick={openImageDialog} 
            icon={<ImageIcon size={16} />} 
            title="Insertar/Editar Imagen" 
          />
        </div>

        {/* Editor Area */}
        <EditorContent 
            innerRef={contentEditableRef}
            className="w-full px-4 py-3 min-h-[120px] max-h-[400px] overflow-y-auto focus:outline-none text-[#373737] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline"
            onInput={handleInput}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPaste={handlePaste}
            initialHtml={value}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400 px-1">
         <span>{placeholder}</span>
         <span className={clsx(
           "font-medium transition-colors",
           charCount > maxLength ? "text-red-500" : "text-gray-400"
         )}>
           {charCount} / {maxLength === 5000 ? '∞' : maxLength}
         </span>
      </div>

      {/* Image Modal */}
      {showImageDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeImageDialog} />
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl relative z-10 flex flex-col p-6 space-y-5 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">
                        {editingImageNode ? 'Editar Imagen' : 'Insertar Imagen'}
                    </h3>
                    <button onClick={closeImageDialog} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {/* Upload / Image Preview */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900">Imagen:</label>
                        {imgUrl ? (
                            <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                                <img src={imgUrl} alt="Preview" className="max-h-40 object-contain p-2" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button 
                                      onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }} 
                                      className="bg-white text-black p-2 rounded-lg font-bold text-xs shadow-lg hover:bg-[var(--color-acid)]"
                                    >
                                        Reemplazar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                                disabled={uploadingImage}
                                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-[var(--color-acid)] hover:bg-[var(--color-acid)]/5 transition-colors disabled:opacity-50"
                            >
                                {uploadingImage ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 mb-2" />
                                        <span className="text-sm font-medium">Subir Imagen (JPG/PNG)</span>
                                    </>
                                )}
                            </button>
                        )}
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>

                    {imgUrl && (
                        <>
                            {/* Width Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900">Tamaño:</label>
                                <div className="flex gap-2">
                                    {['50%', '100%', '300px', '500px'].map((w) => (
                                        <button
                                            key={w}
                                            onClick={(e) => { e.preventDefault(); setImgWidth(w); }}
                                            className={clsx(
                                                "flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all",
                                                imgWidth === w ? "bg-[var(--color-acid)] border-[var(--color-acid)] text-black" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                            )}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                                <input 
                                    type="text"
                                    value={imgWidth}
                                    onChange={(e) => setImgWidth(e.target.value)}
                                    placeholder="Ej. 600px, 80%, etc." 
                                    className="w-full px-3 py-2 text-sm border border-gray-200 bg-white text-gray-900 rounded-lg outline-none focus:border-[var(--color-acid)]"
                                />
                            </div>

                            {/* Alignment Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#373737]">Alineación:</label>
                                <div className="flex gap-2 p-1 bg-gray-50 border border-gray-200 rounded-lg">
                                    {[
                                        { id: 'left', icon: AlignLeft, label: 'Izq' },
                                        { id: 'center', icon: AlignCenter, label: 'Centro' },
                                        { id: 'right', icon: AlignRight, label: 'Der' }
                                    ].map((align) => (
                                        <button
                                            key={align.id}
                                            onClick={(e) => { e.preventDefault(); setImgAlign(align.id); }}
                                            className={clsx(
                                                "flex-1 py-1.5 flex justify-center items-center gap-1 text-xs font-bold rounded-md transition-all",
                                                imgAlign === align.id ? "bg-white shadow-sm text-black" : "text-gray-500 hover:bg-gray-100"
                                            )}
                                        >
                                            <align.icon size={14} />
                                            {align.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description (Small Text) */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#373737]">Descripción (Opcional):</label>
                                <input 
                                    type="text"
                                    value={imgDesc}
                                    onChange={(e) => setImgDesc(e.target.value)}
                                    placeholder="Texto debajo de la imagen..." 
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#DBF227]"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-between items-center gap-3 pt-4 border-t border-gray-100">
                    {editingImageNode ? (
                        <button 
                            onClick={(e) => { e.preventDefault(); deleteImage(); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} /> Eliminar
                        </button>
                    ) : <div />}
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={(e) => { e.preventDefault(); closeImageDialog(); }}
                            className="px-4 py-2 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={(e) => { e.preventDefault(); saveImage(); }}
                            disabled={!imgUrl}
                            className="px-6 py-2 text-sm font-bold text-[#373737] bg-[#DBF227] hover:bg-[#c7dc15] rounded-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({ onClick, icon, title }: { onClick: () => void, icon: React.ReactNode, title: string }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="p-1.5 rounded-md text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
      title={title}
    >
      {icon}
    </button>
  );
}
