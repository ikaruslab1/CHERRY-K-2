'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2, Search } from 'lucide-react';

export function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,short_id.ilike.%${search}%`);
    }

    const { data } = await query.limit(50);
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } else {
        alert("Error actualizando rol");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input 
            placeholder="Buscar por nombre o ID..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
        />
        <Button onClick={fetchUsers} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </Button>
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-slate-300">
                <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Rol</th>
                    <th className="p-3">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
                {users.map(user => (
                    <tr key={user.id} className="hover:bg-white/5">
                        <td className="p-3 font-mono">{user.short_id}</td>
                        <td className="p-3">{user.first_name} {user.last_name}</td>
                        <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                user.role === 'staff' ? 'bg-indigo-500/20 text-indigo-400' :
                                'bg-slate-500/20 text-slate-400'
                            }`}>
                                {user.role}
                            </span>
                        </td>
                        <td className="p-3 flex gap-2">
                            {['user', 'staff', 'admin'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => updateRole(user.id, role)}
                                    disabled={user.role === role}
                                    className="px-2 py-1 bg-white/5 rounded hover:bg-white/10 text-xs disabled:opacity-50"
                                >
                                    {role.charAt(0).toUpperCase()}
                                </button>
                            ))}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
