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
      <nav className="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] relative max-h-36 overflow-y-auto overflow-x-hidden p-2">
        <div className="flex items-center justify-around w-full gap-1">
          {visibleItems.map((item) => {
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center w-full relative py-2 px-1 focus:outline-none rounded-xl"
              >
                {/* Highlight background pill */}
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active-indicator"
                    className="absolute inset-0 bg-gray-100 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <motion.span
                  animate={{
                    scale: isActive ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    color: isActive ? 'var(--color-acid)' : undefined
                  }}
                  className={cn(
                    "relative z-10 transition-colors duration-200",
                    isActive ? "" : "text-gray-400"
                  )}
                >
                  {item.icon}
                </motion.span>

                {/* Label */}
                <motion.span
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    scale: isActive ? 1.02 : 1
                  }}
                  style={{
                    color: isActive ? 'var(--color-acid)' : undefined
                  }}
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider mt-1 transition-colors duration-200 text-center truncate max-w-full px-0.5",
                    isActive ? "font-black" : "text-gray-400"
                  )}
                >
                  {item.label}
                </motion.span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
