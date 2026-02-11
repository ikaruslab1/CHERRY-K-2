
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { useConference } from '@/context/ConferenceContext';

// Fetcher specific for platform users NOT in the current conference
const fetcher = async (url: string) => {
    // Url format: platform-users/conferenceId?search=term
    const parts = url.split('?');
    const pathParts = parts[0].split('/');
    const conferenceId = pathParts[1];
    
    const params = new URLSearchParams(parts[1]);
    const search = params.get('search');
    
    // 1. Get all user IDs associated with this conference (Roles AND Access)
    if (conferenceId && conferenceId !== 'null' && conferenceId !== 'undefined') {
        const [rolesRes, accessRes] = await Promise.all([
            supabase
                .from('conference_roles')
                .select('user_id')
                .eq('conference_id', conferenceId),
            
            supabase
                .from('conference_access')
                .select('user_id')
                .eq('conference_id', conferenceId)
        ]);
            
        if (rolesRes.error) throw rolesRes.error;
        if (accessRes.error) throw accessRes.error;
        
        // Combine IDs from both sources
        const roleIds = rolesRes.data?.map(r => r.user_id) || [];
        const accessIds = accessRes.data?.map(a => a.user_id) || [];
        
        // Use Set to get unique IDs to exclude
        const excludedIds = [...new Set([...roleIds, ...accessIds])];
        
        // 2. Fetch profiles NOT in this list
        let query = supabase
            .from('profiles')
            .select('id, first_name, last_name, short_id, degree, is_owner, email')
            .order('created_at', { ascending: false })
            .limit(50); // Pagination limit for performance

        if (excludedIds.length > 0) {
            // Use NOT IN filter
            // Note: If the list is huge, this might fail (URL length limits). 
            // For typical conference sizes (< 1000 users), this is fine.
            query = query.not('id', 'in', `(${excludedIds.join(',')})`);
        }

        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,short_id.ilike.%${search}%`);
        }
        
        const { data, error } = await query;
        if (error) throw error;

        // Map data to include synthetic role (default to 'user' or 'owner')
        const mappedData = (data as any[]).map(u => ({
            ...u,
            role: u.is_owner ? 'owner' : 'user'
        }));

        return mappedData as unknown as UserProfile[];
    } else {
        // If no conference is selected, technically all users are "platform users" 
        // but typically useUsers handles the "global" view. 
        // However, to be consistent, we return empty or all users depending on requirement.
        // User asked for "users not in the event". If no event, maybe show nothing or all?
        // Let's assume this hook is only used when there is an active event to distinguish vs event users.
        return [];
    }
};

export function usePlatformUsers(search: string) {
    const { currentConference } = useConference();
    
    const key = `platform-users/${currentConference?.id || 'null'}?search=${search || ''}`;

    const { data, error, isLoading, mutate } = useSWR(
        key, 
        fetcher,
        {
            keepPreviousData: true,
            revalidateOnFocus: false, 
        }
    );

    return {
        platformUsers: data || [],
        loading: isLoading,
        error,
        mutate
    };
}
