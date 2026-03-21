import React, { useState } from 'react';
import { useConference } from '@/context/ConferenceContext';
import { Copy, Check, Code, ExternalLink, Globe, Info } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function EmbeddingsView() {
    const { currentConference } = useConference();
    const [copied, setCopied] = useState<string | null>(null);
    const [defaultAuthView, setDefaultAuthView] = useState<'login' | 'register'>('login');

    if (!currentConference) {
        return (
            <div className="p-8 text-center text-gray-500">
                Selecciona un evento para ver sus opciones de integración.
            </div>
        );
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const authBlock = currentConference.conference_landing_config?.blocks?.find((b: any) => b.type === 'auth');
    const hasCustomFields = (authBlock?.content?.custom_inputs || []).length > 0;
    const isLandingActive = currentConference.custom_landing_enabled;
    const isSpecialAuthCase = isLandingActive && hasCustomFields;

    const authUrl = new URL(`${baseUrl}/event/${currentConference.id}/embed/auth`);
    authUrl.searchParams.set('view', defaultAuthView);
    if (isSpecialAuthCase) {
        authUrl.searchParams.set('custom', 'true');
    }

    const embeddings = [
        {
            id: 'agenda',
            title: 'Agenda del Evento',
            description: 'Muestra la agenda completa y horarios en otra página web sin requerir inicio de sesión.',
            url: `${baseUrl}/event/${currentConference.id}/agenda?hideHeader=true`, 
            height: '800px',
        },
        {
            id: 'login',
            title: 'Formulario de Registro / Inicio de Sesión',
            description: isSpecialAuthCase 
                ? 'Este formulario incluye los campos personalizados configurados en tu landing page activa.'
                : 'Muestra únicamente los formularios de ingreso o registro para este evento. Al ingresar, redirigirá directamente a la plataforma.',
            url: authUrl.toString(),
            height: isSpecialAuthCase ? '850px' : '650px',
        },
        {
            id: 'index',
            title: 'Index Personalizado (Landing Page)',
            description: 'Incrusta toda la landing page personalizada del evento.',
            url: `${baseUrl}/event/${currentConference.id}`,
            height: '800px',
        }
    ];

    const generateIframe = (url: string, height: string) => {
        return `<iframe \n  src="${url}" \n  width="100%" \n  height="${height}" \n  frameborder="0" \n  style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" \n  allow="autoplay; fullscreen" \n  loading="lazy"\n></iframe>`;
    };

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Code className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#373737]">Embeddings y Código Iframe</h2>
                    <p className="text-sm text-gray-500">
                        Inserta diferentes secciones del evento en tu propio sitio web.
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                {embeddings.map((embed) => {
                    const isLanding = embed.id === 'index';
                    const isLandingDisabled = isLanding && !currentConference.custom_landing_enabled;
                    const isSpecialAuth = embed.id === 'login' && isSpecialAuthCase;
                    const isAuth = embed.id === 'login';
                    
                    const iframeCode = generateIframe(embed.url, embed.height);
                    const isCopied = copied === embed.id;

                    return (
                        <div 
                            key={embed.id} 
                            className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm transition-all duration-300 ${
                                isLandingDisabled ? 'opacity-50 grayscale pointer-events-none' : 'hover:shadow-md'
                            } ${isSpecialAuth ? 'ring-2 ring-blue-100 border-blue-200' : ''}`}
                        >
                            <div className="p-5 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-[#373737] flex items-center gap-2">
                                        <Globe className={`w-4 h-4 ${isLandingDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
                                        {embed.title}
                                        {isLandingDisabled && (
                                            <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Desactivado</span>
                                        )}
                                        {isSpecialAuth && (
                                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Personalizado</span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isLandingDisabled 
                                            ? 'Debes activar la opcion "Landing Activa" en Diseño para usar este embedding.' 
                                            : embed.description}
                                    </p>
                                </div>
                                {!isLandingDisabled && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2 text-xs h-8 bg-white text-black border-gray-200 hover:bg-gray-100"
                                        onClick={() => window.open(`${baseUrl}/admin/preview?url=${encodeURIComponent(embed.url)}&height=${embed.height}`, '_blank')}
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span className="hidden sm:inline">Vista Previa</span>
                                    </Button>
                                )}
                            </div>
                            <div className="p-5 space-y-3">
                                {isAuth && (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-tight">
                                            <Icons.Settings2 className="w-4 h-4 text-gray-400" />
                                            Vista por defecto:
                                        </div>
                                        <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto">
                                            <button 
                                                onClick={() => setDefaultAuthView('login')}
                                                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${defaultAuthView === 'login' ? 'bg-[#373737] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Iniciar Sesión
                                            </button>
                                            <button 
                                                onClick={() => setDefaultAuthView('register')}
                                                className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${defaultAuthView === 'register' ? 'bg-[#373737] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                            >
                                                Registro
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isSpecialAuth && (
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-2 flex gap-3 items-start animate-in slide-in-from-top-1 duration-300">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <Icons.Info className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blue-900 leading-tight">Configuración Especial Detectada</p>
                                            <p className="text-xs text-blue-700 mt-0.5">
                                                Al tener la landing activa y campos personalizados, este iframe mostrará automáticamente el formulario extendido con tus campos adicionales.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Código HTML (Iframe)</label>
                                <div className="relative group">
                                    {!isLandingDisabled && (
                                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="sm"
                                                className={`h-8 px-3 gap-2 ${isCopied ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-[#373737] hover:bg-black text-white'}`}
                                                onClick={() => copyToClipboard(iframeCode, embed.id)}
                                            >
                                                {isCopied ? (
                                                    <><Check className="w-3 h-3" /> Copiado</>
                                                ) : (
                                                    <><Copy className="w-3 h-3" /> Copiar Código</>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                    <pre className={`p-4 rounded-xl overflow-x-auto text-sm font-mono border shadow-inner ${
                                        isLandingDisabled 
                                            ? 'bg-gray-100 text-gray-400 border-gray-200' 
                                            : 'bg-gray-900 text-gray-100 border-gray-800'
                                    }`}>
                                        <code>{isLandingDisabled ? 'Opcion desactivada' : iframeCode}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        
    );
}
