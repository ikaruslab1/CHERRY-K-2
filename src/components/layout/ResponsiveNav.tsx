import { useState } from 'react';
import { Home, LogOut, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [isOpen, setIsOpen] = useState(false);

    // Filter visible items
    const visibleItems = items.filter(item => item.show !== false);

    return (
        <>
            {/* Main Toggle Button (Home/Menu) - Fixed or Sticky */}
            <div className="fixed top-6 left-6 z-40">
               <motion.button 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(true)}
                  className="bg-white p-3.5 rounded-2xl shadow-lg border border-gray-100 text-[#373737] flex items-center justify-center group hover:border-[#DBF227] transition-colors"
                  title="Abrir Menú"
               >
                  <Home className="w-6 h-6 group-hover:text-black transition-colors" />
               </motion.button>
            </div>

            {/* Backdrop & Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Menu Container */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-full max-w-[300px] bg-white shadow-2xl z-50 flex flex-col p-6"
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
                                    onClick={() => setIsOpen(false)}
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
                                            setIsOpen(false);
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
        </>
    );
}
