'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type AllowedRole = 'admin' | 'staff' | 'ponente' | 'user' | 'owner' | 'vip';

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
                // 1. Verificar Sesión (Offline-friendly)
                // Usamos getSession en lugar de getUser para permitir funcionamiento offline
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError || !session?.user) {
                    console.warn('No session found or error:', sessionError);
                    router.push('/');
                    return;
                }

                const user = session.user;

                // 2. Optimización: Buscar en caché (Memoria -> LocalStorage -> DB)
                let role: AllowedRole | null = null;
                
                // A) Caché en Memoria
                if (globalCachedRole && globalCachedRole.id === user.id) {
                    role = globalCachedRole.role as AllowedRole;
                } 
                // B) Caché en LocalStorage (Persistencia Offline)
                else {
                    const cachedRoleStr = localStorage.getItem(`user_role_${user.id}`);
                    if (cachedRoleStr) {
                        role = cachedRoleStr as AllowedRole;
                        // Restaurar a memoria
                        globalCachedRole = { id: user.id, role };
                    }
                }

                // C) Si tenemos rol (de memoria o local), validamos y renderizamos
                if (role) {
                    setUserRole(role);
                    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
                        router.push(redirectTo);
                        return;
                    }
                    setIsAuthorized(true);
                    setLoading(false);
                    
                    // Opcional: Revalidar en segundo plano si hay conexión
                    // Para no bloquear la UI, podríamos lanzar una validación silenciosa aquí
                }

                // D) Si NO hay rol en caché, consultamos DB (Requiere conexión la primera vez)
                if (!role) {
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    if (error || !profile) {
                        console.error('Error fetching profile role:', error);
                        // Si falla y no tenemos rol, solo redirigimos si es un error fatal de autenticación
                        // Pero si es falta de conexión, tal vez deberíamos mostrar un error en lugar de logout?
                        // Por seguridad, sin rol no podemos dejar pasar. El usuario DEBE conectarse al menos una vez.
                        router.push('/');
                        return;
                    }

                    role = profile.role as AllowedRole;
                    
                    // Guardar en caché y localStorage
                    globalCachedRole = { id: user.id, role: role };
                    localStorage.setItem(`user_role_${user.id}`, role);
                    
                    setUserRole(role);
                }

                // Validación final (en caso de que hayamos obtenido el rol recién ahora)
                if (loading) { // Solo si no autorizamos arriba
                    if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
                        router.push(redirectTo);
                        return;
                    }
                    setIsAuthorized(true);
                }

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
