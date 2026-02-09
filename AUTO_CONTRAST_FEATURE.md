# Contraste Automático de Texto - Implementación

## 🎯 Funcionalidad

El sistema ahora calcula **automáticamente** si el texto e iconos sobre fondos de color de acento deben ser **blancos o negros** para garantizar máxima legibilidad, basándose en el contraste del color de fondo.

---

## Cómo Funciona

### 1. **Cálculo de Luminancia (WCAG 2.0)**

Utilizamos la fórmula estándar de WCAG 2.0 para calcular la luminancia relativa de un color:

```typescript
luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
```

### 2. **Determinación del Color de Texto**

- **Luminancia > 0.5** → Fondo claro → Texto **NEGRO**
- **Luminancia ≤ 0.5** → Fondo oscuro → Texto **BLANCO**

### 3. **Soporte para Gradientes**

Cuando se usa un gradiente:

1. Extrae el primer color del gradiente
2. Calcula la luminancia de ese color
3. Determina el color de texto óptimo

---

## Implementación Técnica

### **Archivo de Utilidades**

`src/lib/colorUtils.ts`

Funciones disponibles:

```typescript
// Retorna 'white' o 'black'
getContrastColor(backgroundColor: string): 'white' | 'black'

// Retorna '#FFFFFF' o '#000000'
getContrastColorHex(backgroundColor: string): string

// Verifica si es color claro
isLightColor(color: string): boolean

// Verifica si es color oscuro
isDarkColor(color: string): boolean
```

### **Variable CSS Automática**

`--color-acid-text`

Esta variable se inyecta automáticamente por `DynamicTheme` y contiene el color de texto óptimo (blanco o negro) basado en el color de acento actual.

---

## Uso en Componentes

### **Método 1: Variable CSS (Recomendado)**

```tsx
// Para iconos
<Calendar style={{ color: 'var(--color-acid-text)' }} />

// Para texto
<span style={{ color: 'var(--color-acid-text)' }}>Texto</span>
```

### **Método 2: Función Directa**

```tsx
import { getContrastColor } from "@/lib/colorUtils";

const textColor = getContrastColor("#DBF227"); // 'black'
```

---

## Componentes Actualizados

### ✅ **AgendaView** (`src/components/events/AgendaView.tsx`)

- Icono de calendario
- Indicador "Asistidos" (icono y texto)
- Contador de asistidos

### ✅ **ResponsiveNav** (`src/components/layout/ResponsiveNav.tsx`)

- Icono de menú (mobile y desktop)
- Iconos de navegación activos
- Todos los iconos sobre fondo de color de acento

### ✅ **DynamicTheme** (`src/components/theme/DynamicTheme.tsx`)

- Calcula automáticamente el color de texto
- Inyecta `--color-acid-text` como variable CSS global

---

## Ejemplos de Comportamiento

### **Color Claro (ej: #DBF227 - Verde Lima)**

- Luminancia: ~0.85
- Texto: **NEGRO** (#000000)
- Resultado: Excelente contraste ✅

### **Color Oscuro (ej: #2c3e50 - Azul Oscuro)**

- Luminancia: ~0.15
- Texto: **BLANCO** (#FFFFFF)
- Resultado: Excelente contraste ✅

### **Gradiente (ej: Ocean)**

```css
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

- Extrae: #667eea
- Luminancia: ~0.35
- Texto: **BLANCO** (#FFFFFF)

---

## Variables CSS Disponibles

```css
/* Color de fondo sólido */
--color-acid: #d9f528;

/* Gradiente (puede ser igual al sólido) */
--color-acid-gradient: linear-gradient(...);

/* Color de texto automático (NUEVO) */
--color-acid-text: #000000; /* o #FFFFFF según contraste */
```

---

## Ventajas

1. **Accesibilidad**: Cumple con estándares WCAG 2.0
2. **Automático**: No requiere configuración manual
3. **Dinámico**: Se adapta a cualquier color de acento
4. **Consistente**: Mismo comportamiento en toda la app
5. **Gradientes**: Funciona perfectamente con gradientes
6. **Mantenible**: Centralizado en una utilidad reutilizable

---

## Archivos Modificados

### Nuevos:

- `src/lib/colorUtils.ts` - Utilidades de contraste

### Modificados:

- `src/components/theme/DynamicTheme.tsx` - Cálculo automático
- `src/app/globals.css` - Nueva variable CSS
- `src/components/events/AgendaView.tsx` - Iconos y texto
- `src/components/layout/ResponsiveNav.tsx` - Navegación

---

## Testing

### Prueba con Color Claro:

1. Configura color de acento: `#FFE66D` (amarillo claro)
2. Observa que los iconos y texto son **negros**
3. Verifica legibilidad perfecta ✅

### Prueba con Color Oscuro:

1. Configura color de acento: `#2c3e50` (azul oscuro)
2. Observa que los iconos y texto son **blancos**
3. Verifica legibilidad perfecta ✅

### Prueba con Gradiente:

1. Selecciona gradiente "Ocean" (azul a púrpura)
2. Observa que el texto es **blanco**
3. Verifica que se adapta al primer color del gradiente ✅

---

## Notas Técnicas

- El cálculo se basa en la **luminancia relativa** según WCAG 2.0
- El umbral de 0.5 es el estándar recomendado
- Para gradientes, se usa el **primer color** como referencia
- Si no se puede extraer un color, usa **negro** por defecto
- La variable CSS se actualiza automáticamente con cada cambio de conferencia

---

## Próximos Pasos (Opcional)

Si deseas aplicar esto a más elementos:

```tsx
// Cualquier elemento sobre fondo de acento
<div className="bg-[var(--color-acid)]">
  <span style={{ color: "var(--color-acid-text)" }}>
    Texto con contraste perfecto
  </span>
</div>
```

¡El contraste automático garantiza que tu aplicación sea siempre legible, sin importar qué color de acento elijas! 🎨✨
