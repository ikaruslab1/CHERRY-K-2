'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#373737]"></div>
    </div>
);

const AttendanceView = dynamic(() => import('@/views/admin/AttendanceView'), {
    loading: () => <LoadingSpinner />,
    ssr: false
});

export default function AdminScannerPage() {
    return (
        <div className="space-y-6">
            <AttendanceView />
        </div>
    );
}
