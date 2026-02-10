'use client';

import { useState, useEffect } from 'react';
import { metricsService, EventMetricSummary } from '@/services/metricsService';
import { useConference } from '@/context/ConferenceContext';
import { formatMexicoDate } from '@/lib/dateUtils';
import { ContentPlaceholder } from '@/components/ui/ContentPlaceholder';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BarChart2, Users, Calendar, AlertCircle } from 'lucide-react';

interface EventMetricsDashboardProps {
  onSelectEvent: (eventId: string) => void;
}

export function EventMetricsDashboard({ onSelectEvent }: EventMetricsDashboardProps) {
  const { currentConference } = useConference();
  const [metrics, setMetrics] = useState<EventMetricSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentConference) {
      loadMetrics();
    }
  }, [currentConference]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
        const data = await metricsService.getEventMetrics(currentConference!.id);
        setMetrics(data);
    } catch (error) {
        console.error("Error loading metrics", error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return <ContentPlaceholder type="grid" count={3} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-[#373737]">Dashboard de Métricas</h2>
           <p className="text-gray-500 text-sm">Monitoreo de asistencia e interés por evento.</p>
        </div>
        <Button variant="outline" onClick={loadMetrics} className="gap-2">
            <BarChart2 className="h-4 w-4 text-black" /> <span className="text-black">Actualizar</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((event) => {
          const attendanceRate = event.total_interested > 0 
            ? Math.round((event.unique_attendees / event.total_interested) * 100) 
            : 0;
            
          const isMultiDay = event.duration_days > 1;

          return (
            <div 
                key={event.event_id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-bold text-lg text-[#373737] leading-tight line-clamp-2">
                        {event.title}
                    </h3>
                    {isMultiDay && (
                        <span className="shrink-0 bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                            {event.duration_days} Días
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4" />
                    {formatMexicoDate(event.date, { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>

                {/* Metrics Visualization */}
                <div className="space-y-3 bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="flex justify-between items-end text-sm">
                        <span className="text-gray-500 font-medium">Asistencia</span>
                        <div className="text-right">
                            <span className="font-bold text-[#373737] text-lg">{event.unique_attendees}</span>
                            <span className="text-gray-400 text-xs mx-1">/</span>
                            <span className="text-gray-400 text-xs">{event.total_interested} interesados</span>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                                attendanceRate > 80 ? 'bg-green-500' : 
                                attendanceRate > 50 ? 'bg-[#DBF227]' : 'bg-orange-400'
                            }`}
                            style={{ width: `${Math.min(attendanceRate, 100)}%` }}
                        />
                    </div>
                    
                    <div className="text-right text-xs font-bold text-gray-400">
                        {attendanceRate}% Asistencia efectiva
                    </div>
                </div>
              </div>

              <Button 
                onClick={() => onSelectEvent(event.event_id)} 
                className="w-full bg-white border border-gray-200 text-[#373737] hover:bg-gray-50 hover:border-gray-300 justify-between group"
              >
                 Ver Detalles
                 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          );
        })}

        {metrics.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                No hay eventos registrados para analizar.
            </div>
        )}
      </div>
    </div>
  );
}
