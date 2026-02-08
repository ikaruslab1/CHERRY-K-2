import { QRCodeSVG } from 'qrcode.react';
import { Award } from 'lucide-react';

// Utility for degree abbreviations
const getDegreeAbbr = (degree: string | null, gender: string | null) => {
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
  
  // Utility for event article
  const getEventArticle = (type: string) => {
    if (!type) return 'al evento';
    const t = type.toLowerCase();
    const feminine = ['conferencia', 'mesa', 'ponencia', 'clase', 'plática', 'charla', 'actividad'];
    if (feminine.some(f => t.includes(f))) return 'a la';
    return 'al';
  };

  // Utility for contrast color
  const getContrastColor = (hexColor: string) => {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? '#000000' : '#ffffff';
  };

interface Certificate {
    id: string; // attendance id
    scanned_at: string;
    events: {
      id: string;
      title: string;
      date: string; // Timestamptz
      type: string;
      location: string;
      description: string;
      conferences?: {
          title: string;
          institution_name: string;
          department_name: string;
          certificate_config?: any; // Add config to conference
      };
      // Certificate config from DB (legacy event config)
      certificate_config?: {
        mode: 'template_v1' | 'custom_background';
        background_url?: string;
        styles?: {
          text_color: string;
          accent_color: string; 
          font_family: string;
          text_alignment: 'left' | 'center' | 'right';
          content_vertical_position: string; 
        };
        texts?: {
          attendee: string;
          speaker: string;
          staff: string;
          organizer: string;
        };
        signers?: Array<{
           name: string;
           role: string;
           signature_url?: string;
        }>;
        show_qr?: boolean;
        qr_position?: 'bottom-left' | 'bottom-right';
      } | null;
    };
    profiles: {
        first_name: string;
        last_name: string;
        degree: string | null;
        gender: string | null;
    }
    isSpeaker?: boolean;
    isStaff?: boolean;
    isOrganizer?: boolean;
}

export function CertificateContent({ certificate }: { certificate: Certificate }) {
    // Function to format event date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
    };
    
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

    // --- SIGNER LOGIC ---
    const signerCount = config?.signer_count || 1;
    const signers = config?.signers || [];

    // Simple Mock Barcode Component
    const MockBarcode = ({ color = '#000' }: { color?: string }) => (
        <div className="flex h-10 items-end justify-center gap-[3px] opacity-80 select-none overflow-hidden" style={{ color }}>
            {Array.from({ length: 25 }).map((_, i) => (
                <div 
                    key={i} 
                    className="bg-current" 
                    style={{ 
                        height: `${Math.max(60, Math.random() * 100)}%`,
                        width: Math.random() > 0.6 ? '3px' : '1px'
                    }} 
                />
            ))}
        </div>
    );

    // Helper to generate signature blocks -- Compact Version
    const Signatures = ({ count, color = '#000000', align = 'center' }: { count: number, color?: string, align?: 'center' | 'left' | 'right' }) => {
        return (
            <div className={`flex gap-6 ${align === 'center' ? 'justify-center' : align === 'left' ? 'justify-start' : 'justify-end'} mt-2 w-full px-0`}>

                {Array.from({ length: count }).map((_, i) => {
                    const signer = signers[i] || {};
                    const name = signer.name || 'Ana María Cárdenas Vargas';
                    const role = signer.role || 'Jefa de carrera en Diseño Gráfico';
                    
                    return (
                        <div key={i} className={`text-center flex flex-col items-center ${count > 2 ? 'min-w-[150px]' : 'min-w-[200px]'}`}>
                            {/* Barcode (replacing QR logic) */}
                            <div className="mb-2 w-full flex justify-center">
                                <MockBarcode color={color} />
                            </div>
                            
                            {/* Divider Line */}
                            <div className="w-full border-b border-gray-400 mb-2 opacity-50"></div>
                            
                            {/* Name & Role */}
                            <p className="text-sm font-bold uppercase whitespace-nowrap" style={{ color: color }}>{name}</p>
                            <p className="text-[10px] opacity-70 whitespace-nowrap" style={{ color: color }}>{role}</p>
                        </div>
                    );
                })}
            </div>
        )
    };

    // --- LAYOUT HELPERS ---
    const Header = ({ date, accent = '#000', variant = 'default' }: { date: string, accent?: string, variant?: 'default' | 'modern' | 'classic' }) => (
        <div className={`flex justify-between items-start w-full mb-8 relative z-10 ${variant === 'classic' ? 'font-serif' : 'font-sans'}`}>
            {/* Logos Left */}
            <div className="flex items-center gap-4">
                 <img src="/assets/unam.svg" alt="UNAM" className="h-16 w-auto object-contain brightness-0 opacity-80" style={{ color: accent === '#ffffff' ? 'white' : 'black', filter: accent === '#ffffff' ? 'invert(1)' : 'none' }} />
                 <div className="h-10 w-[1px] bg-current opacity-20"></div>
                 <img src="/assets/fesa.svg" alt="FES Acatlán" className="h-16 w-auto object-contain brightness-0 opacity-80" style={{ color: accent === '#ffffff' ? 'white' : 'black', filter: accent === '#ffffff' ? 'invert(1)' : 'none' }} />
            </div>
            {/* Date Right */}
            <div className="text-right" style={{ color: accent }}>
                <p className={`text-sm ${variant === 'modern' ? 'font-bold' : 'font-medium'}`}>{formatDate(date)}</p>
            </div>
        </div>
    );

    const MainBody = ({ 
        certificate, 
        displayText, 
        styles,
        textColor,
        variant = 'default'
    }: { 
        certificate: Certificate, 
        displayText: string, 
        styles: any,
        textColor: string,
        variant?: 'default' | 'modern' | 'classic'
    }) => {
        // Dynamic Styles based on variant
        const titleFont = variant === 'classic' ? 'var(--font-playfair)' : 'var(--font-geist-sans)';
        const nameFont = variant === 'classic' ? 'var(--font-great-vibes)' : 'inherit';
        
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center z-10 w-full max-w-4xl mx-auto px-8">
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
                     <h2 className="text-xl font-bold tracking-[0.5em] uppercase mb-12 text-white bg-black px-6 py-1 transform -skew-x-10">
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
                <p className={`text-lg mb-4 opacity-80 max-w-2xl ${variant === 'classic' ? 'font-serif italic text-gray-600' : variant === 'modern' ? 'font-bold text-gray-500 uppercase text-sm tracking-wide' : 'font-light'}`}>
                    a:
                </p>

                {/* Name */}
                <h3 
                    className={`${variant === 'classic' ? 'text-6xl font-normal my-4' : variant === 'modern' ? 'text-6xl font-black uppercase tracking-tight my-4' : 'text-5xl font-bold mb-6'}`} 
                    style={{ color: styles.accent_color, fontFamily: displayFont }}
                >
                    {getDegreeAbbr(certificate.profiles.degree, certificate.profiles.gender)} {certificate.profiles.first_name} {certificate.profiles.last_name}
                </h3>

                {/* Divider */}
                {variant === 'classic' ? (
                     <div className="w-full max-w-sm h-px bg-gray-300 mb-8 mx-auto relative flex items-center justify-center">
                         <div className="w-2 h-2 rounded-full border border-gray-400 bg-white absolute"></div>
                     </div>
                ) : variant === 'modern' ? (
                    <div className="w-24 h-2 mb-8 mx-auto" style={{ backgroundColor: styles.accent_color }}></div>
                ) : (
                    <div className="w-32 h-1 bg-current mb-6 opacity-20 mx-auto"></div>
                )}

                {/* Event Context */}
                <p className={`text-lg mb-4 opacity-80 max-w-2xl ${variant === 'classic' ? 'font-serif italic text-gray-600' : variant === 'modern' ? 'font-bold text-gray-500 uppercase text-sm tracking-wide' : 'font-light'}`}>
                    {displayText}
                </p>

                {/* Event Title */}
                <h4 
                    className={`${variant === 'classic' ? 'text-3xl font-serif font-bold text-gray-800' : variant === 'modern' ? 'text-4xl font-black uppercase tracking-tighter' : 'text-3xl font-bold uppercase'} mb-12 max-w-3xl leading-tight`}
                    style={{ fontFamily: displayFont }}
                >
                    {certificate.events.title}
                </h4>

                {/* Motto */}
                <p className={`text-sm opacity-70 ${variant === 'classic' ? 'font-serif italic text-gray-400' : 'font-serif italic'}`}>
                    "Por mi raza hablará el espíritu"
                </p>
            </div>
        );
    };

    // --- CUSTOM BACKGROUND MODE ---
    if (config?.mode === 'custom_background') {
        const customStyles = config.styles || {
            text_color: '#000000',
            accent_color: '#dbf227',
            font_family: 'sans',
            text_alignment: 'center',
            content_vertical_position: '40%'
        };

        const texts = config.texts || {
            attendee: `Por su asistencia ${getEventArticle(certificate.events.type)} ${certificate.events.type}`,
            speaker: `Por impartir la ${certificate.events.type.toLowerCase()}:`,
            staff: "Por su valiosa participación en la logística del evento:",
            organizer: "Por su invaluable apoyo y liderazgo en la organización del evento:"
        };
        const roleText = isSpeaker ? texts.speaker : isStaff ? texts.staff : isOrganizer ? texts.organizer : texts.attendee;

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
                {config.background_url && (
                    <img 
                        src={config.background_url} 
                        alt="Background" 
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                )}
                
                {/* Layout Overlay */}
                 <div className="relative z-10 h-full flex flex-col justify-between">
                    <Header date={certificate.events.date} accent={customStyles.text_color} variant="default" />
                    
                    <MainBody 
                        certificate={certificate} 
                        displayText={roleText} 
                        styles={customStyles} 
                        textColor={customStyles.text_color} 
                        variant="default" // Default style for custom background to let background shine
                    />

                    <div className="w-full flex justify-center mt-8">
                       <Signatures count={signerCount} align="center" color={customStyles.text_color} />
                    </div>
                </div>
            </div>
        );
    }

    // --- TEMPLATE: CLASSIC / ELEGANT ---
    if (config?.template_id === 'classic') {
        const accent = config.styles?.accent_color || '#dbf227'; 
        const textColor = config.styles?.text_color || '#373737'; 
        
        const defaultTexts = {
             attendee: `Por su asistencia ${getEventArticle(certificate.events.type)} ${certificate.events.type}`,
             speaker: `Por impartir la ${certificate.events.type.toLowerCase()}:`,
             staff: "Por su valiosa participación en la logística del evento:",
             organizer: "Por su invaluable apoyo y liderazgo en la organización del evento:"
        };
        const texts = config?.texts || {};
        const roleText = isSpeaker ? (texts.speaker || defaultTexts.speaker) : isStaff ? (texts.staff || defaultTexts.staff) : isOrganizer ? (texts.organizer || defaultTexts.organizer) : (texts.attendee || defaultTexts.attendee);

        return ( 
            <div 
                style={{ width: '279.4mm', height: '215.9mm', color: textColor, fontFamily: 'var(--font-playfair)' }} 
                className="bg-[#faf9f6] relative overflow-hidden mx-auto p-12 flex flex-col justify-between"
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
                    <Header date={certificate.events.date} variant="classic" />
                    
                    <MainBody 
                         certificate={certificate} 
                         displayText={roleText} 
                         styles={{ accent_color: accent }} 
                         textColor={textColor} 
                         variant="classic"
                    />

                    <div className="w-full flex justify-center mt-4">
                         <Signatures count={signerCount} align="center" color={textColor} />
                    </div>
                </div>
            </div>
        );
    }

    // --- TEMPLATE: MODERN / GEOMETRIC ---
    if (config?.template_id === 'modern') {
        const accent = config.styles?.accent_color || '#dbf227';
        const textColor = config.styles?.text_color || '#000000'; 
        
        const defaultTexts = {
             attendee: `Por su asistencia ${getEventArticle(certificate.events.type)} ${certificate.events.type}`,
             speaker: `Por impartir la ${certificate.events.type.toLowerCase()}:`,
             staff: "Por su valiosa participación en la logística del evento:",
             organizer: "Por su invaluable apoyo y liderazgo en la organización del evento:"
        };
        const texts = config?.texts || {};
        const roleText = isSpeaker ? (texts.speaker || defaultTexts.speaker) : isStaff ? (texts.staff || defaultTexts.staff) : isOrganizer ? (texts.organizer || defaultTexts.organizer) : (texts.attendee || defaultTexts.attendee);

        return (
            <div 
                style={{ width: '279.4mm', height: '215.9mm', color: textColor, fontFamily: 'var(--font-geist-sans)' }} 
                className="bg-white relative overflow-hidden mx-auto flex flex-col p-12"
            >
                {/* Modern Geometric Accents */}
                <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-gray-50 skew-x-12 origin-top pointer-events-none -z-0"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 pointer-events-none" style={{ background: accent }}></div>
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none rounded-bl-full" style={{ background: accent }}></div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                     <Header date={certificate.events.date} variant="modern" />
                    
                     <MainBody 
                         certificate={certificate} 
                         displayText={roleText} 
                         styles={{ accent_color: accent }} 
                         textColor={textColor} 
                         variant="modern"
                     />

                     <div className="w-full flex justify-center mt-8 pt-8">
                         <Signatures count={signerCount} align="center" color={textColor} />
                     </div>
                </div>
            </div>
        );
    }

    // --- DEFAULT LAYOUT (Original Refactored - Split) ---
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

    return (
        <div 
            style={{ 
                width: '279.4mm', 
                height: '215.9mm',
                fontFamily: bodyFont,
                backgroundColor: 'white',
            }} 
            className="relative overflow-hidden mx-auto shadow-none print:shadow-none flex flex-col"
        >
             {/* TOP HALF - Accent Background */}
             <div 
                style={{ backgroundColor: accent, color: contrastColor, height: '50%' }} 
                className="w-full relative flex flex-col items-center p-12 pb-0"
             >
                 {/* Header (Logos & Date) */}
                 <div className="w-full mb-2">
                     <Header date={certificate.events.date} accent={contrastColor} variant="default" />
                 </div>

                 {/* Title Section */}
                 <div className="flex-1 flex flex-col justify-center items-center text-center -mt-12">
                    <p className="text-sm uppercase tracking-[0.3em] opacity-80 mb-4">
                        Se otorga la presente
                    </p>
                    <h1 className="text-[100px] font-bold tracking-widest leading-none uppercase mb-2">
                        CONSTANCIA
                    </h1>
                    <h2 className="text-3xl font-light tracking-[0.2em] uppercase opacity-90">
                        de participación
                    </h2>
                 </div>

                 {/* Decorative Line at Bottom of Block */}
                 <div className="w-full h-4 bg-white opacity-20 absolute bottom-0 left-0"></div>
                 <div className="w-full h-1 absolute bottom-4 left-0" style={{ backgroundColor: contrastColor, opacity: 0.3 }}></div>
             </div>
             
             {/* BOTTOM HALF - White Background */}
             <div className="h-[50%] bg-white text-[#1a1a1a] flex flex-col items-center justify-between p-12 pt-8 text-center relative">
                {/* Accent Line separate from block */}
                <div className="absolute top-1 left-0 w-full h-1" style={{ backgroundColor: accent }}></div>

                <div className="flex-1 flex flex-col justify-center w-full max-w-4xl mx-auto">
                    {/* Role Text */}
                    <p className="text-lg mb-1 opacity-80 font-light">
                        a:
                    </p>

                    {/* Name */}
                    <h3 
                        className="text-5xl font-bold mb-4" 
                        style={{ color: accent, fontFamily: displayFont }}
                    >
                        {getDegreeAbbr(certificate.profiles.degree, certificate.profiles.gender)} {certificate.profiles.first_name} {certificate.profiles.last_name}
                    </h3>

                    {/* Divider */}
                    <div className="w-32 h-1 bg-gray-200 mb-4 mx-auto"></div>

                    {/* Event Context */}
                    <p className="text-lg mb-2 opacity-80 font-light">
                        {roleText}
                    </p>

                    {/* Event Title */}
                    <h4 
                        className="text-3xl font-bold uppercase mb-6 max-w-3xl mx-auto leading-tight"
                        style={{ fontFamily: displayFont }}
                    >
                        {certificate.events.title}
                    </h4>

                    {/* Motto */}
                    <p className="text-sm opacity-70 font-serif italic mb-2">
                        "Por mi raza hablará el espíritu"
                    </p>
                    
                    {/* Address */}
                    <p className="text-[10px] opacity-50 uppercase tracking-wider">
                        Naucalpan de Juárez, Méx. Av. Jardines de San Mateo s/n, Sta Cruz Acatlan
                    </p>
                </div>

                {/* Signatures */}
                <div className="w-full flex justify-center mt-auto">
                    <Signatures count={signerCount} align="center" color="#1a1a1a" />
                </div>
             </div>
        </div>
    );
}


export type { Certificate };
