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

export const ClassicTemplate = ({
    certificate,
    bodyFont,
    displayFont,
    isSpeaker,
    isStaff,
    isOrganizer
}: TemplateProps) => {

    const conf = certificate.events.conferences;
    const config = conf?.certificate_config || certificate.events.certificate_config;

    const accent = config?.styles?.accent_color || '#dbf227'; 
    const textColor = config?.styles?.text_color || '#373737'; 
    
    const defaultTexts = {
         attendee: `Por su asistencia ${getEventArticle(certificate.events.type)} ${certificate.events.type}`,
         speaker: `Por impartir la ${certificate.events.type.toLowerCase()}:`,
         staff: "Por su valiosa participación en la logística del evento:",
         organizer: "Por su invaluable apoyo y liderazgo en la organización del evento:"
    };
    const texts = config?.texts || {};
    const roleText = isSpeaker ? (texts.speaker || defaultTexts.speaker) : isStaff ? (texts.staff || defaultTexts.staff) : isOrganizer ? (texts.organizer || defaultTexts.organizer) : (texts.attendee || defaultTexts.attendee);
    const signerCount = config?.signer_count || 1;
    const signers = config?.signers || [];
    const logos = config?.logos;

    return ( 
        <div 
            style={{ width: '279.4mm', height: '215.9mm', color: textColor, fontFamily: 'var(--font-playfair)' }} 
            className="certificate-container bg-[#faf9f6] relative overflow-hidden mx-auto p-12 flex flex-col justify-between"
        >
            {/* Classic Ornament Border */}
            <div className="absolute inset-4 border border-[#ddd] pointer-events-none"></div>
            <div className="absolute inset-6 border-[3px] border-double pointer-events-none" style={{ borderColor: accent }}></div>
            
            {/* Corners */}
            <div className="absolute top-6 left-6 w-16 h-16 border-t-[3px] border-l-[3px] pointer-events-none" style={{ borderColor: accent }}></div>
            <div className="absolute top-6 right-6 w-16 h-16 border-t-[3px] border-r-[3px] pointer-events-none" style={{ borderColor: accent }}></div>
            <div className="absolute bottom-6 left-6 w-16 h-16 border-b-[3px] border-l-[3px] pointer-events-none" style={{ borderColor: accent }}></div>
            <div className="absolute bottom-6 right-6 w-16 h-16 border-b-[3px] border-r-[3px] pointer-events-none" style={{ borderColor: accent }}></div>

            <div className="relative z-10 h-full flex flex-col justify-between px-12 py-8">
                <Header date={certificate.events.date} id={certificate.id} variant="classic" logos={logos} />
                
                <MainBody 
                     certificate={certificate} 
                     displayText={roleText} 
                     contextText={texts.context}
                     styles={{ accent_color: accent }} 
                     textColor={textColor} 
                     variant="classic"
                     displayFont={displayFont}
                     isStaff={isStaff}
                     isOrganizer={isOrganizer}
                />

                <div className="w-full flex justify-center mt-4">
                     <Signatures count={signerCount} signers={signers} align="center" color={textColor} />
                </div>
            </div>
        </div>
    );
};
