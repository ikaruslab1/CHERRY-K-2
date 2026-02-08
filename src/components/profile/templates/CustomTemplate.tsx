import React, { useRef, useLayoutEffect, useState, useMemo } from 'react';
import NextImage from 'next/image';
import { Certificate, formatDate, getDegreeAbbr, Signatures, getEventArticle } from './CertificateShared';

// Helper to map font options
const getFontFamily = (font: string) => {
    switch (font) {
        case 'serif': return 'var(--font-playfair)';
        case 'mono': return 'var(--font-geist-mono)';
        case 'cursive': return 'var(--font-dancing-script)';
        case 'sans': return 'var(--font-geist-sans)';
        default: return null;
    }
};

interface TemplateProps {
    certificate: Certificate;
    bodyFont: string;
    displayFont: string;
    isSpeaker?: boolean;
    isStaff?: boolean;
    isOrganizer?: boolean;
    onElementSelect?: (id: string) => void;
    onElementUpdate?: (id: string, updates: any) => void;
    selectedElement?: string | null;
    isDesigner?: boolean;
    zoomScale?: number;
}

// Helper to convert mm to px (approximate for display)
const mmToPx = (mm: number) => mm * 3.7795;
const CANVAS_WIDTH = mmToPx(279.4);
const CANVAS_HEIGHT = mmToPx(215.9);
const SNAP_THRESHOLD = 5;

interface SnapLines {
    vertical: { x: number; label?: string }[];
    horizontal: { y: number; label?: string }[];
}

interface Guide {
    type: 'vertical' | 'horizontal';
    position: number;
}

const DraggableElement = ({ 
    id, 
    config, 
    children, 
    onUpdate, 
    onSelect, 
    isDesigner, 
    isSelected, 
    zoomScale = 1,
    defaultPos,
    snapLines,
    onGuidesUpdate,
    onMeasure
}: {
    id: string;
    config: any;
    children: React.ReactNode;
    onUpdate?: (id: string, updates: any) => void;
    onSelect?: (id: string) => void;
    isDesigner?: boolean;
    isSelected?: boolean;
    zoomScale?: number;
    defaultPos: { x: number; y: number };
    snapLines?: SnapLines;
    onGuidesUpdate?: (guides: Guide[]) => void;
    onMeasure?: (id: string, width: number, height: number) => void;
}) => {
    // Use config pos or default
    const x = config?.x !== undefined ? config.x : defaultPos.x;
    const y = config?.y !== undefined ? config.y : defaultPos.y;
    const scale = config?.scale || 1;
    const elementRef = useRef<HTMLDivElement>(null);

    // Measure element size on change
    useLayoutEffect(() => {
        if (elementRef.current && onMeasure) {
            const { width, height } = elementRef.current.getBoundingClientRect();
            // We need unscaled dimensions if possible, but getBoundingClientRect returns scaled if transform is applied.
            // Since we apply scale in transform, we should divide by zoomScale AND local scale to get 'base' size?
            // Actually, we care about the "visual" bounding box for alignment most of the time, OR the center.
            // But to calculate edges for alignment of OTHER items, parent needs to know our current visual edges.
            // Let's report the Raw size (unscaled) if possible, or just use the current logic.
            // Simpler: Report width/height divided by (zoomScale * scale)
            onMeasure(id, width / (zoomScale * scale), height / (zoomScale * scale));
        }
    }, [children, config, zoomScale, scale, id, onMeasure]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isDesigner || !onUpdate || !onSelect) return;
        
        e.preventDefault();
        e.stopPropagation();
        onSelect(id);

        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = x;
        const startTop = y;

        // Current Dimensions for edge snapping
        const width = elementRef.current ? elementRef.current.offsetWidth : 0;
        const height = elementRef.current ? elementRef.current.offsetHeight : 0;
        const halfW = (width * scale) / 2;
        const halfH = (height * scale) / 2;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startX) / zoomScale;
            const dy = (moveEvent.clientY - startY) / zoomScale;
            
            let newX = startLeft + dx;
            let newY = startTop + dy;

            // Margin Clamping
            const SAFETY_MARGIN = 50;
            if (newX < SAFETY_MARGIN) newX = SAFETY_MARGIN;
            if (newX > CANVAS_WIDTH - SAFETY_MARGIN) newX = CANVAS_WIDTH - SAFETY_MARGIN;
            if (newY < SAFETY_MARGIN) newY = SAFETY_MARGIN;
            if (newY > CANVAS_HEIGHT - SAFETY_MARGIN) newY = CANVAS_HEIGHT - SAFETY_MARGIN;

            // Snapping Logic
            const activeGuides: Guide[] = [];
            
            if (snapLines) {
                // Vertical Snapping (X axis)
                // Check Center, Left, Right against snap lines
                const edgesX = [
                    { val: newX, type: 'center', offset: 0 },
                    { val: newX - halfW, type: 'left', offset: halfW },
                    { val: newX + halfW, type: 'right', offset: -halfW }
                ];

                let snappedX = false;
                for (const edge of edgesX) {
                    if (snappedX) break;
                    for (const line of snapLines.vertical) {
                        if (Math.abs(edge.val - line.x) < SNAP_THRESHOLD) {
                             newX = line.x + edge.offset;
                             // Re-clamp if snap pushes out of bounds (optional, but good for safety)
                             if (newX < SAFETY_MARGIN) newX = SAFETY_MARGIN;
                             if (newX > CANVAS_WIDTH - SAFETY_MARGIN) newX = CANVAS_WIDTH - SAFETY_MARGIN;

                             activeGuides.push({ type: 'vertical', position: line.x });
                             snappedX = true;
                             break;
                        }
                    }
                }

                // Horizontal Snapping (Y axis)
                const edgesY = [
                    { val: newY, type: 'center', offset: 0 },
                    { val: newY - halfH, type: 'top', offset: halfH },
                    { val: newY + halfH, type: 'bottom', offset: -halfH }
                ];
                let snappedY = false;
                for (const edge of edgesY) {
                    if (snappedY) break;
                    for (const line of snapLines.horizontal) {
                        if (Math.abs(edge.val - line.y) < SNAP_THRESHOLD) {
                             newY = line.y + edge.offset;
                             // Re-clamp
                             if (newY < SAFETY_MARGIN) newY = SAFETY_MARGIN;
                             if (newY > CANVAS_HEIGHT - SAFETY_MARGIN) newY = CANVAS_HEIGHT - SAFETY_MARGIN;

                             activeGuides.push({ type: 'horizontal', position: line.y });
                             snappedY = true;
                             break;
                        }
                    }
                }
            }

            if (onGuidesUpdate) onGuidesUpdate(activeGuides);
            
            onUpdate(id, {
                x: newX,
                y: newY
            });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            if (onGuidesUpdate) onGuidesUpdate([]); // Clear guides
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };
    
    // Calculate max width based on position and margins to force wrapping
    const SAFETY_MARGIN = 50;
    // Since the element is centered (translate -50%), the available width on each side is the distance to the nearest margin.
    // Total max width = 2 * min(distance_to_left_margin, distance_to_right_margin)
    const distLeft = x - SAFETY_MARGIN;
    const distRight = CANVAS_WIDTH - SAFETY_MARGIN - x;
    const safetyWidth = Math.max(0, Math.min(distLeft, distRight) * 2);

    // Use user-defined max width if available, but clamp to safety width
    const userMaxWidth = config?.maxWidth ? config.maxWidth : 800; // Default to 800 if not set, but constraint applies
    const finalMaxWidth = Math.min(safetyWidth, userMaxWidth);

    return (
        <div 
            ref={elementRef}
            style={{ 
                position: 'absolute', 
                left: `${x}px`, 
                top: `${y}px`, 
                transform: `translateX(-50%) translateY(-50%) scale(${scale})`, // Center anchor
                transformOrigin: 'center center',
                cursor: isDesigner ? 'move' : 'default',
                border: isDesigner && isSelected ? '1px dashed #DBF227' : '1px solid transparent', // Focus ring
                outline: isDesigner && isSelected ? '1px solid white' : 'none', // Contrast for focus
                zIndex: isSelected ? 50 : 10,
                // whiteSpace: 'nowrap', // Removed to enable text wrapping
                userSelect: 'none',
                maxWidth: `${finalMaxWidth}px`,
                width: 'max-content' // Ensure it takes necessary space but respects maxWidth
            }}
            onMouseDown={handleMouseDown}
            className={isDesigner && isSelected ? "bg-black/5" : ""}
        >
            {children}
        </div>
    );
};

export const CustomTemplate = ({
    certificate,
    bodyFont,
    displayFont,
    isSpeaker,
    isStaff,
    isOrganizer,
    onElementSelect,
    onElementUpdate,
    selectedElement,
    isDesigner = false,
    zoomScale = 1
}: TemplateProps) => {

    const conf = certificate.events.conferences;
    const config = conf?.certificate_config || certificate.events.certificate_config;

    // Helper to determine if the user has a special role that should hide context
    // Speakers (Ponentes) SHOULD see the context text.
    // Admins, Staff, Owners, Organizers should NOT.
    // @ts-ignore
    const userRole = certificate.profiles?.role || '';
    const shouldHideContext = isStaff || isOrganizer || 
                         ['admin', 'owner', 'organizer', 'staff'].includes(userRole);

    const customStyles = config?.styles || {
        text_color: '#000000',
        accent_color: '#dbf227',
        font_family: 'sans',
    };

    const texts = config?.texts || {};
    // Determine the main role text
    const roleText = isSpeaker 
        ? (texts.speaker || `Por impartir la ${certificate.events.type.toLowerCase()}:`) 
        : isStaff 
            ? (texts.staff || "Por su valiosa participación en la logística del evento:") 
            : isOrganizer 
                ? (texts.organizer || "Por su invaluable apoyo y liderazgo en la organización del evento:") 
                : (texts.attendee || `Por su asistencia ${getEventArticle(certificate.events.type)} ${certificate.events.type}`);

    const elements = config?.elements || {};
    const signerCount = config?.signer_count || 1;
    const signers = config?.signers || [];

    // Defaults relative to canvas center
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    // --- SNAP & GUIDE LOGIC ---
    const [measurements, setMeasurements] = useState<Record<string, {width: number, height: number}>>({});
    const [activeGuides, setActiveGuides] = useState<Guide[]>([]);

    const handleMeasure = (id: string, width: number, height: number) => {
        setMeasurements(prev => {
            if (prev[id]?.width === width && prev[id]?.height === height) return prev;
            return { ...prev, [id]: { width, height } };
        });
    };

    const snapLines = useMemo(() => {
        if (!isDesigner || !selectedElement) return undefined;

        const vertical: { x: number }[] = [{ x: centerX }]; // Canvas Center
        const horizontal: { y: number }[] = [{ y: centerY }]; // Canvas Center

        // Add other elements' lines
        Object.entries(elements).forEach(([key, el]: [string, any]) => {
            if (key === selectedElement) return; // Skip self

            const elX = el.x !== undefined ? el.x : centerX; // Simplified default
            const elY = el.y !== undefined ? el.y : centerY;
            const elScale = el.scale || 1;
            const dims = measurements[key]; // Get dimensions if available
            
            // Centers
            vertical.push({ x: elX });
            horizontal.push({ y: elY });

            if (dims) {
                const halfW = (dims.width * elScale) / 2;
                const halfH = (dims.height * elScale) / 2;
                // Edges
                vertical.push({ x: elX - halfW }); // Left
                vertical.push({ x: elX + halfW }); // Right
                horizontal.push({ y: elY - halfH }); // Top
                horizontal.push({ y: elY + halfH }); // Bottom
            }
        });

        return { vertical, horizontal };
    }, [elements, measurements, selectedElement, isDesigner, centerX, centerY]);


    // Construct common props for draggables
    const dragProps = {
        onUpdate: onElementUpdate,
        onSelect: onElementSelect,
        isDesigner,
        zoomScale,
        snapLines,
        onGuidesUpdate: setActiveGuides,
        onMeasure: handleMeasure
    };

    return (
        <div 
            style={{ 
                width: '279.4mm', 
                height: '215.9mm',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'white',
                color: customStyles.text_color,
                fontFamily: bodyFont,
            }} 
            className="certificate-container mx-auto shadow-none print:shadow-none flex flex-col"
        >
            {/* Background Image */}
            {config?.background_url && (
                <div className="absolute inset-0 z-0 pointer-events-none w-full h-full"> 
                    <NextImage 
                        src={config.background_url} 
                        alt="Background" 
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}

            {/* Guides Overlay */}
            {isDesigner && (
                <>
                    {/* Safety Margin Guide */}
                    <div 
                        style={{ 
                            position: 'absolute',
                            top: `${50}px`,
                            left: `${50}px`,
                            right: `${50}px`,
                            bottom: `${50}px`,
                            border: '1px dashed rgba(255, 0, 0, 0.4)',
                            zIndex: 100,
                            pointerEvents: 'none'
                        }}
                    />

                    {activeGuides.map((guide, i) => (
                        <div 
                            key={i}
                            style={{
                                position: 'absolute',
                                backgroundColor: '#ff00ff', // Magenta guide
                                zIndex: 100,
                                ...(guide.type === 'vertical' ? {
                                    left: guide.position,
                                    top: 0,
                                    bottom: 0,
                                    width: 1
                                } : {
                                    top: guide.position,
                                    left: 0,
                                    right: 0,
                                    height: 1
                                })
                            }}
                            className="pointer-events-none opacity-80"
                        ></div>
                    ))}
                </>
            )}

            {/* Configurable Elements Layer */}
            <div className="absolute inset-0 z-10">
                
                {/* 1. Name */}
                <DraggableElement 
                    id="name" 
                    config={elements.name} 
                    defaultPos={{ x: centerX, y: centerY - 50 }} 
                    isSelected={selectedElement === 'name'} 
                    {...dragProps}
                >
                    <h3 
                        // @ts-ignore
                        style={{ 
                            color: elements.name?.color || customStyles.accent_color, 
                            fontFamily: getFontFamily(elements.name?.fontFamily) || displayFont,
                            textAlign: elements.name?.textAlign || 'center',
                            fontWeight: elements.name?.fontWeight || 'bold', // Default bold
                            fontStyle: elements.name?.fontStyle || 'normal',
                            textDecoration: elements.name?.textDecoration || 'none',
                            letterSpacing: elements.name?.letterSpacing || 'normal',
                            lineHeight: elements.name?.lineHeight || '1.1',
                            whiteSpace: elements.name?.whiteSpace || 'pre-wrap', 
                        }}
                        className="text-5xl"
                    >
                        {getDegreeAbbr(certificate.profiles.degree, certificate.profiles.gender)} {certificate.profiles.first_name} {certificate.profiles.last_name}
                    </h3>
                </DraggableElement>

                {/* 2. Event Title */}
                <DraggableElement 
                    id="eventTitle" 
                    config={elements.eventTitle} 
                    defaultPos={{ x: centerX, y: centerY + 50 }} 
                    isSelected={selectedElement === 'eventTitle'}
                    {...dragProps}
                >
                     <h4 
                        style={{ 
                            color: elements.eventTitle?.color || customStyles.text_color, 
                            fontFamily: getFontFamily(elements.eventTitle?.fontFamily) || displayFont,
                            textAlign: elements.eventTitle?.textAlign || 'center',
                            fontWeight: elements.eventTitle?.fontWeight || 'bold',
                            fontStyle: elements.eventTitle?.fontStyle || 'normal',
                            textDecoration: elements.eventTitle?.textDecoration || 'none',
                            letterSpacing: elements.eventTitle?.letterSpacing || 'normal',
                            lineHeight: elements.eventTitle?.lineHeight || '1.1',
                            whiteSpace: elements.eventTitle?.whiteSpace || 'pre-wrap',
                        }}
                        className="text-3xl uppercase leading-tight"
                    >
                        {certificate.events.title}
                    </h4>
                </DraggableElement>

                {/* 3. Role Text */}
                <DraggableElement 
                    id="roleText" 
                    config={elements.roleText} 
                    defaultPos={{ x: centerX, y: centerY - 100 }} 
                    isSelected={selectedElement === 'roleText'}
                    {...dragProps}
                >
                    <p 
                        style={{ 
                            color: elements.roleText?.color || customStyles.text_color, 
                            fontFamily: getFontFamily(elements.roleText?.fontFamily) || bodyFont,
                            textAlign: elements.roleText?.textAlign || 'center',
                            fontWeight: elements.roleText?.fontWeight || '300', // Default light
                            fontStyle: elements.roleText?.fontStyle || 'normal',
                            textDecoration: elements.roleText?.textDecoration || 'none',
                            letterSpacing: elements.roleText?.letterSpacing || 'normal',
                            lineHeight: elements.roleText?.lineHeight || '1.4',
                            whiteSpace: elements.roleText?.whiteSpace || 'pre-wrap',
                        }}
                        className="text-xl opacity-90"
                    >
                        {roleText}
                    </p>
                </DraggableElement>

                {/* 4. Context Text - Strictly hidden for defined roles (Admin, Staff, Owner) but shown for Speaker/Attendee */}
                {!shouldHideContext && (certificate.events.conferences?.title || texts.context) && (
                     <DraggableElement 
                        id="contextText" 
                        config={elements.contextText} 
                        defaultPos={{ x: centerX, y: centerY + 100 }} 
                        isSelected={selectedElement === 'contextText'}
                        {...dragProps}
                    >
                        <p 
                            style={{ 
                                color: elements.contextText?.color || customStyles.text_color, 
                                fontFamily: getFontFamily(elements.contextText?.fontFamily) || bodyFont,
                                textAlign: elements.contextText?.textAlign || 'center',
                                fontWeight: elements.contextText?.fontWeight || 'normal',
                                fontStyle: elements.contextText?.fontStyle || 'normal',
                                textDecoration: elements.contextText?.textDecoration || 'none',
                                letterSpacing: elements.contextText?.letterSpacing || 'normal',
                                lineHeight: elements.contextText?.lineHeight || '1.4',
                                whiteSpace: elements.contextText?.whiteSpace || 'pre-wrap',
                            }}
                            className="text-lg opacity-80"
                        >
                            {texts.context || `En el marco del ${certificate.events.conferences?.title || ''}`}
                        </p>
                    </DraggableElement>
                )}

                {/* 5. Date */}
                <DraggableElement 
                    id="date" 
                    config={elements.date} 
                    defaultPos={{ x: CANVAS_WIDTH - 150, y: 50 }} 
                    isSelected={selectedElement === 'date'}
                    {...dragProps}
                >
                    <p 
                       style={{ 
                            color: elements.date?.color || customStyles.text_color, 
                            fontFamily: getFontFamily(elements.date?.fontFamily) || bodyFont,
                            textAlign: elements.date?.textAlign || 'right',
                            fontWeight: elements.date?.fontWeight || '500',
                            fontStyle: elements.date?.fontStyle || 'normal',
                            textDecoration: elements.date?.textDecoration || 'none',
                            letterSpacing: elements.date?.letterSpacing || 'normal',
                            lineHeight: elements.date?.lineHeight || '1.4',
                            whiteSpace: elements.date?.whiteSpace || 'pre-wrap',
                       }}
                       className="text-sm"
                    >
                        {formatDate(certificate.events.date)}
                    </p>
                </DraggableElement>

                {/* 6. ID */}
                <DraggableElement 
                    id="id" 
                    config={elements.id} 
                    defaultPos={{ x: CANVAS_WIDTH - 150, y: 80 }} 
                    isSelected={selectedElement === 'id'}
                    {...dragProps}
                >
                     <p 
                        style={{ 
                            color: elements.id?.color || customStyles.text_color, 
                            fontFamily: getFontFamily(elements.id?.fontFamily) || 'monospace', // Default mono
                            textAlign: elements.id?.textAlign || 'right',
                            fontWeight: elements.id?.fontWeight || 'normal',
                            fontStyle: elements.id?.fontStyle || 'normal',
                            textDecoration: elements.id?.textDecoration || 'none',
                            letterSpacing: elements.id?.letterSpacing || 'normal',
                            lineHeight: elements.id?.lineHeight || '1',
                       }}
                        className="text-[10px] opacity-60 font-mono tracking-widest text-right"
                    >
                        ID: {certificate.id ? certificate.id.split('-')[0].toUpperCase() : 'XXXX'}
                     </p>
                </DraggableElement>

                {/* 7. Signatures Group */}
                <DraggableElement 
                    id="signatures" 
                    config={elements.signatures} 
                    defaultPos={{ x: centerX, y: CANVAS_HEIGHT - 100 }} 
                    isSelected={selectedElement === 'signatures'}
                    {...dragProps}
                >
                    <div style={{ 
                        filter: (elements.signatures?.contrast === 'white') ? 'brightness(0) invert(1)' : 'brightness(0)',
                        // Force color override for text elements inside logic if needed, but signatures component handles color prop
                    }}>
                        {/* We pass color explicitly to Signatures component */}
                        <Signatures 
                            count={signerCount} 
                            signers={signers} 
                            align={elements.signatures?.textAlign || 'center'} 
                            color={elements.signatures?.contrast === 'white' ? '#ffffff' : (elements.signatures?.color || customStyles.text_color)} 
                        />
                    </div>
                </DraggableElement>

                 {/* 8. Logos Group */}
                 {config?.logos && config.logos.length > 0 && (
                     <DraggableElement
                        id="logos"
                        config={elements.logos}
                        defaultPos={{ x: 150, y: 50 }}
                        isSelected={selectedElement === 'logos'}
                        {...dragProps}
                     >
                         <div 
                            className={`flex ${elements.logos?.direction === 'vertical' ? 'flex-col h-auto w-16' : 'flex-row h-16 w-auto'} items-center gap-4`}
                         >
                            {config.logos.map((logo: any, index: number) => {
                                if (logo.type === 'none' || !logo.value) return null;
                                const logoUrl = logo.type === 'preset' ? `/assets/${logo.value}.svg` : logo.value;
                                return (
                                    <React.Fragment key={index}>
                                        <NextImage 
                                            src={logoUrl} 
                                            alt={`Logo ${index}`} 
                                            width={120}
                                            height={60}
                                            className={`${elements.logos?.direction === 'vertical' ? 'w-full h-auto' : 'h-full w-auto'} object-contain max-h-[60px] max-w-[120px]`}
                                            style={{ 
                                                filter: (elements.logos?.contrast === 'white') ? 'brightness(0) invert(1)' : 'brightness(0)' 
                                            }} 
                                        />
                                        {index < config.logos.filter((l:any) => l.type !== 'none').length - 1 && (
                                            <div 
                                                className={`${elements.logos?.direction === 'vertical' ? 'w-8 h-[1px]' : 'h-8 w-[1px]'} bg-current opacity-20`} 
                                                style={{ backgroundColor: (elements.logos?.contrast === 'white') ? '#ffffff' : (config.styles?.text_color || '#000000') }}
                                            ></div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                         </div>
                     </DraggableElement>
                 )}

            </div>
        </div>
    );
};
