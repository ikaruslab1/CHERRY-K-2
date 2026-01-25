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
  };
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const degreeAbbr = getDegreeAbbreviation(profile.degree, profile.gender);
  const fullName = `${degreeAbbr} ${profile.first_name} ${profile.last_name}`;
  
  // JSON data for QR
  const qrData = JSON.stringify({
    id: profile.short_id,
    nombre: fullName,
    grado: profile.degree
  });

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center space-y-6 shadow-2xl max-w-sm w-full mx-auto relative overflow-hidden group hover:border-white/20 transition-all duration-300">
      
      {/* Decorative Gradient Blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all" />

      <div className="text-center space-y-1 relative z-10">
        <p className="text-slate-400 text-sm uppercase tracking-widest font-medium">Identidad Digital</p>
        <h2 className="text-4xl font-mono font-bold text-white tracking-widest">{profile.short_id}</h2>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-lg relative z-10">
        <QRCodeSVG 
            value={qrData} 
            size={200}
            level="H"
            includeMargin={true}
            className="w-full h-auto"
        />
      </div>

      <div className="text-center space-y-1 relative z-10">
        <p className="text-white text-xl font-semibold">{fullName}</p>
        <p className="text-slate-400 text-sm">{profile.degree}</p>
      </div>

    </div>
  );
}
