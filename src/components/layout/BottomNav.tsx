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
      <nav className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200/80 dark:border-zinc-800 rounded-2xl flex items-center justify-around py-3 px-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
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
                  className="absolute inset-0 bg-gray-100 dark:bg-zinc-800/80 rounded-xl -z-10"
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
                  isActive ? "" : "text-gray-400 dark:text-gray-500"
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
                  "text-[9px] font-bold uppercase tracking-wider mt-1.5 transition-colors duration-200",
                  isActive ? "font-black" : "text-gray-400 dark:text-gray-500"
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
