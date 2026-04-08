'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { PublicAgenda } from '@/components/events/PublicAgenda';
import { useLanguage } from '@/context/LanguageContext';

export default function PublicAgendaPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const conferenceId = params.conferenceId as string;
    const hideHeader = searchParams.get('hideHeader') === 'true';

    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-white">
            <PublicAgenda 
                conferenceId={conferenceId} 
                title={hideHeader ? undefined : t('agenda.public_title')}
            />
        </div>
    );
}
