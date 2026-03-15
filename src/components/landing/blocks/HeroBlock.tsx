'use client';

import { LandingBlock } from '@/types';
import { Target, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroBlockProps {
  block: LandingBlock;
  globalStyles: any;
  authForms?: React.ReactNode;
}

export function HeroBlock({ block, globalStyles, authForms }: HeroBlockProps) {
  const { title, subtitle, gradient_start, gradient_end } = block.content;
  const variant = block.variant || 'centered';

  const containerStyle = {
    background: `linear-gradient(135deg, ${gradient_start || '#373737'} 0%, ${gradient_end || '#000000'} 100%)`,
  };

  if (variant === 'split') {
    return (
      <section className="relative min-h-[90vh] grid lg:grid-cols-2 overflow-hidden" style={containerStyle}>
        <div className="flex flex-col justify-center px-6 lg:px-16 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="inline-block px-4 py-1.5 bg-[#DBF227] text-black text-[10px] font-bold uppercase tracking-widest rounded-full">
              Evento Destacado
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-none tracking-tighter">
              {title}
            </h1>
            <p className="text-lg text-gray-300/80 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          </motion.div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border-l border-white/10 flex flex-col justify-center p-6 lg:p-12">
          {authForms || (
            <div className="text-center text-white/40 italic text-sm">
              Formularios de registro aquí
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-24 text-center overflow-hidden" style={containerStyle}>
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 relative z-10 space-y-8"
      >
        <div className="flex justify-center flex-wrap gap-4 mb-4">
           <span className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] text-white font-bold uppercase border border-white/10 backdrop-blur-md">
             <Target className="w-3 h-3 text-[#DBF227]" /> Innovación
           </span>
           <span className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] text-white font-bold uppercase border border-white/10 backdrop-blur-md">
             <Zap className="w-3 h-3 text-[#DBF227]" /> Impacto
           </span>
        </div>

        <h1 className="text-5xl md:text-8xl font-bold text-white leading-[0.9] tracking-tighter max-w-5xl mx-auto">
          {title}
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {variant === 'centered' && (
           <div className="pt-8 flex flex-wrap justify-center gap-4">
              <button className="px-10 py-4 bg-[#DBF227] text-black font-bold rounded-xl hover:scale-105 transition-transform">
                Comenzar Registro
              </button>
              <button className="px-10 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                Saber más
              </button>
           </div>
        )}
      </motion.div>
    </section>
  );
}
