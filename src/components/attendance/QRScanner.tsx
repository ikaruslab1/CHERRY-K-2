import { useEffect, useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, Camera, CameraOff, AlertCircle } from 'lucide-react';

interface QRScannerProps {
    onScan: (data: string) => void;
    onError?: (error: any) => void;
    paused?: boolean;
}

export function QRScanner({ onScan, onError, paused }: QRScannerProps) {
    const [isEnabled, setIsEnabled] = useState(true);

    // Si está pausado (ej. modal abierto), desmontamos o pausamos el escáner para ahorrar recursos y evitar lecturas fantasma
    // La librería @yudiel/react-qr-scanner tiene 'enabled' prop o 'paused'.
    
    return (
        <div className="w-full aspect-square bg-black rounded-3xl overflow-hidden relative shadow-inner border border-gray-800 group">
            {/* Viewfinder Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full border-[20px] border-black/50 mask-image-suggested">
                    {/* Corner Markers */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-[#DBF227] rounded-tl-xl" />
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-[#DBF227] rounded-tr-xl" />
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-[#DBF227] rounded-bl-xl" />
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-[#DBF227] rounded-br-xl" />
                    
                    {/* Scan Line Animation */}
                    {!paused && (
                         <div className="absolute top-0 left-0 w-full h-1 bg-[#DBF227]/50 shadow-[0_0_20px_#DBF227] animate-[scan_2s_ease-in-out_infinite]" />
                    )}
                </div>
            </div>

            <div className="h-full w-full">
                <Scanner 
                    onScan={(result) => {
                        if (result && result.length > 0 && !paused) {
                            onScan(result[0].rawValue);
                        }
                    }}
                    onError={(e) => {
                        console.error(e);
                        if (onError) onError(e);
                    }}
                    paused={paused}
                    components={{
                        torch: true,
                        finder: false // Custom finder above
                    }}
                    styles={{
                        container: { height: '100%', width: '100%' },
                        video: { height: '100%', width: '100%', objectFit: 'cover' }
                    }}
                />
            </div>
            
            {paused && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center text-white/70">
                        <CameraOff className="h-10 w-10 mb-2 opacity-50" />
                        <span className="text-sm font-medium tracking-wider uppercase">Escáner Pausado</span>
                    </div>
                </div>
            )}
        </div>
    );
}
