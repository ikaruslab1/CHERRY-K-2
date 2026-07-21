'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#373737]"></div>
    </div>
);

const LandingEditor = dynamic(() => import('@/components/admin/LandingEditor').then(mod => mod.LandingEditor), {
    loading: () => <LoadingSpinner />,
    ssr: false
});

export default function LandingEditorPage() {
    return <LandingEditor />;
}
