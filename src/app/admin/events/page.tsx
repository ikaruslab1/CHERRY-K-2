'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#373737]"></div>
    </div>
);

const EventsManager = dynamic(() => import('@/components/admin/EventsManager').then(mod => mod.EventsManager), {
    loading: () => <LoadingSpinner />,
    ssr: false
});

export default function EventsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-black uppercase tracking-tight">Gestión de Eventos</h1>
            <EventsManager />
        </div>
    );
}
