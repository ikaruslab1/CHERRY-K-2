'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PreviewContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const height = searchParams.get('height') || '800px';

  if (!url) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500 font-medium">
        No se proporcionó una URL para la vista previa.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="ml-4 text-xs font-mono text-gray-400 truncate max-w-md">
                    {url}
                </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Vista Previa del Iframe
            </span>
        </div>
        <iframe 
          src={url} 
          width="100%" 
          style={{ height, border: 'none' }}
          allow="autoplay; fullscreen"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando vista previa...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
