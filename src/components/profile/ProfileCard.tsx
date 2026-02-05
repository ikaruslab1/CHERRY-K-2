'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getDegreeAbbreviation } from '@/utils/degreeHelper';
import { Printer, Link, Check } from 'lucide-react';
import { useConference } from '@/context/ConferenceContext';

interface ProfileCardProps {
  profile: {
    short_id: string;
    first_name: string;
    last_name: string;
    degree: string;
    gender: string;
    role: string;
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const { currentConference } = useConference();
  
  const degreeAbbr = getDegreeAbbreviation(profile.degree, profile.gender);
  const fullName = `${degreeAbbr} ${profile.first_name} ${profile.last_name}`;
  
  // Dynamic values from conference or defaults
  const eventTitle = currentConference?.title || 'Semana del Diseño';
  const institution = currentConference?.institution_name || 'Facultad de Estudios Superiores Acatlán';
  const department = currentConference?.department_name || 'Licenciatura en Diseño Gráfico';

  const getRoleTheme = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'ponente':
        return { bg: '#278BF2', text: '#FFFFFF', name: 'Ponente' };
      case 'staff':
        return { bg: '#F23527', text: '#FFFFFF', name: 'Staff' };
      case 'admin':
        return { bg: '#373737', text: '#FFFFFF', name: 'Administrador' };
      case 'owner':
        return { 
          bg: 'linear-gradient(45deg, #FFFFFF, #FFD1FF, #CCEAFF, #FFFFFF, #D1FFEA, #FFFAD1, #FFFFFF)', 
          text: '#373737', 
          name: 'Desarrollador',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          animation: 'gradient 10s ease infinite',
          bgSize: '300% 300%'
        };
      default:
        // Default color for standard users/attendees
        return { bg: '#DBF227', text: '#373737', name: 'Asistente' };
    }
  };

  const { bg: themeColor, text: themeTextColor, name: roleName, animation, bgSize } = getRoleTheme(profile.role);
  
  // JSON data for QR
  const qrData = JSON.stringify({
    id: profile.short_id,
    nombre: fullName,
    rol: profile.role,
    evento: eventTitle
  });

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/?code=${profile.short_id}`;
    navigator.clipboard.writeText(link);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  // Reusable Front Face Content
  const FrontFaceContent = (
    <div className="flex flex-col h-full w-full bg-white select-none">
      {/* Header - Accent Color - Safe Zone Top */}
      {/* Header - Accent Color - Safe Zone Top */}
      <div 
        className="relative shrink-0 flex flex-col items-center justify-center pt-8 pb-6 px-4 overflow-hidden transition-colors duration-300"
        style={{ 
          background: themeColor,
          animation: animation,
          backgroundSize: bgSize
        }}
      >
          {/* Animated Background Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[gradient_8s_ease_infinite]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <span 
              className="text-[10px] xs:text-[11px] font-black uppercase tracking-[0.25em] mb-1 opacity-80"
              style={{ color: themeTextColor }}
            >
              ID de Acceso
            </span>
            <h2 
              className="text-3xl xs:text-4xl font-mono font-black tracking-widest drop-shadow-sm"
              style={{ color: themeTextColor }}
            >
              {profile.short_id}
            </h2>
          </div>
      </div>

      {/* Main Content Body - Flexible Space */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 py-4 w-full min-h-0">
          
          {/* Title Section */}
          <div className="flex flex-col items-center justify-center space-y-2 mt-2">
              <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] text-center">{eventTitle}</h3>
              <h1 className="text-[#373737] text-center leading-tight">
                  <span className="block text-xl xs:text-2xl font-bold text-gray-700">
                    {degreeAbbr} {profile.first_name}
                  </span>
                  <span className="block text-lg xs:text-xl font-medium text-gray-500 mt-1">
                    {profile.last_name}
                  </span>
              </h1>
          </div>

          {/* QR Section - Guaranteed Padding */}
          <div className="relative my-2 p-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl shadow-sm shrink-0">
              <QRCodeSVG 
                  value={qrData} 
                  size={140}
                  level="H"
                  includeMargin={false}
                  className="w-[140px] h-[140px] object-contain"
              />
          </div>

          {/* Role Badge */}
          {/* Role Badge */}
          <span 
            className="shrink-0 px-8 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-black/5 mb-2 transition-colors duration-300"
            style={{ 
              background: themeColor, 
              color: themeTextColor,
              animation: animation,
              backgroundSize: bgSize
            }}
          >
              {roleName}
          </span>
      </div>

      {/* Footer - Safe Zone Bottom */}
      <div className="shrink-0 pb-8 pt-2 px-6 text-center">
          <div className="w-12 h-1.5 bg-gray-100 mx-auto rounded-full mb-3" />
          <div className="space-y-1">
            <p className="text-[#373737] text-[9px] font-bold uppercase tracking-wider leading-relaxed">
                {institution}
            </p>
            <p className="text-gray-400 text-[8px] font-medium tracking-widest uppercase">
                {department}
            </p>
          </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[18rem] xs:max-w-xs sm:max-w-sm mx-auto">
      <div 
        className="relative w-full aspect-[9/16] [perspective:1000px] cursor-pointer group print:hidden"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* 3D Wrapper */}
        <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* Front Face */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] glass rounded-[2rem] xs:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
              {FrontFaceContent}
          </div>

          {/* Back Face */}
          {/* Back Face */}
          <div 
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center transition-colors duration-300"
            style={{ 
              background: themeColor,
              animation: animation,
              backgroundSize: bgSize
            }}
          >
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[gradient_8s_ease_infinite]" />
               
               <div className="relative z-10 space-y-6">
                  <div 
                    className="w-20 h-20 border-4 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ borderColor: themeTextColor }}
                  >
                       <div 
                        className="w-10 h-10 rounded-full animate-bounce"
                        style={{ backgroundColor: themeTextColor }} 
                       />
                  </div>
                  <h2 
                    className="text-4xl font-black uppercase tracking-widest leading-tight drop-shadow-sm"
                    style={{ color: themeTextColor }}
                  >
                      {eventTitle}
                  </h2>
                  <div 
                    className="w-16 h-1 mx-auto rounded-full mt-6"
                    style={{ backgroundColor: themeTextColor }}
                  />
               </div>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 print:hidden animate-in slide-in-from-bottom-2 fade-in duration-500">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-500 hover:text-[#373737] hover:border-[#373737] hover:bg-gray-50 transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir</span>
        </button>
        
        <button 
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-500 hover:text-[#373737] hover:border-[#373737] hover:bg-gray-50 transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
        >
          {showCopied ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4" />}
          <span>{showCopied ? 'Copiado' : 'Copiar Acceso'}</span>
        </button>
      </div>

      {/* Print View Only - Hidden normally, visible on print */}
      <div id="print-container" className="hidden fixed inset-0 z-[9999] bg-white items-center justify-center h-screen w-screen p-0 m-0">
         <div className="print-card w-[320px] h-[569px] border border-gray-200 rounded-[2.5rem] overflow-hidden flex flex-col shadow-none bg-white relative">
            {FrontFaceContent}
         </div>
      </div>
      
      {/* Global Print Styles to Hide everything else */}
      <style jsx global>{`
        @media print {
          /* Hide everything by default */
          body > * {
            visibility: hidden;
          }
          
          /* Show only the print container and its children */
          #print-container, 
          #print-container * {
            visibility: visible;
          }

          /* Position the print container */
          #print-container {
            display: flex !important;
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            background: white;
            align-items: center;
            justify-content: center;
          }

          /* Force background graphics */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Hide non-printable elements explicitly */
          .print-hidden, .no-print {
            display: none !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
