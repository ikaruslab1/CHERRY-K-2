'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { ProfileDetailsView } from '@/components/profile/ProfileDetailsView';
import { User, Calendar, FileText, Mic, Crown, HelpCircle, LogOut, LayoutDashboard, Settings, QrCode, X, IdCard } from 'lucide-react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveNav } from '@/components/layout/ResponsiveNav';
import { SidebarAwareContainer } from '@/components/layout/SidebarAwareContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useConference } from '@/context/ConferenceContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-acid)]"></div>
    </div>
);

const AgendaView = dynamic(() => import('@/components/events/AgendaView').then(mod => mod.AgendaView), {
    loading: () => <LoadingSpinner />,
    ssr: false
});

const ParticipationView = dynamic(() => import('@/components/profile/ParticipationView').then(mod => mod.ParticipationView), {
    loading: () => <LoadingSpinner />,
    ssr: false
});

const FAQView = dynamic(() => import('@/components/faq/FAQView').then(mod => mod.FAQView), {
    loading: () => <LoadingSpinner />,
    ssr: false
});

const CertificatesView = dynamic(() => import('@/components/profile/CertificatesView').then(mod => mod.CertificatesView), {
    loading: () => <LoadingSpinner />,
    ssr: false
});

export default function ProfilePage() {
  const router = useRouter();
  const { currentConference } = useConference();
  const { t } = useLanguage();
  const { loading: authLoading, userRole } = useRoleAuth();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'gafete' | 'agenda' | 'participation' | 'constancias' | 'faq'>('profile');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const isStaff = userRole === 'staff';
  const isPonente = userRole === 'ponente';
  const isOwner = userRole === 'owner';

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

  const handleGearClick = () => {
      if (isOwner) {
          setIsRoleModalOpen(true);
      } else if (userRole === 'staff') {
          router.push('/staff');
      } else if (userRole === 'admin' || isAdmin) {
          router.push('/admin');
      }
  };

  const navItems = [
    { id: 'profile', label: 'Perfil', icon: <User className="w-5 h-5" />, show: true },
    { id: 'gafete', label: 'Gafete Digital', icon: <IdCard className="w-5 h-5" />, show: true },
    { id: 'agenda', label: t('nav.agenda'), icon: <Calendar className="w-5 h-5" />, show: true },
    { id: 'constancias', label: t('nav.certificates'), icon: <FileText className="w-5 h-5" />, show: true },
    { id: 'divider-ponente', label: t('nav.tools_speaker'), show: isPonente, isDivider: true },
    { id: 'participation', label: t('nav.participation'), icon: <Mic className="w-5 h-5" />, show: isPonente },
    { id: 'divider-admin', label: 'Administración', show: isAdmin || isStaff, isDivider: true },
    { 
        id: 'admin_portal_link', 
        label: isStaff && !isAdmin ? 'Panel Staff' : 'Panel Admin', 
        icon: <LayoutDashboard className="w-5 h-5" />, 
        show: isAdmin || isStaff,
        onClick: () => router.push(isStaff && !isAdmin ? '/staff' : '/admin') 
    },
    { id: 'divider-owner', label: t('nav.tools_owner'), show: isOwner, isDivider: true },
    { 
        id: 'owner_link', 
        label: t('nav.panel_owner'), 
        icon: <Crown className="w-5 h-5" />, 
        show: isOwner,
        onClick: () => router.push('/owner') 
    }
  ];

  const bottomNavItems = [
    { id: 'profile', label: 'Perfil', icon: <User className="w-5 h-5" />, show: true },
    { id: 'gafete', label: 'Gafete', icon: <IdCard className="w-5 h-5" />, show: true },
    { id: 'agenda', label: t('nav.agenda'), icon: <Calendar className="w-5 h-5" />, show: true },
    { id: 'constancias', label: t('nav.certificates'), icon: <FileText className="w-5 h-5" />, show: true },
    { id: 'participation', label: t('nav.participation'), icon: <Mic className="w-5 h-5" />, show: isPonente },
    { id: 'faq', label: t('nav.faq'), icon: <HelpCircle className="w-5 h-5" />, show: true }
  ];

  if (loading) {
    return (
      <SidebarAwareContainer className="min-h-screen p-8 bg-[#050505] text-[#f2f2f2]">
        <div className="md:hidden flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
            <Skeleton className="h-8 w-32 bg-white/5" />
        </div>
        <div className="max-w-4xl mx-auto space-y-8 mt-12 md:mt-0">
            <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-32 flex-shrink-0 rounded-full bg-white/5" />
                ))}
            </div>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                     <Skeleton className="h-24 w-24 rounded-full bg-white/5" />
                     <div className="space-y-3 w-full max-w-sm text-center md:text-left">
                        <Skeleton className="h-8 w-3/4 mx-auto md:mx-0 bg-white/5" />
                        <Skeleton className="h-4 w-1/2 mx-auto md:mx-0 bg-white/5" />
                        <Skeleton className="h-4 w-full mx-auto md:mx-0 bg-white/5" />
                     </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
                     <Skeleton className="h-48 w-full rounded-2xl bg-white/5" />
                </div>
            </div>
        </div>
      </SidebarAwareContainer>
    );
  }

  const isFAQActive = activeTab === 'faq';
  const handleFAQClick = () => setActiveTab('faq');

  return (
    <SidebarAwareContainer className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-24 md:pb-8">
      {/* Mobile Top Header */}
      <div className="md:hidden flex justify-between items-center pt-3 pb-2 px-4 relative z-10 w-full overflow-hidden">
          <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Cherry K-2</span>
              <h2 className="text-sm font-black uppercase tracking-wider leading-tight max-w-[120px] xs:max-w-[180px] truncate text-[var(--foreground)]" title={currentConference?.title || 'Cherry-K'}>
                  {currentConference?.title || 'Cherry-K'}
              </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
              {isOwner || isAdmin || isStaff ? (
                  <button 
                      onClick={handleGearClick}
                      className="p-2 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 rounded-xl shrink-0 transition-all active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer flex items-center justify-center"
                      title={isOwner ? 'Seleccionar Panel' : (isStaff && !isAdmin ? 'Panel Staff' : 'Panel Admin')}
                  >
                      <Settings className="w-4 h-4 transition-transform duration-300 hover:rotate-45" style={{ color: 'var(--color-acid)' }} />
                  </button>
              ) : null}
              <ThemeToggle className="!w-auto !p-2 shrink-0 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 border-transparent hover:border-[var(--border)]" />
              <button 
                  onClick={handleSignOut}
                  className="p-2 bg-gray-50 dark:bg-white/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors rounded-xl border border-gray-200 dark:border-white/5 cursor-pointer"
                  title={t('nav.logout')}
              >
                  <LogOut className="w-4 h-4" />
              </button>
          </div>
      </div>

      <div className="px-4 py-2 xs:py-3 md:p-8 min-h-screen flex flex-col">
        <ResponsiveNav 
          items={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSignOut={handleSignOut}
          onFAQClick={handleFAQClick}
          isFAQActive={isFAQActive}
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
                      {activeTab === 'profile' && <ProfileDetailsView />}
                      {activeTab === 'gafete' && <UserProfileView />}
                      {activeTab === 'agenda' && <AgendaView />}
                      {activeTab === 'constancias' && <CertificatesView />}
                      {isPonente && activeTab === 'participation' && <ParticipationView />}
                      {activeTab === 'faq' && <FAQView defaultRole={userRole || undefined} />}
                  </motion.div>
               </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating Bottom Nav for Mobile View */}
      <BottomNav 
        items={bottomNavItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Role Selection Modal for Owner */}
      <AnimatePresence>
        {isOwner && isRoleModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setIsRoleModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 p-6 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                    <Crown className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider">
                      Seleccionar Panel
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Elige el portal al que deseas ingresar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Role Action Cards */}
              <div className="space-y-3">
                {/* Admin Panel Card */}
                <button
                  onClick={() => {
                    setIsRoleModalOpen(false);
                    router.push('/admin');
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-lime-500/10 dark:hover:bg-lime-500/15 border border-gray-200/80 dark:border-zinc-700/60 hover:border-lime-500/40 transition-all text-left group cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-lime-500/15 dark:bg-lime-500/20 flex items-center justify-center shrink-0 border border-lime-500/30 group-hover:scale-110 transition-transform">
                    <LayoutDashboard className="w-5 h-5" style={{ color: 'var(--color-acid)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Panel Admin</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-600 dark:text-lime-400 font-bold border border-lime-500/20">Admin</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      Gestión de eventos, agenda y métricas
                    </p>
                  </div>
                </button>

                {/* Staff Panel Card */}
                <button
                  onClick={() => {
                    setIsRoleModalOpen(false);
                    router.push('/staff');
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-blue-500/10 dark:hover:bg-blue-500/15 border border-gray-200/80 dark:border-zinc-700/60 hover:border-blue-500/40 transition-all text-left group cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 dark:bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <QrCode className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Panel Staff</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">Staff</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      Escáner de asistencia QR y accesos
                    </p>
                  </div>
                </button>

                {/* Owner Panel Card */}
                <button
                  onClick={() => {
                    setIsRoleModalOpen(false);
                    router.push('/owner');
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 border border-gray-200/80 dark:border-zinc-700/60 hover:border-amber-500/40 transition-all text-left group cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <Crown className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Panel Owner</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">Owner</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      Administración global y plataforma
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </SidebarAwareContainer>
  );
}
