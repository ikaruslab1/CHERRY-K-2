'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useConference } from '@/context/ConferenceContext';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { Download, Award, Users, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EligibleUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  degree: string;
  events_attended: number;
}

function downloadCSVWithBOM(content: string, filename: string) {
  // Add UTF-8 BOM to fix accent/Ñ issues in Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function GlobalCertUsersView() {
  const { currentConference } = useConference();
  const [users, setUsers] = useState<EligibleUser[]>([]);
  const [loading, setLoading] = useState(true);

  const threshold = currentConference?.global_certificate_threshold || 1;

  // Use CSS variables for dynamic coloring based on the conference theme
  const bannerBg = 'rgb(var(--color-acid-rgb) / 0.12)';
  const bannerBorder = 'rgb(var(--color-acid-rgb) / 0.4)';
  const bannerAccentText = 'var(--color-acid-text, #373737)';
  const headerBg = 'rgb(var(--color-acid-rgb) / 0.08)';

  useEffect(() => {
    if (currentConference) loadEligibleUsers();
  }, [currentConference]);

  const loadEligibleUsers = async () => {
    if (!currentConference) return;
    setLoading(true);

    try {
      // 1. Get all attendance records for this conference grouped by user
      const { data: attendanceData, error } = await supabase
        .from('attendance')
        .select(`
          user_id,
          events!inner(id, conference_id)
        `)
        .eq('events.conference_id', currentConference.id)
        .not('scanned_at', 'is', null);

      if (error) throw error;

      // 2. Count unique events per user
      const userEventMap = new Map<string, Set<string>>();
      (attendanceData || []).forEach((record: any) => {
        const uid = record.user_id;
        const eid = record.events?.id;
        if (!uid || !eid) return;
        if (!userEventMap.has(uid)) userEventMap.set(uid, new Set());
        userEventMap.get(uid)!.add(eid);
      });

      // 3. Filter users who meet the threshold
      const eligibleIds = Array.from(userEventMap.entries())
        .filter(([_, events]) => events.size >= threshold)
        .map(([uid, events]) => ({ uid, count: events.size }));

      if (eligibleIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // 4. Fetch profiles for eligible users
      const ids = eligibleIds.map(e => e.uid);
      const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, degree')
        .in('id', ids);

      if (profError) throw profError;

      const result: EligibleUser[] = (profiles || []).map((p: any) => {
        const entry = eligibleIds.find(e => e.uid === p.id);
        return {
          user_id: p.id,
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          email: p.email || '',
          degree: p.degree || '',
          events_attended: entry?.count || 0,
        };
      });

      result.sort((a, b) => b.events_attended - a.events_attended);
      setUsers(result);
    } catch (err) {
      console.error('Error loading eligible users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (users.length === 0) return;
    const headers = ['Nombre', 'Apellido', 'Email', 'Grado', 'Eventos Asistidos'];
    const rows = users.map(u => [
      u.first_name,
      u.last_name,
      u.email,
      u.degree,
      String(u.events_attended),
    ]);
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    downloadCSVWithBOM(csv, `constancias_generales_${currentConference?.title || 'congreso'}.csv`);
  };

  if (loading) {
    return <ContentPlaceholder type="grid" count={3} />;
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Banner Header */}
      <div
        className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: bannerBg, borderColor: bannerBorder }}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: bannerBorder }}
          >
            <Award className="w-5 h-5" style={{ color: bannerAccentText }} />
          </div>
          <div>
            <h3 className="font-bold text-[#373737]">
              Usuarios con constancia general obtenida
            </h3>
            <p className="text-sm text-gray-500">
              {users.length} usuario{users.length !== 1 ? 's' : ''} alcanzaron {threshold} evento{threshold !== 1 ? 's' : ''} de asistencia requeridos.
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadEligibleUsers}
            className="gap-2 text-gray-600"
          >
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCSV}
            disabled={users.length === 0}
            className="gap-2 text-gray-600"
          >
            <Download className="h-4 w-4" /> Descargar CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{ borderColor: bannerBorder }}
      >
        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Ningún usuario ha alcanzado el umbral de {threshold} eventos aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead
                className="font-semibold border-b"
                style={{
                  background: bannerBg,
                  borderColor: bannerBorder,
                  color: '#374151',
                }}
              >
                <tr>
                  <th className="px-6 py-3">#</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Grado</th>
                  <th className="px-6 py-3 text-center">Eventos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-[#111111]">
                {users.map((user, idx) => (
                  <tr key={user.user_id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-3 text-gray-400 dark:text-gray-500 font-mono text-xs">{idx + 1}</td>
                    <td className="px-6 py-3">
                      <span className="font-semibold text-[#373737] dark:text-white">
                        {user.first_name} {user.last_name}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs break-all">
                      {user.email || '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-500 dark:text-gray-400 text-xs">
                      {user.degree || '—'}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: bannerBorder,
                          color: bannerAccentText,
                        }}
                      >
                        {user.events_attended} / {threshold}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
