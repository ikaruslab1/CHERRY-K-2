'use client';

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
  const degreeAbbr = getDegreeAbbreviation(profile.degree, profile.gender);
  const fullName = `${degreeAbbr} ${profile.first_name} ${profile.last_name}`;
  
  // JSON data for QR
  const qrData = JSON.stringify({
    id: profile.short_id,
    nombre: fullName,
    rol: profile.role
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center space-y-6 shadow-xl max-w-sm w-full mx-auto relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
      
      {/* Decorative Minimalist Elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#DBF227]/10 rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gray-100 rounded-tr-full" />

      <div className="text-center space-y-1 relative z-10">
        <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">Identidad Digital</p>
        <h2 className="text-4xl font-mono font-bold text-[#373737] tracking-widest">{profile.short_id}</h2>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-inner border border-gray-100 relative z-10">
        <QRCodeSVG 
            value={qrData} 
            size={200}
            level="H"
            includeMargin={true}
            className="w-full h-auto"
        />
      </div>

      <div className="text-center space-y-1 relative z-10">
        <p className="text-[#373737] text-xl font-semibold">{fullName}</p>
        <div className='flex items-center justify-center'><p className="text-gray-700 text-sm uppercase tracking-widest bg-[#DBF227]/50 px-6 py-1 rounded-full font-medium">{profile.role}</p></div>
      </div>

    </div>
  );
}
