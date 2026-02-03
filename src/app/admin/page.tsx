'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UsersTable } from '@/components/admin/UsersTable';
import { EventsManager } from '@/components/admin/EventsManager';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { AgendaView } from '@/components/events/AgendaView';
import AttendanceView from '@/views/admin/AttendanceView';
import { CertificatesView } from '@/components/profile/CertificatesView';
import { LogOut, Loader2, QrCode, User, Calendar, FileText, Users, CalendarRange } from 'lucide-react';

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'agenda' | 'users' | 'events' | 'attendance' | 'constancias'>(
      (searchParams.get('tab') as any) || 'profile'
  );


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

        {/* Navigation Bar */}
        <div className="sticky top-4 z-50">
            <nav className="flex items-center gap-2 p-1.5 md:p-2 bg-white/80 backdrop-blur-md border border-gray-100/50 shadow-sm rounded-2xl overflow-hidden">
                <div className="flex-1 flex items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                     {/* Profile */}
                     <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === 'profile' 
                            ? 'bg-gray-100 text-[#373737] shadow-sm' 
                            : 'text-gray-500 hover:text-[#373737] hover:bg-gray-50'
                        }`}
                    >
                        <User className="h-4 w-4 md:h-5 md:w-5" />
                        <span className="hidden xs:inline">Mi Perfil</span>
                    </button>

                    <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />

                     {/* Main Nav Items */}
                    {[
                        { id: 'agenda', label: 'Agenda', icon: Calendar },
                        { id: 'constancias', label: 'Constancias', icon: FileText },
                        { id: 'users', label: 'Usuarios', icon: Users },
                        { id: 'events', label: 'Eventos', icon: CalendarRange },
                        { id: 'attendance', label: 'Asistencia', icon: QrCode },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <button 
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                                    activeTab === item.id 
                                    ? 'bg-[#dbf227] text-[#373737] shadow-sm' 
                                    : 'text-gray-500 hover:text-[#373737] hover:bg-gray-50'
                                }`}
                                title={item.label}
                            >
                                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                                <span className={`${activeTab === item.id ? 'inline' : 'hidden md:inline'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Logout */}
                <div className="pl-2 border-l border-gray-100 ml-auto flex-shrink-0">
                    <button 
                        onClick={handleSignOut}
                        className="p-2 md:px-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                        <span className="hidden md:inline text-xs font-medium">Salir</span>
                    </button>
                </div>
            </nav>
        </div>

        <div key={activeTab} className="p-0 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === 'profile' && <UserProfileView />}
            {activeTab === 'agenda' && <AgendaView />}
            {activeTab === 'constancias' && <CertificatesView />}
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
