'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { AgendaView } from '@/components/events/AgendaView';
import StaffAttendanceView from '@/views/staff/AttendanceView';
import { LogOut, Loader2, QrCode } from 'lucide-react';

export default function StaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'agenda' | 'scanner'>('scanner');
  const [authorized, setAuthorized] = useState(false);

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
      
      if (!profile || (profile.role !== 'staff' && profile.role !== 'admin')) {
        router.push('/profile');
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      router.push('/');
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white text-[#373737]">
          <Loader2 className="h-8 w-8 animate-spin text-[#DBF227]" />
        </div>
      );
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-[#373737]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Pills & Actions */}
        <div className="relative flex justify-center items-center bg-white/80 backdrop-blur-sm p-2 rounded-2xl sticky top-4 z-50">
            
            {/* Tabs & Pills */}
            <div className="flex items-center space-x-1 bg-gray-100/50 p-1 rounded-xl overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                        activeTab === 'profile' 
                        ? 'bg-white text-[#373737] shadow-sm' 
                        : 'text-gray-500 hover:text-[#373737]'
                    }`}
                >
                    Mi Perfil
                </button>
                <button 
                    onClick={() => setActiveTab('agenda')}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                        activeTab === 'agenda' 
                        ? 'bg-white text-[#373737] shadow-sm' 
                        : 'text-gray-500 hover:text-[#373737]'
                    }`}
                >
                    Agenda
                </button>
                <button 
                    onClick={() => setActiveTab('scanner')}
                    className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                        activeTab === 'scanner' 
                        ? 'bg-white text-[#373737] shadow-sm' 
                        : 'text-gray-500 hover:text-[#373737]'
                    }`}
                >
                    <QrCode className="h-4 w-4" />
                    Asistencia
                </button>
            </div>

            {/* Right Actions - Absolute Positioned */}
            <div className="absolute right-2 flex items-center gap-4">
                 <button 
                    onClick={handleSignOut}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full group flex items-center gap-2"
                    title="Cerrar Sesión"
                 >
                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">Cerrar Sesión</span>
                    <LogOut className="h-5 w-5" />
                 </button>
            </div>
        </div>

        <div key={activeTab} className="p-0 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
             {activeTab === 'profile' && <UserProfileView />}
             {activeTab === 'agenda' && <AgendaView />}
             {activeTab === 'scanner' && <StaffAttendanceView />}
        </div>
      </div>
    </main>
  );
}
