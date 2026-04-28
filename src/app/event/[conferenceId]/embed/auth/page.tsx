'use client';

import { useState, use, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Info, X, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function EmbedAuthPage({ params }: { params: Promise<{ conferenceId: string }> }) {
  const { conferenceId } = use(params);
  const { language, t } = useLanguage();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [extraPadding, setExtraPadding] = useState('0px');

  useEffect(() => {
    // Definir vista por defecto si viene en la URL
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view');
    const marginParam = searchParams.get('margin');
    
    // Comportamiento por defecto: margen amplio abajo para forzar scroll en modales
    setExtraPadding(marginParam ? marginParam.split(' ')[0] : '400px');

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
    <div 
      className={`min-h-screen bg-white flex flex-col items-center p-4 relative overflow-x-hidden overflow-y-auto justify-start`}
      style={{ 
        paddingTop: extraPadding !== '0px' ? '40px' : '0px', 
        paddingBottom: extraPadding 
      }}
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-20" />
      


      <div className="w-full max-w-[420px] space-y-6 relative z-10">
        {/* Toggle Header */}
        <div className="flex flex-col space-y-1.5 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {view === 'login' ? t('auth.welcome_back') : t('auth.create_account')}
            </h2>
            <p className="text-sm text-gray-500 pb-2">
                {view === 'login' 
                    ? t('auth.enter_id') 
                    : (config?.custom_inputs?.length > 0 
                        ? t('auth.complete_extended') 
                        : t('auth.complete_details'))}
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
                        ? <LoginForm conferenceId={conferenceId} isEmbedded={true} locale={language} /> 
                        : <RegisterForm 
                            conferenceId={conferenceId} 
                            isEmbedded={true} 
                            customInputs={config?.custom_inputs || []}
                            fieldsOrder={config?.fields_order || []}
                            locale={language}
                          />
                    }
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Toggle Footer */}
        <div className="text-center text-sm">
            {view === 'login' ? (
                <p className="text-gray-500">
                    {t('auth.no_account_yet')}{' '}
                    <button 
                        onClick={() => setView('register')}
                        className="font-bold text-[#373737] hover:underline transition-all"
                    >
                        {t('auth.register_here')}
                    </button>
                </p>
            ) : (
                <p className="text-gray-500">
                    {t('auth.already_have_id')}{' '}
                    <button 
                        onClick={() => setView('login')}
                        className="font-bold text-[#373737] hover:underline transition-all"
                    >
                        {t('auth.log_in')}
                    </button>
                </p>
            )}
        </div>
      </div>
    </div>
  );
}
