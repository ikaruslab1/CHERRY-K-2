'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { UsersTable } from '@/components/admin/UsersTable';
import { EventsManager } from '@/components/admin/EventsManager';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'events'>('users');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        router.push('/profile');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      );
  }

  return (
    <main className="min-h-screen p-8 bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Panel de Administración</h1>
            <Button variant="ghost" onClick={() => router.push('/profile')}>Volver al Perfil</Button>
        </div>

        <div className="flex gap-4 border-b border-white/10 pb-4">
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'users' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Usuarios
            </button>
            <button 
                onClick={() => setActiveTab('events')}
                className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'events' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Eventos
            </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[500px]">
            {activeTab === 'users' ? <UsersTable /> : <EventsManager />}
        </div>
      </div>
    </main>
  );
}
