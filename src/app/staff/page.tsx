'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { AgendaView } from '@/components/events/AgendaView';
import StaffAttendanceView from '@/views/staff/AttendanceView';
import { CertificatesView } from '@/components/profile/CertificatesView';
import { UsersTable } from '@/components/admin/UsersTable';
import { LogOut, QrCode, Users, Calendar, FileText, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveNav } from '@/components/layout/ResponsiveNav';
import { SidebarAwareContainer } from '@/components/layout/SidebarAwareContainer';
import { BottomNav } from '@/components/layout/BottomNav';

export default function StaffPage() {
  const router = useRouter();
  const { loading, isAuthorized } = useRoleAuth(['staff', 'admin']);
  const [activeTab, setActiveTab] = useState<'profile' | 'agenda' | 'users' | 'scanner' | 'constancias'>('scanner');

  const handleSignOut = async () => {
      await supabase.auth.signOut();
      router.push('/');
  };

  const navItems = [
    { 
      id: 'profile_link', 
      label: 'Volver al Perfil', 
      icon: <ArrowLeft className="w-5 h-5" />, 
      show: true,
      onClick: () => router.push('/profile')
    },
    { id: 'divider-staff-tools', label: 'Herramientas Staff', show: true, isDivider: true },
    { 
      id: 'scanner', 
      label: 'Asistencia', 
      icon: <QrCode className="w-5 h-5" />, 
      show: true,
      onClick: () => setActiveTab('scanner')
    },
    { 
      id: 'users', 
      label: 'Usuarios', 
      icon: <Users className="w-5 h-5" />, 
      show: true,
      onClick: () => setActiveTab('users')
    },
    { 
      id: 'agenda', 
      label: 'Agenda', 
      icon: <Calendar className="w-5 h-5" />, 
      show: true,
      onClick: () => setActiveTab('agenda')
    },
    { 
      id: 'constancias', 
      label: 'Constancias', 
      icon: <FileText className="w-5 h-5" />, 
      show: true,
      onClick: () => setActiveTab('constancias')
    }
  ];

  const bottomNavItems = [
    { id: 'profile_link', label: 'Mi Perfil', icon: <ArrowLeft className="w-5 h-5" />, show: true },
    { id: 'scanner', label: 'Scanner', icon: <QrCode className="w-5 h-5" />, show: true },
    { id: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5" />, show: true },
    { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" />, show: true },
    { id: 'constancias', label: 'Constancias', icon: <FileText className="w-5 h-5" />, show: true }
  ];

  if (loading || !isAuthorized) return null;

  const handleBottomNavAction = (id: string) => {
    if (id === 'profile_link') {
      router.push('/profile');
    } else {
      setActiveTab(id as any);
    }
  };

  return (
    <SidebarAwareContainer className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 md:pb-8">
      <div className="px-4 py-3 md:p-8 min-h-screen flex flex-col">
        <ResponsiveNav 
          items={navItems}
          activeTab={activeTab}
          setActiveTab={(id) => {
            const item = navItems.find(i => i.id === id);
            if (item && item.onClick) {
              item.onClick();
            } else {
              setActiveTab(id as any);
            }
          }}
          handleSignOut={handleSignOut}
          hideMobileToggle={true}
        />
        
        <div className="max-w-4xl mx-auto space-y-6 mt-0 md:mt-0 flex-1 w-full relative z-10">
          <div className="p-0 min-h-0">
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
                       {activeTab === 'users' && <UsersTable readOnly />}
                       {activeTab === 'scanner' && <StaffAttendanceView />}
                  </motion.div>
               </AnimatePresence>
          </div>
        </div>
      </div>

      <BottomNav 
        items={bottomNavItems}
        activeTab={activeTab}
        setActiveTab={handleBottomNavAction}
      />
    </SidebarAwareContainer>
  );
}
