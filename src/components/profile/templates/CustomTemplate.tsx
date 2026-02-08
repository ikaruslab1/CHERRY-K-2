import React from 'react';
import { Certificate, Header, MainBody, Signatures, getEventArticle } from './CertificateShared';

interface TemplateProps {
    certificate: Certificate;
    bodyFont: string;
    displayFont: string;
    isSpeaker?: boolean;
    isStaff?: boolean;
    isOrganizer?: boolean;
}

export const CustomTemplate = ({
    certificate,
    bodyFont,
    displayFont,
    isSpeaker,
    isStaff,
    isOrganizer
}: TemplateProps) => {

    const conf = certificate.events.conferences;
    const config = conf?.certificate_config || certificate.events.certificate_config;

    const customStyles = config?.styles || {
        text_color: '#000000',
        accent_color: '#dbf227',
        font_family: 'sans',
        text_alignment: 'center',
        content_vertical_position: '40%'
    };

    const texts = config?.texts || {
        attendee: `Por su asistencia ${getEventArticle(certificate.events.type)} ${certificate.events.type}`,
        speaker: `Por impartir la ${certificate.events.type.toLowerCase()}:`,
        staff: "Por su valiosa participación en la logística del evento:",
        organizer: "Por su invaluable apoyo y liderazgo en la organización del evento:"
    };
    const roleText = isSpeaker ? texts.speaker : isStaff ? texts.staff : isOrganizer ? texts.organizer : texts.attendee;
    const signerCount = config?.signer_count || 1;
    const signers = config?.signers || [];

    return (
        <div 
            style={{ 
                width: '279.4mm', 
                height: '215.9mm',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'white',
                color: customStyles.text_color,
                fontFamily: bodyFont
            }} 
            className="certificate-container mx-auto shadow-none print:shadow-none flex flex-col p-12"
        >
            {/* Background Image */}
            {config?.background_url && (
                <img 
                    src={config.background_url} 
                    alt="Background" 
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
            )}
            
            {/* Layout Overlay */}
             <div className="relative z-10 h-full flex flex-col justify-between">
                <Header date={certificate.events.date} id={certificate.id} accent={customStyles.text_color} variant="default" />
                
                <MainBody 
                    certificate={certificate} 
                    displayText={roleText} 
                    contextText={texts.context}
                    styles={customStyles} 
                    textColor={customStyles.text_color} 
                    variant="default" // Default style for custom background to let background shine
                    displayFont={displayFont}
                    isStaff={isStaff}
                    isOrganizer={isOrganizer}
                />

                <div className="w-full flex justify-center mt-8">
                   <Signatures count={signerCount} signers={signers} align="center" color={customStyles.text_color} />
                </div>
            </div>
        </div>
    );
};
