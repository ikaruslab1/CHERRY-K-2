export function getTranslatedField(entity: any, fieldName: string, language: string): string {
  if (!entity) return '';
  
  if (language === 'en') {
    const englishField = `${fieldName}_en`;
    // Si existe el texto en inglés y no está vacío, lo retornamos
    if (entity[englishField] && typeof entity[englishField] === 'string' && entity[englishField].trim() !== '') {
      return entity[englishField];
    }
  }
  
  // Como fallback, retornamos el valor original (que asumimos está en español),
  // o una cadena vacía si tampoco existe.
  return entity[fieldName] || '';
}
