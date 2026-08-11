'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Smartphone, AlertTriangle, ArrowLeft, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface DesktopRequiredWarningProps {
  title: string;
  description: string;
  recommendedResolution?: string;
  onDismiss?: () => void;
  onBack?: () => void;
}

export function DesktopRequiredWarning({
  title,
  description,
  recommendedResolution = '1280px+ (Escritorio)',
  onDismiss,
  onBack,
}: DesktopRequiredWarningProps) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/admin');
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="lg:hidden fixed inset-0 z-[150] bg-[var(--background)] text-[var(--foreground)] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 xs:p-8 shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col items-center space-y-5"
      >
        {/* Graphic Illustration */}
        <div className="relative flex items-center justify-center py-4">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
            <Monitor className="w-10 h-10 text-amber-500" />
          </div>
          
          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-2xl bg-gray-900 dark:bg-zinc-800 flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md">
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>

          <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full bg-amber-500 text-black font-black flex items-center justify-center text-xs shadow-md">
            !
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 inline-block">
            Vista Recomendada
          </span>
          <h2 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed px-1">
            {description}
          </p>
        </div>

        {/* Resolution Recommendation Badge */}
        <div className="w-full p-3 bg-gray-50 dark:bg-zinc-800/80 rounded-2xl border border-gray-100 dark:border-zinc-700/60 text-center">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">
            Resolución Recomendada
          </p>
          <p className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200">
            {recommendedResolution}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5 pt-2">
          <button
            onClick={handleBack}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-gray-900 text-xs font-bold transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Panel</span>
          </button>

          <button
            onClick={handleDismiss}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Continuar de todos modos</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
