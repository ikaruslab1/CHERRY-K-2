'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { PublicAgenda } from '@/components/events/PublicAgenda';

export default function PublicAgendaPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const conferenceId = params.conferenceId as string;
    const hideHeader = searchParams.get('hideHeader') === 'true';

    return (
        <div className="min-h-screen bg-white">
            <PublicAgenda 
                conferenceId={conferenceId} 
                title={hideHeader ? undefined : "Cronograma del Evento"}
            />
        </div>
    );
}
