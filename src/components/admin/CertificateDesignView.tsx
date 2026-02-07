'use client';

import { CertificateDesigner } from '@/components/admin/CertificateDesigner';
import { useConference } from '@/context/ConferenceContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Event } from '@/types';
import { Loader2, Search, Calendar, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export function CertificateDesignView() {
    const { currentConference } = useConference();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (currentConference) {
            fetchEvents();
        }
    }, [currentConference]);

    const fetchEvents = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('conference_id', currentConference?.id)
            .order('date', { ascending: true });
        
        if (data) setEvents(data as Event[]);
        setLoading(false);
    };

    const handleSaveConfig = async (config: any) => {
        if (!selectedEventId) return;

        const { error } = await supabase
            .from('events')
            .update({ certificate_config: config })
            .eq('id', selectedEventId);

        if (error) {
            console.error('Error updating certificate config:', error);
            throw error; // Let the child component handle the error alert
        }
        
        // Update local state to reflect changes without refetching
        setEvents(events.map(ev => ev.id === selectedEventId ? { ...ev, certificate_config: config } : ev));
    };

    const filteredEvents = events.filter(ev => 
        ev.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ev.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedEvent = events.find(ev => ev.id === selectedEventId);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#DBF227]" />
            </div>
        );
    }

    if (selectedEventId && selectedEvent) {
        return (
            <div className="flex flex-col h-[calc(100vh-100px)]">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                    <button 
                        onClick={() => setSelectedEventId(null)}
                        className="text-sm text-gray-500 hover:text-black hover:underline"
                    >
                        ← Volver a la lista
                    </button>
                    <h2 className="font-bold text-lg truncate">
                        Editando: <span className="text-[#373737]">{selectedEvent.title}</span>
                    </h2>
                </div>
                <div className="flex-1 overflow-hidden -mx-4 md:-mx-8">
                     <CertificateDesigner 
                        eventId={selectedEvent.id}
                        initialConfig={selectedEvent.certificate_config}
                        onSave={handleSaveConfig}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-[#373737]">Editor de Constancias</h3>
                    <p className="text-sm text-gray-500">
                        Selecciona un evento para personalizar su constancia.
                    </p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar evento..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#DBF227] text-sm"
                    />
                </div>
            </div>

            {events.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="font-bold text-gray-800">No hay eventos registrados</h3>
                    <p className="text-gray-500 text-sm mt-2">
                        Crea eventos primero en la sección de "Gestión Eventos".
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEvents.map(event => {
                        const hasCustomConfig = event.certificate_config?.mode === 'custom_background';
                        const givesCertificate = event.gives_certificate;

                        return (
                            <button
                                key={event.id}
                                onClick={() => setSelectedEventId(event.id)}
                                className={`group text-left p-5 rounded-xl border transition-all hover:shadow-md relative overflow-hidden ${
                                    hasCustomConfig 
                                    ? 'bg-white border-[#DBF227] shadow-sm' 
                                    : 'bg-white border-gray-100 hover:border-gray-300'
                                }`}
                            >
                                {!givesCertificate && (
                                    <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                                        No da constancia
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 px-2 py-1 rounded-md">
                                        {event.type}
                                    </span>
                                    {hasCustomConfig ? (
                                        <CheckCircle2 className="w-5 h-5 text-[#DBF227]" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-100 group-hover:border-gray-300"></div>
                                    )}
                                </div>
                                
                                <h4 className="font-bold text-[#373737] line-clamp-2 mb-2 group-hover:text-black">
                                    {event.title}
                                </h4>
                                
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {new Date(event.date).toLocaleDateString([], {day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                </div>

                                {!givesCertificate && (
                                    <div className="mt-3 flex items-center gap-1.5 text-xs text-orange-500 bg-orange-50 p-2 rounded-lg">
                                        <AlertCircle className="w-3 h-3" />
                                        <span className="font-medium">Activa constancias en el evento</span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
