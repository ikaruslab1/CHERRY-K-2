'use client';

import { LandingBlock } from '@/types';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturesBlockProps {
  block: LandingBlock;
}

const ICONS = Icons;

export function FeaturesBlock({ block }: FeaturesBlockProps) {
  const { title: sectionTitle, items = [], text_align = 'left', grid_align = 'left' } = block.content;
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
        <div className={`mb-16 flex flex-col gap-8 ${
          grid_align === 'center' ? 'items-center text-center' : 
          grid_align === 'right' ? 'items-end text-right' : 
          'items-start text-left'
        }`}>
           <div className="max-w-2xl">
              <h2 className="text-4xl @md:text-5xl font-bold text-gray-900 leading-[0.9] tracking-tighter mb-4">
                {sectionTitle || 'Características Principales'}
              </h2>
              <div className={`h-1.5 w-24 bg-[#adacac] rounded-full ${
                grid_align === 'center' ? 'mx-auto' : 
                grid_align === 'right' ? 'ml-auto' : 
                ''
              }`}></div>
           </div>
        </div>

        <motion.div 
          key={items.length}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={`flex flex-wrap gap-6 ${
            grid_align === 'center' ? 'justify-center' : 
            grid_align === 'right' ? 'justify-end' : 
            'justify-start'
          }`}
        >
          {items.map((item: any, idx: number) => {
            const Icon = (Icons as any)[item.icon] || Icons.Zap;
            
            return (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className={`p-8 rounded-3xl group transition-all duration-500 flex flex-col ${
                  variant === 'cards' 
                    ? 'bg-gray-50 hover:bg-white hover:shadow-2xl hover:shadow-gray-200 border border-transparent hover:border-gray-100' 
                    : 'bg-white hover:bg-gray-50 border border-gray-100'
                } ${
                  text_align === 'center' ? 'text-center items-center' : 
                  text_align === 'right' ? 'text-right items-end' : 
                  'text-left items-start'
                } w-full ${
                  variant === 'grid' 
                    ? '@md:w-[calc(50%-12px)] @lg:w-[calc(33.333%-16px)]' 
                    : '@lg:w-[calc(33.333%-16px)]'
                }`}
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-lg"
                  style={{ backgroundColor: item.icon_bg_color || '#000000' }}
                >
                  <Icon className="w-6 h-6 transition-colors" style={{ color: item.icon_color || '#FFFFFF' }} />
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
