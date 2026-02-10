
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { useConference } from '@/context/ConferenceContext';

// Fetcher genérico para Supabase + RPC
const fetcher = async (url: string) => {
    // Url format: users/conferenceId?search=term
    const parts = url.split('?');
    const pathParts = parts[0].split('/');
    const conferenceId = pathParts[1];
    
    const params = new URLSearchParams(parts[1]);
    const search = params.get('search');
    
    // Si no hay conferencia asignada, usamos el fallback global (profiles)
    if (!conferenceId || conferenceId === 'null' || conferenceId === 'undefined') {
         let query = supabase
            .from('profiles')
            .select('id, first_name, last_name, short_id, degree, is_owner, email')
            .order('created_at', { ascending: false })
            .limit(50);

        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,short_id.ilike.%${search}%`);
        }
        
        const { data, error } = await query;
        if (error) throw error;

        // Map data to include synthetic role
        const mappedData = (data as any[]).map(u => ({
            ...u,
            role: u.is_owner ? 'owner' : 'user'
        }));

        return mappedData as unknown as UserProfile[];
    }

    // Si hay conferencia, usamos la RPC para obtener roles específicos
    const { data, error } = await supabase.rpc('get_users_for_conference', {
        p_conference_id: conferenceId,
        p_search: search || null
    });
    
    if (error) {
        console.warn('Error fetching conference users, falling back to global profiles:', error);
        // Fallback logic duplicated from above
        let query = supabase
            .from('profiles')
            .select('id, first_name, last_name, short_id, degree, is_owner, email')
            .order('created_at', { ascending: false })
            .limit(50);

        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,short_id.ilike.%${search}%`);
        }
        
        const { data: fallbackData, error: fallbackError } = await query;
        if (fallbackError) throw fallbackError;

        // Map data to include synthetic role
        const mappedData = (fallbackData as any[]).map(u => ({
            ...u,
            role: u.is_owner ? 'owner' : 'user'
        }));

        return mappedData as unknown as UserProfile[];
    }
    
    return data as unknown as UserProfile[];
};

export function useUsers(search: string) {
    const { currentConference } = useConference();
    
    // La key de SWR ahora depende de la conferencia activa
    // Si cambia la conferencia, se invalida la caché y se pide de nuevo
    const key = `users/${currentConference?.id || 'null'}?search=${search || ''}`;

    const { data, error, isLoading, mutate } = useSWR(
        key, 
        fetcher,
        {
            keepPreviousData: true, // Mantiene los datos viejos mientras carga los nuevos
            revalidateOnFocus: false, 
        }
    );

    return {
        users: data || [],
        loading: isLoading,
        error,
        mutate
    };
}
