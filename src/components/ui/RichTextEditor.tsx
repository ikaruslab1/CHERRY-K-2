'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  Link as LinkIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,     
  Palette
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
    // Only re-render if className changes significantly (e.g. focus ring?)
    // Actually focus ring is on wrapper in parent.
    // So className here is static mostly?
    // Let's check props.
    // innerRef is stable.
    // initialHtml: we only care about it on mount. Ignoring changes to it.
    // callbacks: if they change, we should re-render?
    // But we want to avoid re-render while typing.
    // If we return true, we skip re-render.
    // We only want to re-render if absolutely necessary.
    // Actually the parent handles the border class (wrapper). The Div class is static?
    // Check usage below.
    return prevProps.className === nextProps.className; 
});

EditorContent.displayName = 'EditorContent';

export function RichTextEditor({ 
  value, 
  onChange, 
  label, 
  maxLength = 200,
  placeholder 
}: RichTextEditorProps) {
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  
  // Keep latest onChange in ref to avoid re-creating handleInput
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Sync value -> innerHTML (programmatic updates only)
  useEffect(() => {
    if (contentEditableRef.current && contentEditableRef.current.innerHTML !== value) {
      // Logic to determine if we should update.
      // If the editor is focused, we typically shouldn't touch it unless value moved radically.
      // But since useController drives this, if we type 'a', value becomes '...a'. innerHTML is '...a'.
      // They match. No update.
      // If we reset form, value becomes ''. innerHTML is '...a'. Mismatch. Update!
      if (document.activeElement === contentEditableRef.current) {
          // If focused, be careful. 
          // If the contents match simply, do nothing.
          // If strict match fails, we might fix it but careful about cursor.
          // Usually strict match succeeds during typing.
          if (contentEditableRef.current.innerHTML !== value) {
             // Values mismatch while focused!
             // This might happen if sanitizer ran? Or some overlapping update.
             // We can ignore or force.
             // For a basic editor, let's force update only if length diff is large to avoid cursor stutter?
             // No, safest is to trust the user's typing and only update if value is empty/reset.
             // OR, if the value is externally changed effectively.
             // For now: only update. Mouse position might be lost.
          }
      } else {
        contentEditableRef.current.innerHTML = value;
        setCharCount(contentEditableRef.current.textContent?.length || 0);
      }
    } else if (contentEditableRef.current && value === '' && contentEditableRef.current.innerHTML !== '') {
         // Explicit clear
         contentEditableRef.current.innerHTML = '';
         setCharCount(0);
    }
  }, [value]);
  
  // Initial Char Count
  useEffect(() => {
    if (contentEditableRef.current) {
         setCharCount(contentEditableRef.current.textContent?.length || 0);
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

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
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

  return (
    <div className="space-y-2">
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
        </div>

        {/* Editor Area */}
        <EditorContent 
            innerRef={contentEditableRef}
            className="w-full px-4 py-3 min-h-[120px] max-h-[200px] overflow-y-auto focus:outline-none text-[#373737] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-600 [&_a]:underline"
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
           {charCount} / {maxLength}
         </span>
      </div>
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
