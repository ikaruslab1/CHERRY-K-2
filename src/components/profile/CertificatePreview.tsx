import { useRef, useState, useEffect } from 'react';
import { CertificateContent, Certificate } from './CertificateContent';

export function CertificatePreview({ certificate }: { certificate: Certificate }) {
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
