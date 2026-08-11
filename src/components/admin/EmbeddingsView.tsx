import React, { useState } from 'react';
import { useConference } from '@/context/ConferenceContext';
import { Copy, Check, Code, ExternalLink, Globe, Info } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function EmbeddingsView() {
    const { currentConference } = useConference();
    const [copied, setCopied] = useState<string | null>(null);
    const [defaultAuthView, setDefaultAuthView] = useState<'login' | 'register'>('login');
    const [loginIframeWidth, setLoginIframeWidth] = useState('100%');
    const [loginIframeHeight, setLoginIframeHeight] = useState('');

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
            width: '100%',
            margin: '0',
        },
        {
            id: 'login',
            title: 'Formulario de Registro / Inicio de Sesión',
            description: isSpecialAuthCase 
                ? 'Este formulario incluye los campos personalizados configurados en tu landing page activa.'
                : 'Muestra únicamente los formularios de ingreso o registro para este evento. Al ingresar, redirigirá directamente a la plataforma.',
            url: authUrl.toString(),
            height: loginIframeHeight || (isSpecialAuthCase ? '850px' : '650px'),
            width: loginIframeWidth,
            margin: '0',
        },
        {
            id: 'index',
            title: 'Index Personalizado (Landing Page)',
            description: 'Incrusta toda la landing page personalizada del evento.',
            url: `${baseUrl}/event/${currentConference.id}`,
            height: '800px',
            width: '100%',
            margin: '0',
        }
    ];

    const generateIframe = (url: string, height: string, width: string = '100%', margin: string = '0') => {
        return `<iframe \n  src="${url}" \n  width="${width}" \n  height="${height}" \n  frameborder="0" \n  style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" \n  allow="autoplay; fullscreen" \n  loading="lazy"\n></iframe>`;
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
                    
                    const getUrlWithLang = (url: string, lang: string) => {
                        try {
                            const u = new URL(url);
                            u.searchParams.set('lang', lang);
                            return u.toString();
                        } catch (e) {
                            const separator = url.includes('?') ? '&' : '?';
                            return `${url}${separator}lang=${lang}`;
                        }
                    };

                    const urlEs = getUrlWithLang(embed.url, 'es');
                    const urlEn = getUrlWithLang(embed.url, 'en');
                    const iframeCode = generateIframe(embed.url, embed.height, embed.width, embed.margin);
                    const iframeCodeEs = generateIframe(urlEs, embed.height, embed.width, embed.margin);
                    const iframeCodeEn = generateIframe(urlEn, embed.height, embed.width, embed.margin);
                    const isCopied = copied === embed.id;
                    const isCopiedEs = copied === `${embed.id}_es`;
                    const isCopiedEn = copied === `${embed.id}_en`;

                    return (
                        <div 
                            key={embed.id} 
                            className={`bg-white dark:bg-[#111111] rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden shadow-sm transition-all duration-300 ${
                                isLandingDisabled ? 'opacity-50 grayscale pointer-events-none' : 'hover:shadow-md'
                            } ${isSpecialAuth ? 'ring-2 ring-blue-500/20 border-blue-500/40' : ''}`}
                        >
                            <div className="p-4 xs:p-5 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start gap-3 bg-gray-50/50 dark:bg-zinc-900/40">
                                <div>
                                    <h3 className="font-bold text-[#373737] dark:text-white flex items-center gap-2 text-sm xs:text-base">
                                        <Globe className={`w-4 h-4 shrink-0 ${isLandingDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
                                        <span>{embed.title}</span>
                                        {isLandingDisabled && (
                                            <span className="text-[10px] bg-gray-200 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Desactivado</span>
                                        )}
                                        {isSpecialAuth && (
                                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Personalizado</span>
                                        )}
                                    </h3>
                                    <p className="text-xs xs:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {isLandingDisabled 
                                            ? 'Debes activar la opción "Landing Activa" en Diseño para usar este embedding.' 
                                            : embed.description}
                                    </p>
                                </div>
                                {!isLandingDisabled && !currentConference.enable_translation && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2 text-xs h-8 bg-white dark:bg-zinc-800 text-black dark:text-white border-gray-200 dark:border-zinc-700 hover:bg-gray-100 shrink-0"
                                        onClick={() => window.open(`${baseUrl}/admin/preview?url=${encodeURIComponent(embed.url)}&height=${embed.height}&width=${embed.width}&margin=${encodeURIComponent(embed.margin)}`, '_blank')}
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Vista Previa</span>
                                    </Button>
                                )}
                            </div>
                            <div className="p-4 xs:p-5 space-y-3">
                                {isAuth && (
                                    <div className="flex flex-col space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                                        
                                        <div className="h-px bg-gray-200 w-full" />
                                        
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 uppercase tracking-tight">
                                                <Icons.Maximize className="w-4 h-4 text-gray-400" />
                                                Dimensiones del Iframe:
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 overflow-hidden shadow-sm flex-1 sm:flex-none">
                                                    <span className="text-xs text-gray-400 px-2">Ancho:</span>
                                                    <input 
                                                        type="text" 
                                                        value={loginIframeWidth}
                                                        onChange={(e) => setLoginIframeWidth(e.target.value)}
                                                        className="w-20 px-2 py-1.5 text-xs font-bold text-[#373737] focus:outline-none"
                                                        placeholder="100%"
                                                    />
                                                </div>
                                                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 overflow-hidden shadow-sm flex-1 sm:flex-none">
                                                    <span className="text-xs text-gray-400 px-2">Alto:</span>
                                                    <input 
                                                        type="text" 
                                                        value={loginIframeHeight}
                                                        onChange={(e) => setLoginIframeHeight(e.target.value)}
                                                        className="w-20 px-2 py-1.5 text-xs font-bold text-[#373737] focus:outline-none"
                                                        placeholder={isSpecialAuthCase ? '850px' : '650px'}
                                                    />
                                                </div>
                                            </div>
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

                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Código HTML (Iframe)</label>
                                {currentConference.enable_translation ? (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center bg-gray-100 px-3 py-1.5 rounded-t-lg border border-gray-200 border-b-0">
                                                <span className="text-xs font-bold text-gray-700">🇪🇸 Versión en Español</span>
                                                {!isLandingDisabled && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-[10px] h-6 px-2 gap-1 text-gray-500 hover:text-black hover:bg-gray-200"
                                                        onClick={() => window.open(`${baseUrl}/admin/preview?url=${encodeURIComponent(urlEs)}&height=${embed.height}&width=${embed.width}&margin=${encodeURIComponent(embed.margin)}`, '_blank')}
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Vista Previa
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="relative group mt-0">
                                                {!isLandingDisabled && (
                                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="sm"
                                                            className={`h-8 px-3 gap-2 ${isCopiedEs ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-[#373737] hover:bg-black text-white'}`}
                                                            onClick={() => copyToClipboard(iframeCodeEs, `${embed.id}_es`)}
                                                        >
                                                            {isCopiedEs ? (
                                                                <><Check className="w-3 h-3" /> Copiado</>
                                                            ) : (
                                                                <><Copy className="w-3 h-3" /> Copiar Código</>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                                <pre className={`p-4 rounded-b-xl rounded-tr-xl overflow-x-auto text-sm font-mono border shadow-inner ${
                                                    isLandingDisabled 
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200' 
                                                        : 'bg-gray-900 text-gray-100 border-gray-800'
                                                }`}>
                                                    <code>{isLandingDisabled ? 'Opción desactivada' : iframeCodeEs}</code>
                                                </pre>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center bg-gray-100 px-3 py-1.5 rounded-t-lg border border-gray-200 border-b-0">
                                                <span className="text-xs font-bold text-gray-700">🇺🇸 Versión en Inglés</span>
                                                {!isLandingDisabled && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="text-[10px] h-6 px-2 gap-1 text-gray-500 hover:text-black hover:bg-gray-200"
                                                        onClick={() => window.open(`${baseUrl}/admin/preview?url=${encodeURIComponent(urlEn)}&height=${embed.height}&width=${embed.width}&margin=${encodeURIComponent(embed.margin)}`, '_blank')}
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Vista Previa
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="relative group mt-0">
                                                {!isLandingDisabled && (
                                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            size="sm"
                                                            className={`h-8 px-3 gap-2 ${isCopiedEn ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-[#373737] hover:bg-black text-white'}`}
                                                            onClick={() => copyToClipboard(iframeCodeEn, `${embed.id}_en`)}
                                                        >
                                                            {isCopiedEn ? (
                                                                <><Check className="w-3 h-3" /> Copiado</>
                                                            ) : (
                                                                <><Copy className="w-3 h-3" /> Copiar Código</>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                                <pre className={`p-4 rounded-b-xl rounded-tr-xl overflow-x-auto text-sm font-mono border shadow-inner ${
                                                    isLandingDisabled 
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200' 
                                                        : 'bg-gray-900 text-gray-100 border-gray-800'
                                                }`}>
                                                    <code>{isLandingDisabled ? 'Opción desactivada' : iframeCodeEn}</code>
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative group mt-2">
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
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        
    );
}
