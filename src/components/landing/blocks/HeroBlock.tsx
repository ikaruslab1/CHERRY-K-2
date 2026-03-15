'use client';

import { LandingBlock, HeroBlockContent } from '@/types';
import { motion } from 'framer-motion';
import { getContrastColor } from '@/lib/colorUtils';

interface HeroBlockProps {
  block: LandingBlock;
  authForms?: React.ReactNode;
}

export function HeroBlock({ block, authForms }: HeroBlockProps) {
  const content = block.content as HeroBlockContent;
  const { 
    title, 
    subtitle, 
    logos, 
    title_font, 
    title_color, 
    subtitle_font, 
    subtitle_color,
    background_type,
    background_value,
    buttons,
    split_alignment = 'left',
    feature_area_background_type,
    feature_area_background_value
  } = content;
  
  const variant = block.variant || 'centered';

  // Dynamic Styles for Container
  const getBackgroundStyle = (type?: string, value?: string, start?: string, end?: string, direction?: string) => {
    if (type === 'color') return { backgroundColor: value || '#373737' };
    if (type === 'gradient') {
      // Use explicit components if they exist, otherwise fallback to the full string
      if (start && end) {
        return { background: `linear-gradient(${direction || '135deg'}, ${start} 0%, ${end} 100%)` };
      }
      return { background: value || 'linear-gradient(135deg, #373737 0%, #000000 100%)' };
    }
    if (type === 'image') return { 
      backgroundImage: `url(${value})`, 
      backgroundSize: 'cover', 
      backgroundPosition: 'center' 
    };
    // Fallback legacy behavior
    return { background: `linear-gradient(135deg, ${content.gradient_start || '#373737'} 0%, ${content.gradient_end || '#000000'} 100%)` };
  };

  const containerStyle = getBackgroundStyle(
    background_type, 
    background_value, 
    content.gradient_start, 
    content.gradient_end, 
    content.gradient_direction
  );

  // Calculate contrast for logos (white logos on dark bg, black logos on light bg)
  const contrastColor = background_type === 'image' 
    ? 'white' 
    : getContrastColor(background_value || content.gradient_start || '#373737');

  // Typography Class Mapping (Aligned with Certificates)
  const fontClasses: Record<string, string> = {
    sans: 'font-geist-sans',
    serif: 'font-playfair',
    mono: 'font-geist-mono',
    cursive: 'font-dancing-script'
  };

  const titleStyle = {
    color: title_color || '#FFFFFF',
    fontFamily: title_font ? undefined : 'inherit'
  };

  const subtitleStyle = {
    color: subtitle_color || 'rgba(255, 255, 255, 0.7)',
    fontFamily: subtitle_font ? undefined : 'inherit'
  };

  const renderLogos = () => {
    // Ensure logos is an array and filter out any invalid entries
    const validLogos = Array.isArray(logos) ? logos.filter(l => typeof l === 'string' && l.length > 0) : [];
    
    if (validLogos.length === 0) return null;
    
    const isWhite = contrastColor === 'white';
    const isCentered = variant === 'centered';
    
    return (
      <div className={`flex flex-wrap gap-6 mb-8 ${isCentered ? 'justify-center' : 'lg:justify-start justify-center'}`}>
        {validLogos.map((logo, idx) => (
          <motion.img 
            key={`${logo}-${idx}`}
            src={logo}
            alt={`Logo ${idx}`}
            className={`h-8 md:h-12 w-auto object-contain brightness-0 ${isWhite ? 'invert' : ''} transition-all duration-300`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
          />
        ))}
      </div>
    );
  };

  if (variant === 'split') {
    const isRightAligned = split_alignment === 'right';
    const featureBgStyle = getBackgroundStyle(
      feature_area_background_type, 
      feature_area_background_value,
      content.feature_area_gradient_start,
      content.feature_area_gradient_end,
      content.feature_area_gradient_direction
    );

    return (
      <section className="relative min-h-[90vh] grid lg:grid-cols-2 overflow-hidden" style={containerStyle}>
        <div className={`flex flex-col justify-center px-6 lg:px-16 py-20 relative z-10 ${isRightAligned ? 'lg:order-2' : ''}`}>
          <motion.div
            initial={{ opacity: 0, x: isRightAligned ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {renderLogos()}
            <h1 
              style={titleStyle}
              className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-none tracking-tighter ${title_font ? fontClasses[title_font] : ''}`}
            >
              {title}
            </h1>
            <p 
              style={subtitleStyle}
              className={`text-lg md:text-xl max-w-xl leading-relaxed ${subtitle_font ? fontClasses[subtitle_font] : ''}`}
            >
              {subtitle}
            </p>
          </motion.div>
        </div>
        
        <div 
          style={featureBgStyle}
          className={`flex flex-col justify-center p-6 lg:p-12 min-h-[300px] lg:min-h-full ${isRightAligned ? 'lg:order-1 lg:border-r' : 'lg:border-l'} border-black/10`}
        >
          {/* Feature Area content (Empty or customizable in future) */}
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center py-24 text-center overflow-hidden" style={containerStyle}>
      {!background_type || background_type !== 'image' && (
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      )}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 relative z-10 flex flex-col items-center"
      >
        {renderLogos()}

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          style={titleStyle}
          className={`text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] tracking-tighter max-w-5xl mx-auto ${title_font ? fontClasses[title_font] : ''}`}
        >
          {title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true }}
          style={subtitleStyle}
          className={`text-xl md:text-2xl mt-8 max-w-3xl mx-auto leading-relaxed ${subtitle_font ? fontClasses[subtitle_font] : ''}`}
        >
          {subtitle}
        </motion.p>

        {variant === 'centered' && buttons && buttons.length > 0 && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
             viewport={{ once: true }}
             className="pt-10 flex flex-wrap justify-center gap-4 px-4"
           >
              {buttons.map((btn, idx) => (
                <button 
                  key={idx}
                  onClick={() => btn.url.startsWith('#') ? document.getElementById(btn.url.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' }) : window.open(btn.url, '_blank')}
                  style={{ backgroundColor: btn.color || (idx === 0 ? '#DBF227' : 'rgba(255,255,255,0.1)') }}
                  className={`px-8 py-4 ${idx === 0 ? 'text-black' : 'text-white border border-white/10 backdrop-blur-md'} font-bold rounded-xl hover:scale-105 transition-transform text-sm md:text-base w-full sm:w-auto shadow-xl shadow-black/5`}
                >
                  {btn.label}
                </button>
              ))}
           </motion.div>
        )}
      </motion.div>
    </section>
  );
}
