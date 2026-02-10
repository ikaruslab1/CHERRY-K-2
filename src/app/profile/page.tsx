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
import { MetricsView } from '@/components/admin/metrics/MetricsView';
import { CertificateDesignView } from '@/components/admin/CertificateDesignView';
import { User, Calendar, FileText, Mic, QrCode, Users, Settings, LayoutDashboard, Award, Crown } from 'lucide-react';
import { CertificatesView } from '@/components/profile/CertificatesView';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveNav } from '@/components/layout/ResponsiveNav';
import { SidebarAwareContainer } from '@/components/layout/SidebarAwareContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { useConference } from '@/context/ConferenceContext';
import { useRoleAuth } from '@/hooks/useRoleAuth';

export default function ProfilePage() {
  const router = useRouter();
  const { currentConference } = useConference();
  const { loading: authLoading, userRole } = useRoleAuth();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'agenda' | 'users' | 'events' | 'metrics' | 'attendance' | 'participation' | 'constancias' | 'design-certificates'>('profile');

  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isStaff = userRole === 'staff';
  const isPonente = userRole === 'ponente';
  const isOwner = userRole === 'owner';

  console.log('[ProfilePage] Current State -> userRole:', userRole, 'isAdmin:', isAdmin, 'isStaff:', isStaff);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setSessionLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const loading = authLoading || sessionLoading;

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      router.push('/');
  };

  const navItems = [
    { id: 'profile', label: 'Mi Perfil', icon: <User className="w-5 h-5" />, show: true },
    { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" />, show: true },
    { id: 'constancias', label: 'Constancias', icon: <FileText className="w-5 h-5" />, show: true },
    { id: 'divider-ponente', label: 'Herramientas del Ponente', show: isPonente, isDivider: true },
    { id: 'participation', label: 'Participación', icon: <Mic className="w-5 h-5" />, show: isPonente },
    { id: 'divider-admin', label: isStaff ? 'Herramientas del Staff' : 'Herramientas de Administrador', show: isAdmin || isStaff, isDivider: true },
    { id: 'attendance', label: 'Asistencia', icon: <QrCode className="w-5 h-5" />, show: isAdmin || isStaff },
    { id: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5" />, show: isAdmin || isStaff },
    { id: 'events', label: 'Gestión Eventos', icon: <Settings className="w-5 h-5" />, show: isAdmin },
    { id: 'metrics', label: 'Dashboard Métricas', icon: <LayoutDashboard className="w-5 h-5" />, show: isAdmin },
    { 
        id: 'design-certificates', 
        label: 'Diseño de Constancias', 
        icon: <Award className="w-5 h-5" />, 
        show: isAdmin
    },
    { id: 'divider-owner', label: 'Herramienta de Owner', show: isOwner, isDivider: true },
    { 
        id: 'owner_link', 
        label: 'Panel Owner', 
        icon: <Crown className="w-5 h-5" />, 
        show: isOwner,
        onClick: () => router.push('/owner') 
    }
  ];

  if (loading) {
    return (
      <SidebarAwareContainer className="min-h-screen p-8 bg-gray-50">
        <div className="md:hidden flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-32" />
        </div>
        <div className="max-w-4xl mx-auto space-y-8 mt-12 md:mt-0">
            <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-32 flex-shrink-0 rounded-full" />
                ))}
            </div>
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
                </div>
            </div>
        </div>
      </SidebarAwareContainer>
    );
  }

  return (
    <SidebarAwareContainer className="min-h-screen bg-gray-50 text-[#373737]">
      <div className="p-4 md:p-8 min-h-screen flex flex-col">
          <ResponsiveNav 
            items={navItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleSignOut={handleSignOut}
          />
          
          <div className="max-w-4xl mx-auto space-y-8 mt-12 md:mt-0 flex-1 w-full">
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
                        {(isAdmin || isStaff) && activeTab === 'users' && <UsersTable readOnly={isStaff} currentUserRole={userRole || undefined} />}
                        {isAdmin && activeTab === 'events' && <EventsManager />}
                        {isAdmin && activeTab === 'metrics' && <MetricsView />}
                        {isAdmin && activeTab === 'design-certificates' && <CertificateDesignView />}
                    </motion.div>
                 </AnimatePresence>
            </div>
          </div>
      </div>
    </SidebarAwareContainer>
  );
}
