# PLAN DE DISEÑO: DIRECTION "ACID EDITORIAL"

## 1. DIAGNÓSTICO (LA CRUDA REALIDAD)

El estado actual del proyecto sufre de "Síndrome de Plantilla":

- **Gris sobre blanco:** La paleta de colores (`#373737`, `#ffffff`, `#gray-200`) es segura pero aburrida. Grita "herramienta administrativa" en lugar de "experiencia de congreso internacional".
- **Tipografía Tímida:** El uso de `Geist Sans` como principal es funcional para Vercel, pero anónimo para una marca con identidad. `Syne` y `Playfair` están importadas pero infrautilizadas.
- **Formas Indecisas:** El uso de `rounded-xl` y `rounded-lg` en botones e inputs es genérico. No tiene opinión.
- **Ausencia de Tensión:** Todo flota en un espacio blanco sin estructura visible. Falta jerarquía visual dramática.

**Conclusión:** El diseño actual es funcional, pero olvidable. Necesita una inyección de adrenalina visual.

---

## 2. MANIFIESTO VISUAL: "ACID EDITORIAL"

### El Concepto

Una fusión entre la **maquetación editorial de alta moda** y el **brutalismo digital refinado**.
Contrastes altos, tipografía masiva, micro-interacciones físicas y una paleta de colores eléctrica sobre oscuridad profunda.

### Tipografía (Swiss Style)

Legibilidad absoluta y neutralidad.

1.  **Titulares y Cuerpo:** `Geist Sans` (Neo-grotesque estilo Helvética).
    - _Por qué:_ Elimina la distracción de los trazos variables. Uniforme, sólida y profesional.
2.  **Datos / Metadatos:** `JetBrains Mono`.
    - _Por qué:_ Aporta el toque "técnico/congreso" para fechas, horas y etiquetas.

### Paleta de Colores (Radical)

Abandonamos los grises medios. Vamos a extremos.

- **Fondo Principal (Void):** `#050505` (Negro profundo, no gris).
- **Texto Principal (Paper):** `#F2F2F2` (Blanco tiza, no quemado).
- **Acento Primario (Acid Lime):** `#D9F528` (Energía pura, para botones primarios y focos).
- **Acento Secundario (Digital Violet):** `#5E17EB` (Profundidad, para gradientes o estados activos).
- **Superficies (Cards):** `#111111` (Ligeramente elevado del fondo).
- **Bordes:** `#333333` (Sutiles pero presentes).

### Estrategia de Interacción (Física)

- **Botones:** No solo cambian de color. Se desplazan, "clic-ean" visualmente (scale down).
- **Transiciones:** `framer-motion` para todo. Las páginas no cargan de golpe; los elementos entran en cascada (staggered delay).
- **Cursor:** Invertido o con rastro sutil (opcional, pero recomendado).

---

## 3. HOJA DE RUTA DE IMPLEMENTACIÓN

### FASE 1: LOS CIMIENTOS (Inmediata)

- [x] **Limpieza de CSS:** Reemplazar variables en `globals.css` con la nueva paleta `Acid` y `Void`.
- [x] **Tipografía Global:** Forzar `Syne` para todos los `h1`, `h2`, `h3` y `Manrope` para `p`, `span`, `div`.
- [x] **Reset de Bordes:** Eliminar los `rounded-xl` genéricos. Pasar a una estrategia mixta: `rounded-none` o `rounded-3xl` (Contrastes extremos).

### FASE 2: COMPONENTES ATÓMICOS (UI Kit)

- [x] **Reconstruir Botones (`Button.tsx`):**
  - Estilo "Solid": Fondo `#D9F528`, Texto Negro, Hover: Elevación + Sombra dura.
  - Estilo "Outcome": Borde `#333333`, Hover: Fondo Blanco, Texto Negro.
- [x] **Reconstruir Inputs (`Input.tsx`):**
  - Fondo `#111111`, Borde inferior visible (estilo línea) o recuadro minimalista sin bordes redondeados.
  - Focus: Ring `#D9F528` brillante.

### FASE 3: ESTRUCTURA Y LAYOUT

- [x] **Sidebar:** Dejar de ser un bloque gris. Convertirla en un panel de cristal oscuro (backdrop-blur) o una columna sólida negra con tipografía `Manrope` en mayúsculas.
- [x] **Grid Visible:** Añadir un fondo sutil de grilla o puntos para dar sensación técnica.

### FASE 4: EL ALMA (Animación)

- [x] **Page Transitions:** Implementar `AnimatePresence` en el layout principal.
- [x] **Micro-interacciones:** Añadir `whileHover={{ scale: 1.02 }}` y `whileTap={{ scale: 0.95 }}` a todos los elementos interactivos.

---

**Instrucción al Desarrollador:**
No pidas permiso para ser audaz. Si dudas, hazlo más grande, más brillante o más oscuro. El objetivo es impacto.
