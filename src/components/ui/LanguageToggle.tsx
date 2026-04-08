"use client";

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageToggleProps {
  collapsed?: boolean;
  mobile?: boolean;
}

export function LanguageToggle({ collapsed = false, mobile = false }: LanguageToggleProps) {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === 'es' ? 'en' : 'es');
  };

  const currentLabel = language === 'es' ? 'Español' : 'English';
  const oppositeTitle = language === 'es' ? 'Switch to English' : 'Cambiar a Español';

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "w-full flex items-center gap-3 transition-colors rounded-lg font-medium text-sm",
        mobile ? "px-4 py-3 text-gray-400 hover:bg-gray-50 hover:text-gray-600" : "px-3 py-3 text-gray-400 hover:bg-gray-50 hover:text-gray-600",
        collapsed ? "justify-center" : ""
      )}
      title={collapsed ? oppositeTitle : ''}
    >
      <Globe className={cn("shrink-0", mobile ? "w-4 h-4" : "w-5 h-5")} />
      
      {(!collapsed || mobile) && (
        <span className="truncate flex-1 text-left">
          {currentLabel}
        </span>
      )}

      {(!collapsed || mobile) && (
        <div className="flex items-center bg-gray-100 rounded-md p-0.5 text-[10px] uppercase font-bold tracking-wider text-gray-500">
          <span className={cn("px-1.5 py-0.5 rounded shadow-sm transition-colors", language === 'es' ? "bg-white text-black" : "text-transparent")}>ES</span>
          <span className={cn("px-1.5 py-0.5 rounded shadow-sm transition-colors", language === 'en' ? "bg-white text-black" : "text-transparent")}>EN</span>
        </div>
      )}
    </button>
  );
}
