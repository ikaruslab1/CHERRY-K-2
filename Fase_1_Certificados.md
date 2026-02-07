# Plan de Desarrollo: Fase 1 - Constancias Personalizadas (MVP)

Este documento detalla el plan de implementación para el sistema de constancias personalizadas, enfocado en una arquitectura híbrida que permite tanto el uso de plantillas predefinidas como la carga de diseños de fondo completamente personalizados ("Full Background").

El objetivo es permitir que cada evento defina su propia identidad visual para las constancias, manteniendo la generación dinámica de datos (nombres, roles, fechas).

---

## 1. Arquitectura de Datos (Supabase)

Aprovecharemos la flexibilidad de PostgreSQL para almacenar la configuración visual directamente en el registro del evento sin crear tablas adicionales complejas por ahora.

### 1.1. Modificación de Base de Datos

Se agregará una columna de tipo `JSONB` a la tabla `events`.

- **Tabla**: `events`
- **Nueva Columna**: `certificate_config` (JSONB, nullable)
- **Default**: `null` (Si es null, se usa el diseño por defecto actual).

### 1.2. Estructura del Objeto JSON (`certificate_config`)

```json
{
  "mode": "custom_background", // o 'template_v1'
  "background_url": "https://...",
  "styles": {
    "text_color": "#000000",
    "accent_color": "#dbf227",
    "font_family": "sans", // 'sans', 'serif', 'mono'
    "text_alignment": "center", // 'left', 'center', 'right'
    "content_vertical_position": "50%" // Porcentaje desde arriba (top)
  },
  "texts": {
    "attendee": "Por su asistencia a...",
    "speaker": "Por impartir la conferencia...",
    "staff": "Por su apoyo en la logística...",
    "organizer": "Por su liderazgo en la organización..."
  },
  "signers": [
    {
      "name": "Dra. Nombre Apellido",
      "role": "Directora",
      "signature_url": "https://..." // Opcional
    }
  ],
  "show_qr": true,
  "qr_position": "bottom-right" // 'bottom-left', 'bottom-right'
}
```

---

## 2. Gestión de Archivos (Storage)

Se requiere un lugar para almacenar las imágenes de fondo de alta resolución que subirán los administradores.

- **Bucket**: Usar el bucket existente `events` o crear uno nuevo `certificates`.
- **Estructura de Carpetas**: `certificates/{event_id}/background_{timestamp}.jpg`
- **Políticas (RLS)**:
  - _Lectura_: Pública (para que se vean en la constancia).
  - _Escritura_: Solo usuarios autenticados con rol `admin` u `owner`.

---

## 3. Desarrollo Frontend - Componentes y Lógica

Se reutilizará la lógica de generación DOM existente (`CertificateContent.tsx`), haciéndola configurable mediante props.

### 3.1. Panel de Diseño (Admin View)

Ubicación: Dentro de la edición de evento (`/admin/events/[id]`).
Nuevo Componente: `CertificateDesigner.tsx`

**Funcionalidades:**

1.  **Selector de Modo**: "Diseño Estándar" vs "Fondo Personalizado".
2.  **Uploader de Fondo**: Área para arrastrar y soltar la imagen base (Recomendación: JPG/PNG, 300dpi, formato carta).
3.  **Controles de Estilo**:
    - **Color Pickers**: Para texto principal y acentos.
    - **Sliders**: Para ajustar la posición vertical del bloque de texto (Padding Top).
    - **Alineación**: Botones para izquierda/centro/derecha.
4.  **Editor de Textos**: Inputs para personalizar la frase de agradecimiento por cada rol (Asistente, Staff, etc.).
5.  **Previsualización en Vivo**: Renderizar `CertificateContent` con datos "dummy" para ver los cambios en tiempo real.

### 3.2. Renderizador Dinámico (Public View)

Actualización del componente: `CertificateContent.tsx`

**Cambios:**

1.  Leer la prop `certificate_config`.
2.  **Fondo**: Si existe `background_url`, renderizarla como imagen absoluta cubriendo el 100% (`object-fit: cover`) detrás del contenido.
3.  **Posicionamiento**: Usar las coordenadas configuradas para mover el contenedor de texto (`div.content-wrapper`).
    - Ejemplo: `style={{ marginTop: config.styles.content_vertical_position }}`.
4.  **Textos Variables**:
    - En lugar de la lógica _hardcoded_ actual, buscar el texto en `config.texts[userRole]`.
    - Fallback a los textos por defecto si no hay configuración.

---

## 4. Implementación Paso a Paso

### Fase 1.1: Backend y Tipos (Día 1)

1.  Ejecutar migración SQL para agregar columna JSONB.
2.  Definir interfaces TypeScript para `CertificateConfig`.
3.  Actualizar funciones de fetch en `useEvents` o `api` para traer este nuevo campo.

### Fase 1.2: Componente de Visualización (Día 2)

1.  Refactorizar `CertificateContent.tsx`.
2.  Crear lógica de estilos condicionales (si hay fondo custom vs diseño default).
3.  Probar con datos _hardcoded_ para asegurar que el diseño flexible funciona.

### Fase 1.3: Editor "No-Code" (Día 3-4)

1.  Construir `CertificateDesigner.tsx`.
2.  Integrar subida de imágenes a Supabase Storage.
3.  Conectar el guardado de la configuración al `updateEvent`.
4.  Unificar la vista de edición con la previsualización.

### Fase 1.4: Integración final y Pulido (Día 5)

1.  Validar visualización en diferentes dispositivos.
2.  Asegurar que la impresión (PDF) respeta los fondos e imágenes de alta resolución (CSS `@media print`).
3.  Verificar que los roles (Staff/Speaker) ven sus textos correctos.

---

## 5. Consideraciones Técnicas y Limitaciones

- **Impresión Web**: Dependemos del navegador para la generación del PDF. Es crucial usar unidades absolutas (mm, pt) o relativas al viewport consistentes para asegurar que la "hoja carta" se respete.
- **Resolución**: Advertir al usuario que suba imágenes de al menos 2000px de ancho para evitar pixelado al imprimir.
- **Contraste**: Responsabilidad del usuario asegurar que el color de texto elegido contraste con su imagen de fondo.

## 6. Ventajas de esta aproximación (Fase 1)

- **No rompe lo actual**: Los eventos pasados siguen usando el diseño default (al ser `config = null`).
- **Despliegue Rápido**: No requiere librerías gráficas pesadas.
- **Flexibilidad Suficiente**: Cubre la necesidad de "marcar" el evento visualmente sin desarrollar un editor gráfico complejo.
