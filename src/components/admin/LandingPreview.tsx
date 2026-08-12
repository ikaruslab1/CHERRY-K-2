'use client';

import { Conference, ConferenceLandingConfig } from '@/types';
import { LandingRenderer } from '@/components/landing/LandingRenderer';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface LandingPreviewProps {
  config: ConferenceLandingConfig;
  conference: Conference;
  view: 'desktop' | 'tablet' | 'mobile';
  zoom?: number;
  locale?: 'en' | 'es';
}

const VIEWPORT_DATA = {
  desktop: { width: 1440, height: 900, baseScale: 0.5, icon: Monitor },
  tablet: { width: 768, height: 1024, baseScale: 0.6, icon: Tablet },
  mobile: { width: 375, height: 812, baseScale: 0.75, icon: Smartphone }
};

export function LandingPreview({ config, conference, view, zoom = 1, locale }: LandingPreviewProps) {
  const { width, height, baseScale, icon: Icon } = VIEWPORT_DATA[view];
  const scale = baseScale * zoom;

  return (
    <div 
      className="relative flex flex-col items-center transition-all duration-500 ease-in-out" 
      style={{ width: `${width * scale}px` }}
    >
      {/* Device Frame Info */}
      <div className="mb-6 flex items-center gap-3 bg-white dark:bg-[#111111] px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
         <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
         <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">
           {view} — {width} × {height} px
         </span>
      </div>

      {/* Simulated Device Container */}
      <div 
        className="relative shadow-[0_30px_100px_rgba(0,0,0,0.15)] border-[12px] border-gray-950 rounded-[3rem] overflow-hidden bg-white dark:bg-[#050505] transition-all duration-500 origin-top"
        style={{
          width: `${width}px`,
          transform: `scale(${scale})`,
          // We don't limit height here to allow seeing the full page
          minHeight: `${height}px`,
        }}
      >
        {/* Content Area with LandingRenderer */}
        <div className="relative w-full">
           <LandingRenderer config={config} conference={conference} forcedLocale={locale} />

           {/* THE FOLD INDICATOR (Límite de pantalla inicial) */}
           <div 
             className="absolute left-0 right-0 pointer-events-none z-[100]"
             style={{ top: `${height}px` }}
           >
              {/* Line */}
              <div className="w-full border-t-4 border-dashed border-red-500/50 relative">
                 {/* Label */}
                 <div className="absolute right-4 top-2 bg-red-500 text-white px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter shadow-xl flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Fin de Pantalla Inicial (Scroll sugerido)
                 </div>
              </div>
              
              {/* Overlay for content "Below the Fold" */}
              <div className="w-full h-[5000px] bg-red-500/[0.03] transition-colors" />
           </div>
        </div>

        {/* Scroll Bar Decoration (Simulated) */}
        <div className="absolute right-1 top-2 bottom-2 w-1.5 bg-gray-100/10 rounded-full z-[101]" />
      </div>

      {/* Footer Shadow/Reflection */}
      <div 
        className="w-full h-8 bg-black/5 blur-2xl rounded-full mt-[-30px] transition-all duration-500"
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  );
}
