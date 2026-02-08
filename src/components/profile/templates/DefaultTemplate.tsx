import React from 'react';
import { Certificate, Header, Signatures, getEventArticle, getDegreeAbbr, getContrastColor } from './CertificateShared';

interface TemplateProps {
    certificate: Certificate;
    bodyFont: string;
    displayFont: string;
    isSpeaker?: boolean;
    isStaff?: boolean;
    isOrganizer?: boolean;
}

export const DefaultTemplate = ({
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
    const contrastColor = getContrastColor(accent);
    const textColor = '#1a1a1a';
    
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

    return (
        <div 
            style={{ 
                width: '279.4mm', 
                height: '215.9mm',
                fontFamily: bodyFont,
                backgroundColor: 'white',
            }} 
            className="certificate-container relative overflow-hidden mx-auto shadow-none print:shadow-none flex flex-col"
        >
             {/* TOP HALF - Accent Background */}
             <div 
                style={{ backgroundColor: accent, color: contrastColor, height: '50%' }} 
                className="w-full relative flex flex-col items-center p-8 pb-0"
             >
                 {/* Header (Logos & Date) */}
                 <div className="w-full mb-0">
                     <Header date={certificate.events.date} id={certificate.id} accent={contrastColor} variant="default" />
                 </div>

                 {/* Title Section */}
                 <div className="flex-1 flex flex-col justify-center items-center text-center -mt-16">
                    <p className="text-xs uppercase tracking-[0.3em] opacity-80 mb-1 leading-none">
                        Se otorga la presente
                    </p>
                    <h1 className="text-[90px] font-bold tracking-widest leading-none uppercase mb-1">
                        CONSTANCIA
                    </h1>
                    <h2 className="text-2xl font-light tracking-[0.2em] uppercase opacity-90 leading-none">
                        de participación
                    </h2>
                 </div>

                 {/* Decorative Line at Bottom of Block */}
                 <div className="w-full h-4 bg-white opacity-20 absolute bottom-0 left-0"></div>
                 <div className="w-full h-1 absolute bottom-4 left-0" style={{ backgroundColor: contrastColor, opacity: 0.3 }}></div>
             </div>
             
             {/* BOTTOM HALF - White Background */}
             <div className="h-[50%] bg-white text-[#1a1a1a] flex flex-col items-center p-8 pt-4 relative">
                {/* Accent Line separate from block */}
                <div className="absolute top-1 left-0 w-full h-1" style={{ backgroundColor: accent }}></div>

                {/* Section 1: Main Content */}
                <div className="flex-1 flex flex-col justify-center items-center w-full max-w-4xl mx-auto">
                    {/* Role Text */}
                    <p className="text-base mb-1 opacity-80 font-light leading-none">
                        a:
                    </p>

                    {/* Name */}
                    <h3 
                        className="text-5xl font-bold mb-2 leading-none" 
                        style={{ color: accent, fontFamily: displayFont }}
                    >
                        {getDegreeAbbr(certificate.profiles.degree, certificate.profiles.gender)} {certificate.profiles.first_name} {certificate.profiles.last_name}
                    </h3>

                    {/* Divider */}
                    <div className="w-24 h-0.5 bg-gray-200 mb-2 mx-auto"></div>

                    {/* Event Context */}
                    <p className="text-base mb-2 opacity-80 font-light leading-none">
                        {roleText}
                    </p>

                    {/* Event Title */}
                    <h4 
                        className="text-3xl font-bold uppercase mb-2 max-w-3xl mx-auto leading-tight"
                        style={{ fontFamily: displayFont }}
                    >
                        {certificate.events.title}
                    </h4>

                    {/* Global Event Context */}
                    {(!isStaff && !isOrganizer) && (certificate.events.conferences?.title || texts.context) && (
                         <p className="text-base mb-8 opacity-80 font-light leading-none">
                            {texts.context || 'En el marco del'} {certificate.events.conferences?.title}
                        </p>
                    )}
                </div>

                {/* Section 2: Motto & Address */}
                <div className="mb-8 flex flex-col items-center gap-1">
                    <p className="text-sm opacity-70 font-serif italic leading-none">
                        "Por mi raza hablará el espíritu"
                    </p>
                    <p className="text-[9px] opacity-50 uppercase tracking-wider leading-none">
                        Naucalpan de Juárez, Méx. Av. Jardines de San Mateo s/n, Sta Cruz Acatlan
                    </p>
                </div>

                {/* Section 3: Signatures */}
                <div className="w-full flex justify-center mb-6">
                    <Signatures count={signerCount} signers={signers} align="center" color="#1a1a1a" />
                </div>
             </div>
        </div>
    );
};
