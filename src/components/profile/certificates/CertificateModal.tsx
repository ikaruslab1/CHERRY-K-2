import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/Button';
import { Printer, X } from 'lucide-react';
import { Certificate } from '@/types/certificates';
import { CertificatePreview } from '../CertificatePreview';
import { CertificateContent } from '../CertificateContent';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export function CertificateModal({ 
  certificate, 
  onClose
}: CertificateModalProps) {
    if (!certificate) return null;

    const handlePrint = () => {
        const originalTitle = document.title;
        const certId = certificate.id.split('-').pop()?.toUpperCase() || certificate.id;
        const fullName = `${certificate.profiles.first_name} ${certificate.profiles.last_name}`;
        document.title = `${certId} - ${fullName}`;
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 sm:p-4 overflow-hidden print:hidden">
            <div className="bg-white sm:rounded-xl shadow-2xl w-full max-w-6xl flex flex-col h-full sm:h-[90vh]">
                
                {/* Modal Toolbar */}
                <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Vista Previa de Constancia</h3>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 text-black hover:text-black">
                             <Printer className="h-4 w-4" />
                             <span className="hidden sm:inline">Imprimir</span>
                         </Button>
                         <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                        >
                             <X className="h-5 w-5" />
                         </button>
                    </div>
                </div>

                {/* Scaled View Area */}
                <div className="flex-1 overflow-hidden bg-gray-900/90 relative flex items-center justify-center p-2 sm:p-8 min-w-0 min-h-0">
                    <CertificatePreview certificate={certificate} />
                </div>
            </div>

            {/* PRINT PORTAL - Renders outside the react root for cleaner printing */}
            {typeof window !== 'undefined' && createPortal(
                <div id="print-portal" className="print-only">
                    <CertificateContent certificate={certificate} />
                </div>,
                document.body
            )}
        </div>
    );
}
