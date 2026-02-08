import { useState } from 'react';
import { Home, LogOut, X, Menu, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/context/SidebarContext';
import { InstallPWAButton } from '../ui/InstallPWAButton';
import { cn } from '@/lib/utils';

interface NavItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    show?: boolean;
    onClick?: () => void;
}

interface ResponsiveNavProps {
    items: NavItem[];
    activeTab: string;
    setActiveTab: (id: any) => void;
    handleSignOut: () => void;
}

export function ResponsiveNav({ items, activeTab, setActiveTab, handleSignOut }: ResponsiveNavProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { isDesktopCollapsed, setIsDesktopCollapsed } = useSidebar();

    // Filter visible items
    const visibleItems = items.filter(item => item.show !== false);

    const sidebarBg = "bg-[var(--color-surface)] border-r border-[var(--color-subtle)]";
    const itemActive = "bg-[var(--color-acid)] text-black font-bold shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]";
    const itemInactive = "text-gray-400 hover:text-[var(--color-acid)] hover:bg-[var(--color-subtle)]";

    return (
        <>
            {/* MOBILE: Toggle Button - Only visible on mobile */}
            <div className="md:hidden fixed top-4 left-4 z-40">
               <motion.button 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileOpen(true)}
                  className="bg-[var(--color-acid)] p-3 shadow-lg text-black flex items-center justify-center border-2 border-transparent hover:border-white transition-all rounded-none"
                  title="Abrir Menú"
               >
                  <Menu className="w-6 h-6" />
               </motion.button>
            </div>

            {/* MOBILE: Backdrop & Menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        />

                        {/* Menu Container */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="md:hidden fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-[var(--color-void)] border-r border-[var(--color-subtle)] z-50 flex flex-col p-6"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-10 pb-4 border-b border-[var(--color-subtle)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-[var(--color-acid)] flex items-center justify-center rounded-none rotate-3">
                                        <LayoutGrid className="w-4 h-4 text-black" />
                                    </div>
                                    <h2 className="text-xl font-bold font-syne text-[var(--color-chalk)] uppercase tracking-wider">Cherry-K</h2>
                                </div>
                                <button 
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 hover:bg-[var(--color-subtle)] text-[var(--color-acid)] transition-colors rounded-none"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Nav Items */}
                            <nav className="flex-1 space-y-1">
                                {visibleItems.map((item, index) => {
                                    const isActive = activeTab === item.id;
                                    return (
                                        <motion.button
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + (index * 0.05) }}
                                            onClick={() => {
                                                if (item.onClick) {
                                                    item.onClick();
                                                } else {
                                                    setActiveTab(item.id);
                                                    setIsMobileOpen(false);
                                                }
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-4 px-4 py-4 text-left font-manrope font-bold uppercase tracking-widest text-xs transition-all rounded-none",
                                                isActive ? itemActive : itemInactive
                                            )}
                                        >
                                            {item.icon}
                                            <span className="text-sm">{item.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </nav>

                            {/* Footer / Sign Out */}
                            <div className="pt-6 border-t border-[var(--color-subtle)] mt-auto space-y-4">
                                <InstallPWAButton />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-950/30 transition-colors font-medium rounded-none uppercase text-xs tracking-widest"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* DESKTOP: Sidebar - Only visible on desktop */}
            <motion.aside
                initial={false}
                animate={{ 
                    width: isDesktopCollapsed ? '80px' : '280px'
                }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={cn(
                    "hidden md:flex fixed top-0 left-0 bottom-0 z-40 flex-col",
                    sidebarBg
                )}
            >
                {/* Header with Toggle */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-subtle)] min-h-[88px]">
                    <AnimatePresence mode='wait'>
                        {!isDesktopCollapsed && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-3 overflow-hidden"
                            >
                                <div className="w-8 h-8 bg-[var(--color-acid)] flex items-center justify-center rounded-none shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                                    <LayoutGrid className="w-4 h-4 text-black" />
                                </div>
                                <h2 className="text-xl font-bold font-syne text-[var(--color-chalk)] uppercase tracking-wider whitespace-nowrap">
                                    Menu
                                </h2>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                        className={cn(
                            "p-2 hover:bg-[var(--color-subtle)] text-[var(--color-acid)] transition-colors rounded-none",
                            isDesktopCollapsed ? "mx-auto" : ""
                        )}
                    >
                        {isDesktopCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </motion.button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[var(--color-subtle)]">
                    {visibleItems.map((item, index) => {
                        const isActive = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                onClick={() => {
                                    if (item.onClick) {
                                        item.onClick();
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-4 rounded-none text-left transition-all group relative",
                                    isActive ? itemActive : itemInactive,
                                    isDesktopCollapsed ? "justify-center px-2" : ""
                                )}
                                title={isDesktopCollapsed ? item.label : ''}
                            >
                                <span className="relative z-10">{item.icon}</span>
                                {!isDesktopCollapsed && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs font-bold uppercase tracking-widest font-manrope relative z-10"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Footer / Sign Out */}
                <div className="p-4 border-t border-[var(--color-subtle)] space-y-4">
                    <InstallPWAButton collapsed={isDesktopCollapsed} />
                    <button
                        onClick={handleSignOut}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-950/20 transition-colors font-medium rounded-none border border-transparent hover:border-red-900/50",
                            isDesktopCollapsed ? "justify-center px-2" : ""
                        )}
                        title={isDesktopCollapsed ? 'Cerrar Sesión' : ''}
                    >
                        <LogOut className="w-5 h-5" />
                        {!isDesktopCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-xs font-bold uppercase tracking-widest"
                            >
                                Cerrar Sesión
                            </motion.span>
                        )}
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
