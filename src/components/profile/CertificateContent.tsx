import { DefaultTemplate } from './templates/DefaultTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CustomTemplate } from './templates/CustomTemplate';
import { Certificate } from './templates/CertificateShared';

export function CertificateContent({ certificate }: { certificate: Certificate }) {
    
    const conf = certificate.events.conferences;
    // Use conference config if available, otherwise fallback to event config (for backward compatibility)
    const config = conf?.certificate_config || certificate.events.certificate_config;

    // Determine Role
    const isSpeaker = certificate.isSpeaker;
    const isStaff = certificate.isStaff;
    const isOrganizer = certificate.isOrganizer;

    // --- GLOBAL STYLES LOGIC ---
    const styles = config?.styles || {};
    // Base font for structural text (always sans for readability)
    const bodyFont = 'var(--font-geist-sans)';
    // Display font for Name and Event (user selectable)
    const displayFont = styles.font_family === 'serif' ? 'var(--font-playfair)' : 
                      styles.font_family === 'mono' ? 'var(--font-geist-mono)' : 
                      styles.font_family === 'cursive' ? 'var(--font-great-vibes)' :
                      'var(--font-geist-sans)';

    // --- CUSTOM BACKGROUND MODE ---
    if (config?.mode === 'custom_background') {
        return (
            <CustomTemplate 
                certificate={certificate} 
                bodyFont={bodyFont} 
                displayFont={displayFont} 
                isSpeaker={isSpeaker} 
                isStaff={isStaff} 
                isOrganizer={isOrganizer} 
            />
        );
    }

    // --- TEMPLATE: CLASSIC / ELEGANT ---
    if (config?.template_id === 'classic') {
        return ( 
            <ClassicTemplate 
                certificate={certificate} 
                bodyFont={bodyFont} 
                displayFont={displayFont} 
                isSpeaker={isSpeaker} 
                isStaff={isStaff} 
                isOrganizer={isOrganizer} 
            />
        );
    }

    // --- TEMPLATE: MODERN / GEOMETRIC ---
    if (config?.template_id === 'modern') {
        return (
            <ModernTemplate 
                certificate={certificate} 
                bodyFont={bodyFont} 
                displayFont={displayFont} 
                isSpeaker={isSpeaker} 
                isStaff={isStaff} 
                isOrganizer={isOrganizer} 
            />
        );
    }

    // --- DEFAULT LAYOUT (Original Refactored - Split) ---
    return (
        <DefaultTemplate 
            certificate={certificate} 
            bodyFont={bodyFont} 
            displayFont={displayFont} 
            isSpeaker={isSpeaker} 
            isStaff={isStaff} 
            isOrganizer={isOrganizer} 
        />
    );
}

export type { Certificate };
