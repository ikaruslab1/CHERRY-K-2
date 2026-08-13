'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
  </div>
);

const EmailEditor = dynamic(() => import('@/components/admin/email/EmailEditor').then(mod => mod.EmailEditor), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

export default function EmailEditorPage() {
  return <EmailEditor />;
}
