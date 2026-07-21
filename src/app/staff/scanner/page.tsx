'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffScannerRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/scanner');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
            Redireccionando al escáner...
        </div>
    );
}
