'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Search, Edit2, X, UserCog, Check, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { useDebounce } from '@/hooks/useDebounce';
import { UserProfile } from '@/types';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { useUsers } from '@/hooks/useUsers';
import { usePlatformUsers } from '@/hooks/usePlatformUsers';
import { useConference } from '@/context/ConferenceContext';

  export function UsersTable({ readOnly = false, currentUserRole }: { readOnly?: boolean, currentUserRole?: string }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const { users, loading, mutate: mutateUsers } = useUsers(debouncedSearch);
  const { platformUsers, loading: loadingPlatform, mutate: mutatePlatformUsers } = usePlatformUsers(debouncedSearch);

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedQrUser, setSelectedQrUser] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserProfile['role'] | ''>('');
  const [updating, setUpdating] = useState(false);
  const [origin, setOrigin] = useState('');
  const { currentConference } = useConference();

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const openModal = (user: UserProfile) => {
      setSelectedUser(user);
      setSelectedRole(user.role);
  };

  const closeModal = () => {
      setSelectedUser(null);
      setSelectedRole('');
  };

  const closeQrModal = () => {
      setSelectedQrUser(null);
  };

  const saveRole = async () => {
    if (!selectedUser || !currentConference) return;
    setUpdating(true);

    let error;

    // Lógica Segregada:
    // 1. El rol 'owner' (desarrollador) es el único global.
    // 2. Todos los demás roles son específicos de la conferencia.
    
    if (selectedRole === 'owner') {
        // Asignar Owner Globalmente
        const { error: err } = await supabase
          .from('profiles')
          .update({ is_owner: true })
          .eq('id', selectedUser.id);
        error = err;
    } else {
        // Si el usuario era owner global y ahora se le asigna otro rol, 
        // reseteamos su perfil global a is_owner = false y asignamos el rol local.
        if (selectedUser.is_owner) {
            await supabase
              .from('profiles')
              .update({ is_owner: false })
              .eq('id', selectedUser.id);
        }

        // Upsert en roles de conferencia
        const { error: err } = await supabase
          .from('conference_roles')
          .upsert({ 
            user_id: selectedUser.id, 
            conference_id: currentConference.id,
            role: selectedRole 
          }, { onConflict: 'user_id, conference_id' });
        error = err;
    }

    if (!error) {
      mutateUsers();
      mutatePlatformUsers();
      closeModal();
    } else {
        alert("Error actualizando rol");
        console.error(error);
    }
    setUpdating(false);
  };

  const getRoleBadgeClasses = (role: string) => {
      switch(role) {
          case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
          case 'staff': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'ponente': return 'bg-amber-100 text-amber-700 border-amber-200';
          case 'owner': return 'bg-gradient-to-r from-pink-100 via-purple-100 to-indigo-100 text-gray-800 border-purple-100';
          case 'vip': return 'bg-[#F2D027]/20 text-[#8B7814] border-[#F2D027]/30';
          default: return 'bg-gray-100 text-gray-600 border-gray-200';
      }
  };

  const rolesList = (['user', 'vip', 'ponente', 'staff', 'admin', 'owner'] as UserProfile['role'][]).filter(role => {
      // Sólo Owner (Desarrollador) puede asignar el rol de Owner
      if (role === 'owner' && currentUserRole !== 'owner') return false;
      
      // Tanto Admin como Owner pueden asignar el rol de Admin
      if (role === 'admin' && !(currentUserRole === 'owner' || currentUserRole === 'admin')) return false;
      
      return true;
  });

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
        <Button onClick={() => { mutateUsers(); mutatePlatformUsers(); }} disabled={loading} className="bg-[#373737] text-white hover:bg-black w-full xs:w-auto">
            {'Buscar'}
        </Button>
      </div>

      <div className="space-y-4">
        {loading && users.length === 0 ? null : (
        <>
            {(() => {
                const organizers = users.filter(u => ['owner', 'admin', 'staff'].includes(u.role));
                const attendees = users.filter(u => !['owner', 'admin', 'staff'].includes(u.role));
                
                // Although DB sorts, we can enforce frontend sort for attendees just to be sure
                // Priority: ponente > vip > user
                attendees.sort((a, b) => {
                    const getPriority = (role: string) => {
                        if (role === 'ponente') return 0;
                        if (role === 'vip') return 1;
                        return 2;
                    };
                    return getPriority(a.role) - getPriority(b.role);
                });

                const UserList = ({ title, userList }: { title: string, userList: UserProfile[] }) => {
                    if (userList.length === 0) return null;
                    return (
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-[#373737] px-1">{title}</h3>
                            {/* Desktop Table View */}
                            <div className="hidden md:block rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="p-4 w-16">QR</th>
                                            <th className="p-4 w-24">ID</th>
                                            <th className="p-4">Nombre</th>
                                            <th className="p-4">Grado</th>
                                            <th className="p-4">Rol</th>
                                            {!readOnly && <th className="p-4 text-right">Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {userList.map(user => {
                                            const isTargetOwner = user.role === 'owner';
                                            const isTargetAdmin = user.role === 'admin';
                                            const isCurrentOwner = currentUserRole === 'owner';
                                            const isCurrentAdmin = currentUserRole === 'admin';
                                            
                                            // Privacy Logic:
                                            // 1. Owners: Only seen by Owners
                                            // 2. Admins: Seen by Owners & Admins (Not Staff)
                                            // 3. Others: Seen by everyone
                                            let canViewDetails = true;
                                            if (isTargetOwner && !isCurrentOwner) canViewDetails = false;
                                            if (isTargetAdmin && (!isCurrentOwner && !isCurrentAdmin)) canViewDetails = false;

                                            return (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    {canViewDetails ? (
                                                        <button
                                                            onClick={() => setSelectedQrUser(user)}
                                                            className="p-2 bg-gray-50 hover:bg-[#DBF227]/20 text-gray-400 hover:text-[#373737] rounded-lg transition-colors border border-gray-200"
                                                            title="Ver código QR"
                                                        >
                                                            <QrCode className="h-5 w-5" />
                                                        </button>
                                                    ) : (
                                                        <div className="p-2 text-gray-200 cursor-not-allowed">
                                                            <QrCode className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 font-mono text-gray-600 font-medium">
                                                    {canViewDetails ? user.short_id : '••••••'}
                                                </td>
                                                <td className="p-4 text-[#373737] font-semibold">{user.first_name} {user.last_name}</td>
                                                <td className="p-4 text-gray-500">{user.degree}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRoleBadgeClasses(user.role)} capitalize`}>
                                                        {user.role === 'owner' ? 'Desarrollador' : (user.role === 'vip' ? 'VIP' : user.role)}
                                                    </span>
                                                </td>
                                                {!readOnly && (
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
                                                )}
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {userList.map(user => {
                                    const isTargetOwner = user.role === 'owner';
                                    const isTargetAdmin = user.role === 'admin';
                                    const isCurrentOwner = currentUserRole === 'owner';
                                    const isCurrentAdmin = currentUserRole === 'admin';
                                    
                                    let canViewDetails = true;
                                    if (isTargetOwner && !isCurrentOwner) canViewDetails = false;
                                    if (isTargetAdmin && (!isCurrentOwner && !isCurrentAdmin)) canViewDetails = false;

                                    return (
                                    <div key={user.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-[#373737]">{user.first_name} {user.last_name}</h4>
                                                    <p className="text-xs text-gray-500 font-mono">
                                                        {canViewDetails ? user.short_id : '••••••'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeClasses(user.role)} capitalize`}>
                                                {user.role === 'owner' ? 'Dev' : (user.role === 'vip' ? 'VIP' : user.role)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <span className="text-xs text-gray-400">{user.degree || 'Sin grado'}</span>
                                            <div className="flex gap-2">
                                                {canViewDetails ? (
                                                    <button
                                                        onClick={() => setSelectedQrUser(user)}
                                                        className="p-2 bg-gray-50 hover:bg-[#DBF227]/20 text-gray-400 hover:text-[#373737] rounded-lg transition-colors border border-gray-200"
                                                    >
                                                        <QrCode className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <div className="p-2 text-gray-200 cursor-not-allowed border border-transparent">
                                                        <QrCode className="h-4 w-4" />
                                                    </div>
                                                )}
                                                {!readOnly && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={() => openModal(user)}
                                                        className="text-gray-400 hover:text-[#373737] hover:bg-gray-100 h-9 w-9 p-0 rounded-lg border border-gray-200"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                };

                return (
                    <div className="space-y-8">
                        <UserList title="Organizadores" userList={organizers} />
                        <UserList title="Usuarios" userList={attendees} />
                        <UserList title="Usuarios de la plataforma" userList={platformUsers} />
                        
                        {users.length === 0 && platformUsers.length === 0 && !loading && !loadingPlatform && (
                            <div className="p-8 text-center text-gray-400 bg-white rounded-xl border border-gray-100">
                                No se encontraron usuarios.
                            </div>
                        )}
                    </div>
                );
            })()}
        </>
        )}
      </div>

      {/* Role Edit Modal */}
      {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
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
                              {selectedUser.email && (
                                  <div className="text-xs text-gray-400 mt-1">
                                      {selectedUser.email}
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* Role Selector */}
                      <div className="space-y-3">
                          <label className="text-sm font-bold text-[#373737]">Seleccionar nuevo rol:</label>
                          <div className="grid grid-cols-1 gap-2">
                                {rolesList.map((role) => (
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
                                              {role === 'user' ? 'Usuario' : (role === 'owner' ? 'Desarrollador' : (role === 'vip' ? 'VIP' : role))}
                                          </span>
                                          <span className="text-xs text-gray-400">
                                              {role === 'user' && 'Acceso estándar a perfil y agenda.'}
                                              {role === 'vip' && 'Igual a usuario, gafete distintivo.'}
                                              {role === 'ponente' && 'Mismos permisos que usuario. Rol distintivo.'}
                                              {role === 'staff' && 'Puede escanear QRs y ver agenda.'}
                                              {role === 'admin' && 'Control total del sistema.'}
                                              {role === 'owner' && 'Acceso absoluto + Gestión de conferencias.'}
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

      {/* QR Code Modal */}
      {selectedQrUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-[#373737] flex items-center gap-2">
                         <QrCode className="h-4 w-4" />
                         Código de Acceso
                      </h3>
                      <button onClick={closeQrModal} className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-white rounded-full">
                          <X className="h-5 w-5" />
                      </button>
                  </div>
                  
                  <div className="p-8 flex flex-col items-center text-center space-y-6">
                      
                      {/* User Info */}
                      <div className="space-y-2">
                          <div className="h-16 w-16 rounded-full bg-[#DBF227]/20 flex items-center justify-center text-[#373737] font-bold text-2xl mx-auto mb-3">
                              {selectedQrUser.first_name.charAt(0)}{selectedQrUser.last_name.charAt(0)}
                          </div>
                          <h4 className="text-xl font-bold text-[#373737] leading-tight">
                              {selectedQrUser.first_name} {selectedQrUser.last_name}
                          </h4>
                          <p className="text-sm text-gray-500 font-medium">
                              {selectedQrUser.degree} • <span className="capitalize">{selectedQrUser.role}</span>
                          </p>
                      </div>

                      {/* QR Code */}
                      <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                           <QRCodeSVG 
                                value={`${origin}/?code=${selectedQrUser.short_id}`}
                                size={180}
                                level="M"
                                className="text-[#373737]"
                            />
                      </div>

                      <div className="space-y-1">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Código Personal</p>
                          <p className="font-mono text-2xl font-bold text-[#373737] tracking-widest">{selectedQrUser.short_id}</p>
                      </div>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <Button onClick={closeQrModal} className="w-full bg-[#373737] text-white hover:bg-black">
                          Cerrar
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
