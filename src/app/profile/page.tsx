
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
import { Skeleton } from '@/components/ui/Skeleton';

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


// ... inside component

  if (loading) {
    return (
      <SidebarAwareContainer className="min-h-screen p-8 bg-gray-50">
        {/* Mobile Nav Skeleton */}
        <div className="md:hidden flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-32" />
        </div>

        <div className="max-w-4xl mx-auto space-y-8 mt-12 md:mt-0">
            {/* Header / Tabs Skeleton */}
            <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-32 flex-shrink-0 rounded-full" />
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                     <Skeleton className="h-24 w-24 rounded-full" />
                     <div className="space-y-3 w-full max-w-sm text-center md:text-left">
                        <Skeleton className="h-8 w-3/4 mx-auto md:mx-0" />
                        <Skeleton className="h-4 w-1/2 mx-auto md:mx-0" />
                        <Skeleton className="h-4 w-full mx-auto md:mx-0" />
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Skeleton className="h-48 w-full rounded-2xl" />
                     <Skeleton className="h-48 w-full rounded-2xl" />
                     <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
            </div>
        </div>
      </SidebarAwareContainer>
    );
  }

  return (
    <SidebarAwareContainer className="min-h-screen p-4 md:p-8 bg-gray-50 text-[#373737]">
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
