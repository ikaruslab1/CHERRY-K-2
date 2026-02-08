'use client';

import { ReactNode } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarAwareContainerProps {
    children: ReactNode;
    className?: string;
}

export function SidebarAwareContainer({ children, className = '' }: SidebarAwareContainerProps) {
    const { isDesktopCollapsed } = useSidebar();
    
    // Adjusted margins to match the new sharper layout
    const marginClass = isDesktopCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]';
    
    return (
        <motion.div 
            layout 
            className={`${className} ${marginClass} min-h-screen bg-[var(--color-void)] relative transition-all duration-500 ease-in-out`}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
