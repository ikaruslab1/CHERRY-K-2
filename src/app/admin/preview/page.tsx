'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

function PreviewContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const url = searchParams.get('url');
  const height = searchParams.get('height') || '800px';
  const width = searchParams.get('width') || '100%';
  const margin = searchParams.get('margin') || '0';
  const [showSpecialMsg, setShowSpecialMsg] = useState(false);

  useEffect(() => {
    if (url && url.includes('custom=true')) {
      setShowSpecialMsg(true);
      const timer = setTimeout(() => {
        setShowSpecialMsg(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [url]);

  if (!url) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500 font-medium">
        No se proporcionó una URL para la vista previa.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 flex flex-col items-center justify-center relative">
      <AnimatePresence>
        {showSpecialMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
          >
            <div className="bg-[#373737] text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#DBF227] flex items-center justify-center shrink-0 shadow-lg shadow-[#DBF227]/20">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">{t('auth.custom_fields_active')}</p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  {t('auth.custom_fields_msg')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 transition-all duration-300 mx-auto"
        style={{ width: width === '100%' ? '100%' : width }}
      >
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="ml-4 text-xs font-mono text-gray-400 truncate max-w-md">
                    {url}
                </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Vista Previa del Iframe (Espaciado Interno)
            </span>
        </div>
        <div className="bg-gray-50">
          <iframe 
            src={url} 
            width="100%" 
            style={{ height, border: 'none', background: 'white' }}
            allow="autoplay; fullscreen"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando vista previa...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
