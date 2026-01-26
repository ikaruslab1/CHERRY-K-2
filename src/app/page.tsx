'use client';

import { useState } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('login');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 xs:p-6 sm:p-8 md:p-12 relative overflow-hidden">

      <div className="w-full xs:max-w-md sm:max-w-md md:max-w-lg space-y-8 xs:space-y-10 z-10 transition-all duration-300">
        <div className="text-center space-y-3 xs:space-y-4">
            <h1 className="text-4xl xs:text-5xl md:text-6xl font-extrabold tracking-tight text-[#373737] leading-tight">
                Bienvenido <br/> de vuelta
            </h1>
            <p className="text-gray-400 text-base xs:text-lg md:text-xl">Inicia sesión o crea tu cuenta</p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-fit mx-auto">
            <button
                onClick={() => setActiveTab('login')}
                className={cn(
                    "px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                    activeTab === 'login' ? "bg-white text-[#373737] shadow-sm ring-1 ring-black/5" : "text-gray-400 hover:text-[#373737]"
                )}
            >
                Ingresar
            </button>
            <button
                onClick={() => setActiveTab('register')}
                className={cn(
                    "px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300",
                    activeTab === 'register' ? "bg-white text-[#373737] shadow-sm ring-1 ring-black/5" : "text-gray-400 hover:text-[#373737]"
                )}
            >
                Registrarse
            </button>
        </div>

        <div className="transition-all duration-500">
            {activeTab === 'login' ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <LoginForm />
                </div>
            ) : (
                 <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <RegisterForm />
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
