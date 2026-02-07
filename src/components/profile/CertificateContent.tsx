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
      };
      // Certificate config from DB
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
    const config = certificate.events.certificate_config;

    // Determine Role
    const isSpeaker = certificate.isSpeaker;
    const isStaff = certificate.isStaff;
    const isOrganizer = certificate.isOrganizer;

    // --- CUSTOM BACKGROUND MODE ---
    if (config?.mode === 'custom_background') {
        const styles = config.styles || {
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
        
        // Font selection
        const fontFamily = styles.font_family === 'serif' ? 'var(--font-playfair)' : 
                          styles.font_family === 'mono' ? 'var(--font-geist-mono)' : 
                          'var(--font-geist-sans)'; // Default sans
        
        return (
            <div 
                style={{ 
                    width: '279.4mm', 
                    height: '215.9mm',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: 'white',
                    color: styles.text_color,
                    fontFamily: fontFamily
                }} 
                className="certificate-container mx-auto shadow-none print:shadow-none"
            >
                {/* Background Image */}
                {config.background_url && (
                    <img 
                        src={config.background_url} 
                        alt="Certificate Background" 
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 0
                        }}
                    />
                )}

                {/* Content Overlay */}
                <div 
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        paddingTop: styles.content_vertical_position,
                        paddingLeft: '2rem',
                        paddingRight: '2rem',
                        textAlign: styles.text_alignment as any,
                        width: '100%'
                    }}
                >
                    <div style={{ maxWidth: '85%', margin: '0 auto' }}>
                         {/* Name */}
                        <h2 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: 'bold', 
                            marginBottom: '0.5rem',
                            lineHeight: 1.2
                        }}>
                             {getDegreeAbbr(certificate.profiles.degree, certificate.profiles.gender)} {certificate.profiles.first_name} {certificate.profiles.last_name}
                        </h2>

                        {/* Role Text */}
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem', opacity: 0.9 }}>
                            {roleText}
                        </p>

                        {/* Event Title */}
                        {certificate.events.title && (
                             <h3 style={{ 
                                fontSize: '1.8rem', 
                                fontWeight: '800', 
                                textTransform: 'uppercase',
                                marginBottom: '0.5rem',
                                color: styles.accent_color // Use accent color for title? Or maybe just text color
                            }}>
                                {certificate.events.title}
                            </h3>
                        )}
                        
                         {/* Date / Location */}
                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            {formatDate(certificate.events.date)}
                        </p>
                    </div>
                </div>

                {/* QR Code - Optional/Configurable position */}
                {(config.show_qr !== false) && (
                    <div style={{
                        position: 'absolute',
                        bottom: '25mm',
                        right: config.qr_position === 'bottom-left' ? undefined : '25mm',
                        left: config.qr_position === 'bottom-left' ? '25mm' : undefined,
                        zIndex: 20
                    }}>
                         <div className="bg-white p-2 rounded shadow-sm inline-block">
                            <QRCodeSVG 
                                value={`https://cherry-k-2.com/verify/${certificate.id}`} 
                                size={60} 
                                level="M"
                                fgColor="#000000"
                            />
                        </div>
                        <div style={{ fontSize: '10px', marginTop: '4px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.7)',  padding: '2px', borderRadius: '4px' }}>
                             ID: {certificate.id.split('-').pop()?.toUpperCase()}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- DEFAULT LAYOUT (Original) ---
    const accentColor = '#dbf227'; // Hardcoded default
    const institution = conf?.institution_name || 'FES Acatlán';
    const department = conf?.department_name || 'UNAM'; // Default fallback
    const confTitle = conf?.title || 'SEMANA DEL DISEÑO';

    return (
        <div 
            style={{ 
                width: '279.4mm', 
                height: '215.9mm',
            }} 
            className="flex flex-col bg-white relative overflow-hidden mx-auto shadow-none print:shadow-none"
        >
            {/* TOP DARK SECTION - 60% */}
            <div className="h-[60%] w-full bg-[#1a1a1a] relative flex flex-col px-12 pt-8 pb-6">
                
                {/* Subtle texture overlay */}
                <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                />

                {/* Top Left - Brand Logo */}
                <div className="flex items-center gap-3 mb-8 z-10">
                    <img src="/assets/unam.svg" alt="UNAM" className="h-16 w-auto object-contain brightness-0 invert opacity-90" />
                    <div className="h-12 w-[1px] bg-white/20"></div>
                    <img src="/assets/fesa.svg" alt="FES Acatlán" className="h-16 w-auto object-contain brightness-0 invert opacity-90" />
                </div>

                {/* Circular Badge Top Right */}
                <div className="absolute top-8 right-12 z-10">
                    <div className="relative w-32 h-32">
                        {/* Circular text ring */}
                        <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
                            <defs>
                                <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                            </defs>
                            <text className="text-[6px] fill-white uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--font-playfair)' }}>
                                <textPath href="#circlePath" startOffset="0%">
                                    {confTitle} • {institution} •
                                </textPath>
                            </text>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Award className="w-8 h-8 opacity-70" style={{ color: accentColor }} />
                        </div>
                    </div>
                </div>

                {/* Main Title */}
                <div className="flex-1 flex flex-col justify-center items-center text-center z-10 -mt-4">
                    <h1 className="font-[var(--font-playfair)] text-[85px] font-bold tracking-[0.15em] text-[#c0c0c0] uppercase leading-none mb-2" >
                        CONSTANCIA
                    </h1>
                    <p className="font-[var(--font-great-vibes)] text-6xl -mt-4 tracking-wide" style={{ color: accentColor }}>
                        {isSpeaker ? 'de Ponente' : isStaff ? 'de Staff' : isOrganizer ? 'de Organizador' : 'de Participación'}
                    </p>
                </div>

            </div>

            {/* BOTTOM WHITE SECTION - 40% */}
            <div className="h-[40%] w-full bg-white relative px-12 py-8 flex flex-col">
                
                {/* Decorative gradient separator */}
                <div 
                    className="absolute top-0 left-0 right-0 h-1 opacity-60"
                    style={{ background: `linear-gradient(to right, transparent, ${accentColor}, transparent)` }}
                ></div>

                {/* Content Grid */}
                <div className="flex-1 flex gap-8 relative z-10">
                    
                    {/* Left Content - 65% */}
                    <div className="w-[65%] flex flex-col justify-between">
                        
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-3">
                                ESTO ES PARA CERTIFICAR QUE
                            </p>
                            
                            <div className="border-b-2 border-gray-300 pb-1 mb-4">
                                <h2 className="text-2xl font-bold text-[#373737]" >
                                    {getDegreeAbbr(certificate.profiles.degree, certificate.profiles.gender)} {certificate.profiles.first_name} {certificate.profiles.last_name}
                                </h2>
                            </div>

                            <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                {isSpeaker 
                                    ? <span>Por impartir la {certificate.events.type.toLowerCase()}:</span>
                                    : isStaff
                                    ? <span>Por su valiosa participación en la logística del evento:</span>
                                    : isOrganizer
                                    ? <span>Por su invaluable apoyo y liderazgo en la organización del evento:</span>
                                    : <span>Ha completado satisfactoriamente su asistencia {getEventArticle(certificate.events.type)} {certificate.events.type}</span>
                                }
                            </p>

                            <h3 className="text-xl font-black uppercase text-[#1a1a1a] mb-3 tracking-wide" >
                                {certificate.events.title}
                            </h3>

                            <p className="text-xs text-gray-500">
                                Realizado en {certificate.events.location || 'FES Acatlán, UNAM'} • {formatDate(certificate.events.date)}
                            </p>
                        </div>

                        {/* Bottom info */}
                        <div className="text-[15px] text-gray-400 italic leading-none">
                            <p>"Por mi raza hablará el espíritu"</p>
                            <p>{institution}, {department}</p>
                        </div>
                    </div>

                    {/* Right Content - 35% */}
                    <div className="w-[35%] flex flex-col justify-between items-end relative">
                        
                        {/* Decorative watercolor element (simulated with gradient) */}
                        <div className="absolute -top-4 -right-8 w-48 h-48 rounded-full opacity-20 pointer-events-none" 
                            style={{
                                background: `radial-gradient(circle at 30% 40%, ${accentColor} 0%, #e8e8e8 40%, transparent 70%)`,
                                filter: 'blur(30px)'
                            }}
                        />

                        {/* QR Code & Signature */}
                        <div className="w-full flex flex-col items-end gap-3 z-10 ">
                            <div className=" w-35 h-35 bg-white p-2 border border-gray-200 rounded shadow-sm">
                                <QRCodeSVG 
                                    value={`https://cherry-k-2.com/verify/${certificate.id}`} 
                                    size={65} 
                                    level="H"
                                    fgColor="#1a1a1a"
                                    className="w-full h-full object-contain"
                                />
                            </div>
<br />
                            <div className="text-right">
                                <div className="w-65 border-b border-gray-400 mb-1 relative">
                                    <span className="absolute bottom-0 right-0 font-[var(--font-great-vibes)] text-xl  font-bold">
                                        Ana María Cárdenas Vargas
                                    </span>
                                </div>
                                <p className="text-[16px] text-gray-500">Jefa de la carrera en Diseño Gráfico</p>
                                <p className="text-[12px] text-gray-400 font-mono mt-2">
                                    ID: {certificate.id.split('-').pop()?.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}

export type { Certificate };
