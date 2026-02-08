'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ParticleBadgeProps {
  roleName: string;
  themeColor: string;
  themeTextColor: string;
  animation?: string;
  bgSize?: string;
  className?: string;
}

interface Particle {
  id: string;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

export function ParticleBadge({ 
  roleName, 
  themeColor, 
  themeTextColor, 
  animation, 
  bgSize,
  className = ''
}: ParticleBadgeProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create a unique ID prefix for this burst
    const timestamp = Date.now();
    
    // Generate random particles
    const particleCount = 12; // More particles for better effect
    const newParticles: Particle[] = Array.from({ length: particleCount }).map((_, i) => ({
      id: `${timestamp}-${i}`,
      angle: (i * (360 / particleCount)) + (Math.random() * 30 - 15),
      distance: 80 + Math.random() * 60,
      size: 4 + Math.random() * 6,
      color: themeColor
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Clean up these specific particles after animation (1s)
    setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Particles Container - absolutely positioned to center but behind content */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
            y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
            opacity: [1, 1, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute rounded-full pointer-events-none z-0"
          style={{
            width: particle.size,
            height: particle.size,
            background: particle.color, 
          }}
        />
      ))}

      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="relative z-10 shrink-0 px-8 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-black/5 transition-all duration-300 cursor-pointer select-none border-none outline-none"
        style={{
          background: themeColor,
          color: themeTextColor,
          animation: animation,
          backgroundSize: bgSize,
        }}
      >
        {roleName}
      </motion.button>
    </div>
  );
}
