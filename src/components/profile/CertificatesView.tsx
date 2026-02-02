'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Printer, X, Award, Eye, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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

export function CertificatesView() {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          id,
          scanned_at,
          events!inner (
            id,
            title,
            date,
            type,
            location,
            description,
            gives_certificate,
            duration_days
          ),
          profiles:user_id (
            first_name,
            last_name,
            degree,
            gender
          )
        `)
        .eq('user_id', user.id)
        .eq('events.gives_certificate', true)
        .not('scanned_at', 'is', null);

      if (error) throw error;

      // Group attendance by event
      const attendanceByEvent = (data as any[]).reduce((acc, curr) => {
        const eventId = curr.events.id;
        if (!acc[eventId]) {
          acc[eventId] = [];
        }
        acc[eventId].push(curr);
        return acc;
      }, {} as Record<string, any[]>);

      const validCertificates: Certificate[] = [];

      Object.values(attendanceByEvent).forEach((attendances: any) => {
          const event = attendances[0].events;
          const requiredDays = event.duration_days || 1;
          
          // Only grant certificate if attendance count meets duration requirement
          if (attendances.length >= requiredDays) {
              // Use the most recent attendance record for the certificate
              attendances.sort((a: any, b: any) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());
              validCertificates.push(attendances[0]);
          }
      });

      setCertificates(validCertificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (cert: Certificate) => {
    const originalTitle = document.title;
    const certId = cert.id.split('-').pop()?.toUpperCase() || cert.id;
    const fullName = `${cert.profiles.first_name} ${cert.profiles.last_name}`;
    document.title = `${certId} - ${fullName}`;
    window.print();
    document.title = originalTitle;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const currentPrintDate = new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#DBF227]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                 <h2 className="text-2xl font-bold text-[#373737]">Mis Constancias</h2>
                 <p className="text-gray-500">Descarga tus constancias de asistencia a los eventos.</p>
            </div>
        </div>
        
        {certificates.length === 0 ? (
           <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
               <p className="text-gray-500 font-medium">No tienes constancias disponibles aún.</p>
               <p className="text-sm text-gray-400">Participa en eventos que otorguen constancia para verlas aquí.</p>
           </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => (
                    <div key={cert.id} className="bg-white border boundary-gray-200 rounded-xl p-4 md:p-5 hover:shadow-md transition-shadow group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#DBF227]/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                        
                        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DBF227]/20 text-yellow-800">
                                        {cert.events.type || 'Evento'}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono">
                                        {formatDate(cert.events.date)}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-[#373737] leading-tight mb-2 line-clamp-2" title={cert.events.title}>
                                    {cert.events.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                     <MapPin className="h-3.5 w-3.5" />
                                     <span className="truncate">{cert.events.location || 'FES Acatlán'}</span>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => setSelectedCertificate(cert)}
                                className="w-full mt-2 bg-[#373737] hover:bg-[#2a2a2a] text-white flex items-center justify-center gap-2"
                            >
                                <Eye className="h-4 w-4" />
                                Visualizar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col h-[90vh]">
                
                {/* Modal Toolbar */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="font-semibold text-gray-700">Vista Previa de Constancia</h3>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={() => handlePrint(selectedCertificate)} className="gap-2">
                             <Printer className="h-4 w-4" />
                             Imprimir
                         </Button>
                         <button 
                            onClick={() => setSelectedCertificate(null)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                        >
                             <X className="h-5 w-5" />
                         </button>
                    </div>
                </div>

                {/* Scaled View Area */}
                <div className="flex-1 overflow-hidden bg-gray-900/90 relative flex items-center justify-center p-4 md:p-8">
                    <CertificatePreview certificate={selectedCertificate} />
                </div>
            </div>

            {/* PRINT ONLY AREA */}
            <div id="certificate-print-area" className="hidden">
                  <CertificateContent certificate={selectedCertificate} />
            </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for the actual content to share between Preview and Print
function CertificateContent({ certificate }: { certificate: Certificate }) {
    const currentPrintDate = new Date().toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Function to format event date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
    };

    // Letter Landscape Dimensions in mm
    // Width: 11in = 279.4mm
    // Height: 8.5in = 215.9mm
    
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

// Sub-component for Scaling
function CertificatePreview({ certificate }: { certificate: Certificate }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parent = containerRef.current.parentElement;
                if (parent) {
                    const availableWidth = parent.clientWidth - 48; // padding
                    const availableHeight = parent.clientHeight - 48;
                    
                    // Ratio for Letter Landscape: 279.4 / 215.9 ~= 1.294
                    
                    // We calculate scale to FIT the 279.4mm x 215.9mm box into the available px space.
                    // 1mm ~ 3.7795px
                    const baseWidthPx = 279.4 * 3.7795; // ~1056px
                    const baseHeightPx = 215.9 * 3.7795; // ~816px

                    const scaleX = availableWidth / baseWidthPx;
                    const scaleY = availableHeight / baseHeightPx;
                    
                    const newScale = Math.min(scaleX, scaleY, 0.95); 
                    setScale(newScale);
                }
            }
        };

        window.addEventListener('resize', updateScale);
        updateScale();
        setTimeout(updateScale, 100);

        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // Base dimensions in PX for the transform container
    const widthPx = 279.4 * 3.78; 
    const heightPx = 215.9 * 3.78;

    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: widthPx * scale, 
                height: heightPx * scale 
            }} 
            className="origin-center shadow-2xl transition-all duration-300 ease-out bg-white"
        >
            <div 
                style={{ 
                    transform: `scale(${scale})`, 
                    transformOrigin: 'top left', 
                    width: '279.4mm', 
                    height: '215.9mm',
                }}
            >
                <CertificateContent certificate={certificate} />
            </div>
        </div>
    );
}
