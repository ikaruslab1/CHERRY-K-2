'use client';

import { CertificateDesigner } from '@/components/admin/CertificateDesigner';
import { useConference } from '@/context/ConferenceContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export function CertificateDesignView() {
    const { currentConference } = useConference();

    const handleSaveConfig = async (config: any) => {
        if (!currentConference) return;

        const { error } = await supabase
            .from('conferences')
            .update({ certificate_config: config })
            .eq('id', currentConference.id);

        if (error) {
            console.error('Error updating certificate config:', error);
            throw error;
        }
        
        // Note: We don't update global context here to avoid redirecting, 
        // effectively assuming the local state in CertificateDesigner is enough for now.
    };

    if (!currentConference) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#DBF227]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                <h2 className="font-bold text-lg truncate">
                    Diseño Global del Evento: <span className="text-[#373737]">{currentConference.title}</span>
                </h2>
            </div>
            <div className="flex-1 overflow-hidden -mx-4 md:-mx-8">
                    <CertificateDesigner 
                    eventId={currentConference.id} 
                    initialConfig={currentConference.certificate_config}
                    onSave={handleSaveConfig}
                />
            </div>
        </div>
    );
}
