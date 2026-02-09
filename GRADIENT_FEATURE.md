# Soporte de Gradientes para Color de Acento - Implementación

## 🎨 Nueva Funcionalidad

Ahora el sistema de personalización de marca soporta **tanto colores sólidos como gradientes** para el color de acento de cada conferencia.

---

## Cambios Implementados

### 1. **Base de Datos**

**Archivo**: `supabase/migrations/20260208_add_gradient_support.sql`

- Cambiado `accent_color` de `TEXT` a `JSONB`
- Estructura: `{type: "solid" | "gradient", value: "color_value"}`
- Permite almacenar tanto colores hexadecimales como gradientes CSS completos

### 2. **Tipos TypeScript**

**Archivo**: `src/types/index.ts`

```typescript
accent_color?: {
  type: 'solid' | 'gradient';
  value: string; // hex para sólido, CSS gradient para gradiente
}
```

### 3. **DynamicTheme Component**

**Archivo**: `src/components/theme/DynamicTheme.tsx`

- Detecta automáticamente si es sólido o gradiente
- Para gradientes:
  - Extrae el primer color para compatibilidad con elementos que requieren color sólido
  - Inyecta `--color-acid` (color sólido extraído)
  - Inyecta `--color-acid-gradient` (gradiente completo)
- Permite usar gradientes en elementos que lo soporten

### 4. **Panel de Owner - Selector Mejorado**

**Archivo**: `src/app/owner/page.tsx`

#### **Selector de Tipo**

- Botones para cambiar entre "Sólido" y "Gradiente"
- Interfaz clara y minimalista

#### **Modo Sólido**

- Color picker visual
- Input de texto para código hex
- Mismo comportamiento que antes

#### **Modo Gradiente**

- ✨ **Vista previa en tiempo real** del gradiente
- 🎨 **8 gradientes predefinidos**:
  - Lime (verde lima clásico)
  - Sunset (naranja a amarillo)
  - Ocean (azul a púrpura)
  - Fire (rosa a rojo)
  - Forest (azul cielo a cyan)
  - Purple (aqua a rosa)
  - Gold (crema a durazno)
  - Night (gris oscuro a azul)
- ✏️ **Editor de gradiente personalizado** (CSS)
  - Textarea para escribir cualquier gradiente CSS
  - Soporta `linear-gradient`, `radial-gradient`, `conic-gradient`, etc.
  - Validación en tiempo real con vista previa

---

## Cómo Usar

### Para Owners:

1. **Ir al Panel de Owner**
2. **Crear o editar una conferencia**
3. **En la sección "IDENTIDAD_VISUAL"**:

   **Opción A - Color Sólido:**
   - Click en "SÓLIDO"
   - Usa el color picker o escribe el código hex

   **Opción B - Gradiente:**
   - Click en "GRADIENTE"
   - Selecciona un gradiente predefinido, O
   - Escribe tu propio gradiente CSS personalizado
   - Ejemplo: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

4. **Guardar la conferencia**

---

## Variables CSS Disponibles

```css
/* Color sólido (siempre disponible) */
--color-acid: #d9f528;

/* Gradiente (puede ser igual al sólido o un gradiente completo) */
--color-acid-gradient: linear-gradient(...);
```

### Uso en Componentes:

```css
/* Para elementos que soportan gradientes */
.elemento-con-gradiente {
  background: var(--color-acid-gradient);
}

/* Para elementos que necesitan color sólido */
.elemento-solido {
  background: var(--color-acid);
  border-color: var(--color-acid);
}
```

---

## Ejemplos de Gradientes

### Linear Gradients:

```css
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
linear-gradient(to right, #ff6b6b, #ffd93d)
linear-gradient(45deg, #12c2e9, #c471ed, #f64f59)
```

### Radial Gradients:

```css
radial-gradient(circle, #667eea 0%, #764ba2 100%)
radial-gradient(ellipse at top, #e0c3fc 0%, #8ec5fc 100%)
```

### Conic Gradients:

```css
conic-gradient(from 180deg, #667eea, #764ba2, #667eea)
```

---

## Compatibilidad

### ✅ Elementos que usan el gradiente completo:

- Fondos de tarjetas grandes
- Banners y headers
- Elementos decorativos
- Cualquier elemento con `background: var(--color-acid-gradient)`

### ✅ Elementos que usan el color sólido extraído:

- Bordes
- Iconos
- Texto
- Elementos pequeños
- Cualquier elemento con `background: var(--color-acid)`

---

## Archivos Modificados

### Nuevos:

- `supabase/migrations/20260208_add_gradient_support.sql`

### Modificados:

- `src/types/index.ts`
- `src/components/theme/DynamicTheme.tsx`
- `src/app/owner/page.tsx`
- `src/components/profile/ProfileCard.tsx`
- `src/app/globals.css`

---

## Ventajas

1. **Flexibilidad Total**: Elige entre colores sólidos simples o gradientes complejos
2. **Compatibilidad Garantizada**: El sistema extrae automáticamente un color sólido de los gradientes
3. **Fácil de Usar**: Gradientes predefinidos para selección rápida
4. **Personalizable**: Editor CSS para gradientes completamente personalizados
5. **Vista Previa en Tiempo Real**: Ve exactamente cómo se verá antes de guardar
6. **Retrocompatible**: Los eventos existentes con colores sólidos siguen funcionando

---

## Notas Técnicas

- Los gradientes se almacenan como strings CSS completos
- El primer color hex del gradiente se extrae automáticamente para compatibilidad
- Si no se puede extraer un color, se usa el default (#D9F528)
- Los gradientes se aplican vía CSS variables para máxima flexibilidad
- El sistema soporta cualquier tipo de gradiente CSS válido

---

## Testing

1. Crea una conferencia con gradiente "Ocean"
2. Navega por la aplicación
3. Observa que:
   - Los elementos grandes muestran el gradiente completo
   - Los bordes e iconos usan el color sólido extraído
   - Todo se ve cohesivo y profesional

¡Disfruta de la nueva funcionalidad de gradientes! 🌈✨
