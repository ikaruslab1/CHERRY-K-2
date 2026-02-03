'use client';

import { useState, Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('login');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-12 px-4 xs:px-6 sm:px-8 md:p-12 relative bg-gradient-to-br from-gray-50 via-white to-gray-100 animate-gradient-xy overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70vh] h-[70vh] rounded-full bg-[#DBF227]/5 blur-3xl" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[70vh] h-[70vh] rounded-full bg-gray-200/20 blur-3xl" />
      </div>

      <div className="w-full xs:max-w-md sm:max-w-md md:max-w-lg space-y-8 xs:space-y-10 z-10 transition-all duration-300 my-auto">
        <div className="text-center space-y-3 xs:space-y-4">
            <h1 className="text-4xl xs:text-5xl md:text-6xl font-extrabold tracking-tight text-[#373737] leading-tight">
                Bienvenido <br/> de vuelta
            </h1>
            <p className="text-gray-400 text-base xs:text-lg md:text-xl">Inicia sesión o crea tu cuenta</p>
        </div>

        <div className="relative grid grid-cols-2 bg-gray-100/80 backdrop-blur-sm p-1 rounded-2xl w-full max-w-[300px] mx-auto shadow-inner">
            {/* Sliding Background Pill */}
            <div 
                className={cn(
                    "absolute top-1 bottom-1 bg-white rounded-xl shadow-sm ring-1 ring-black/5 transition-all duration-300 ease-in-out",
                    activeTab === 'login' ? "left-1 right-[50%]" : "left-[50%] right-1"
                )}
            />

            <button
                onClick={() => setActiveTab('login')}
                className={cn(
                    "relative z-10 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200",
                    activeTab === 'login' ? "text-[#373737]" : "text-gray-400 hover:text-[#373737]"
                )}
            >
                Ingresar
            </button>
            <button
                onClick={() => setActiveTab('register')}
                className={cn(
                    "relative z-10 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200",
                    activeTab === 'register' ? "text-[#373737]" : "text-gray-400 hover:text-[#373737]"
                )}
            >
                Registrarse
            </button>
        </div>

        <div className="relative min-h-[400px] overflow-hidden">
            <div className={cn(
                "transition-all duration-500 ease-in-out absolute w-full",
                activeTab === 'login' 
                    ? "opacity-100 translate-x-0 relative z-10" 
                    : "opacity-0 -translate-x-8 absolute top-0 pointer-events-none z-0"
            )}>
                <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full" /></div>}>
                    <LoginForm />
                </Suspense>
            </div>
            
            <div className={cn(
                "transition-all duration-500 ease-in-out absolute w-full",
                activeTab === 'register' 
                    ? "opacity-100 translate-x-0 relative z-10" 
                    : "opacity-0 translate-x-8 absolute top-0 pointer-events-none z-0"
            )}>
                 <RegisterForm />
            </div>
        </div>
      </div>
    </main>
  );
}
