import React from 'react';
// @ts-ignore
import Barcode from 'react-barcode';
import NextImage from 'next/image';

// --- UTILITIES ---

export const getDegreeAbbr = (degree: string | null, gender: string | null) => {
    if (!degree || degree === 'Estudiante') return '';
    
    const isFemale = gender === 'Femenino';
    
    switch (degree) {
      case 'Licenciatura': return 'Lic.';
      case 'Maestría': return isFemale ? 'Mtra.' : 'Mtro.';
      case 'Doctorado': return isFemale ? 'Dra.' : 'Dr.';
      case 'Especialidad': return 'Esp.';
      case 'Profesor': return 'Prof.';
      case 'Profesora': return 'Profa.';
      default: return degree;
    }
};
  
export const getEventArticle = (type: string) => {
    if (!type) return 'al evento';
    const t = type.toLowerCase();
    const feminine = ['conferencia', 'mesa', 'ponencia', 'clase', 'plática', 'charla', 'actividad'];
    if (feminine.some(f => t.includes(f))) return 'a la';
    return 'al';
};

export const getContrastColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Mexico_City'
    });
};

// --- TYPES ---

// --- TYPES ---

import { Certificate, TextElementStyle } from '@/types/certificates';
export type { Certificate, TextElementStyle };

// --- TEXT STYLE UTILITIES ---

export const resolveFontSize = (size?: string): string => {
    const map: Record<string, string> = {
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
    };
    return map[size || '3xl'] || map['3xl'];
};

export const resolveFontFamily = (family?: string): string => {
    const map: Record<string, string> = {
        'sans': 'var(--font-geist-sans)',
        'serif': 'var(--font-playfair)',
        'mono': 'var(--font-geist-mono)',
        'cursive': 'var(--font-dancing-script)',
    };
    return map[family || 'sans'] || 'inherit';
};

// --- COMPONENTS ---

export const RealBarcode = ({ value, color = '#000' }: { value: string, color?: string }) => (
    <div className="opacity-80">
        <Barcode 
            value={value}
            format="CODE128"
            width={1}
            height={30}
            displayValue={false}
            background="transparent"
            lineColor={color}
            margin={0}
        />
    </div>
);

export const Signatures = ({ count, signers, color = '#000000', align = 'center', scale = 1, gap = 24 }: { count: number, signers: any[], color?: string, align?: 'center' | 'left' | 'right', scale?: number, gap?: number }) => {
    return (
        <div 
            className={`flex ${align === 'center' ? 'justify-center' : align === 'left' ? 'justify-start' : 'justify-end'} mt-2 w-full px-0`}
            style={{ gap: `${gap}px` }}
        >

            {Array.from({ length: count }).map((_, i) => {
                const signer = signers[i] || {};
                const name = signer.name || 'Ana María Cárdenas Vargas';
                const role = signer.role || 'Jefa de carrera en Diseño Gráfico';
                
                return (
                    <div key={i} className={`text-center flex flex-col items-center`} style={{ minWidth: `${(count > 2 ? 150 : 200) * scale}px` }}>
                        {/* Barcode (replacing QR logic) */}
                        <div className="mb-1 w-full flex justify-center items-end overflow-hidden opacity-75" style={{ height: `${32 * scale}px` }}>
                            <div style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}>
                                <RealBarcode value={name ? name.toUpperCase().replace(/[^A-Z0-9]/g, '') : `SIGNER${i+1}`} color={color} />
                            </div>
                        </div>
                        
                        {/* Divider Line */}
                        <div className="w-full border-b border-gray-400 mb-2 opacity-50"></div>
                        
                        {/* Name & Role */}
                        <p className="font-bold uppercase whitespace-nowrap leading-tight" style={{ color: color, fontSize: `${0.875 * scale}rem` }}>
                            {getDegreeAbbr(signer.degree, signer.gender)} {name}
                        </p>
                        <p className="opacity-70 whitespace-nowrap leading-tight" style={{ color: color, fontSize: `${0.625 * scale}rem` }}>{role}</p>
                    </div>
                );
            })}
        </div>
    )
};

export const Header = ({ date, id, accent = '#000', variant = 'default', logos }: { date: string, id?: string, accent?: string, variant?: 'default' | 'modern' | 'classic', logos?: any[] }) => {
    // Default logos if none provided (Backward Compatibility)
    // If logos array is empty or undefined, use default unam/fesa
    // But if it's explicitly passed as empty array [], it means no logos? Requirements say "Por defecto siempre van a aparecer los logos unam y fesa".
    // So if config.logos is missing, fallback. If present, use it.
    const effectiveLogos = (logos && logos.length > 0) ? logos : [
        { type: 'preset', value: 'unam' },
        { type: 'preset', value: 'fesa' }
    ];

    const activeLogos = effectiveLogos.filter(l => l && l.type !== 'none' && l.value);

    return (
        <div className={`flex justify-between items-start w-full mb-8 relative z-10 ${variant === 'classic' ? 'font-serif' : 'font-sans'}`}>
            {/* Logos Left */}
            <div className="flex items-center gap-4 h-16">
                 {activeLogos.map((logo, index) => {
                     const logoUrl = logo.type === 'preset' ? `/assets/${logo.value}.svg` : logo.value;
                     return (
                         <div key={index} className="flex items-center gap-4 h-full"> 
                             <NextImage 
                                src={logoUrl} 
                                alt={`Logo ${index + 1}`} 
                                width={120}
                                height={64}
                                className="h-full w-auto object-contain max-w-[120px]" 
                                style={{ filter: accent === '#ffffff' ? 'brightness(0) invert(1)' : 'brightness(0)' }} 
                             />
                             {index < activeLogos.length - 1 && (
                                 <div className="h-10 w-[1px] bg-current opacity-20" style={{ backgroundColor: accent }}></div>
                             )}
                         </div>
                     );
                 })}
            </div> 
            {/* Date Right */}
            <div className="text-right" style={{ color: accent }}>
                <p className={`text-sm ${variant === 'modern' ? 'font-bold' : 'font-medium'}`}>{formatDate(date)}</p>
                {id && <p className="text-[10px] opacity-60 mt-0.5 font-mono tracking-widest">ID: {id.split('-')[0].toUpperCase()}</p>}
            </div>
        </div>
    );
};

export const MainBody = ({ 
    certificate, 
    displayText, 
    contextText,
    styles,
    textColor,
    variant = 'default',
    displayFont,
    align = 'center',
    isStaff,
    isOrganizer,
    nameStyle,
    eventTitleStyle
}: { 
    certificate: Certificate, 
    displayText: string, 
    contextText?: string,
    styles: any,
    textColor: string,
    variant?: 'default' | 'modern' | 'classic',
    displayFont: string,
    align?: 'center' | 'left' | 'right',
    isStaff?: boolean,
    isOrganizer?: boolean,
    nameStyle?: TextElementStyle,
    eventTitleStyle?: TextElementStyle
}) => {
    // Dynamic Styles based on variant
    const titleFont = variant === 'classic' ? 'var(--font-playfair)' : 'var(--font-geist-sans)';
    // const nameFont = variant === 'classic' ? 'var(--font-great-vibes)' : 'inherit';
    
    // Determine alignment classes
    const alignmentClasses = align === 'right' ? 'items-end text-right' : align === 'left' ? 'items-start text-left' : 'items-center text-center';
    const marginClasses = align === 'right' ? 'ml-auto mr-0' : align === 'left' ? 'mr-auto ml-0' : 'mx-auto';

    // Resolved text element styles
    const nameResolvedFont = nameStyle?.fontFamily ? resolveFontFamily(nameStyle.fontFamily) : displayFont;
    const nameResolvedSize = nameStyle?.fontSize ? resolveFontSize(nameStyle.fontSize) : undefined;
    const nameResolvedAlign = nameStyle?.textAlign || undefined;
    const nameResolvedLineHeight = nameStyle?.lineHeight || undefined;

    const eventResolvedFont = eventTitleStyle?.fontFamily ? resolveFontFamily(eventTitleStyle.fontFamily) : displayFont;
    const eventResolvedSize = eventTitleStyle?.fontSize ? resolveFontSize(eventTitleStyle.fontSize) : undefined;
    const eventResolvedAlign = eventTitleStyle?.textAlign || undefined;
    const eventResolvedLineHeight = eventTitleStyle?.lineHeight || undefined;

    return (
        <div className={`flex-1 flex flex-col ${alignmentClasses} justify-center z-10 w-full max-w-4xl ${marginClasses} px-8`}>
            {/* Constancia Title */}
            {variant === 'modern' ? (
                 <div className="relative mb-4">
                    <div className="absolute -inset-4 bg-gray-100 skew-x-[-10deg] opacity-50 -z-10 transform scale-110"></div>
                    <h1 className="text-[90px] font-black leading-none tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600" style={{ fontFamily: titleFont }}>
                        CONSTANCIA
                    </h1>
                 </div>
            ) : (
                <h1 className={`${variant === 'classic' ? 'text-[70px] tracking-widest font-serif text-gray-800' : 'text-[80px] font-bold tracking-widest'} leading-none uppercase mb-2`} style={{ fontFamily: titleFont }}>
                    CONSTANCIA
                </h1>
            )}

            {/* Subtitle */}
            {variant === 'modern' ? (
                 <h2 className="text-xl font-bold tracking-[0.5em] uppercase mb-10 text-white bg-black px-6 py-1 transform -skew-x-10">
                    de participación
                </h2>
            ) : variant === 'classic' ? (
                <h2 className="text-2xl font-serif italic tracking-widest mb-10 text-gray-500">
                    — de participación —
                </h2>
            ) : (
                <h2 className="text-3xl font-light tracking-[0.2em] uppercase mb-12 opacity-90">
                    de participación
                </h2>
            )}

            {/* Role Text */}
            <p className={`text-lg mb-2 opacity-80 max-w-2xl ${variant === 'classic' ? 'font-serif italic text-gray-600' : variant === 'modern' ? 'font-bold text-gray-500 uppercase text-sm tracking-wide' : 'font-light'}`}>
                a:
            </p>

            {/* Name */}
            <h3 
                className={`${variant === 'classic' ? 'text-6xl font-normal my-4' : variant === 'modern' ? 'text-6xl font-black uppercase tracking-tight my-2 leading-none' : 'text-5xl font-bold mb-6'}`} 
                style={{ 
                    color: styles.accent_color, 
                    fontFamily: nameResolvedFont,
                    ...(nameResolvedSize && { fontSize: nameResolvedSize }),
                    ...(nameResolvedAlign && { textAlign: nameResolvedAlign as any }),
                    ...(nameResolvedLineHeight && { lineHeight: nameResolvedLineHeight }),
                }}
            >
                {getDegreeAbbr(certificate.profiles.degree, certificate.profiles.gender)} {certificate.profiles.first_name} {certificate.profiles.last_name}
            </h3>

            {/* Divider */}
            {variant === 'classic' ? (
                 <div className={`w-full max-w-sm h-px bg-gray-300 mb-8 ${marginClasses} relative flex items-center justify-center`}>
                     <div className="w-2 h-2 rounded-full border border-gray-400 bg-white absolute"></div>
                 </div>
            ) : variant === 'modern' ? (
                <div className={`w-24 h-2 mb-6 ${marginClasses}`} style={{ backgroundColor: styles.accent_color }}></div>
            ) : (
                <div className={`w-32 h-1 bg-current mb-6 opacity-20 ${marginClasses}`}></div>
            )}

            {/* Event Context */}
            <p className={`text-lg mb-1 opacity-80 max-w-2xl ${variant === 'classic' ? 'font-serif italic text-gray-600' : variant === 'modern' ? 'font-bold text-gray-500 uppercase text-sm tracking-wide' : 'font-light'}`}>
                {displayText}
            </p>

            {/* Event Title */}
            <h4 
                className={`${variant === 'classic' ? 'text-3xl font-serif font-bold text-gray-800' : variant === 'modern' ? 'text-4xl font-black uppercase tracking-tighter leading-none' : 'text-3xl font-bold uppercase'} mb-2 max-w-3xl`}
                style={{ 
                    fontFamily: eventResolvedFont,
                    ...(eventResolvedSize && { fontSize: eventResolvedSize }),
                    ...(eventResolvedAlign && { textAlign: eventResolvedAlign as any }),
                    ...(eventResolvedLineHeight && { lineHeight: eventResolvedLineHeight }),
                    ...(!eventResolvedLineHeight && { lineHeight: '1.1' }),
                }}
            >
                {certificate.events.title}
            </h4>

            {/* Global Event Context */}
            {(!isStaff && !isOrganizer && !certificate.isStaff && !certificate.isOrganizer) && (certificate.events.conferences?.title || contextText) && (
                 <p className={`text-lg mb-10 opacity-80 max-w-2xl ${variant === 'classic' ? 'font-serif italic text-gray-600' : variant === 'modern' ? 'font-bold text-gray-500 uppercase text-sm tracking-wide' : 'font-light'}`}>
                    {contextText || 'En el marco del'} {certificate.events.conferences?.title}
                </p>
            )}

            {/* Motto */}
            <p className={`text-sm opacity-70 ${variant === 'classic' ? 'font-serif italic text-gray-400' : 'font-serif italic'}`}>
                "Por mi raza hablará el espíritu"
            </p>
        </div>
    );
};
