'use client';

import { CertificateDesigner } from '@/components/admin/CertificateDesigner';
import { useConference } from '@/context/ConferenceContext';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export function CertificateDesignView() {
    const { currentConference, refreshConference } = useConference();

    const handleSaveConfig = async (config: any) => {
        if (!currentConference) return;

        const { data, error } = await supabase
            .from('conferences')
            .update({ certificate_config: config })
            .eq('id', currentConference.id)
            .select();

        if (error) {
            console.error('Error updating certificate config:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.error('Update operation affected 0 rows. Check RLS policies.');
            throw new Error('No se pudieron guardan los cambios. Permisos insuficientes (RLS).');
        }
        
        if (refreshConference) {
            await refreshConference();
        }
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
