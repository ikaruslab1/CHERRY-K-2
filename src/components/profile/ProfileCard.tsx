'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getDegreeAbbreviation } from '@/utils/degreeHelper';
import { Printer, Link, Check } from 'lucide-react';
import { useConference } from '@/context/ConferenceContext';
import { motion, useAnimation } from 'framer-motion';
import { ParticleBadge } from './ParticleBadge';
import { getContrastColorHex } from '@/lib/colorUtils';

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

interface Particle {
  id: string;
  angle: number;
  distance: number;
  size: number;
  color: string;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const controls = useAnimation();
  const { currentConference } = useConference();
  
  const degreeAbbr = getDegreeAbbreviation(profile.degree, profile.gender);
  const fullName = `${degreeAbbr} ${profile.first_name} ${profile.last_name}`;
  
  console.log('[ProfileCard] Rendering with profile:', profile);

  // Dynamic values from conference or defaults
  const eventTitle = currentConference?.title || 'Semana del Diseño';
  const institution = currentConference?.institution_name || 'Facultad de Estudios Superiores Acatlán';
  const department = currentConference?.department_name || 'Licenciatura en Diseño Gráfico';
  
  // Extract color value from accent_color object
  const accentColorConfig = currentConference?.accent_color || { type: 'solid', value: '#DBF227' };
  const accentColor = accentColorConfig.type === 'gradient' 
    ? (accentColorConfig.value.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/)?.[0] || '#DBF227')
    : accentColorConfig.value;
  
  const badgeIcon = currentConference?.badge_icon || { type: 'default', value: '' };

  const getRoleTheme = (role: string) => {
    const normalizedRole = role?.toLowerCase().trim();
    console.log(`[ProfileCard] getRoleTheme for: "${role}" -> normalized: "${normalizedRole}"`);

    switch (normalizedRole) {
      case 'ponente':
        return { 
          bg: '#278BF2', 
          text: '#FFFFFF', 
          name: 'Ponente',
          animation: 'shimmer 2s ease-in-out infinite',
          animationType: 'shimmer'
        };
      case 'staff':
        return { 
          bg: '#F23527', 
          text: '#FFFFFF', 
          name: 'Staff',
          animation: 'pulse 2s ease-in-out infinite',
          animationType: 'pulse'
        };
      case 'admin':
      case 'administrador':
        return { 
          bg: '#373737', 
          text: '#FFFFFF', 
          name: 'Administrador',
          animation: 'breathing 3s ease-in-out infinite',
          animationType: 'breathing'
        };
      case 'vip':
        return { 
          bg: '#F2D027', 
          text: '#373737', 
          name: 'VIP',
          animation: 'glow 2s ease-in-out infinite',
          animationType: 'glow'
        };
      case 'owner':
      case 'desarrollador':
        return { 
          bg: 'linear-gradient(45deg, #FFFFFF, #FFD1FF, #CCEAFF, #FFFFFF, #D1FFEA, #FFFAD1, #FFFFFF)', 
          text: '#373737', 
          name: 'Desarrollador',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          animation: 'gradient 10s ease infinite',
          bgSize: '300% 300%',
          animationType: 'gradient'
        };
      default:
        console.log(`[ProfileCard] Fallback to Asistente for role: ${normalizedRole}`);
        // Default color for standard users/attendees - uses conference accent color
        const bgValue = accentColorConfig.value;
        return { 
          bg: bgValue, 
          text: getContrastColorHex(bgValue), 
          name: 'Asistente',
          animation: 'wave 3s ease-in-out infinite',
          animationType: 'wave'
        };
    }
  };

  const { bg: themeColor, text: themeTextColor, name: roleName, animation, bgSize, animationType } = getRoleTheme(profile.role);
  console.log(`[ProfileCard] Final roleName: ${roleName}`);

  
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

  const handleCardClick = async () => {
    // 1. Jump Up
    controls.start({
      scale: 1.15,
      transition: { duration: 0.3, ease: "easeOut" }
    });

    // 2. Flip halfway through jump
    setIsFlipped(!isFlipped);
    
    // 3. Land and Spawn Particles
    setTimeout(() => {
        // Land
        controls.start({
          scale: 1,
          transition: { duration: 0.3, ease: "easeIn" }
        });

        // Spawn particles
        const timestamp = Date.now();
        const particleCount = 12;
        const newParticles: Particle[] = Array.from({ length: particleCount }).map((_, i) => ({
          id: `${timestamp}-${i}`,
          angle: (i * (360 / particleCount)) + (Math.random() * 30 - 15),
          distance: 140 + Math.random() * 60, // Increased distance
          size: 6 + Math.random() * 6,
          color: themeColor
        }));
        
        setParticles(prev => [...prev, ...newParticles]);
        
        // Clean up
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1500); // Increased duration cleanup
    }, 300);
  };

  // Reusable Front Face Content
  const FrontFaceContent = (
    <div className="flex flex-col h-full w-full bg-white select-none">
      {/* Header - Accent Color - Safe Zone Top */}
      <div 
        className="relative shrink-0 flex flex-col items-center justify-center pt-6 pb-4 px-4 overflow-hidden transition-colors duration-300"
        style={{ 
          background: themeColor,
          ...(animationType === 'gradient' && {
            backgroundSize: bgSize,
            animation: animation
          })
        }}
      >
          {/* Animation Overlays */}
          {animationType === 'shimmer' && (
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s ease-in-out infinite'
              }}
            />
          )}
          
          {animationType === 'pulse' && (
            <div 
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />
          )}
          
          {animationType === 'breathing' && (
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                animation: 'breathing 3s ease-in-out infinite'
              }}
            />
          )}
          
          {animationType === 'glow' && (
            <div 
              className="absolute inset-0"
              style={{
                boxShadow: 'inset 0 0 60px rgba(255,255,255,0.4)',
                animation: 'glow 2s ease-in-out infinite'
              }}
            />
          )}
          
          {animationType === 'wave' && (
            <div 
              className="absolute inset-0 opacity-40"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'wave 3s ease-in-out infinite'
              }}
            />
          )}
          
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

          {/* QR Section - Maximized & Elegant */}
          <div className="relative flex-1 flex items-center justify-center py-2 w-full">
              <div className="relative p-3 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
                  <div className="absolute inset-0 rounded-2xl border border-black/5" />
                  <QRCodeSVG 
                      value={qrData} 
                      size={180}
                      level="H"
                      includeMargin={true}
                      className="w-full h-full object-contain max-w-[180px] max-h-[180px]"
                  />
                  {/* Decorative corners */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-black/10 rounded-tl-lg" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-black/10 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-black/10 rounded-bl-lg" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-black/10 rounded-br-lg" />
              </div>
          </div>

          {/* Role Badge - Subtle & Clean */}
          <div className="flex flex-col items-center mb-4">
              {profile.role !== 'owner' && (
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1.5 opacity-60">
                      Rol en este evento
                  </span>
              )}
              <ParticleBadge 
                roleName={roleName}
                themeColor={themeColor}
                themeTextColor={themeTextColor}
                animation={animation}
                bgSize={bgSize}
                animationType={animationType}
                className="scale-90"
              />
          </div>
      </div>

      {/* Footer - Safe Zone Bottom */}
      <div className="shrink-0 pb-6 pt-2 px-6 text-center">
          <div className=" opacity-60 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
            <p className="text-[#373737] text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-1">
                {institution}
            </p>
            <div className="w-8 h-px bg-gray-200 mx-auto my-2" />
            <p className="text-gray-400 text-[9px] font-medium tracking-[0.2em] uppercase">
                {department}
            </p>
          </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      }}
      className="flex flex-col items-center gap-8 w-full max-w-[20rem] xs:max-w-xs sm:max-w-sm mx-auto"
    >
      <motion.div 
        className="relative w-full aspect-[9/16] [perspective:1000px] cursor-pointer group print:hidden select-none"
        onClick={handleCardClick}
        animate={controls}
      >
        {/* Particles - In front of the card */}
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
                y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
                opacity: [1, 1, 0],
                scale: [0, 1.2, 0],
              }}
              transition={{ duration: 1.3, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                background: particle.color, 
              }}
            />
          ))}
        </div>


        {/* 3D Wrapper */}
        <motion.div 
          className="relative w-full h-full [transform-style:preserve-3d]"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          
          {/* Front Face */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col border border-gray-100">
              {FrontFaceContent}
          </div>

          {/* Back Face */}
          <div 
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col items-center justify-center p-8 text-center transition-colors duration-300"
            style={{ 
              background: themeColor,
              ...(animationType === 'gradient' && {
                backgroundSize: bgSize,
                animation: animation
              })
            }}
          >
               {/* Animation Overlays */}
               {animationType === 'shimmer' && (
                 <div 
                   className="absolute inset-0 opacity-40"
                   style={{
                     background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                     backgroundSize: '200% 100%',
                     animation: 'shimmer 2s ease-in-out infinite'
                   }}
                 />
               )}
               
               {animationType === 'pulse' && (
                 <div 
                   className="absolute inset-0"
                   style={{
                     background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                     animation: 'pulse 2s ease-in-out infinite'
                   }}
                 />
               )}
               
               {animationType === 'breathing' && (
                 <div 
                   className="absolute inset-0 opacity-30"
                   style={{
                     background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
                     animation: 'breathing 3s ease-in-out infinite'
                   }}
                 />
               )}
               
               {animationType === 'glow' && (
                 <div 
                   className="absolute inset-0"
                   style={{
                     boxShadow: 'inset 0 0 60px rgba(255,255,255,0.4)',
                     animation: 'glow 2s ease-in-out infinite'
                   }}
                 />
               )}
               
               {animationType === 'wave' && (
                 <div 
                   className="absolute inset-0 opacity-40"
                   style={{
                     background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                     backgroundSize: '200% 200%',
                     animation: 'wave 3s ease-in-out infinite'
                   }}
                 />
               )}
               
               <div className="relative z-10 space-y-6">
                  {badgeIcon.type !== 'default' && badgeIcon.value ? (
                    <img 
                      src={badgeIcon.type === 'preset' ? `/assets/${badgeIcon.value}.svg` : badgeIcon.value}
                      alt="Badge Icon"
                      className="w-24 h-24 object-contain mx-auto mb-6"
                      style={{ 
                        filter: themeTextColor === '#FFFFFF' ? 'brightness(0) invert(1)' : 'brightness(0)'
                      }}
                    />
                  ) : (
                    <div 
                      className="w-24 h-24 border-4 rounded-full flex items-center justify-center mx-auto mb-6 bg-white/10 backdrop-blur-sm overflow-hidden"
                      style={{ borderColor: themeTextColor }}
                    >
                      <div 
                        className="w-12 h-12 rounded-full animate-pulse"
                        style={{ backgroundColor: themeTextColor }} 
                      />
                    </div>
                  )}
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

        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4 w-full print:hidden animate-in slide-in-from-bottom-2 fade-in duration-500">
        <div className="flex items-center justify-center gap-3 w-full">
            <button 
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-gray-500 hover:text-black hover:border-black/10 hover:shadow-lg transition-all active:scale-95 text-xs font-bold uppercase tracking-wider group"
            >
                <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Imprimir</span>
            </button>
            
            <button 
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-gray-500 hover:text-black hover:border-black/10 hover:shadow-lg transition-all active:scale-95 text-xs font-bold uppercase tracking-wider group"
            >
                {showCopied ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                <span>{showCopied ? 'Copiado' : 'Compartir'}</span>
            </button>
        </div>
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
    </motion.div>
  );
}
