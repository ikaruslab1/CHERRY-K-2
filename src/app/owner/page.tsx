'use client';

import { useEffect, useState } from 'react';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ResponsiveNav } from '@/components/layout/ResponsiveNav';
import { SidebarAwareContainer } from '@/components/layout/SidebarAwareContainer';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { Conference } from '@/types';
import { useConference } from '@/context/ConferenceContext';

export default function OwnerDashboard() {
  const { isAuthorized } = useRoleAuth(['owner']);
  const router = useRouter();
  
  const handleSignOut = async () => {
      await supabase.auth.signOut();
      router.push('/');
  };

  const navItems = [
      { 
          id: 'profile', 
          label: 'Volver al Perfil', 
          icon: <User className="w-5 h-5" />, 
          show: true,
          onClick: () => router.push('/profile')
      },
      {
          id: 'owner',
          label: 'Panel Owner',
          icon: <LayoutDashboard className="w-5 h-5" />,
          show: true
      }
  ];

  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectConference } = useConference();

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newConf, setNewConf] = useState<{
    title: string;
    description: string;
    event_type: string;
    institution_name: string;
    department_name: string;
  }>({ 
    title: '', 
    description: '',
    event_type: 'Congreso',
    institution_name: '',
    department_name: ''
  });

  const EVENT_TYPES = ['Congreso', 'Seminario', 'Coloquio', 'Evento especial'];

  useEffect(() => {
    const checkUser = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
       fetchConferences();
    };
    checkUser();
  }, [isAuthorized]);

  const fetchConferences = async () => {
    const { data, error } = await supabase
      .from('conferences')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setConferences(data);
    setLoading(false);
  };

  const handleSave = async () => {
     if (!newConf.title) return;

     const payload = {
         title: newConf.title,
         description: newConf.description,
         event_type: newConf.event_type,
         institution_name: newConf.institution_name,
         department_name: newConf.department_name
     };

     if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('conferences')
          .update(payload)
          .eq('id', editingId);

        if (!error) {
           setConferences(conferences.map(c => 
              c.id === editingId ? { ...c, ...payload } : c
           ));
           resetForm();
        } else {
           alert('Error al actualizar: ' + error.message);
        }
     } else {
        // Create new
        const { data, error } = await supabase
          .from('conferences')
          .insert([{
             ...payload,
             start_date: new Date().toISOString(), 
             end_date: new Date().toISOString(), 
             is_active: false
          }])
          .select();

        if (data) {
           setConferences([data[0], ...conferences]);
           resetForm();
        } else if (error) {
           alert('Error al crear evento: ' + error.message);
        }
     }
  };

  const resetForm = () => {
     setIsCreating(false);
     setEditingId(null);
     setNewConf({ 
        title: '', 
        description: '',
        event_type: 'Congreso',
        institution_name: '',
        department_name: ''
     });
  };

  const startEdit = (conf: Conference) => {
     setNewConf({ 
        title: conf.title, 
        description: conf.description,
        event_type: conf.event_type || 'Congreso',
        institution_name: conf.institution_name || '',
        department_name: conf.department_name || ''
     });
     setEditingId(conf.id);
     setIsCreating(true);
  };

  const toggleActive = async (id: string, currentState: boolean) => {
      const { error } = await supabase
        .from('conferences')
        .update({ is_active: !currentState })
        .eq('id', id);
        
      if (!error) {
          setConferences(conferences.map(c => 
             c.id === id ? { ...c, is_active: !currentState } : c
          ));
      } else {
         alert('Error al actualizar estado: ' + error.message);
      }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!isAuthorized) return <div className="p-8 text-center">Acceso denegado. Se requiere rol Owner.</div>;

  return (
    <SidebarAwareContainer className="min-h-screen bg-muted p-8">
      <ResponsiveNav 
          items={navItems}
          activeTab="owner"
          setActiveTab={() => {}}
          handleSignOut={handleSignOut}
      />
      <div className="max-w-6xl mx-auto mt-12 md:mt-0">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-playfair text-foreground">Gestionar eventos</h1>
            <p className="text-muted-foreground">Panel de Control Global (Owner)</p>
          </div>
          <button 
             onClick={() => setIsCreating(true)}
             className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-opacity-90 transition shadow-lg"
          >
             + Nuevo Evento
          </button>
        </header>

        {isCreating && (
           <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-border animate-in fade-in slide-in-from-top-4">
              <h2 className="text-xl font-bold mb-4 text-foreground">{editingId ? 'Editar Evento' : 'Crear Nuevo Evento'}</h2>
              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Tipo de Evento</label>
                        <select 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-accent outline-none bg-white text-foreground"
                            value={newConf.event_type}
                            onChange={e => setNewConf({...newConf, event_type: e.target.value})}
                        >
                            {EVENT_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Título del Evento</label>
                        <input 
                            type="text" 
                            placeholder="Ej. Congreso Internacional 2026" 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-accent outline-none"
                            value={newConf.title}
                            onChange={e => setNewConf({...newConf, title: e.target.value})}
                        />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Institución que Preside</label>
                        <input 
                            type="text" 
                            placeholder="Ej. Facultad de Estudios Superiores Acatlán" 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-accent outline-none"
                            value={newConf.institution_name}
                            onChange={e => setNewConf({...newConf, institution_name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Departamento que Preside</label>
                        <input 
                            type="text" 
                            placeholder="Ej. División de Edificación y Diseño" 
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-accent outline-none"
                            value={newConf.department_name}
                            onChange={e => setNewConf({...newConf, department_name: e.target.value})}
                        />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium mb-1 text-foreground">Descripción (Solo Staff/Owner)</label>
                    <textarea 
                        placeholder="Descripción interna o notas del evento..." 
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-accent outline-none"
                        rows={3}
                        value={newConf.description}
                        onChange={e => setNewConf({...newConf, description: e.target.value})}
                    />
                 </div>

                 <div className="flex gap-2 justify-end pt-2">
                    <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded transition">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-accent text-accent-foreground rounded font-bold shadow-md hover:shadow-lg transition">Guardar</button>
                 </div>
              </div>
           </div>
        )}

        <div className="grid grid-cols-1 gap-6">
           {conferences.map(conf => (
             <div key={conf.id} className="bg-white p-6 rounded-xl shadow-sm border border-border flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                       <h3 className="text-xl font-bold text-foreground">{conf.title}</h3>
                       {conf.is_active ? 
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Activo</span> : 
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">Inactivo</span>
                       }
                       <span className="text-xs border px-2 py-1 rounded-full bg-gray-50">{conf.event_type || 'Congreso'}</span>
                   </div>
                   <p className="text-muted-foreground text-sm mb-2">{conf.description || 'Sin descripción'}</p>
                   {conf.institution_name && <p className="text-xs text-muted-foreground font-medium">{conf.institution_name} - {conf.department_name}</p>}
                   <div className="text-xs text-muted-foreground flex gap-4 mt-2">
                      <span>Creado: {new Date(conf.created_at || '').toLocaleDateString()}</span>
                   </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                   <button 
                      onClick={() => selectConference(conf)}
                      className="flex-1 md:flex-none px-4 py-2 text-sm border border-black/10 rounded hover:bg-black/5 transition font-medium text-center"
                   >
                      Entrar
                   </button>
                   <button 
                      onClick={() => startEdit(conf)}
                      className="flex-1 md:flex-none px-4 py-2 text-sm border border-black/10 rounded hover:bg-black/5 transition font-medium text-center"
                   >
                      Editar
                   </button>
                   <button 
                      onClick={() => toggleActive(conf.id, conf.is_active)}
                      className={`flex-1 md:flex-none px-4 py-2 text-sm rounded font-medium transition text-center ${conf.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                   >
                      {conf.is_active ? 'Desactivar' : 'Activar'}
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </SidebarAwareContainer>
  );
}
