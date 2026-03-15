---
goal: 'Implementación de bloques modulares avanzados para la sección Hero'
version: 1.0
date_created: 2026-03-15
last_updated: 2026-03-15
owner: Antigravity
status: 'Completed'
tags: ['feature', 'design', 'hero', 'landing']
---

# Introducción

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

Este plan detalla la implementación de mejoras significativas en el bloque **Hero** de la landing page modular. El objetivo es proporcionar a los administradores herramientas de personalización profunda que permitan adaptar la primera impresión del evento a su identidad de marca, sin importar la plantilla seleccionada, y añadiendo funcionalidades específicas para los diseños "Centrado" y "Dividido".

## 1. Requirements & Constraints

### Globales (Cualquier Plantilla)
- **REQ-HERO-001**: Soporte para logotipos (URLs) posicionados sobre el título principal. La selección debe realizarse a partir de los logos ya configurados en las constancias de la conferencia.
- **REQ-HERO-011**: Restricción de formato: No se permitirá la carga ni selección de archivos en formato SVG para los logotipos del Hero.
- **REQ-HERO-002**: Selección de tipografía independiente para título principal y secundario.
- **REQ-HERO-003**: Selección de color hexadecimal para título principal y secundario.
- **REQ-HERO-004**: Personalización de fondo para la sección de títulos (Color sólido, Degradado o Imagen vía URL).

### Específicos: Plantilla Centrada (Default)
- **REQ-HERO-005**: Gestión dinámica de botones (Añadir/Quitar). Por defecto: 1 botón.
- **REQ-HERO-006**: Personalización de color, texto y URL de cada botón individualmente.

### Específicos: Plantilla Dividida (Split)
- **REQ-HERO-007**: Eliminación del formulario de inicio de sesión integrado por defecto.
- **REQ-HERO-008**: Personalización de la sección derecha (donde estaba el formulario) con color, degradado o imagen.
- **REQ-HERO-009**: Opción de alineación de contenido (Títulos a la izquierda o derecha). Por defecto: Izquierda.

### Plantilla Minimalista
- **REQ-HERO-010**: No requiere ajustes adicionales en esta fase.

### Directrices de Diseño & Responsividad
- **GUD-HERO-001**: Estilos responsivos automáticos. El tamaño de la fuente y los espaciados deben estar predefinidos (hardcoded) para una visualización óptima en móviles y tabletas. No se deben incluir controles de "Tamaño de fuente" en el editor para mantener la consistencia del diseño.

## 2. Implementation Steps

### Phase 1: Data Model & Type Definitions
- GOAL-001: Actualizar los tipos de TypeScript y las constantes por defecto para soportar las nuevas propiedades.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Actualizar la interfaz de contenido de Hero en `src/types/index.ts`. | ✅ | 2026-03-15 |
| TASK-002 | Definir `BLOCK_DEFAULTS.hero` con la nueva estructura en `src/constants/landing.ts`. | ✅ | 2026-03-15 |

### Phase 2: Component Logic & Rendering
- GOAL-002: Refactorizar `HeroBlock.tsx` para renderizar dinámicamente según la nueva configuración.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-003 | Implementar lógica de renderizado de logotipos superiores. | ✅ | 2026-03-15 |
| TASK-004 | Aplicar estilos dinámicos de tipografía y color a los títulos, con lógica responsiva predefinida (sin controles manuales). | ✅ | 2026-03-15 |
| TASK-005 | Implementar el sistema de fondo dinámico (color/degradado/imagen) para el contenedor principal. | ✅ | 2026-03-15 |
| TASK-006 | Refactorizar variante `centered` para soportar array de botones dinámicos. | ✅ | 2026-03-15 |
| TASK-007 | Refactorizar variante `split` para sustituir el formulario por el nuevo bloque de contenido/fondo y añadir soporte de alineación lateral. | ✅ | 2026-03-15 |

### Phase 3: Administrative Editor UI
- GOAL-003: Expandir el `LandingEditorSidebar.tsx` para incluir los nuevos controles de personalización.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-008 | Crear sección de controles globales (Logos, Fonts, Colors, Background). | ✅ | 2026-03-15 |
| TASK-009 | Crear controles específicos para la variante `centered` (Gestión de botones). | ✅ | 2026-03-15 |
| TASK-010 | Crear controles específicos para la variante `split` (Fondo del "feature area" y Alineación). | ✅ | 2026-03-15 |

### Phase 4: Validation & Visual Polish
- GOAL-004: Asegurar que la experiencia de usuario y el diseño sean premium y coherentes.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-011 | Verificar responsividad de las nuevas configuraciones (especialmente en Split y múltiples botones). | ✅ | 2026-03-15 |
| TASK-012 | Añadir transiciones suaves (framer-motion) al cambiar configuraciones en el editor. | ✅ | 2026-03-15 |

## 3. Alternatives

- **ALT-001**: Usar una biblioteca de fuentes externa dinámica (Google Fonts Loader). *Decisión*: Se mantendrán las fuentes del sistema definidas en el proyecto para asegurar rendimiento y coherencia con `global_styles`.
- **ALT-002**: Mantener una estructura de contenido rígida. *Decisión*: Se opta por una estructura flexible para permitir futuras expansiones sin romper la base de datos.

## 4. Dependencies

- **DEP-001**: `lucide-react` para nuevos iconos en el editor.
- **DEP-002**: `framer-motion` para animaciones de entrada y transiciones.
- **DEP-003**: `shadcn/ui` (Input, Button, Select) para la interfaz del editor.

## 5. Files

- **FILE-001**: `src/types/index.ts` (Modelado de datos)
- **FILE-002**: `src/constants/landing.ts` (Configuración por defecto)
- **FILE-003**: `src/components/landing/blocks/HeroBlock.tsx` (Componente visual)
- **FILE-004**: `src/components/admin/LandingEditorSidebar.tsx` (Interfaz de usuario del editor)

## 6. Testing

- **TEST-001**: Verificar que el cambio de color en el editor se refleja instantáneamente en el preview.
- **TEST-002**: Probar la carga de imágenes vía URL tanto para el Hero como para el fondo del Split.
- **TEST-003**: Validar que el bloque Minimalista sigue funcionando sin regresiones.

## 7. Risks & Assumptions

- **RISK-001**: URLs de imágenes externas rotas o de carga lenta. Se recomienda añadir un "placeholder" o estado de carga.
- **ASSUMPTION-001**: Los administradores tienen acceso a las URLs de los logos e imágenes que desean utilizar.

## 8. Technical Considerations (Breakdown)

### System Architecture Overview

```mermaid
graph TD
    subgraph Frontend Layout
        Editor[LandingEditorSidebar] -->|Update State| ConfigStore[Landing Config Context]
        ConfigStore -->|Inject Data| HeroBlock[HeroBlock Component]
    end

    subgraph Component Logic
        HeroBlock -->|Variant Centered| RenderButtons[Render Dynamic Buttons]
        HeroBlock -->|Variant Split| RenderFeatureArea[Render Custom Side Area]
        HeroBlock -->|Global| RenderStyles[Apply Dynamic Typography & Colors]
    end

    subgraph Data
        ConfigStore -->|Save| API[/api/conference/landing]
        API --> DB[(Supabase JSONB)]
    end
```

### Component Hierarchy Documentation (HeroBlock)

```
HeroBlock (Section)
├── BackgroundLayer (div with dynamic style)
├── ContentContainer (div)
│   ├── LogosSection (flex-wrap for logos)
│   ├── HeadlinesSection (h1, p with dynamic fonts/colors)
│   └── ActionsSection (Conditional)
│       ├── CenteredButtons (Mapping array)
│       └── SplitLayout (Grid lg:cols-2)
│           ├── TextPanel (Order dependent on alignment)
│           └── FeaturePanel (Custom background image/color)
```
