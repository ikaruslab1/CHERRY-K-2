'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { ResponsiveNav } from '@/components/layout/ResponsiveNav';
import { SidebarAwareContainer } from '@/components/layout/SidebarAwareContainer';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { Loader2, User, Calendar, FileText, QrCode, Users, Settings, Award, LayoutDashboard } from 'lucide-react';
import { FAQView } from '@/components/faq/FAQView';

// ... imports

const UsersTable = dynamic(() => import('@/components/admin/UsersTable').then(mod => mod.UsersTable), {
    loading: () => <LoadingSpinner />,
    ssr: false
});
const EventsManager = dynamic(() => import('@/components/admin/EventsManager').then(mod => mod.EventsManager), {
    loading: () => <LoadingSpinner />,
    ssr: false
});
const UserProfileView = dynamic(() => import('@/components/profile/UserProfileView').then(mod => mod.UserProfileView), {
    loading: () => <LoadingSpinner />,
    ssr: false
});
const AgendaView = dynamic(() => import('@/components/events/AgendaView').then(mod => mod.AgendaView), {
    loading: () => <LoadingSpinner />,
    ssr: false
});
const AttendanceView = dynamic(() => import('@/views/admin/AttendanceView'), {
    loading: () => <LoadingSpinner />,
    ssr: false
});
const CertificatesView = dynamic(() => import('@/components/profile/CertificatesView').then(mod => mod.CertificatesView), {
    loading: () => <LoadingSpinner />,
    ssr: false
});
const CertificateDesignView = dynamic(() => import('@/components/admin/CertificateDesignView').then(mod => mod.CertificateDesignView), {
    loading: () => <LoadingSpinner />,
    ssr: false
});

// ... rest of the file

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
    );
}

function AdminContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loading, isAuthorized, userRole } = useRoleAuth(['admin', 'owner']);
    
    // Initialize state from URL params only once
    const [activeTab, setActiveTab] = useState<'profile' | 'agenda' | 'users' | 'events' | 'attendance' | 'constancias' | 'design-certificates' | 'faq'>(
        (searchParams.get('tab') as any) || 'profile'
    );


    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading || !isAuthorized) return null;

    const navItems = [
        { id: 'owner-dashboard', label: 'Volver a Owner', icon: <LayoutDashboard className="w-5 h-5" />, show: userRole === 'owner', onClick: () => router.push('/owner') },
        { id: 'profile', label: 'Mi Perfil', icon: <User className="w-5 h-5" />, show: true },
        { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" />, show: true },
        { id: 'constancias', label: 'Constancias', icon: <FileText className="w-5 h-5" />, show: true },
        { id: 'attendance', label: 'Asistencia', icon: <QrCode className="w-5 h-5" />, show: true },
        { id: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5" />, show: true },
        { id: 'events', label: 'Gestión Eventos', icon: <Settings className="w-5 h-5" />, show: true },
        { id: 'design-certificates', label: 'Diseño de Constancias', icon: <Award className="w-5 h-5" />, show: true },
    ];

    const isDesignTab = activeTab === 'design-certificates';
    const isFAQActive = activeTab === 'faq';
    const handleFAQClick = () => setActiveTab('faq');

    return (
        <SidebarAwareContainer className="min-h-screen bg-gray-50 text-[#373737]">
            {isDesignTab ? (
                /* Design tab: zero padding, full width */
                <>
                    <ResponsiveNav 
                        items={navItems}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        handleSignOut={handleSignOut}
                        onFAQClick={handleFAQClick}
                        isFAQActive={isFAQActive}
                    />
                    <div className="mt-12 md:mt-0">
                        <div className="p-0 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CertificateDesignView />
                        </div>
                    </div>
                </>
            ) : (
                /* All other tabs: normal padding and max-width */
                <div className="p-4 xs:p-6 md:p-8">
                    <ResponsiveNav 
                        items={navItems}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        handleSignOut={handleSignOut}
                        onFAQClick={handleFAQClick}
                        isFAQActive={isFAQActive}
                    />
                    <div className="max-w-6xl mx-auto space-y-6 xs:space-y-8 mt-12 md:mt-0">
                        <div className="p-0 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'profile' && <UserProfileView />}
                            {activeTab === 'agenda' && <AgendaView />}
                            {activeTab === 'constancias' && <CertificatesView />}
                            {activeTab === 'users' && <UsersTable currentUserRole={userRole || undefined} />}
                            {activeTab === 'events' && <EventsManager />}
                            {activeTab === 'attendance' && <AttendanceView />}
                            {activeTab === 'faq' && <FAQView defaultRole={userRole || undefined} />}
                        </div>
                    </div>
                </div>
            )}
        </SidebarAwareContainer>
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
