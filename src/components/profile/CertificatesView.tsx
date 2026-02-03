'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Printer, X, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { CertificateCard } from './CertificateCard';
import { CertificateContent, Certificate } from './CertificateContent';
import { CertificatePreview } from './CertificatePreview';


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
                    <CertificateCard 
                      key={cert.id} 
                      cert={cert} 
                      onView={setSelectedCertificate} 
                      formatDate={formatDate}
                    />
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
