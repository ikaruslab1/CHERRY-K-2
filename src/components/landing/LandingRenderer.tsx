'use client';

import React, { useState, useEffect } from 'react';
import { ConferenceLandingConfig, LandingBlock, Conference } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroBlock } from './blocks/HeroBlock';
import { FeaturesBlock } from './blocks/FeaturesBlock';
import { AgendaBlock } from './blocks/AgendaBlock';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { DEFAULT_LANDING_CONFIG } from '@/constants/landing';
import { Cherry } from 'lucide-react';
import Link from 'next/link';

interface LandingRendererProps {
  config?: ConferenceLandingConfig | null;
  conference: Conference;
}

export function LandingRenderer({ config: propConfig, conference }: LandingRendererProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Usar la config del prop o la por defecto si no existe
  const config = propConfig || DEFAULT_LANDING_CONFIG;

  // Determinar la fuente seleccionada
  const fontMap: Record<string, string> = {
    sans: 'font-sans',
    serif: 'font-playfair',
    mono: 'font-geist-mono',
    cursive: 'font-dancing-script',
    // Legacy support
    inter: 'font-sans',
    syne: 'font-sans',
    manrope: 'font-sans'
  };
  const selectedFont = fontMap[config.global_styles?.font_family || 'sans'] || 'font-sans';

  // Helper para renderizar los formularios de autenticación dentro de los bloques que lo soporten (como Hero Split)
  const renderAuthForms = () => (
    <div className="w-full max-w-[420px] mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
       <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {view === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
          </h2>
          <p className="text-sm text-gray-500 font-medium tracking-tight">
            {view === 'login' 
              ? 'Ingresa tu ID de acceso para continuar' 
              : 'Completa tus datos para obtener tu ID digital'}
          </p>
       </div>
       
       <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative group transition-all duration-500">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {view === 'login' ? (
                <LoginForm conferenceId={conference.id} />
              ) : (
                <RegisterForm conferenceId={conference.id} />
              )}
            </motion.div>
          </AnimatePresence>
       </div>

       <div className="text-center text-sm font-medium">
          {view === 'login' ? (
            <p className="text-gray-500">
              ¿Aún no tienes cuenta?{' '}
              <button 
                onClick={() => setView('register')}
                className="font-bold hover:underline transition-all text-[#373737]"
              >
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p className="text-gray-500">
              ¿Ya tienes tu ID?{' '}
              <button 
                onClick={() => setView('login')}
                className="font-bold hover:underline transition-all text-[#373737]"
              >
                Inicia sesión
              </button>
            </p>
          )}
       </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-white selection:bg-[#DBF227] selection:text-black @container ${selectedFont}`}>
      
      {/* Dynamic Blocks Rendering Loop */}
      {config.blocks && config.blocks.length > 0 ? (
        <div className="flex flex-col">
          {config.blocks.map((block: LandingBlock) => {
            if (!block.is_visible) return null;

            switch (block.type) {
              case 'hero':
                return (
                  <HeroBlock 
                    key={block.id} 
                    block={block} 
                    authForms={block.variant === 'split' ? renderAuthForms() : undefined}
                  />
                );
              case 'features':
                return (
                  <FeaturesBlock 
                    key={block.id} 
                    block={block} 
                  />
                );
              case 'auth':
                return (
                  <section key={block.id} id="auth-section" className="py-20 bg-gray-50 flex items-center justify-center border-y border-gray-100 scroll-mt-20">
                    {renderAuthForms()}
                  </section>
                );
              case 'agenda':
                return <AgendaBlock key={block.id} block={block} conferenceId={conference.id} />;
              case 'cta':
                const ctaBg = block.content.background_color || '#000000';
                const ctaColor = block.content.text_color || '#FFFFFF';
                const textJustify = block.content.text_align === 'left' ? 'text-left' : block.content.text_align === 'right' ? 'text-right' : 'text-center';
                const flexJustify = block.content.button_align === 'left' ? 'justify-start' : block.content.button_align === 'right' ? 'justify-end' : 'justify-center';
                
                const ctaButtons = block.content.buttons || [
                  { label: block.content.register_label || "Obtener Entrada", url: "#register" },
                  { label: block.content.login_label || "Acceder a mi Portal", url: "#login" }
                ];

                return (
                  <section key={block.id} className="py-24 relative overflow-hidden" style={{ backgroundColor: ctaBg, color: ctaColor }}>                     
                     <div className={`container mx-auto px-6 relative z-10 ${textJustify}`}>
                        <motion.h2 
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          className="text-4xl @md:text-5xl font-black mb-4 tracking-tighter"
                        >
                          {block.content.title || 'Únete al Futuro de la Legislación'}
                        </motion.h2>

                        {block.content.subtitle && (
                          <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className={`text-lg @md:text-xl font-medium mb-12 max-w-2xl opacity-80 ${block.content.text_align === 'center' || !block.content.text_align ? 'mx-auto' : ''}`}
                          >
                            {block.content.subtitle}
                          </motion.p>
                        )}
                        
                        {(ctaButtons.length > 0) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className={`flex flex-wrap gap-4 ${flexJustify}`}
                          >
                             {ctaButtons.map((btn: any, idx: number) => {
                               const btnBg = btn.color || (idx === 0 ? '#DBF227' : 'rgba(255,255,255,0.1)');
                               const btnText = btn.text_color || (idx === 0 ? '#000000' : ctaColor);

                               if (btn.url === '#register' || btn.url === '#login') {
                                 return (
                                   <button 
                                     key={idx}
                                     onClick={() => setView(btn.url === '#register' ? 'register' : 'login')}
                                     className="px-10 py-4 font-bold text-sm uppercase tracking-wider rounded-xl transition-all hover:scale-105 shadow-xl"
                                     style={{ backgroundColor: btnBg, color: btnText }}
                                   >
                                     {btn.label}
                                   </button>
                                 );
                               }
                               
                               return (
                                 <a 
                                   key={idx}
                                   href={btn.url}
                                   className="px-10 py-4 font-bold text-sm uppercase tracking-wider rounded-xl transition-all inline-block hover:scale-105 shadow-xl"
                                   style={{ backgroundColor: btnBg, color: btnText }}
                                 >
                                   {btn.label}
                                 </a>
                               );
                             })}
                          </motion.div>
                        )}
                     </div>
                  </section>
                );
              default:
                return (
                  <div key={block.id} className="py-12 bg-gray-50 text-center text-gray-400 font-mono text-xs uppercase tracking-widest border-y border-gray-100">
                    Módulo "{block.type}" en desarrollo...
                  </div>
                );
            }
          })}
        </div>
      ) : (
        /* Fallback for empty config */
        <div className="h-screen flex items-center justify-center bg-gray-50">
           <div className="text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl mx-auto"></div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Configurando Módulos...</p>
           </div>
        </div>
      )}

      {/* Institutional Branding (Persistent) */}
      <footer className="py-12 bg-white border-t border-gray-50 relative z-20">
         <div className="container mx-auto px-6 flex flex-col @md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center @md:items-start gap-2">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-lg shadow-gray-200">
                     <Cherry className="w-4 h-4 text-white" />
                  </div>
                  <Link href="/login" className="font-bold text-gray-950 tracking-tighter hover:text-black transition-colors">
                    Plataforma Cherry-k-2
                  </Link>
               </div>
               <p className="text-[10px] text-gray-400 font-mono">Sistema de Gestión de Eventos Académicos v2.5</p>
            </div>

            <div className="flex flex-col items-center @md:items-end gap-1">
               <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Desarrollado por</span>
               <a href="https://torrhez.myportfolio.com/" className="text-xs font-bold text-gray-900 border-b-2 border-[#DBF227] hover:bg-[#DBF227] transition-all px-1">
                  Prof. Adrián Torres
               </a>
            </div>
         </div>
      </footer>
    </div>
  );
}
