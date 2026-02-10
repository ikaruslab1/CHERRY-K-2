'use client';

import { useState } from 'react';
import { EventMetricsDashboard } from './EventMetricsDashboard';
import { EventMetricsDetail } from './EventMetricsDetail';

export function MetricsView() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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
    <div className="fade-in">
        <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-[#373737]">Dashboard de Métricas</h3>
        </div>
        <EventMetricsDashboard onSelectEvent={setSelectedEventId} />
    </div>
  );
}
