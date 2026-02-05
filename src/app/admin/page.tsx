'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { ResponsiveNav } from '@/components/layout/ResponsiveNav';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { Loader2, User, Calendar, FileText, QrCode, Users, Settings } from 'lucide-react';

const UsersTable = dynamic(() => import('@/components/admin/UsersTable').then(mod => mod.UsersTable), {
    loading: () => <LoadingSpinner />,
});
const EventsManager = dynamic(() => import('@/components/admin/EventsManager').then(mod => mod.EventsManager), {
    loading: () => <LoadingSpinner />,
});
const UserProfileView = dynamic(() => import('@/components/profile/UserProfileView').then(mod => mod.UserProfileView), {
    loading: () => <LoadingSpinner />,
});
const AgendaView = dynamic(() => import('@/components/events/AgendaView').then(mod => mod.AgendaView), {
    loading: () => <LoadingSpinner />,
});
const AttendanceView = dynamic(() => import('@/views/admin/AttendanceView'), {
    loading: () => <LoadingSpinner />,
});
const CertificatesView = dynamic(() => import('@/components/profile/CertificatesView').then(mod => mod.CertificatesView), {
    loading: () => <LoadingSpinner />,
});

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
    const { loading, isAuthorized } = useRoleAuth(['admin']);
    
    // Initialize state from URL params only once
    const [activeTab, setActiveTab] = useState<'profile' | 'agenda' | 'users' | 'events' | 'attendance' | 'constancias'>(
        (searchParams.get('tab') as any) || 'profile'
    );


    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading || !isAuthorized) return null;

    const navItems = [
        { id: 'profile', label: 'Mi Perfil', icon: <User className="w-5 h-5" />, show: true },
        { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-5 h-5" />, show: true },
        { id: 'constancias', label: 'Constancias', icon: <FileText className="w-5 h-5" />, show: true },
        { id: 'attendance', label: 'Asistencia', icon: <QrCode className="w-5 h-5" />, show: true },
        { id: 'users', label: 'Usuarios', icon: <Users className="w-5 h-5" />, show: true },
        { id: 'events', label: 'Gestión Eventos', icon: <Settings className="w-5 h-5" />, show: true },
    ];

    return (
        <main className="min-h-screen p-4 xs:p-6 md:p-8 bg-gray-50 text-[#373737]">
            <ResponsiveNav 
                items={navItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleSignOut={handleSignOut}
            />

            <div className="max-w-6xl mx-auto space-y-6 xs:space-y-8 mt-12 md:mt-0">

                <div className="p-0 min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
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
