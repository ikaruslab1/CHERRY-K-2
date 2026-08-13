'use client';

import { useState, useMemo } from 'react';
import { RegistrationEmailConfig } from '@/types';
import { compileRegistrationEmailHtml, AgendaEventItem } from '@/lib/emailCompiler';
import { Monitor, Smartphone, RefreshCw, Eye, Sparkles } from 'lucide-react';

interface EmailPreviewProps {
  config: RegistrationEmailConfig;
  agendaEvents?: AgendaEventItem[];
  accentColor?: string;
  conferenceTitle?: string;
  institutionName?: string;
}

export function EmailPreview({
  config,
  agendaEvents = [],
  accentColor = '#d9383a',
  conferenceTitle = 'Congreso Internacional 2026',
  institutionName = 'Universidad Nacional Autonóma de México',
}: EmailPreviewProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [useSampleData, setUseSampleData] = useState(true);

  // Compile dynamic HTML based on config and options
  const compiledHtml = useMemo(() => {
    const sampleVars = useSampleData
      ? {
          nombre: 'Ana García Pérez',
          usuario: 'anagarcia24',
          contraseña: 'CH-8492',
          rol: 'Asistente VIP',
          email: 'ana.garcia@ejemplo.com',
          evento: conferenceTitle,
          fecha: '15-18 de Octubre, 2026',
          institucion: institutionName,
          url_acceso: 'https://scherry.click',
        }
      : {
          nombre: '{{nombre}}',
          usuario: '{{usuario}}',
          contraseña: '{{contraseña}}',
          rol: '{{rol}}',
          email: '{{email}}',
          evento: '{{evento}}',
          fecha: '{{fecha}}',
          institucion: '{{institucion}}',
          url_acceso: '{{url_acceso}}',
        };

    return compileRegistrationEmailHtml(config, sampleVars, agendaEvents);
  }, [config, agendaEvents, useSampleData, conferenceTitle, institutionName]);

  return (
    <div className="flex flex-col h-full bg-gray-100 border-l border-gray-200">
      {/* Preview Toolbar */}
      <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="font-bold text-xs uppercase tracking-wider text-gray-700">
            Vista Previa en Tiempo Real
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Sample Data Toggle */}
          <button
            onClick={() => setUseSampleData(!useSampleData)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
              useSampleData
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
            title="Alternar entre datos de demostración y etiquetas de etiquetas {{}}"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{useSampleData ? 'Datos de Ejemplo' : 'Etiquetas {{ }}'}</span>
          </button>

          {/* Device Frame Viewport Switcher */}
          <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'desktop'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Vista de Escritorio (600px max)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-md transition-all ${
                viewport === 'mobile'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Vista Móvil (360px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center bg-gray-100">
        <div
          className={`transition-all duration-300 bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 my-auto ${
            viewport === 'desktop' ? 'w-full max-w-[660px]' : 'w-[380px]'
          }`}
        >
          {/* Email Subject / Header bar inside preview */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="truncate max-w-[280px]">
                <strong className="text-gray-700">De:</strong> Cherry &lt;contacto@send.scherry.click&gt;
              </span>
              <span className="text-[10px] text-gray-400">Ahora</span>
            </div>
            <div className="font-semibold text-gray-900 text-xs truncate">
              <span className="text-gray-400 font-normal me-1">Asunto:</span>
              {config.subject
                ? config.subject
                    .replace(/{{nombre}}/g, useSampleData ? 'Ana García' : '{{nombre}}')
                    .replace(/{{usuario}}/g, useSampleData ? 'anagarcia24' : '{{usuario}}')
                    .replace(/{{evento}}/g, useSampleData ? conferenceTitle : '{{evento}}')
                : 'Sin asunto'}
            </div>
          </div>

          {/* HTML Render iframe */}
          <div className="w-full h-[640px] bg-white overflow-hidden relative">
            <iframe
              srcDoc={compiledHtml}
              title="Email Preview"
              className="w-full h-full border-none"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
