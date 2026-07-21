'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  show?: boolean;
}

interface BottomNavProps {
  items: BottomNavItem[];
  activeTab: string;
  setActiveTab: (id: any) => void;
}

export function BottomNav({ items, activeTab, setActiveTab }: BottomNavProps) {
  const visibleItems = items.filter(item => item.show !== false);

  return (
    <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
      <nav className="bg-black/90 backdrop-blur-lg border border-white/10 rounded-2xl flex items-center justify-around py-3 px-2 shadow-[0_10px_35px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {visibleItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 relative py-1 focus:outline-none"
            >
              {/* Highlight background pill */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-indicator"
                  className="absolute inset-0 bg-white/5 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Icon */}
              <motion.span
                animate={{
                  scale: isActive ? 1.15 : 1,
                  color: isActive ? 'var(--color-acid)' : '#9ca3af'
                }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                {item.icon}
              </motion.span>

              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0.8,
                  scale: isActive ? 1.02 : 1
                }}
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wider mt-1.5 transition-colors",
                  isActive ? "text-[var(--color-acid)] font-black" : "text-gray-400"
                )}
              >
                {item.label}
              </motion.span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
