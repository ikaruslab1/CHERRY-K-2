
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { AgendaView } from '@/components/events/AgendaView';
import { UsersTable } from '@/components/admin/UsersTable';
import { EventsManager } from '@/components/admin/EventsManager';
import AttendanceView from '@/views/admin/AttendanceView';
import { ParticipationView } from '@/components/profile/ParticipationView';
import { User, Calendar, FileText, Mic, QrCode, Users, Settings, LayoutDashboard, Award } from 'lucide-react';
import { CertificatesView } from '@/components/profile/CertificatesView';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveNav } from '@/components/layout/ResponsiveNav';
import { SidebarAwareContainer } from '@/components/layout/SidebarAwareContainer';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'agenda' | 'users' | 'events' | 'attendance' | 'participation' | 'constancias'>('profile');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isPonente, setIsPonente] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[PROFILE] Starting session check...');
        
        // With createBrowserClient, session should be available quickly
        let user = null;
        let attempts = 0;
        const maxAttempts = 10; // Reduced to 1 second
        
        while (!user && attempts < maxAttempts) {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          console.log(`[PROFILE] Attempt ${attempts + 1}/${maxAttempts}:`, currentUser ? '✓ User found' : '✗ Not found');
          
          if (currentUser) {
            user = currentUser;
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!user) {
          console.log('[PROFILE] No user found, redirecting to login');
          router.push('/');
          return;
        }

        console.log('[PROFILE] ✓ User authenticated, loading profile...');

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        console.log('[PROFILE] Profile data loaded:', profile?.role);
        
        if (profile?.role) {
            setUserRole(profile.role);
        }

        if (profile?.role === 'admin') {
           setIsAdmin(true);
        } else if (profile?.role === 'staff') {
           setIsStaff(true);
        } else if (profile?.role === 'ponente') {
           setIsPonente(true);
        } else if (profile?.role === 'owner') {
           setIsOwner(true);
           setIsAdmin(true);
        }

        console.log('[PROFILE] ✓ Profile loaded successfully');
        setLoading(false);
      } catch (error) {
        console.error('[PROFILE] Error in loadData:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      router.push('/');
  };

const navItems = [
    { id: 'profile', label: 'Mi Perfil', icon: <User className="w-5 h-5" />, show: true },
    { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" />, show: true },
    { id: 'constancias', label: 'Constancias', icon: <FileText className="w-5 h-5" />, show: true },
    { id: 'participation', label: 'Participación', icon: <Mic className="w-5 h-5" />, show: isPonente },
    { id: 'attendance', label: 'Asistencia', icon: <QrCode className="w-5 h-5" />, show: isAdmin || isStaff },
    { id: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5" />, show: isAdmin },
    { id: 'events', label: 'Gestión Eventos', icon: <Settings className="w-5 h-5" />, show: isAdmin },
    { 
        id: 'design-certificates', 
        label: 'Diseño de Constancias', 
        icon: <Award className="w-5 h-5" />, 
        show: isAdmin,
        onClick: () => router.push('/admin?tab=design-certificates')
    },
    { 
        id: 'owner_link', 
        label: 'Panel Owner', 
        icon: <LayoutDashboard className="w-5 h-5" />, 
        show: isOwner,
        onClick: () => router.push('/owner') 
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#373737]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-[#373737] rounded-full" />
          <p className="text-sm font-medium text-gray-500 animate-pulse">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarAwareContainer className="min-h-screen p-8 bg-gray-50 text-[#373737]">
      <ResponsiveNav 
        items={navItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleSignOut={handleSignOut}
      />
      
      <div className="max-w-4xl mx-auto space-y-8 mt-12 md:mt-0">

        <div className="p-0 min-h-[500px]">
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'profile' && <UserProfileView />}
                    {activeTab === 'agenda' && <AgendaView />}
                    {activeTab === 'constancias' && <CertificatesView />}
                    {isPonente && activeTab === 'participation' && <ParticipationView />}
                    {(isAdmin || isStaff) && activeTab === 'attendance' && <AttendanceView />}
                    {isAdmin && activeTab === 'users' && <UsersTable currentUserRole={userRole} />}
                    {isAdmin && activeTab === 'events' && <EventsManager />}
                </motion.div>
             </AnimatePresence>
        </div>
      </div>
    </SidebarAwareContainer>
  );
}
