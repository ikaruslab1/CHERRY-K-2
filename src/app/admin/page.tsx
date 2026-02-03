'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { AdminNav } from '@/components/admin/AdminNav';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { Loader2 } from 'lucide-react';

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading || !isAuthorized) return null;

    return (
        <main className="min-h-screen p-4 xs:p-6 md:p-8 bg-gray-50 text-[#373737]">
            <div className="max-w-6xl mx-auto space-y-6 xs:space-y-8">
                <AdminNav 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    isMobileMenuOpen={isMobileMenuOpen} 
                    setIsMobileMenuOpen={setIsMobileMenuOpen} 
                    handleSignOut={handleSignOut} 
                />

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
