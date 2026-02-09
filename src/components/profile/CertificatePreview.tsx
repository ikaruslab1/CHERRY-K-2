import { useRef, useState, useEffect } from 'react';
import { CertificateContent, Certificate } from './CertificateContent';

export function CertificatePreview({ certificate }: { certificate: Certificate }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState<number | null>(null); // Start null to hide

    // Constants
    const MM_TO_PX = 3.7795;
    const PDF_WIDTH_MM = 279.4;
    const PDF_HEIGHT_MM = 215.9;
    
    // Base dimensions in PX
    const widthPx = PDF_WIDTH_MM * MM_TO_PX;
    const heightPx = PDF_HEIGHT_MM * MM_TO_PX;

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current && containerRef.current.parentElement) {
                const parent = containerRef.current.parentElement;
                
                // Use getBoundingClientRect for more accurate available space
                const rect = parent.getBoundingClientRect();
                
                // Subtract padding safely (e.g. 32px total horizontal padding is p-4, but let's be safe with 40-60px)
                // If parent has p-2 (16px total), we subtract that plus a bit of margin.
                const paddingX = 32; 
                const paddingY = 32;

                const availableWidth = rect.width - paddingX; 
                const availableHeight = rect.height - paddingY;
                
                const scaleX = availableWidth / widthPx;
                const scaleY = availableHeight / heightPx;
                
                // Allow scale to be determined by the most constrained dimension
                // Cap at 1.0 (100%) so it doesn't blow up on huge screens
                const newScale = Math.min(scaleX, scaleY, 1); 
                setScale(newScale);
            }
        };

        // Initial
        updateScale();

        // Robust Resize Observer
        const parentElement = containerRef.current?.parentElement;
        let observer: ResizeObserver | null = null;

        if (parentElement) {
            observer = new ResizeObserver(() => {
                window.requestAnimationFrame(updateScale);
            });
            observer.observe(parentElement);
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, [widthPx, heightPx]);

    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: widthPx * (scale || 0.1), 
                height: heightPx * (scale || 0.1),
                opacity: scale ? 1 : 0,
                maxWidth: '100%',
                maxHeight: '100%'
            }} 
            className="origin-center shadow-2xl transition-all duration-300 ease-out bg-white relative"
        >
            <div 
                style={{ 
                    transform: `scale(${scale || 1})`, 
                    transformOrigin: 'top left', 
                    width: `${PDF_WIDTH_MM}mm`, 
                    height: `${PDF_HEIGHT_MM}mm`,
                }}
            >
                <CertificateContent certificate={certificate} />
            </div>
        </div>
    );
}
