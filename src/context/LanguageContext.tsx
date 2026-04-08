"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import es from '../locales/es.json';
import en from '../locales/en.json';

type Language = 'es' | 'en';
type Dictionary = Record<string, any>;

interface LanguageContextProps {
  language: Language;
  changeLanguage: (lang: Language) => void;
  // Function to get translations by dot notation, e.g. t('common.save')
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const dictionaries: Record<Language, Dictionary> = {
  es,
  en,
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('es'); // Español por defecto

  useEffect(() => {
    // Check URL parameters first for embedded iframes
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as Language;
    
    if (urlLang === 'es' || urlLang === 'en') {
      setLanguage(urlLang);
      localStorage.setItem('language', urlLang);
      return;
    }

    // Intentar leer el localStorage del lado del cliente
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && (storedLang === 'es' || storedLang === 'en')) {
      setLanguage(storedLang);
    } else {
      // Como fallback intentar tomar el del navegador
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en' || browserLang === 'es') {
        setLanguage(browserLang as Language);
        localStorage.setItem('language', browserLang);
      }
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = dictionaries[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback al español o retornar la llave si no existe
        let esValue: any = dictionaries['es'];
        for (const kEs of keys) {
            if (esValue && typeof esValue === 'object' && kEs in esValue) {
                esValue = esValue[kEs];
            } else {
                return key; // No encontró ni en el idioma actual ni en el español default
            }
        }
        return typeof esValue === 'string' ? esValue : key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
