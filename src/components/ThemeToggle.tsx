'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle({ className, collapsed }: { className?: string; collapsed?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={toggleTheme}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all cursor-pointer ${
        collapsed ? 'justify-center' : ''
      } ${className}`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="flex items-center justify-center shrink-0"
      >
        {theme === 'dark' ? (
          <Sun className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
        ) : (
          <Moon className="h-4.5 w-4.5 text-slate-500 fill-slate-500" />
        )}
      </motion.div>
      {!collapsed && (
        <span className="text-sm font-medium">
          {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
        </span>
      )}
    </motion.button>
  );
}
