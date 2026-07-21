'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRoleAuth } from '@/hooks/useRoleAuth';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#373737]"></div>
    </div>
);

const UsersTable = dynamic(() => import('@/components/admin/UsersTable').then(mod => mod.UsersTable), {
    loading: () => <LoadingSpinner />,
    ssr: false
});

export default function UsersPage() {
    const { loading, userRole } = useRoleAuth(['admin', 'owner', 'staff'], '/profile');

    if (loading) return <LoadingSpinner />;

    const isStaff = userRole === 'staff';

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-black uppercase tracking-tight">
                {isStaff ? 'Lista de Asistentes' : 'Gestión de Usuarios y Roles'}
            </h1>
            <UsersTable readOnly={isStaff} currentUserRole={userRole || undefined} />
        </div>
    );
}
