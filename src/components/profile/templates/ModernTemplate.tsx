import React from 'react';
import { Certificate, Header, MainBody, Signatures, getEventArticle } from './CertificateShared';
import NextImage from 'next/image';

interface TemplateProps {
    certificate: Certificate;
    bodyFont: string;
    displayFont: string;
    isSpeaker?: boolean;
    isStaff?: boolean;
    isOrganizer?: boolean;
}

export const ModernTemplate = ({
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
    const textColor = config?.styles?.text_color || '#000000'; 
    
    // Calculate contrast color for logos in the top part of the gradient (accent color)
    const getContrastColor = (hexColor: string) => {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    };
    const logoContrast = getContrastColor(accent);

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
    const effectiveLogos = (logos && logos.length > 0) ? logos : [
        { type: 'preset', value: 'unam' },
        { type: 'preset', value: 'fesa' }
    ];
    const activeLogos = effectiveLogos.filter((l: any) => l && l.type !== 'none' && l.value);

    // Date Formatting (re-implemented here since we split Header)
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
    };

    return (
        <div 
            style={{ width: '279.4mm', height: '215.9mm', color: textColor, fontFamily: 'var(--font-geist-sans)' }} 
            className="certificate-container bg-white relative overflow-hidden mx-auto flex flex-row shadow-none print:shadow-none"
        >
            {/* Left Sidebar - Gradient & Logos */}
            <div 
                className="w-[22%] h-full flex flex-col items-center justify-start py-16 gap-12 relative z-10"
                style={{ 
                    background: `linear-gradient(to bottom, ${accent} 0%, #ffffff 100%)` 
                }}
            >
                <div className="flex flex-col items-center gap-8 w-full px-6">
                    {activeLogos.map((logo: any, index: number) => {
                         const logoUrl = logo.type === 'preset' ? `/assets/${logo.value}.svg` : logo.value;
                         return (
                             <React.Fragment key={index}>
                                <NextImage
                                    src={logoUrl}
                                    alt={`Logo ${index + 1}`}
                                    width={150}
                                    height={120}
                                    className="w-full h-auto object-contain max-h-[120px] opacity-90"
                                    style={{ filter: logoContrast === '#ffffff' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                                />
                                {index < activeLogos.length - 1 && (
                                    <div className="w-[40%] h-[1px] bg-current opacity-30" style={{ color: logoContrast }}></div>
                                )}
                             </React.Fragment>
                         );
                    })}
                </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 h-full flex flex-col justify-between py-12 pr-12 pl-8 relative">
                 {/* Modern Geometric Overlay (optional reduced) */}
                 <div className="absolute top-0 right-0 w-[40%] h-[60%] bg-gray-50 skew-x-12 origin-top pointer-events-none -z-0 opacity-50"></div>

                 {/* Top Right: Date & ID */}
                 <div className="text-right z-10">
                    <p className="text-sm font-bold uppercase tracking-wider">{formatDate(certificate.events.date)}</p>
                    <p className="text-[10px] opacity-50 mt-1 font-mono tracking-widest">ID: {certificate.id.split('-')[0].toUpperCase()}</p>
                 </div>
                
                 {/* Main Body - Right Aligned */}
                 <div className="flex-1 flex flex-col justify-center">
                     <MainBody 
                         certificate={certificate} 
                         displayText={roleText} 
                         contextText={texts.context}
                         styles={{ accent_color: accent }} 
                         textColor={textColor} 
                         variant="modern"
                         displayFont={displayFont}
                         align="center"
                         isStaff={isStaff}
                         isOrganizer={isOrganizer}
                         nameStyle={config?.name_style}
                         eventTitleStyle={config?.event_title_style}
                     />
                 </div>

                 {/* Signatures - Right Aligned */}
                 <div className="w-full flex justify-center mt-8 z-10">
                     <Signatures count={signerCount} signers={signers} align="center" color={textColor} />
                 </div>
            </div>
        </div>
    );
};
