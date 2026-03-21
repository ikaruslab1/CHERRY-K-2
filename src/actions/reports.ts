'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { UserProfile } from '@/types';

export async function getConferenceReportData(conferenceId: string, roleType: 'organizers' | 'users') {
  try {
    // 1. Fetch full profiles for these users using the RPC to avoid URL length limits
    const { data: profiles, error: profilesError } = await supabaseAdmin.rpc('get_conference_report_data', {
      p_conference_id: conferenceId,
      p_role_type: roleType
    });

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) return { success: true, data: [] };

    // 3. Fetch attendance and interests in parallel
    const [attendanceRes, interestsRes, usersMetadataRes] = await Promise.all([
      supabaseAdmin
        .from('attendance')
        .select('user_id, event_id, events(title)')
        .eq('events.conference_id', conferenceId)
        .not('scanned_at', 'is', null),
      supabaseAdmin
        .from('event_interests')
        .select('user_id, event_id, events(title)')
        .eq('events.conference_id', conferenceId),
      // List auth users to get metadata. In reality we should do this in batches if >= 1000
      // but for now 1000 is likely enough
      supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    ]);

    if (attendanceRes.error) throw attendanceRes.error;
    if (interestsRes.error) throw interestsRes.error;
    if (usersMetadataRes.error) throw usersMetadataRes.error;

    const attendance = attendanceRes.data || [];
    const interests = interestsRes.data || [];
    const authUsers = usersMetadataRes.data.users || [];

    // Create a map for quick lookup
    const authUserMap = new Map(authUsers.map(u => [u.id, u]));

    // 4. Combine data
    // 4. Combine data
    const reportData = (profiles as any[]).map(profile => {
      const authUser = authUserMap.get(profile.id);
      const customData = authUser?.user_metadata?.custom_data || {};
      
      const userAttendance = Array.from(new Set(attendance
        .filter(a => a.user_id === profile.id)
        .map(a => (a.events as any)?.title)
        .filter(Boolean)));
        
      const userInterests = Array.from(new Set(interests
        .filter(i => i.user_id === profile.id)
        .map(i => (i.events as any)?.title)
        .filter(Boolean)));

      return {
        ...profile,
        custom_data: customData,
        asistencias: userAttendance,
        intereses: userInterests,
      };
    });

    return { success: true, data: reportData };
  } catch (err: any) {
    console.error('Error in getConferenceReportData:', err);
    return { success: false, error: err.message };
  }
}
