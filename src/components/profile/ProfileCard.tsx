'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getDegreeAbbreviation } from '@/utils/degreeHelper';

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
  const degreeAbbr = getDegreeAbbreviation(profile.degree, profile.gender);
  const fullName = `${degreeAbbr} ${profile.first_name} ${profile.last_name}`;
  
  // JSON data for QR
  const qrData = JSON.stringify({
    id: profile.short_id,
    nombre: fullName,
    rol: profile.role
  });

  return (
    <div 
      className="relative w-full max-w-sm mx-auto aspect-[9/16] [perspective:1000px] cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* 3D Wrapper */}
      <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front Face */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header - Accent Color with slow animation */}
            <div className="relative h-[22%] bg-[#DBF227] flex flex-col items-center justify-center p-6 overflow-hidden">
                {/* Animated Background Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[gradient_8s_ease_infinite]" />
                
                <span className="relative text-[#373737] text-[10px] font-black uppercase tracking-[0.25em] mb-1 opacity-80">ID de Acceso</span>
                <h2 className="relative text-[#373737] text-4xl font-mono font-black tracking-widest drop-shadow-sm">{profile.short_id}</h2>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 bg-white relative">
                
                <div className="text-center space-y-1">
                    <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Semana del Diseño</h3>
                </div>
                
                <div className="text-center space-y-1">
                    <h1 className="text-[#373737] text-2xl font-bold leading-tight">
                        <span className="text-3xl font-medium text-gray-600 block mb-1">{degreeAbbr} {profile.first_name} {profile.last_name}</span>
                    </h1>
                </div>

                <div className="p-3 bg-white border-2 border-dashed border-gray-100 rounded-2xl shadow-sm">
                    <QRCodeSVG 
                        value={qrData} 
                        size={160}
                        level="H"
                        includeMargin={false}
                        className="w-full h-auto"
                    />
                </div>

                <span className="px-6 py-2 rounded-full bg-[#373737] text-white text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg shadow-[#373737]/20">
                    {profile.role}
                </span>
            </div>

            {/* Footer */}
            <div className="pb-8 pt-2 px-8 text-center space-y-2">
                <div className="w-12 h-1 bg-gray-100 mx-auto rounded-full mb-2" />
                <p className="text-[#373737] text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                    Facultad de Estudios Superiores Acatlán <br /> <span className="text-gray-400 text-[10px] font-medium tracking-widest uppercase"> Carrera en Diseño Gráfico</span>
                </p>
            </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#DBF227] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8 text-center">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[gradient_8s_ease_infinite] opacity-50" />
             
             <div className="relative z-10 space-y-6">
                <div className="w-20 h-20 border-4 border-[#373737] rounded-full flex items-center justify-center mx-auto mb-4">
                     <div className="w-10 h-10 bg-[#373737] rounded-full animate-bounce" />
                </div>
                <h2 className="text-[#373737] text-5xl font-black uppercase tracking-widest leading-tight drop-shadow-sm">
                    Semana<br />del<br />Diseño
                </h2>
                <div className="w-16 h-1 bg-[#373737] mx-auto rounded-full mt-6" />
             </div>
        </div>

      </div>
    </div>
  );
}
