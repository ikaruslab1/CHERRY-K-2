'use client';

import { useRouter } from 'next/navigation';
import { WifiOff, Home } from 'lucide-react';

export default function OfflinePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <WifiOff className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Estás desconectado</h1>
        <p className="text-gray-500 mb-8">
          No pudimos cargar esta sección, pero puedes acceder a tus entradas descargadas o volver al inicio.
        </p>
        
        <div className="space-y-3">
            <button 
               onClick={() => router.push('/profile')}
               className="w-full py-3 px-4 bg-[#DBF227] hover:bg-[#cbe320] text-[#373737] font-bold rounded-xl transition-colors"
            >
              Ir a Mis Entradas
            </button>
            <button 
               onClick={() => window.location.reload()}
               className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Reintentar Conexión
            </button>
        </div>
      </div>
    </div>
  );
}
