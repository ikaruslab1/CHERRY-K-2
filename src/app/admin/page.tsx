'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UsersTable } from '@/components/admin/UsersTable';
import { EventsManager } from '@/components/admin/EventsManager';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { AgendaView } from '@/components/events/AgendaView';
import AttendanceView from '@/views/admin/AttendanceView';
import { LogOut, Loader2, QrCode, ChevronDown, ChevronUp } from 'lucide-react';

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'agenda' | 'users' | 'events' | 'attendance'>(
      (searchParams.get('tab') as any) || 'profile'
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        router.push('/profile');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      router.push('/');
  };

  // Removed page blocking loader
  /*if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white text-[#373737]">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      );
  }*/

  if (loading) return null; // Or return a skeleton, but for now just null or the layout to prevent flashing unauth content? 
  // Actually, if we return layout, we might show unauth data. 
  // But wait, the previous code returned a loader.
  // The user said "Elimina el spin".
  // If I return <main>..., it will render.
  // Let's rely on the router push if unauthorized, and maybe show an empty div or the layout structure.
  // For 'smooth appearance', maybe showing the layout (header) is better.

  return (
    <main className="min-h-screen p-4 xs:p-6 md:p-8 bg-gray-50 text-[#373737]">
      <div className="max-w-6xl mx-auto space-y-6 xs:space-y-8">
        {/* Header with Pills & Actions */}
        <div className="relative flex flex-col md:flex-row justify-center items-center bg-white/80 backdrop-blur-sm p-2 md:p-2 rounded-2xl sticky top-4 z-50 gap-2 md:gap-0 shadow-sm border border-gray-100/50">
            
            {/* Tabs & Pills */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center w-full md:w-auto gap-2 md:gap-1 bg-gray-100/50 p-2 md:p-1 rounded-xl transition-all duration-300">
                
                {/* Mobile Header: Profile + Toggle */}
                <div className="flex flex-row gap-1 w-full md:w-auto">
                    <button 
                        onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                        className={`flex-1 md:flex-none px-4 py-2 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap md:w-auto flex justify-center md:inline-block items-center gap-2 ${
                            activeTab === 'profile' 
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
                        className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap w-full md:w-auto flex justify-center md:inline-block ${
                            activeTab === 'agenda' 
                            ? 'bg-white text-[#373737] shadow-sm' 
                            : 'text-gray-500 hover:text-[#373737]'
                        }`}
                    >
                        Agenda
                    </button>
                    <button 
                        onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }}
                        className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap w-full md:w-auto flex justify-center md:inline-block ${
                            activeTab === 'users' 
                            ? 'bg-white text-[#373737] shadow-sm' 
                            : 'text-gray-500 hover:text-[#373737]'
                        }`}
                    >
                        Usuarios
                    </button>
                    <button 
                        onClick={() => { setActiveTab('events'); setIsMobileMenuOpen(false); }}
                        className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap w-full md:w-auto flex justify-center md:inline-block ${
                            activeTab === 'events' 
                            ? 'bg-white text-[#373737] shadow-sm' 
                            : 'text-gray-500 hover:text-[#373737]'
                        }`}
                    >
                        Gestión Eventos
                    </button>
                    <button 
                        onClick={() => { setActiveTab('attendance'); setIsMobileMenuOpen(false); }}
                        className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center justify-center gap-2 w-full md:w-auto ${
                            activeTab === 'attendance' 
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

        <div key={activeTab} className="p-0 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'profile' && <UserProfileView />}
            {activeTab === 'agenda' && <AgendaView />}
            {activeTab === 'users' && <UsersTable />}
            {activeTab === 'events' && <EventsManager />}
            {activeTab === 'attendance' && <AttendanceView />}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-[#373737]">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      }>
      <AdminContent />
    </Suspense>
  );
}
