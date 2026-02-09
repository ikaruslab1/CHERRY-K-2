'use client';

import { useConference } from '@/context/ConferenceContext';
import { useEffect } from 'react';
import { getContrastColorHex } from '@/lib/colorUtils';

/**
 * DynamicTheme Component
 * 
 * Injects the conference-specific accent color as a CSS variable
 * that overrides the default --color-acid throughout the application.
 * This allows the entire UI to adapt to the conference's branding.
 * 
 * Supports both solid colors and gradients.
 * Automatically calculates optimal text color for contrast.
 */
export function DynamicTheme() {
  const { currentConference } = useConference();
  
  useEffect(() => {
    // Get the accent color from the current conference or use default
    const accentColorConfig = currentConference?.accent_color || { type: 'solid', value: '#D9F528' };
    
    let colorValue: string;
    let gradientValue: string | null = null;
    
    if (accentColorConfig.type === 'gradient') {
      // For gradients, we store the full gradient and extract the first color for compatibility
      gradientValue = accentColorConfig.value;
      // Extract first color from gradient for elements that need a solid color
      const colorMatch = accentColorConfig.value.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/);
      colorValue = colorMatch ? colorMatch[0] : '#D9F528';
    } else {
      colorValue = accentColorConfig.value;
    }
    
    // Calculate optimal text color for contrast
    const textColor = getContrastColorHex(gradientValue || colorValue);
    
    // Inject the color as CSS variables on the document root
    document.documentElement.style.setProperty('--color-acid', colorValue);
    document.documentElement.style.setProperty('--color-acid-text', textColor);
    if (gradientValue) {
      document.documentElement.style.setProperty('--color-acid-gradient', gradientValue);
    } else {
      document.documentElement.style.setProperty('--color-acid-gradient', colorValue);
    }
    
    // Cleanup: reset to default when component unmounts or conference changes
    return () => {
      document.documentElement.style.setProperty('--color-acid', '#D9F528');
      document.documentElement.style.setProperty('--color-acid-text', '#000000');
      document.documentElement.style.setProperty('--color-acid-gradient', '#D9F528');
    };
  }, [currentConference?.accent_color]);
  
  // This component doesn't render anything
  return null;
}
