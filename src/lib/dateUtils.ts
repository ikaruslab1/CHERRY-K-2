/**
 * Formats a date to a string suitable for datetime-local input (YYYY-MM-DDTHH:mm)
 * in the America/Mexico_City timezone.
 */
export function formatToMexicoDateTimeLocal(date: Date | string | number): string {
  const d = new Date(date);
  
  // Use Intl.DateTimeFormat to get parts of the date in Mexico City timezone
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(d);
  const getPart = (type: string) => parts.find(p => p.type === type)?.value;

  return `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}`;
}

/**
 * Returns YYYY-MM-DD representation of a date in America/Mexico_City timezone
 */
export function getMexicoDateISO(date: Date | string | number): string {
    const d = new Date(date);
    const formatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const parts = formatter.formatToParts(d);
    const getPart = (type: string) => parts.find(p => p.type === type)?.value;
    
    return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

/**
 * Parses a datetime-local string (YYYY-MM-DDTHH:mm) assuming it's in America/Mexico_City
 * and returns a Date object.
 */
export function parseMexicoDateTimeLocal(dateTimeStr: string): Date {
  if (!dateTimeStr) return new Date();
  
  // Mexico City is UTC-06:00 (since DST was abolished in most of Mexico in 2022)
  // For most of the year/territory, this is constant now.
  // If we want to be 100% sure about older dates or specific regions, 
  // we would need a library, but -06:00 is standard for "Hora del Centro".
  
  // Ensure we have seconds if missing, and append the offset
  const normalizedStr = dateTimeStr.length === 16 ? dateTimeStr + ":00" : dateTimeStr;
  return new Date(`${normalizedStr}-06:00`);
}

/**
 * Formats a date for display in Spanish (Mexico)
 */
export function formatMexicoTime(date: Date | string | number): string {
  return new Date(date).toLocaleTimeString('es-MX', {
    timeZone: 'America/Mexico_City',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export function formatMexicoDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}): string {
  return new Date(date).toLocaleDateString('es-MX', {
    timeZone: 'America/Mexico_City',
    ...options
  });
}
