'use client';

import { LandingBlock } from '@/types';
import { Target, Zap, Users, Globe, Shield, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturesBlockProps {
  block: LandingBlock;
  globalStyles: any;
}

const ICONS = {
  Target, Zap, Users, Globe, Shield, Trophy
};

export function FeaturesBlock({ block, globalStyles }: FeaturesBlockProps) {
  const { title: sectionTitle, items = [] } = block.content;
  const variant = block.variant || 'grid';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center lg:text-left flex flex-col lg:flex-row items-end justify-between gap-8">
           <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-[0.9] tracking-tighter mb-4">
                {sectionTitle || 'Características Principales'}
              </h2>
              <div className="h-1.5 w-24 bg-[#DBF227] rounded-full"></div>
           </div>
           <p className="text-gray-500 font-medium uppercase tracking-widest text-xs">
             Elevando la experiencia del evento
           </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`grid gap-6 ${
            variant === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-3'
          }`}
        >
          {items.map((item: any, idx: number) => {
            const Icon = (ICONS as any)[item.icon] || Zap;
            
            return (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className={`p-8 rounded-3xl group transition-all duration-500 ${
                  variant === 'cards' 
                    ? 'bg-gray-50 hover:bg-white hover:shadow-2xl hover:shadow-gray-200 border border-transparent hover:border-gray-100' 
                    : 'bg-white hover:bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 group-hover:bg-[#DBF227] group-hover:rotate-12 transition-all duration-300">
                  <Icon className="w-6 h-6 text-[#DBF227] group-hover:text-black transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
                  {item.title}
                </h3>
                
                <p className="text-gray-500 leading-relaxed text-sm">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
