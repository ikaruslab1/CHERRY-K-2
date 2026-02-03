import { LogOut, ChevronDown, ChevronUp, QrCode } from 'lucide-react';

interface AdminNavProps {
    activeTab: 'profile' | 'agenda' | 'users' | 'events' | 'attendance' | 'constancias';
    setActiveTab: (tab: 'profile' | 'agenda' | 'users' | 'events' | 'attendance' | 'constancias') => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    handleSignOut: () => void;
}

export function AdminNav({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, handleSignOut }: AdminNavProps) {
    return (
        <div className="relative flex flex-col md:flex-row justify-center items-center bg-white/80 backdrop-blur-sm p-2 md:p-2 rounded-2xl sticky top-4 z-50 gap-2 md:gap-0 shadow-sm border border-gray-100/50">

            {/* Tabs & Pills */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center w-full md:w-auto gap-2 md:gap-1 bg-gray-100/50 p-2 md:p-1 rounded-xl transition-all duration-300">

                {/* Mobile Header: Profile + Toggle */}
                <div className="flex flex-row gap-1 w-full md:w-auto">
                    <button
                        onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                        className={`flex-1 md:flex-none px-4 py-2 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap md:w-auto flex justify-center md:inline-block items-center gap-2 ${activeTab === 'profile'
                                ? 'bg-white text-[#373737] shadow-sm'
                                : 'text-gray-500 hover:text-[#373737] bg-white/50 md:bg-transparent'
                            }`}
                    >
                        Mi Perfil
                    </button>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden px-3 py-2 rounded-lg text-xs font-semibold bg-white shadow-sm text-[#373737] border border-gray-100 flex items-center justify-center transition-all hover:bg-gray-50 active:scale-95"
                    >
                        <span className="sr-only">Ver más</span>
                        {isMobileMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                </div>

                {/* Collapsible Content */}
                <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row gap-2 md:gap-1 w-full md:w-auto animate-in slide-in-from-top-2 md:animate-none duration-200`}>
                    <button
                        onClick={() => { setActiveTab('agenda'); setIsMobileMenuOpen(false); }}
                        className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap w-full md:w-auto flex justify-center md:inline-block ${activeTab === 'agenda'
                                ? 'bg-white text-[#373737] shadow-sm'
                                : 'text-gray-500 hover:text-[#373737]'
                            }`}
                    >
                        Agenda
                    </button>
                    <button
                        onClick={() => { setActiveTab('constancias'); setIsMobileMenuOpen(false); }}
                        className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap w-full md:w-auto flex justify-center md:inline-block ${activeTab === 'constancias'
                                ? 'bg-white text-[#373737] shadow-sm'
                                : 'text-gray-500 hover:text-[#373737]'
                            }`}
                    >
                        Constancias
                    </button>
                    <button
                        onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
                        className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap w-full md:w-auto flex justify-center md:inline-block ${activeTab === 'users'
                                ? 'bg-white text-[#373737] shadow-sm'
                                : 'text-gray-500 hover:text-[#373737]'
                            }`}
                    >
                        Usuarios
                    </button>
                    <button
                        onClick={() => { setActiveTab('events'); setIsMobileMenuOpen(false); }}
                        className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap w-full md:w-auto flex justify-center md:inline-block ${activeTab === 'events'
                                ? 'bg-white text-[#373737] shadow-sm'
                                : 'text-gray-500 hover:text-[#373737]'
                            }`}
                    >
                        Gestión Eventos
                    </button>
                    <button
                        onClick={() => { setActiveTab('attendance'); setIsMobileMenuOpen(false); }}
                        className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center justify-center gap-2 w-full md:w-auto ${activeTab === 'attendance'
                                ? 'bg-white text-[#373737] shadow-sm'
                                : 'text-gray-500 hover:text-[#373737]'
                            }`}
                    >
                        <QrCode className="h-4 w-4" />
                        Asistencia
                    </button>
                </div>
            </div>

            {/* Right Actions - Absolute Positioned */}
            <div className="w-full md:w-auto md:absolute md:right-2 flex justify-end md:justify-start items-center gap-4 border-t md:border-t-0 pt-1 md:pt-0 border-gray-100 mt-1 md:mt-0">
                <button
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5 md:p-2 hover:bg-red-50 rounded-full group flex items-center gap-2 w-full md:w-auto justify-center md:justify-start"
                    title="Cerrar Sesión"
                >
                    <span className="text-[10px] md:text-xs font-medium group-hover:opacity-100 transition-opacity whitespace-nowrap block">Cerrar Sesión</span>
                    <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                </button>
            </div>
        </div>
    );
}
