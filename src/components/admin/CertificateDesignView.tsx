'use client';

import { CertificateDesigner } from '@/components/admin/CertificateDesigner';
import { DesktopRequiredWarning } from '@/components/ui/DesktopRequiredWarning';
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

    const handleSaveGlobalConfig = async (config: any) => {
        if (!currentConference) return;

        const { data, error } = await supabase
            .from('conferences')
            .update({ global_certificate_config: config })
            .eq('id', currentConference.id)
            .select();

        if (error) {
            console.error('Error updating global certificate config:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error('No se pudieron guardar los cambios de constancia general. Permisos insuficientes (RLS).');
        }
        
        if (refreshConference) {
            await refreshConference();
        }
    };

    if (!currentConference) {
        return (
            <div className="flex justify-center items-center py-20 ">
                <Loader2 className="w-8 h-8 animate-spin text-[#DBF227]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-60px)] relative">
            {/* Desktop View Recommended Warning Overlay for Mobile */}
            <DesktopRequiredWarning
                title="Editor de Constancias"
                description="El diseñador de constancias requiere un espacio de trabajo más amplio para ajustar tipografías, logotipos, márgenes y vistas previas del certificado."
                recommendedResolution="1280px+ (Escritorio)"
            />

            <div className="flex items-center gap-4 mb-2 pb-2 border-b border-gray-100 dark:border-zinc-800 px-4 lg:px-6">
                <h2 className="font-bold text-lg truncate text-gray-900 dark:text-white">
                    Diseño Global del Evento: <span className="text-[#373737] dark:text-gray-300">{currentConference.title}</span>
                </h2>
            </div>
            <div className="flex-1 overflow-hidden">
                <CertificateDesigner 
                    eventId={currentConference.id} 
                    initialConfig={currentConference.certificate_config}
                    initialGlobalConfig={(currentConference as any).global_certificate_config}
                    onSave={handleSaveConfig}
                    onSaveGlobal={handleSaveGlobalConfig}
                />
            </div>
        </div>
    );
}
