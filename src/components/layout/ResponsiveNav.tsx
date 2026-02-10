'use client';

import { useState, useEffect } from 'react';
import { LogOut, X, Menu, ChevronLeft, ChevronRight, LayoutGrid, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/context/SidebarContext';
import { useConference } from '@/context/ConferenceContext';
import { InstallPWAButton } from '../ui/InstallPWAButton';
import { usePushSubscription } from '@/hooks/usePushSubscription';
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
    const { currentConference } = useConference();
    const { isSubscribed, subscribe: handlePushSubscription, isLoading } = usePushSubscription();

    // Filter visible items
    const visibleItems = items.filter(item => item.show !== false);

    // Styles - Swiss minimalist (White, Gray, Acid Green Accent)
    const sidebarBg = "bg-white border-r border-gray-100";
    
    // Active Item: Acid Green Background, Black Text (Brand Identity) - Flat, no shadow
    const itemActive = "bg-[var(--color-acid)] text-black font-bold";
    
    // Inactive Item: Gray Text, Hover to Light Gray with Black Text
    const itemInactive = "text-gray-500 hover:bg-gray-50 hover:text-black transition-colors duration-200";

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 10) {
                // Scrolling down
                setIsVisible(false);
            } else {
                // Scrolling up
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <>
            {/* MOBILE: Toggle Button */}
            <motion.div 
                className="md:hidden fixed top-4 left-4 z-[100]"
                initial={{ y: 0 }}
                animate={{ y: isVisible ? 0 : -100 }}
                transition={{ duration: 0.3 }}
            >
               <button 
                  onClick={() => setIsMobileOpen(true)}
                  className="bg-white p-2.5 shadow-sm border border-gray-200 text-black flex items-center justify-center active:scale-95 transition-transform rounded-xl"
                  title="Abrir Menú"
               >
                  <Menu className="w-5 h-5" />
               </button>
            </motion.div>

            {/* MOBILE: Backdrop & Menu */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="md:hidden fixed top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white border-r border-gray-200 z-50 flex flex-col p-6"
                        >
                            {/* Header Mobile */}
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                                    <div className="w-8 h-8 bg-[var(--color-acid)] flex items-center justify-center rounded-lg shrink-0 shadow-sm border border-black/5">
                                        <LayoutGrid className="w-4 h-4" style={{ color: 'var(--color-acid-text)' }} />
                                    </div>
                                    <div className="flex flex-col overflow-hidden min-w-0">
                                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Menu</span>
                                       <h2 className="text-sm font-bold text-black uppercase tracking-wider leading-tight opacity-90 break-words">
                                          {currentConference?.title || 'Cherry-K'}
                                       </h2>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 hover:bg-gray-100 text-gray-500 transition-colors rounded-lg shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Nav Items Mobile */}
                            <nav className="flex-1 space-y-1">
                                {visibleItems.map((item) => {
                                    const isActive = activeTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (item.onClick) {
                                                    item.onClick();
                                                } else {
                                                    setActiveTab(item.id);
                                                    setIsMobileOpen(false);
                                                }
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-lg transition-all",
                                                isActive ? itemActive : itemInactive
                                            )}
                                        >
                                            <span className={cn("transition-colors", isActive ? "" : "text-gray-400")} style={isActive ? { color: 'var(--color-acid-text)' } : undefined}>
                                                {item.icon}
                                            </span>
                                            <span style={isActive ? { color: 'var(--color-acid-text)' } : undefined}>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Footer Mobile */}
                            <div className="pt-6 border-t border-gray-100 mt-auto space-y-3">
                                <InstallPWAButton />
                                <button
                                    onClick={handlePushSubscription}
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 transition-colors text-sm font-medium rounded-lg",
                                        isSubscribed 
                                            ? "text-green-600 hover:bg-green-50" 
                                            : "text-gray-500 hover:bg-gray-50 hover:text-black"
                                    )}
                                >
                                    {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                                    <span>{isLoading ? 'Cargando...' : (isSubscribed ? 'Notificaciones Activadas' : 'Activar Notificaciones')}</span>
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium rounded-lg"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* DESKTOP: Sidebar */}
            <motion.aside
                initial={false}
                animate={{ 
                    width: isDesktopCollapsed ? '80px' : '260px'
                }}
                transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                className={cn(
                    "hidden md:flex fixed top-0 left-0 bottom-0 z-50 flex-col",
                    sidebarBg,
                    "shadow-[10px_0_30px_rgba(0,0,0,0.03)]"
                )}
            >
                {/* Header Desktop */}
                <motion.div 
                    layout
                    className="flex items-center justify-between p-5 border-b border-gray-100 min-h-[80px]"
                >
                    <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                         {/* Icon always visible */}
                        <div className="w-9 h-9 bg-[var(--color-acid)] flex items-center justify-center rounded-xl shrink-0 transition-all hover:scale-105 shadow-sm border border-black/5">
                            <LayoutGrid className="w-5 h-5" style={{ color: 'var(--color-acid-text)' }} />
                        </div>
                        
                        {/* Text - Fades out when collapsed */}
                        <AnimatePresence>
                            {!isDesktopCollapsed && (
                                <motion.div 
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col overflow-hidden min-w-0"
                                >
                                    <div className="min-w-[160px]">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 ml-1 whitespace-nowrap">Menu</span>
                                        <h2 className="text-xs font-bold text-black uppercase tracking-wider leading-tight ml-1 break-words" title={currentConference?.title || 'Cherry-K'}>
                                            {currentConference?.title || 'Cherry-K'}
                                        </h2>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
                
                {/* Toggle Overlay */}
                {isDesktopCollapsed && (
                    <button 
                         onClick={() => setIsDesktopCollapsed(false)}
                         className="absolute top-0 left-0 w-full h-[80px] z-20 opacity-0 cursor-pointer"
                         title="Expandir"
                    />
                )}
                 {!isDesktopCollapsed && (
                    <button
                        onClick={() => setIsDesktopCollapsed(true)}
                        className="absolute top-7 right-4 p-1 hover:bg-gray-100 text-gray-400 hover:text-black transition-colors rounded-lg z-20"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                )}


                {/* Nav Items Desktop */}
                <motion.nav 
                    layout
                    className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200"
                >
                    {visibleItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.onClick) {
                                        item.onClick();
                                    } else {
                                        setActiveTab(item.id);
                                    }
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all group relative min-h-[48px]",
                                    isActive ? itemActive : itemInactive,
                                    isDesktopCollapsed ? "justify-center px-0" : ""
                                )}
                                title={isDesktopCollapsed ? item.label : ''}
                            >
                                <span className={cn(
                                    "relative z-10 shrink-0 transition-colors duration-200", 
                                    isActive ? "" : "text-gray-400 group-hover:text-black"
                                )} style={isActive ? { color: 'var(--color-acid-text)' } : undefined}>
                                    {item.icon}
                                </span>
                                
                                {!isDesktopCollapsed && (
                                    <motion.span 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-sm font-medium tracking-wide relative z-10 truncate"
                                        style={isActive ? { color: 'var(--color-acid-text)' } : undefined}
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </button>
                        );
                    })}
                </motion.nav>

                {/* Footer Desktop */}
                <motion.div 
                    layout
                    className="p-3 border-t border-gray-100 space-y-2"
                >
                    <InstallPWAButton collapsed={isDesktopCollapsed} />
                    
                    <button
                        onClick={handlePushSubscription}
                        disabled={isLoading}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 transition-colors font-medium rounded-lg",
                            isSubscribed 
                                ? "text-green-600 hover:bg-green-50" 
                                : "text-gray-500 hover:bg-gray-50 hover:text-black",
                            isDesktopCollapsed ? "justify-center" : ""
                        )}
                        title={isDesktopCollapsed ? (isSubscribed ? 'Notificaciones Activadas' : 'Activar Notificaciones') : ''}
                    >
                        {isSubscribed ? (
                            <Bell className="w-5 h-5 shrink-0" />
                        ) : (
                            <BellOff className="w-5 h-5 shrink-0" />
                        )}
                        {!isDesktopCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm truncate"
                            >
                                {isLoading ? 'Cargando...' : (isSubscribed ? 'Notificaciones On' : 'Activar Alertas')}
                            </motion.span>
                        )}
                    </button>

                    <button
                        onClick={handleSignOut}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-red-50 transition-colors font-medium rounded-lg",
                            isDesktopCollapsed ? "justify-center" : ""
                        )}
                        title={isDesktopCollapsed ? 'Cerrar Sesión' : ''}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!isDesktopCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm truncate"
                            >
                                Cerrar Sesión
                            </motion.span>
                        )}
                    </button>
                </motion.div>
            </motion.aside>
        </>
    );
}
