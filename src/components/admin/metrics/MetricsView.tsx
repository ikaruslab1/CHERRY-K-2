'use client';

import { useState } from 'react';
import { EventMetricsDashboard } from './EventMetricsDashboard';
import { EventMetricsDetail } from './EventMetricsDetail';
import { GlobalCertUsersView } from './GlobalCertUsersView';
import { useConference } from '@/context/ConferenceContext';
import { BarChart2, Award } from 'lucide-react';

type MetricsTab = 'events' | 'global-cert';

export function MetricsView() {
  const { currentConference } = useConference();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<MetricsTab>('events');

  const showGlobalCertTab = currentConference?.gives_global_certificate === true;

  // Derive accent CSS for the tab badge
  const accentColor = currentConference?.accent_color;
  const isGradient = accentColor?.type === 'gradient';
  const tabAccentBg = isGradient ? accentColor.value : 'var(--color-acid)';
  const tabAccentText = 'var(--color-acid-text, #373737)';

  if (selectedEventId) {
    return (
      <div className="slide-in-right">
        <EventMetricsDetail
          eventId={selectedEventId}
          onBack={() => setSelectedEventId(null)}
        />
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      {/* Header + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#373737]">Dashboard de Métricas</h3>
          {showGlobalCertTab && (
            <p className="text-xs text-gray-400 mt-0.5">Selecciona una vista para explorar los datos.</p>
          )}
        </div>

        {showGlobalCertTab && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'events'
                  ? 'bg-white text-[#373737] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart2 className="h-4 w-4" />
              Eventos
            </button>
            <button
              onClick={() => setActiveTab('global-cert')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'global-cert'
                  ? 'text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={
                activeTab === 'global-cert'
                  ? { background: tabAccentBg, color: tabAccentText }
                  : undefined
              }
            >
              <Award className="h-4 w-4" />
              Constancias
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'events' || !showGlobalCertTab ? (
        <EventMetricsDashboard onSelectEvent={setSelectedEventId} />
      ) : (
        <GlobalCertUsersView />
      )}
    </div>
  );
}
