'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getDegreeAbbreviation } from '@/utils/degreeHelper';
import { Printer, Link, Check } from 'lucide-react';
import { useConference } from '@/context/ConferenceContext';
import { useLanguage } from '@/context/LanguageContext';
import { getTranslatedField } from '@/utils/i18nHelpers';
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
  const { language, t } = useLanguage();
  
  const degreeAbbr = getDegreeAbbreviation(profile.degree, profile.gender);
  const fullName = `${degreeAbbr} ${profile.first_name} ${profile.last_name}`;
  
  console.log('[ProfileCard] Rendering with profile:', profile);

  // Dynamic values from conference or defaults
  const eventTitle = (currentConference?.enable_translation 
    ? getTranslatedField(currentConference, 'title', language) 
    : currentConference?.title) || 'Semana del Diseño';
    
  const institution = (currentConference?.enable_translation
    ? getTranslatedField(currentConference, 'institution_name', language)
    : currentConference?.institution_name) || 'Facultad de Estudios Superiores Acatlán';
    
  const department = (currentConference?.enable_translation
    ? getTranslatedField(currentConference, 'department_name', language)
    : currentConference?.department_name) || 'Licenciatura en Diseño Gráfico';
  
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
          name: t('profile.roles.ponente'),
          animation: 'shimmer 2s ease-in-out infinite',
          animationType: 'shimmer'
        };
      case 'staff':
        return { 
          bg: '#F23527', 
          text: '#FFFFFF', 
          name: t('profile.roles.staff'),
          animation: 'pulse 2s ease-in-out infinite',
          animationType: 'pulse'
        };
      case 'admin':
      case 'administrador':
        return { 
          bg: '#373737', 
          text: '#FFFFFF', 
          name: t('profile.roles.admin'),
          animation: 'breathing 3s ease-in-out infinite',
          animationType: 'breathing'
        };
      case 'vip':
        return { 
          bg: '#F2D027', 
          text: '#373737', 
          name: t('profile.roles.vip'),
          animation: 'glow 2s ease-in-out infinite',
          animationType: 'glow'
        };
      case 'owner':
      case 'desarrollador':
        return { 
          bg: 'linear-gradient(45deg, #FFFFFF, #FFD1FF, #CCEAFF, #FFFFFF, #D1FFEA, #FFFAD1, #FFFFFF)', 
          text: '#373737', 
          name: t('profile.roles.owner'),
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
          name: t('profile.roles.asistente'),
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
    
    const baseUrl = currentConference?.custom_landing_enabled 
      ? `${window.location.origin}/event/${currentConference.id}`
      : `${window.location.origin}/login`;
      
    const params = new URLSearchParams();
    if (currentConference?.id) params.set('event', currentConference.id);
    params.set('code', profile.short_id);
    
    const link = `${baseUrl}?${params.toString()}`;
    
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

  // Reusable Front Face Content Component
  const BadgeFront = ({ isPrint = false }: { isPrint?: boolean }) => (
    <div className={`flex flex-col h-full w-full bg-white select-none ${isPrint ? 'print-badge-content' : ''}`}>
      {/* Header - Accent Color - Safe Zone Top */}
      <div 
        className={`relative shrink-0 flex flex-col items-center justify-center overflow-hidden transition-colors duration-300 ${isPrint ? 'pt-12 pb-8 px-8' : 'pt-3.5 xs:pt-4.5 pb-2 xs:pb-2.5 px-3'}`}
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
              className={`${isPrint ? 'text-xs' : 'text-[9px] xs:text-[10px]'} font-black uppercase tracking-[0.25em] mb-0.5 opacity-80`}
              style={{ color: themeTextColor }}
            >
              {t('profile.access_id')}
            </span>
            <h2 
              className={`${isPrint ? 'text-6xl mb-2' : 'text-2xl xs:text-3xl sm:text-4xl'} font-mono font-black tracking-widest drop-shadow-sm`}
              style={{ color: themeTextColor }}
            >
              {profile.short_id}
            </h2>
          </div>
      </div>

      {/* Main Content Body - Flexible Space */}
      <div className={`flex-1 flex flex-col items-center justify-between w-full min-h-0 ${isPrint ? 'px-12 py-12 gap-8' : 'px-3 py-1.5 xs:py-2.5 gap-1'}`}>
          
          {/* Title Section */}
          <div className={`flex flex-col items-center justify-center text-center shrink-0 ${isPrint ? 'space-y-4' : 'space-y-0.5'}`}>
              <h3 className={`${isPrint ? 'text-sm' : 'text-[9px] xs:text-[10px]'} text-gray-400 font-bold uppercase tracking-[0.2em] line-clamp-1`}>{eventTitle}</h3>
              <h1 className="text-[#373737] leading-tight">
                  <span className={`block font-bold text-gray-700 ${isPrint ? 'text-4xl' : 'text-base xs:text-lg sm:text-xl'}`}>
                    {degreeAbbr} {profile.first_name}
                  </span>
                  <span className={`block font-medium text-gray-500 mt-0.5 ${isPrint ? 'text-3xl mt-2' : 'text-sm xs:text-base sm:text-lg'}`}>
                    {profile.last_name}
                  </span>
              </h1>
          </div>

          {/* QR Section - Maximized & Elegant */}
          <div className={`relative flex items-center justify-center w-full flex-1 min-h-0 ${isPrint ? 'py-10' : 'py-0.5'}`}>
              <div className={`relative bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center justify-center ${isPrint ? 'p-6 shadow-none border-gray-200' : 'p-2'}`}>
                  <div className="absolute inset-0 rounded-2xl border border-black/5" />
                  <QRCodeSVG 
                      value={qrData} 
                      size={isPrint ? 320 : 180}
                      level="H"
                      includeMargin={true}
                      className="object-contain w-full h-auto max-w-[170px] xs:max-w-[190px] sm:max-w-[220px] aspect-square"
                  />
                  {/* Decorative corners */}
                  <div className={`absolute border-black/10 rounded-tl-lg ${isPrint ? 'top-6 left-6 w-8 h-8 border-t-4 border-l-4' : 'top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2'}`} />
                  <div className={`absolute border-black/10 rounded-tr-lg ${isPrint ? 'top-6 right-6 w-8 h-8 border-t-4 border-r-4' : 'top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2'}`} />
                  <div className={`absolute border-black/10 rounded-bl-lg ${isPrint ? 'bottom-6 left-6 w-8 h-8 border-b-4 border-l-4' : 'bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2'}`} />
                  <div className={`absolute border-black/10 rounded-br-lg ${isPrint ? 'bottom-6 right-6 w-8 h-8 border-b-4 border-r-4' : 'bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2'}`} />
              </div>
          </div>

          {/* Role Badge - Subtle & Clean */}
          <div className={`flex flex-col items-center shrink-0 ${isPrint ? 'mb-10' : 'mb-0'}`}>
              {profile.role !== 'owner' && (
                  <span className={`${isPrint ? 'text-sm mb-4' : 'text-[8px] mb-0.5'} text-gray-400 font-bold uppercase tracking-widest opacity-60`}>
                      {t('profile.role_in_event')}
                  </span>
              )}
              <ParticleBadge 
                roleName={roleName}
                themeColor={themeColor}
                themeTextColor={themeTextColor}
                animation={animation}
                bgSize={bgSize}
                animationType={animationType}
                className={isPrint ? 'scale-150' : 'scale-90'}
              />
          </div>
      </div>

      {/* Footer - Safe Zone Bottom */}
      <div className={`shrink-0 text-center ${isPrint ? 'pb-16 pt-4 px-12' : 'pb-3.5 pt-1 px-3'}`}>
          <div className="opacity-60 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100 flex flex-col items-center justify-center">
            <p className={`text-[#373737] font-bold uppercase tracking-widest leading-tight mb-0.5 ${isPrint ? 'text-sm' : 'text-[9px] xs:text-[10px]'}`}>
                {institution}
            </p>
            <div className={`bg-gray-200 mx-auto ${isPrint ? 'w-24 h-px my-6' : 'w-6 h-px my-1'}`} />
            <p className={`text-gray-400 font-medium tracking-[0.2em] uppercase leading-tight ${isPrint ? 'text-xs' : 'text-[8px] xs:text-[9px]'}`}>
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
      className="flex flex-col items-center gap-8 w-full max-w-[18.5rem] xs:max-w-[20rem] sm:max-w-sm mx-auto"
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
              <BadgeFront />
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
                <span>{t('profile.print')}</span>
            </button>
            
            <button 
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-gray-500 hover:text-black hover:border-black/10 hover:shadow-lg transition-all active:scale-95 text-xs font-bold uppercase tracking-wider group"
            >
                {showCopied ? <Check className="w-4 h-4 text-green-500" /> : <Link className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                <span>{showCopied ? t('profile.copied') : t('profile.share')}</span>
            </button>
        </div>
      </div>

      {/* PRINT PORTAL - Renders outside the react root for cleaner printing */}
      {typeof window !== 'undefined' && createPortal(
        <div className="print-only fixed inset-0 flex items-center justify-center bg-white z-[9999] p-[5vh]">
          <div className="h-full aspect-[9/15] border-[6px] border-gray-100 rounded-[4rem] overflow-hidden flex flex-col shadow-none bg-white relative">
            <BadgeFront isPrint={true} />
          </div>
        </div>,
        document.body
      )}
      
      {/* Global Print Styles to Hide everything else */}
      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 0;
          }

          /* Hide everything by default via globals.css .print-only pattern */
          
          body {
            background: white !important;
            background-image: none !important;
          }

          /* Force high quality printing of backgrounds */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Centering helper */
          .print-only {
            display: flex !important;
            position: fixed !important;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: white !important;
            z-index: 99999;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </motion.div>
  );
}
