/**
 * Color Contrast Utilities
 * 
 * Provides functions to calculate optimal text color (black or white)
 * based on background color for maximum readability.
 */

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculates relative luminance of a color
 * Based on WCAG 2.0 formula
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Extracts the first color from a gradient string
 */
function extractFirstColorFromGradient(gradient: string): string | null {
  // Match hex colors in the gradient
  const hexMatch = gradient.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/);
  if (hexMatch) return hexMatch[0];
  
  // Match rgb/rgba colors
  const rgbMatch = gradient.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  
  return null;
}

/**
 * Determines if white or black text should be used on a given background color
 * Returns 'white' or 'black'
 * 
 * @param backgroundColor - Hex color string (e.g., '#DBF227') or CSS gradient
 * @returns 'white' or 'black'
 */
export function getContrastColor(backgroundColor: string): 'white' | 'black' {
  // Handle undefined, null, or empty strings
  if (!backgroundColor || typeof backgroundColor !== 'string') {
    return 'black'; // Default to black if invalid
  }
  
  // If it's a gradient, extract the first color
  if (backgroundColor.includes('gradient')) {
    const extractedColor = extractFirstColorFromGradient(backgroundColor);
    if (!extractedColor) return 'black'; // Default to black if can't extract
    backgroundColor = extractedColor;
  }
  
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return 'black'; // Default to black if invalid color
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  // WCAG recommends 0.5 as threshold
  // Luminance > 0.5 means light background, use black text
  // Luminance <= 0.5 means dark background, use white text
  return luminance > 0.5 ? 'black' : 'white';
}

/**
 * Gets the appropriate text color as a hex value
 */
export function getContrastColorHex(backgroundColor: string): string {
  return getContrastColor(backgroundColor) === 'white' ? '#FFFFFF' : '#000000';
}

/**
 * Checks if a color is light (luminance > 0.5)
 */
export function isLightColor(color: string): boolean {
  return getContrastColor(color) === 'black';
}

/**
 * Checks if a color is dark (luminance <= 0.5)
 */
export function isDarkColor(color: string): boolean {
  return getContrastColor(color) === 'white';
}
