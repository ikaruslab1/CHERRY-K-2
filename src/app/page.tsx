'use client';

import { useState } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('login');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">

      <div className="w-full max-w-sm space-y-10 z-10">
        <div className="text-center space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-[#373737] leading-tight">
                Bienvenido <br/> de vuelta
            </h1>
            <p className="text-gray-400 text-lg">Inicia sesión o crea tu cuenta</p>
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
