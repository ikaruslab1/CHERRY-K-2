'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarAwareContainerProps {
    children: ReactNode;
    className?: string;
}

export function SidebarAwareContainer({ children, className = '' }: SidebarAwareContainerProps) {
    const { isDesktopCollapsed } = useSidebar();
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        // Initial check
        checkMobile();
        
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    return (
        <motion.div 
            layout 
            className={`${className} min-h-screen relative transition-all duration-500 ease-in-out`}
            animate={{ 
                paddingLeft: isMobile ? 0 : (isDesktopCollapsed ? '80px' : '260px')
            }}
            initial={false}
        >
            <div className="absolute inset-y-0 left-0 w-px bg-black/5 z-30 md:block hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]" />
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
