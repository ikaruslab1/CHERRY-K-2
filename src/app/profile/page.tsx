'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UserProfileView } from '@/components/profile/UserProfileView';
import { User, Calendar, FileText, Mic, Crown, HelpCircle, LogOut, LayoutDashboard } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'agenda' | 'participation' | 'constancias' | 'faq'>('profile');

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

  const navItems = [
    { id: 'profile', label: t('nav.profile'), icon: <User className="w-5 h-5" />, show: true },
    { id: 'agenda', label: t('nav.agenda'), icon: <Calendar className="w-5 h-5" />, show: true },
    { id: 'constancias', label: t('nav.certificates'), icon: <FileText className="w-5 h-5" />, show: true },
    { id: 'divider-ponente', label: t('nav.tools_speaker'), show: isPonente, isDivider: true },
    { id: 'participation', label: t('nav.participation'), icon: <Mic className="w-5 h-5" />, show: isPonente },
    { id: 'divider-admin', label: 'Administración', show: isAdmin || isStaff, isDivider: true },
    { 
        id: 'admin_portal_link', 
        label: 'Panel Admin', 
        icon: <LayoutDashboard className="w-5 h-5" />, 
        show: isAdmin || isStaff,
        onClick: () => router.push('/admin') 
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
    { id: 'profile', label: t('nav.profile'), icon: <User className="w-5 h-5" />, show: true },
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
      <div className="md:hidden flex justify-between items-center mb-4 pt-4 px-6 relative z-10">
          <div className="flex flex-col">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Cherry K-2</span>
              <h2 className="text-sm font-black uppercase tracking-wider leading-tight max-w-[200px] truncate text-[var(--foreground)]" title={currentConference?.title || 'Cherry-K'}>
                  {currentConference?.title || 'Cherry-K'}
              </h2>
          </div>
          <div className="flex items-center gap-3">
              {isAdmin || isStaff ? (
                  <button 
                      onClick={() => router.push('/admin')}
                      className="bg-[var(--color-acid)] text-black border border-black/10 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer"
                  >
                      Admin
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

      <div className="p-4 md:p-8 min-h-screen flex flex-col">
        <ResponsiveNav 
          items={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSignOut={handleSignOut}
          onFAQClick={handleFAQClick}
          isFAQActive={isFAQActive}
          hideMobileToggle={true}
        />
        
        <div className="max-w-4xl mx-auto space-y-8 mt-4 md:mt-0 flex-1 w-full relative z-10">
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

    </SidebarAwareContainer>
  );
}
