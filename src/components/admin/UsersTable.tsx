'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Search, Edit2, X, UserCog, Check } from 'lucide-react';

import { useDebounce } from '@/hooks/useDebounce';
import { UserProfile } from '@/types';

export function UsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserProfile['role'] | ''>('');
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, short_id, degree, role')
        .order('created_at', { ascending: false });

      if (debouncedSearch) {
        query = query.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,short_id.ilike.%${debouncedSearch}%`);
      }

      const { data, error } = await query.limit(50);
      
      if (error) {
        console.error('Error fetching users:', error);
      } else {
      setUsers((data as unknown as UserProfile[]) || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch]);

  const openModal = (user: UserProfile) => {
      setSelectedUser(user);
      setSelectedRole(user.role);
  };

  const closeModal = () => {
      setSelectedUser(null);
      setSelectedRole('');
  };

  const saveRole = async () => {
    if (!selectedUser) return;
    setUpdating(true);

    const { error } = await supabase
      .from('profiles')
      .update({ role: selectedRole })
      .eq('id', selectedUser.id);

    if (!error) {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: selectedRole as UserProfile['role'] } : u));
      closeModal();
    } else {
        alert("Error actualizando rol");
    }
    setUpdating(false);
  };

  const getRoleBadgeClasses = (role: string) => {
      switch(role) {
          case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'staff': return 'bg-blue-100 text-blue-700 border-blue-200';
          default: return 'bg-gray-100 text-gray-600 border-gray-200';
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xs:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
                placeholder="Buscar por nombre o ID..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                className="pl-10 bg-white border-gray-200 text-[#373737] focus:ring-[#DBF227]"
            />
        </div>
        <Button onClick={fetchUsers} disabled={loading} className="bg-[#373737] text-white hover:bg-black w-full xs:w-auto">
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Buscar'}
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden overflow-x-auto bg-white border border-gray-100 shadow-sm">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Nombre</th>
                    <th className="p-4">Grado</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4 text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-mono text-gray-600 font-medium">{user.short_id}</td>
                        <td className="p-4 text-[#373737] font-semibold">{user.first_name} {user.last_name}</td>
                        <td className="p-4 text-gray-500">{user.degree}</td>
                        <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeClasses(user.role)} capitalize`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="p-4 text-right">
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => openModal(user)}
                                className="text-gray-400 hover:text-[#373737] hover:bg-gray-100"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {users.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-400">
                No se encontraron usuarios.
            </div>
        )}
      </div>

      {/* Role Edit Modal */}
      {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                      <div>
                          <h3 className="text-lg font-bold text-[#373737] flex items-center gap-2">
                             <UserCog className="h-5 w-5 text-[#DBF227]" />
                             Gestionar Usuario
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">Modificar permisos y rol de acceso.</p>
                      </div>
                      <button onClick={closeModal} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      {/* User Summary Card */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-4 items-center">
                          <div className="h-12 w-12 rounded-full bg-[#DBF227]/20 flex items-center justify-center text-[#373737] font-bold text-lg">
                              {selectedUser.first_name.charAt(0)}{selectedUser.last_name.charAt(0)}
                          </div>
                          <div>
                              <h4 className="font-bold text-[#373737]">{selectedUser.first_name} {selectedUser.last_name}</h4>
                              <div className="flex gap-2 text-xs text-gray-500 font-mono mt-0.5">
                                  <span>{selectedUser.short_id}</span>
                                  <span>•</span>
                                  <span>{selectedUser.degree}</span>
                              </div>
                          </div>
                      </div>

                      {/* Role Selector */}
                      <div className="space-y-3">
                          <label className="text-sm font-bold text-[#373737]">Seleccionar nuevo rol:</label>
                          <div className="grid grid-cols-1 gap-2">
                              {(['user', 'staff', 'admin'] as UserProfile['role'][]).map((role) => (
                                  <button
                                      key={role}
                                      onClick={() => setSelectedRole(role)}
                                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                          selectedRole === role 
                                          ? 'border-[#DBF227] bg-[#DBF227]/10 ring-1 ring-[#DBF227]' 
                                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                      }`}
                                  >
                                      <div className="flex flex-col items-start">
                                          <span className="font-semibold text-sm capitalize text-[#373737]">
                                              {role === 'user' ? 'Beneficiario' : role}
                                          </span>
                                          <span className="text-xs text-gray-400">
                                              {role === 'user' && 'Acceso estándar a perfil y agenda.'}
                                              {role === 'staff' && 'Puede escanear QRs y ver agenda.'}
                                              {role === 'admin' && 'Control total del sistema.'}
                                          </span>
                                      </div>
                                      {selectedRole === role && (
                                          <div className="h-5 w-5 rounded-full bg-[#DBF227] flex items-center justify-center">
                                              <Check className="h-3 w-3 text-[#373737]" />
                                          </div>
                                      )}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="p-6 pt-2 bg-gray-50/50 flex gap-3">
                      <Button variant="ghost" onClick={closeModal} className="flex-1 text-gray-500">Cancelar</Button>
                      <Button onClick={saveRole} disabled={updating} className="flex-1 bg-[#373737] text-white hover:bg-black">
                          {updating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Confirmar Cambio'}
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
