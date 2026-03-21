'use client';

import { useState, use, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Info, X, Sparkles } from 'lucide-react';

export default function EmbedAuthPage({ params }: { params: Promise<{ conferenceId: string }> }) {
  const { conferenceId } = use(params);
  const [view, setView] = useState<'login' | 'register'>('login');
  const [config, setConfig] = useState<any>(null);
  const [showSpecialDialog, setShowSpecialDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Definir vista por defecto si viene en la URL
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');
    if (viewParam === 'register' || viewParam === 'login') {
      setView(viewParam as 'login' | 'register');
    }

    async function fetchConfig() {
      try {
        const { data, error } = await supabase
          .from('conferences')
          .select('conference_landing_config, custom_landing_enabled')
          .eq('id', conferenceId)
          .single();

        if (!error && data) {
          const blocks = data.conference_landing_config?.blocks || [];
          const authBlock = blocks.find((b: any) => b.type === 'auth');
          const hasCustomFields = (authBlock?.content?.custom_inputs || []).length > 0;
          
          if (data.custom_landing_enabled && hasCustomFields) {
            setConfig(authBlock.content);
            const isCustomParam = searchParams.get('custom') === 'true';
            if (isCustomParam) {
                setShowSpecialDialog(true);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching conference config:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [conferenceId]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />
      
      <AnimatePresence>
        {showSpecialDialog && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-4 left-4 right-4 z-50 pointer-events-none flex justify-center"
          >
            <div className="bg-[#373737] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 max-w-md pointer-events-auto">
              <div className="w-10 h-10 rounded-full bg-[#DBF227] flex items-center justify-center shrink-0 shadow-lg shadow-[#DBF227]/20">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">Campos Personalizados Activos</p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  Se han agregado nuevos campos obligatorios al formulario de registro para este evento.
                </p>
              </div>
              <button 
                onClick={() => setShowSpecialDialog(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[420px] space-y-6 relative z-10">
        {/* Toggle Header */}
        <div className="flex flex-col space-y-1.5 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {view === 'login' ? 'Bienvenido de nuevo' : 'Crear nueva cuenta'}
            </h2>
            <p className="text-sm text-gray-500 pb-2">
                {view === 'login' 
                    ? 'Ingresa tu ID de acceso para continuar' 
                    : (config?.custom_inputs?.length > 0 
                        ? 'Completa el formulario extendido con tus datos.' 
                        : 'Completa tus datos para generar tu ID digital')}
            </p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-gray-100">
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {view === 'login' 
                        ? <LoginForm conferenceId={conferenceId} isEmbedded={true} /> 
                        : <RegisterForm 
                            conferenceId={conferenceId} 
                            isEmbedded={true} 
                            customInputs={config?.custom_inputs || []}
                            fieldsOrder={config?.fields_order || []}
                          />
                    }
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Toggle Footer */}
        <div className="text-center text-sm">
            {view === 'login' ? (
                <p className="text-gray-500">
                    ¿Aún no tienes cuenta?{' '}
                    <button 
                        onClick={() => setView('register')}
                        className="font-bold text-[#373737] hover:underline transition-all"
                    >
                        Regístrate aquí
                    </button>
                </p>
            ) : (
                <p className="text-gray-500">
                    ¿Ya tienes tu ID?{' '}
                    <button 
                        onClick={() => setView('login')}
                        className="font-bold text-[#373737] hover:underline transition-all"
                    >
                        Inicia sesión
                    </button>
                </p>
            )}
        </div>
      </div>
    </div>
  );
}
