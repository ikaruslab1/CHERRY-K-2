'use client';

import { LandingBlock } from '@/types';
import { motion } from 'framer-motion';

export function SpeakersBlock({ block }: { block: LandingBlock }) {
  const { title, speakers = [] } = block.content;

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 tracking-tighter text-center">
          {title || 'Ponentes Destacados'}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {speakers.length > 0 ? speakers.map((speaker: any, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="aspect-square rounded-3xl bg-gray-200 mb-6 overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500">
                {speaker.image ? (
                  <img src={speaker.image} alt={speaker.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">PHOTO</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                   <p className="text-white text-xs font-bold uppercase tracking-widest">{speaker.role}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{speaker.name}</h3>
              <p className="text-sm text-gray-500">{speaker.organization}</p>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 italic">
              Sin ponentes configurados
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
