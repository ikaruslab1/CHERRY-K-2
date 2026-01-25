'use client';

import { useState } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('login');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                CHERRY-K-2
            </h1>
            <p className="text-slate-400">Plataforma de Gestión de Congresos</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-xl flex">
            <button
                onClick={() => setActiveTab('login')}
                className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    activeTab === 'login' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                )}
            >
                Ingresar
            </button>
            <button
                onClick={() => setActiveTab('register')}
                className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    activeTab === 'register' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
                )}
            >
                Registrarse
            </button>
        </div>

        <div className={cn(
            "bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl transition-all duration-500",
            activeTab === 'register' ? "ring-2 ring-indigo-500/20" : ""
        )}>
            {activeTab === 'login' ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <h2 className="text-xl font-semibold text-white mb-4">Bienvenido de nuevo</h2>
                    <LoginForm />
                </div>
            ) : (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <h2 className="text-xl font-semibold text-white mb-4">Crear Identidad</h2>
                    <RegisterForm />
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
