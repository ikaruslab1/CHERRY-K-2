'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useConference } from '@/context/ConferenceContext';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Award, 
  Palette, 
  Code, 
  QrCode, 
  User, 
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { ResponsiveNav } from '@/components/layout/ResponsiveNav';
import { SidebarAwareContainer } from '@/components/layout/SidebarAwareContainer';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { currentConference } = useConference();
  const { loading, isAuthorized, userRole } = useRoleAuth(['admin', 'owner', 'staff'], '/profile');

  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isStaff = userRole === 'staff';

  // Redirect Staff away from admin root metrics
  React.useEffect(() => {
    if (!loading && isAuthorized && isStaff && pathname === '/admin') {
      router.push('/admin/scanner');
    }
  }, [loading, isAuthorized, isStaff, pathname, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Map paths to active tabs
  const getActiveTab = () => {
    if (pathname === '/admin') return 'metrics';
    if (pathname.startsWith('/admin/events')) return 'events';
    if (pathname.startsWith('/admin/users')) return 'users';
    if (pathname.startsWith('/admin/certificates')) return 'design-certificates';
    if (pathname.startsWith('/admin/landing')) return 'landing-editor';
    if (pathname.startsWith('/admin/embeddings')) return 'embeddings';
    if (pathname.startsWith('/admin/scanner')) return 'attendance';
    return '';
  };

  const activeTab = getActiveTab();

  const navItems = [
    { 
      id: 'profile_link', 
      label: 'Volver a mi Perfil', 
      icon: <ArrowLeft className="w-5 h-5" />, 
      show: true,
      onClick: () => router.push('/profile')
    },
    { id: 'divider-admin-tools', label: 'Herramientas de Control', show: true, isDivider: true },
    { 
      id: 'attendance', 
      label: t('nav.attendance'), 
      icon: <QrCode className="w-5 h-5" />, 
      show: true,
      onClick: () => router.push('/admin/scanner')
    },
    { 
      id: 'users', 
      label: t('nav.users'), 
      icon: <Users className="w-5 h-5" />, 
      show: true,
      onClick: () => router.push('/admin/users')
    },
    { 
      id: 'events', 
      label: t('nav.events_management'), 
      icon: <Settings className="w-5 h-5" />, 
      show: isAdmin,
      onClick: () => router.push('/admin/events')
    },
    { 
      id: 'metrics', 
      label: t('nav.dashboard_metrics'), 
      icon: <LayoutDashboard className="w-5 h-5" />, 
      show: isAdmin,
      onClick: () => router.push('/admin')
    },
    { 
      id: 'embeddings', 
      label: t('nav.embeddings'), 
      icon: <Code className="w-5 h-5" />, 
      show: isAdmin,
      onClick: () => router.push('/admin/embeddings')
    },
    { 
      id: 'design-certificates', 
      label: t('nav.design_certificates'), 
      icon: <Award className="w-5 h-5" />, 
      show: isAdmin,
      onClick: () => router.push('/admin/certificates')
    },
    { 
      id: 'landing-editor', 
      label: t('nav.design_landing'), 
      icon: <Palette className="w-5 h-5" />, 
      show: isAdmin,
      onClick: () => router.push('/admin/landing')
    }
  ];

  const bottomNavItems = [
    { id: 'profile_link', label: 'Mi Perfil', icon: <ArrowLeft className="w-5 h-5" />, show: true },
    { id: 'attendance', label: 'Asistencia', icon: <QrCode className="w-5 h-5" />, show: true },
    { id: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5" />, show: true },
    { id: 'metrics', label: 'Métricas', icon: <LayoutDashboard className="w-5 h-5" />, show: isAdmin }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--foreground)]"></div>
          <span>Cargando panel de control...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect via useRoleAuth
  }

  // Check if we are on a full-width visual editor page
  const isFullWidthPage = pathname.startsWith('/admin/certificates') || pathname.startsWith('/admin/landing');

  const handleBottomNavAction = (id: string) => {
    if (id === 'profile_link') router.push('/profile');
    else if (id === 'attendance') router.push('/admin/scanner');
    else if (id === 'users') router.push('/admin/users');
    else if (id === 'metrics') router.push('/admin');
  };

  if (isFullWidthPage) {
    return (
      <div className="min-h-screen bg-[var(--background)] pb-24 md:pb-0">
        <ResponsiveNav 
          items={navItems}
          activeTab={activeTab}
          setActiveTab={() => {}}
          handleSignOut={handleSignOut}
          hideMobileToggle={true}
        />
        <div className="mt-12 md:mt-0 h-[calc(100vh-48px)] md:h-screen">
          {children}
        </div>
        <BottomNav 
          items={bottomNavItems}
          activeTab={activeTab}
          setActiveTab={handleBottomNavAction}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 md:pb-0">
      <ResponsiveNav 
        items={navItems}
        activeTab={activeTab}
        setActiveTab={() => {}}
        handleSignOut={handleSignOut}
        hideMobileToggle={true}
      />
      <SidebarAwareContainer className="p-4 md:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8 mt-12 md:mt-0">
          {children}
        </div>
      </SidebarAwareContainer>
      <BottomNav 
        items={bottomNavItems}
        activeTab={activeTab}
        setActiveTab={handleBottomNavAction}
      />
    </div>
  );
}
