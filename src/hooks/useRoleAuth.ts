'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type AllowedRole = 'admin' | 'staff' | 'ponente' | 'user' | 'owner';

// Cache simple en memoria para evitar llamadas repetidas en la misma sesión de navegación
let globalCachedRole: { id: string, role: string } | null = null;

/**
 * Hook para proteger rutas basado en roles.
 * Valida que el usuario esté autenticado y tenga uno de los roles permitidos.
 * @param allowedRoles Array de roles permitidos. Si está vacío, solo verifica autenticación.
 * @param redirectTo Ruta a la que redirigir si falla la validación.
 */
export function useRoleAuth(allowedRoles: AllowedRole[] = [], redirectTo: string = '/profile') {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userRole, setUserRole] = useState<AllowedRole | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 1. Verificar Sesión
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/');
                    return;
                }

                // Optimización: Usar caché si ya tenemos el rol de este usuario
                if (globalCachedRole && globalCachedRole.id === user.id) {
                    const role = globalCachedRole.role as AllowedRole;
                    setUserRole(role);
                    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
                        router.push(redirectTo);
                        return;
                    }
                    setIsAuthorized(true);
                    setLoading(false);
                    return;
                }

                // 2. Obtener Rol (si no está en caché)
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error || !profile) {
                    console.error('Error fetching profile role:', error);
                    router.push('/');
                    return;
                }

                const role = profile.role as AllowedRole;
                
                // Guardar en caché
                globalCachedRole = { id: user.id, role: role };
                
                setUserRole(role);

                // 3. Verificar Permisos
                if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
                    router.push(redirectTo); // Redirigir si no tiene el rol
                    return;
                }

                setIsAuthorized(true);
            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router, JSON.stringify(allowedRoles), redirectTo]);

    return { loading, isAuthorized, userRole };
}
