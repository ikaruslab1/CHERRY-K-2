
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

// Fetcher genérico para Supabase
const fetcher = async (queryKey: string) => {
    // queryKey podría ser 'users' o 'users?search=xyz'
    const params = new URLSearchParams(queryKey.split('?')[1]);
    const search = params.get('search');
    
    let query = supabase
        .from('profiles')
        .select('id, first_name, last_name, short_id, degree, role, email')
        .order('created_at', { ascending: false })
        .limit(50);

    if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,short_id.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as unknown as UserProfile[];
};

export function useUsers(search: string) {
    // SWR manejará el caching, revalidación y deduplicación de requests automáticamente
    // Si search cambia, SWR crea una nueva entrada en caché
    const { data, error, isLoading, mutate } = useSWR(
        `users?search=${search}`, 
        fetcher,
        {
            keepPreviousData: true, // Mantiene los datos viejos mientras carga los nuevos (evita parpadeos)
            revalidateOnFocus: false, // Opcional: Evita recargas agresivas al cambiar de ventana
        }
    );

    return {
        users: data || [],
        loading: isLoading,
        error,
        mutate // Función para forzar recarga (útil después de editar un usuario)
    };
}
