'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useConference } from '@/context/ConferenceContext';

type AllowedRole = 'admin' | 'staff' | 'ponente' | 'user' | 'owner' | 'vip';

// Cache simple en memoria para evitar llamadas repetidas en la misma sesión
// Key: `${userId}_${conferenceId}`
const globalRoleCache: Record<string, AllowedRole> = {};

export function useRoleAuth(allowedRoles: AllowedRole[] = [], redirectTo: string = '/profile') {
    const router = useRouter();
    const { currentConference, loading: conferenceLoading } = useConference();
    
    // Convert allowedRoles to string for stable dependency
    const allowedRolesStr = JSON.stringify(allowedRoles);

    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [userRole, setUserRole] = useState<AllowedRole | null>(null);

    useEffect(() => {
        let isMounted = true;

        const getEffectiveRole = async (userId: string, conferenceId: string): Promise<AllowedRole> => {
             // 1. Verificar si es Owner Global (Perfil principal)
             const { data: profile } = await supabase
                .from('profiles')
                .select('is_owner')
                .eq('id', userId)
                .single();
             
             if (profile && profile.is_owner) {
                 return 'owner';
             }

             // 2. Verificar Rol Local en Conferencia
             const { data: localRole } = await supabase
                .from('conference_roles')
                .select('role')
                .eq('user_id', userId)
                .eq('conference_id', conferenceId)
                .single();
             
             if (localRole && localRole.role) {
                 return localRole.role as AllowedRole;
             }
             
             return 'user';
        };

        const updateCache = (userId: string, conferenceId: string, role: AllowedRole) => {
            const key = `${userId}_${conferenceId}`;
            globalRoleCache[key] = role;
            if (typeof window !== 'undefined') {
                localStorage.setItem(`user_role_${key}`, role);
            }
        };

        const validateRole = async (userId: string, conferenceId: string, currentRole: AllowedRole) => {
             const serverRole = await getEffectiveRole(userId, conferenceId);

             if (!isMounted) return;

             if (serverRole !== currentRole) {
                 console.log('Role updated from server:', serverRole);
                 updateCache(userId, conferenceId, serverRole);
                 setUserRole(serverRole);
                 
                 const roles = JSON.parse(allowedRolesStr);
                 if (roles.length > 0 && !roles.includes(serverRole)) {
                     router.push(redirectTo);
                 }
             }
        };

        const checkAuth = async () => {
            if (conferenceLoading) return;

            try {
                // 1. Verificar Sesión
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError || !session?.user) {
                    if (isMounted) router.push('/');
                    return;
                }

                const user = session.user;
                
                if (!currentConference) {
                    if (isMounted) {
                        setUserRole('user'); // Default role
                        setLoading(false);
                        // Only redirect if roles are strictly required and we are not in selection
                        const roles = JSON.parse(allowedRolesStr);
                        if (roles.length > 0 && !redirectTo.includes('select-conference')) {
                            router.push('/select-conference'); 
                        } else {
                            setIsAuthorized(true);
                        }
                    }
                    return;
                }

                const conferenceId = currentConference.id;
                const cacheKey = `${user.id}_${conferenceId}`;
                let role: AllowedRole | null = null;
                
                // 2. Cache
                if (globalRoleCache[cacheKey]) {
                    role = globalRoleCache[cacheKey];
                } else {
                    const cachedRoleStr = typeof window !== 'undefined' ? localStorage.getItem(`user_role_${cacheKey}`) : null;
                    if (cachedRoleStr && ['admin', 'staff', 'ponente', 'user', 'owner', 'vip'].includes(cachedRoleStr)) {
                        role = cachedRoleStr as AllowedRole;
                        globalRoleCache[cacheKey] = role;
                    }
                }

                // 3. Logic
                if (role) {
                    if (isMounted) {
                        setUserRole(role);
                        const roles = JSON.parse(allowedRolesStr);
                        if (roles.length > 0 && !roles.includes(role)) {
                            router.push(redirectTo);
                            return;
                        }
                        setIsAuthorized(true);
                        setLoading(false);
                        
                        validateRole(user.id, conferenceId, role);
                    }
                } else {
                    // Fetch fresh
                    const serverRole = await getEffectiveRole(user.id, conferenceId);
                    
                    if (isMounted) {
                        updateCache(user.id, conferenceId, serverRole);
                        setUserRole(serverRole);
                        
                        const roles = JSON.parse(allowedRolesStr);
                        if (roles.length > 0 && !roles.includes(serverRole)) {
                            router.push(redirectTo);
                            return;
                        }
                        setIsAuthorized(true);
                        setLoading(false);
                    }
                }

            } catch (error) {
                console.error('Auth check error:', error);
                if (isMounted) router.push('/');
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [router, allowedRolesStr, redirectTo, currentConference, conferenceLoading]);

    return { loading, isAuthorized, userRole };
}
