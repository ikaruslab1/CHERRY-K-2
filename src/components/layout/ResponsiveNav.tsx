import { useState } from 'react';
import { Home, LogOut, X, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/context/SidebarContext';
import { InstallPWAButton } from '../ui/InstallPWAButton';

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

    return (
        <>
            {/* MOBILE: Toggle Button - Only visible on mobile */}
            <div className="md:hidden fixed top-6 left-6 z-40">
               <motion.button 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMobileOpen(true)}
                  className="bg-white p-3.5 rounded-2xl shadow-lg border border-gray-100 text-[#373737] flex items-center justify-center group hover:border-[#DBF227] transition-colors"
                  title="Abrir Menú"
               >
                  <Home className="w-6 h-6 group-hover:text-black transition-colors" />
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
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Menu Container */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="md:hidden fixed top-0 left-0 bottom-0 w-full max-w-[300px] bg-white shadow-2xl z-50 flex flex-col p-6"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-[#DBF227] flex items-center justify-center">
                                        <Home className="w-4 h-4 text-[#373737]" />
                                    </div>
                                    <h2 className="text-xl font-bold font-playfair text-[#373737]">Navegación</h2>
                                </div>
                                <button 
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-[#373737]"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Nav Items */}
                            <nav className="flex-1 space-y-2 overflow-y-auto">
                                {visibleItems.map(item => (
                                    <motion.button
                                        key={item.id}
                                        layout
                                        onClick={() => {
                                            if (item.onClick) {
                                                item.onClick();
                                            } else {
                                                setActiveTab(item.id);
                                            }
                                            setIsMobileOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-medium transition-all ${
                                            activeTab === item.id
                                                ? 'bg-[#373737] text-white shadow-md'
                                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#373737]'
                                        }`}
                                    >
                                        {item.icon}
                                        <span className="text-sm">{item.label}</span>
                                    </motion.button>
                                ))}
                            </nav>

                            {/* Footer / Sign Out */}
                            <div className="pt-6 border-t border-gray-100 mt-auto">
                                <InstallPWAButton />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium border border-transparent hover:border-red-100"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="text-sm">Cerrar Sesión</span>
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
                className="hidden md:flex fixed top-0 left-0 bottom-0 bg-white shadow-xl z-40 flex-col border-r border-gray-100"
            >
                {/* Header with Toggle */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    {!isDesktopCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[#DBF227] flex items-center justify-center">
                                <Home className="w-4 h-4 text-[#373737]" />
                            </div>
                            <h2 className="text-xl font-bold font-playfair text-[#373737]">Navegación</h2>
                        </motion.div>
                    )}
                    
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                        className={`p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-[#373737] ${
                            isDesktopCollapsed ? 'mx-auto' : ''
                        }`}
                        title={isDesktopCollapsed ? 'Expandir' : 'Colapsar'}
                    >
                        {isDesktopCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </motion.button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {visibleItems.map(item => (
                        <motion.button
                            key={item.id}
                            layout
                            onClick={() => {
                                if (item.onClick) {
                                    item.onClick();
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-medium transition-all ${
                                activeTab === item.id
                                    ? 'bg-[#373737] text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#373737]'
                            } ${isDesktopCollapsed ? 'justify-center' : ''}`}
                            title={isDesktopCollapsed ? item.label : ''}
                        >
                            {item.icon}
                            {!isDesktopCollapsed && (
                                <motion.span 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-sm"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </motion.button>
                    ))}
                </nav>

                {/* Footer / Sign Out */}
                <div className="p-4 border-t border-gray-100">
                    <InstallPWAButton collapsed={isDesktopCollapsed} />
                    <button
                        onClick={handleSignOut}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium border border-transparent hover:border-red-100 ${
                            isDesktopCollapsed ? 'justify-center' : ''
                        }`}
                        title={isDesktopCollapsed ? 'Cerrar Sesión' : ''}
                    >
                        <LogOut className="w-5 h-5" />
                        {!isDesktopCollapsed && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm"
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
