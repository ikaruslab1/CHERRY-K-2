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
    };
    profiles: {
        first_name: string;
        last_name: string;
        degree: string | null;
        gender: string | null;
    }
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
                                    SEMANA DEL DISEÑO • FES ACATLÁN • UNAM
                                </textPath>
                            </text>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Award className="w-8 h-8 text-[#dbf227] opacity-70" />
                        </div>
                    </div>
                </div>

                {/* Main Title */}
                <div className="flex-1 flex flex-col justify-center items-center text-center z-10 -mt-4">
                    <h1 className="font-[var(--font-playfair)] text-[85px] font-bold tracking-[0.15em] text-[#c0c0c0] uppercase leading-none mb-2" >
                        CONSTANCIA
                    </h1>
                    <p className="font-[var(--font-great-vibes)] text-6xl text-[#dbf227] -mt-4 tracking-wide" >
                        de Participación
                    </p>
                </div>

            </div>

            {/* BOTTOM WHITE SECTION - 40% */}
            <div className="h-[40%] w-full bg-white relative px-12 py-8 flex flex-col">
                
                {/* Decorative gradient separator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#dbf227] to-transparent opacity-60"></div>

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
                                Ha completado satisfactoriamente su asistencia {getEventArticle(certificate.events.type)} {certificate.events.type}
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
                            <p>Santa Cruz Acatlán, Estado de México</p>
                        </div>
                    </div>

                    {/* Right Content - 35% */}
                    <div className="w-[35%] flex flex-col justify-between items-end relative">
                        
                        {/* Decorative watercolor element (simulated with gradient) */}
                        <div className="absolute -top-4 -right-8 w-48 h-48 rounded-full opacity-20 pointer-events-none" 
                            style={{
                                background: 'radial-gradient(circle at 30% 40%, #dbf227 0%, #e8e8e8 40%, transparent 70%)',
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
