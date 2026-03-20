# Reporte de Auditoría de squirrelscan

**URL:** http://localhost:3000  
**Fecha:** 2026-03-16T15:12:57.368Z  
**Páginas:** 1  
**Versión:** 0.0.38

## Puntuación de Salud

| Categoría | Puntuación |
|----------|-------|
| **Global** | **30/100 (F)** |
| Rendimiento | 73/100 |
| Accesibilidad | 89/100 |
| Seguridad | 57/100 |
| Rastreabilidad | 63/100 |
| SEO Principal | 80/100 |
| E-E-A-T | 53/100 |
| Enlaces | 88/100 |
| Cumplimiento Legal | 44/100 |
| Contenido | 89/100 |
| Internacionalización | 100/100 |
| Imágenes | 100/100 |
| Móvil | 100/100 |
| Estructura de URL | 100/100 |

## Resumen

- **Superadas:** 79
- **Advertencias:** 31
- **Fallidas:** 4

---

## Problemas Detectados

### Rastreabilidad

*1 error(es), 1 advertencia(s)*

#### Existencia de Sitemap **[ERROR]**

`crawl/sitemap-exists`

> Comprueba si existe un mapa del sitio XML y si está referenciado en robots.txt

**Solución:**

Los sitemaps XML ayudan a los motores de búsqueda a descubrir e indexar tus páginas. Crea un archivo sitemap.xml en la raíz de tu dominio listando todas las páginas importantes. Referéncialo en robots.txt con 'Sitemap: https://tusitio.com/sitemap.xml'. Envíalo a Google Search Console y Bing Webmaster Tools. Mantén el archivo por debajo de 50MB y 50,000 URLs; utiliza un índice de sitemaps para sitios más grandes.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| sitemap-exists | X falla | No se encontró el sitemap XML |

---

#### Robots.txt **[ERROR]**

`crawl/robots-txt`

> Comprueba si robots.txt existe y está configurado correctamente

**Solución:**

El archivo robots.txt indica a los motores de búsqueda qué páginas deben rastrear. Colócalo en la raíz de tu dominio (ejemplo.com/robots.txt). Incluye la URL de tu sitemap. Evita bloquear recursos importantes (CSS, JS, imágenes) que los motores de búsqueda necesitan para renderizar las páginas. Nunca uses 'Disallow: /' a menos que quieras bloquear todo el rastreo. Usa Google Search Console para probar tu robots.txt.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| robots-txt-exists | ! aviso | No se encontró el archivo robots.txt |

---

### SEO Principal

*0 error(s), 6 advertencia(s)*

#### Meta Descripción **[ERROR]**

`core/meta-description`

> Valida la presencia y longitud de la meta descripción

**Solución:**

Las meta descripciones deben tener entre 120-160 caracteres y proporcionar un resumen atractivo de la página. Aunque no es un factor de ranking directo, una buena descripción mejora el porcentaje de clics (CTR) desde los resultados de búsqueda. Escribe descripciones únicas para cada página que muestren con precisión el contenido. Incluye una llamada a la acción cuando sea apropiado. Si falta, los motores de búsqueda generarán fragmentos automáticos que podrían no representar tu página de forma óptima.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| meta-description | ! aviso | Descripción demasiado corta |

<details><summary><strong>meta-description:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>meta-description:</strong> 1 ítem(s)</summary>

- [Plataforma de Gestión de Asistencia y Eventos (45 chars)](http://localhost:3000/login)

</details>

---

#### URL Canónica **[WARN]**

`core/canonical`

> Valida la presencia y el formato de la URL canónica

**Solución:**

Las URLs canónicas indican a los motores de búsqueda cuál es la versión "maestra" de una página, evitando problemas de contenido duplicado. Cada página debe especificar una URL canónica, apuntando normalmente a sí misma. Añade una etiqueta <link rel="canonical" href="..."> en la sección head. Usa URLs absolutas y asegura la consistencia (con o sin barra final, www vs no-www). Para contenido paginado, apunta a la página principal o usa rel="prev/next".

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| canonical | ! aviso | Falta la URL canónica |

<details><summary><strong>canonical:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

---

#### Etiquetas Open Graph **[WARN]**

`core/og-tags`

> Valida las etiquetas meta Open Graph para compartir en redes sociales

**Solución:**

Las etiquetas Open Graph controlan cómo aparece tu contenido cuando se comparte en Facebook, LinkedIn y otras plataformas. Etiquetas requeridas: og:title, og:description, og:image, og:url y og:type. Añade etiquetas OG en el head de tu página. Usa imágenes de al menos 1200x630 píxeles para una mejor visualización. Mantén og:title por debajo de 60 caracteres y og:description por debajo de 200. Prueba cómo se comparte usando la herramienta Depurador de Compartido de Facebook.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| og-title | ! aviso | Falta og:title |
| og-description | ! aviso | Falta og:description |
| og-image | ! aviso | Falta og:image - las comparticiones sociales carecerán de imagen |

<details><summary><strong>og-title:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>og-description:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>og-image:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

---

#### Twitter Cards *[INFO]*

`core/twitter-cards`

> Valida las etiquetas meta de Twitter Card

**Solución:**

Las Twitter Cards mejoran cómo aparecen los enlaces en los tweets. La etiqueta meta twitter:card especifica el tipo de tarjeta (summary, summary_large_image, player o app). Añade etiquetas twitter:card, twitter:title, twitter:description y twitter:image. Para imágenes grandes, usa summary_large_image con imágenes de al menos 800x418 píxeles. Valida usando la herramienta Twitter Card Validator.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| twitter-card | ! aviso | No hay Twitter card ni etiquetas Open Graph para compartir en Twitter |

<details><summary><strong>twitter-card:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

---

### Seguridad

*1 error(s), 2 advertencia(s)*

#### HTTPS **[ERROR]**

`security/https`

> Comprueba el uso de HTTPS

**Solución:**

HTTPS encripta los datos entre los usuarios y tu servidor, protegiendo la información sensible. Es una señal de ranking y es requerido para muchas funciones modernas de los navegadores. Migra a HTTPS obteniendo un certificado SSL (gratuito con Let's Encrypt). Actualiza los enlaces internos para usar https://. Configura redirecciones 301 de HTTP a HTTPS. Actualiza tus URLs canónicas y el sitemap. Comprueba avisos de contenido mixto tras la migración.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| https | X falla | La página no se sirve a través de HTTPS |

<details><summary><strong>https:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

---

#### Política de Seguridad de Contenido (CSP) **[WARN]**

`security/csp`

> Comprueba la cabecera Content-Security-Policy y valida las directivas

**Solución:**

La CSP previene ataques XSS restringiendo qué recursos se pueden cargar. Comienza con una política de "solo reporte" para identificar problemas. Directivas clave: default-src 'self', script-src (evita 'unsafe-inline'), img-src, style-src, frame-ancestors. Usa nonces o hashes en lugar de 'unsafe-inline' para scripts. Prueba a fondo, ya que una CSP estricta puede romper funcionalidades.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| csp-missing | ! aviso | No hay cabecera Content-Security-Policy |

---

#### X-Frame-Options **[WARN]**

`security/x-frame-options`

> Comprueba la cabecera de protección contra clickjacking

**Solución:**

X-Frame-Options evita que tu sitio sea embebido en iframes, protegiendo contra ataques de clickjacking. Configura: X-Frame-Options: DENY (sin marcos) o SAMEORIGIN (solo el mismo origen). Para navegadores modernos, se prefiere CSP frame-ancestors: Content-Security-Policy: frame-ancestors 'self'. Usa ambos para máxima compatibilidad.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| x-frame-options | ! aviso | No hay protección contra clickjacking |

---

### Enlaces

*0 error(s), 2 advertencia(s)*

#### Enlaces Internos **[WARN]**

`links/internal-links`

> Valida el recuento de enlaces internos

**Solución:**

Los enlaces internos ayudan a los usuarios a navegar por tu sitio y distribuyen la autoridad de las páginas. Cada página debería tener al menos un enlace interno apuntando hacia ella (sin contar la navegación). Añade enlaces internos contextuales desde contenido relacionado. Usa textos de anclaje descriptivos que indiquen de qué trata la página enlazada. Evita las páginas huérfanas (sin enlaces internos) y asegúrate de que las páginas importantes reciban más enlaces. Revisa la estructura de tu sitio para crear clusters de contenido lógicos.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| internal-links | ! aviso | Muy pocos enlaces internos (0, mínimo 1) |

<details><summary><strong>internal-links:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>internal-links:</strong> 1 ítem(s)</summary>

- [Muy pocos enlaces internos (0, mínimo 1)](http://localhost:3000/login)

</details>

---

#### Páginas sin Salida **[WARN]**

`links/dead-end-pages`

> Páginas sin enlaces internos salientes, atrapando potencialmente a los usuarios

**Solución:**

Añade enlaces de navegación o enlaces a contenido relacionado para ayudar a los usuarios a continuar navegando. Los enlaces internos mejoran la experiencia de usuario y ayudan a los motores de búsqueda a descubrir contenido.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| dead-end | ! aviso | La página no tiene enlaces internos salientes (callejón sin salida) |

<details><summary><strong>dead-end:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

---

### Contenido

*0 error(s), 1 advertencia(s)*

#### Recuento de Palabras **[WARN]**

`content/word-count`

> Comprueba la longitud del contenido para detectar problemas de contenido escaso

**Solución:**

Las páginas con contenido escaso (menos de 300 palabras) a menudo tienen dificultades para posicionarse y son desindexadas activamente por Google desde la actualización del núcleo de junio de 2025. Añade más contenido valioso y relevante a las páginasÔÇöapunta a al menos 500 palabras para páginas estándar y más de 1000 para artículos detallados. Si una página no puede ampliarse, utiliza noindex voluntariamente o consolídala en un recurso más completo. Recortar páginas de bajo contenido de tu índice es mejor que dejarlo para que Google te penalice.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| word-count | ! aviso | Contenido escaso: 38 palabras (mínimo 300) |

<details><summary><strong>word-count:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>word-count:</strong> 1 ítem(s)</summary>

- [Contenido escaso: 38 palabras (mínimo 300)](http://localhost:3000/login)

</details>

---

### Rendimiento

*1 error(s), 9 advertencia(s)*

#### Tamaño de Archivo JavaScript Demasiado Grande **[ERROR]**

`perf/js-file-size`

> Comprueba archivos JavaScript que exceden los límites de tamaño recomendados

**Solución:**

Los archivos JavaScript grandes bloquean el hilo principal y retrasan la interactividad. Divide los paquetes de código en fragmentos menores (code-split), elimina exportaciones no utilizadas (tree-shake), carga perezosamente scripts no críticos y difiere o carga de forma asíncrona los scripts de terceros. Usa importaciones dinámicas para la división basada en rutas.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| js-file-size | X falla | 1 archivo(s) JS exceden 1.0 MB |
| js-file-size-warn | ! aviso | 2 archivo(s) JS exceden 250.0 KB |

<details><summary><strong>js-file-size:</strong> 1 ítem(s)</summary>

- [http://localhost:3000/_next/static/chunks/d6d01_next_dist_compiled_react-dom_f1fb408c._.js](http://localhost:3000/_next/static/chunks/d6d01_next_dist_compiled_react-dom_f1fb408c._.js)
  - de: [/login](http://localhost:3000/login)

</details>

<details><summary><strong>js-file-size-warn:</strong> 2 ítem(s)</summary>

- [http://localhost:3000/_next/static/chunks/d6d01_next_dist_compiled_next-devtools_index_5a59b1b0.js](http://localhost:3000/_next/static/chunks/d6d01_next_dist_compiled_next-devtools_index_5a59b1b0.js)
  - de: [/login](http://localhost:3000/login)
- [http://localhost:3000/_next/static/chunks/d6d01_next_dist_client_0dac9414._.js](http://localhost:3000/_next/static/chunks/d6d01_next_dist_client_0dac9414._.js)
  - de: [/login](http://localhost:3000/login)

</details>

---

#### Tamaño de Archivo CSS Demasiado Grande **[ERROR]**

`perf/css-file-size`

> Comprueba archivos CSS que exceden los límites de tamaño recomendados

**Solución:**

Los archivos CSS grandes ralentizan el renderizado y aumentan el ancho de banda. Divide las hojas de estilo grandes en fragmentos menores, elimina selectores no utilizados y minifica el CSS. Considera el inlining de CSS crítico para los estilos superiores (above-the-fold) y la carga perezosa para el CSS no crítico.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| css-file-size-warn | ! aviso | 1 archivo(s) CSS exceden 150.0 KB |

<details><summary><strong>css-file-size-warn:</strong> 1 ítem(s)</summary>

- [http://localhost:3000/_next/static/chunks/%5Broot-of-the-server%5D__70d35c34._.css](http://localhost:3000/_next/static/chunks/%5Broot-of-the-server%5D__70d35c34._.css)
  - de: [/login](http://localhost:3000/login)

</details>

---

#### Peso Total de la Página **[WARN]**

`perf/total-byte-weight`

> Comprueba el peso total en bytes de la página

**Solución:**

Reduce el peso total de la página para cargas más rápidas en conexiones lentas. Optimiza las imágenes (usa formatos modernos, comprime, sirve tamaños apropiados). Minifica y comprime CSS/JS. Elimina código no utilizado mediante tree-shaking. Carga de forma perezosa recursos no críticos. Apunta a menos de 1.6MB para usuarios móviles.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| total-byte-weight | ! aviso | Total de recursos rastreados: 3381KB (página pesada) |

---

#### Cadenas de Solicitudes Críticas **[WARN]**

`perf/critical-request-chains`

> Identifica cadenas de recursos dependientes que retrasan el renderizado

**Solución:**

Las cadenas de solicitudes críticas son secuencias de peticiones de red dependientes que deben completarse antes de que la página pueda renderizarse. Reduce la profundidad de la cadena: 1) Poniendo en línea (inline) el CSS crítico en lugar de enlazar archivos externos. 2) Añadiendo async o defer a scripts no críticos. 3) Evitando @import de CSS ÔÇö usa etiquetas <link> en su lugar. 4) Usando <link rel='preload'> para recursos críticos. 5) Reduciendo el número de recursos que bloquean el renderizado en el <head>.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| critical-request-chains | ! aviso | Se encontraron 2 cadena(s) de solicitudes críticas |

<details><summary><strong>critical-request-chains:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>critical-request-chains:</strong> 2 ítem(s)</summary>

- CSS: /_next/static/chunks/%5Broot-of-the-server%5D__70d35c34._.css
- JS: /_next/static/chunks/d6d01_next_dist_build_polyfills_polyfill-nomodule.js

</details>

---

#### JavaScript Duplicado **[WARN]**

`perf/duplicate-js`

> Detecta librerías JavaScript duplicadas cargadas varias veces

**Solución:**

Elimina las cargas de librerías JavaScript duplicadas para reducir el peso de la página y evitar conflictos. Comprueba si la misma librería se carga desde diferentes CDNs o versiones. Usa una única fuente para cada dependencia. Considera usar un empaquetador de módulos (bundler) para aplicar deduplicación en dependencias compartidas.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| duplicate-js-same-version | ! aviso | 3 librería(s) cargadas múltiples veces |

<details><summary><strong>duplicate-js-same-version:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>duplicate-js-same-version:</strong> 3 ítem(s)</summary>

- d6d01 (9x)
- src (5x)
- node (2x)

</details>

---

#### JavaScript sin Minificar **[WARN]**

`perf/unminified-js`

> Detecta JavaScript sin minificar que podría ser optimizado

**Solución:**

Minifica el JavaScript para reducir el tamaño del archivo y mejorar los tiempos de carga. Usa herramientas de construcción como Terser, esbuild o UglifyJS. La mayoría de los empaquetadores (Webpack, Vite, Rollup) minifican automáticamente en producción. La minificación acorta los nombres de variables, elimina espacios en blanco y código muerto.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| unminified-js | ! aviso | 9 archivo(s) JavaScript parecen estar sin minificar |

<details><summary><strong>unminified-js:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>unminified-js:</strong> 5 ítem(s)</summary>

- 1025.2KB, ahorro aproximado de 259.9KB
- 166.8KB, ahorro aproximado de 53.0KB
- 797.0KB, ahorro aproximado de 722.7KB
- 144.7KB, ahorro aproximado de 60.3KB
- 646.5KB, ahorro aproximado de 295.9KB

</details>

---

#### HTTP/2 *[INFO]*

`perf/http2`

> Comprueba el soporte del protocolo HTTP/2

**Solución:**

HTTP/2 permite la multiplexación, la compresión de cabeceras y el push del servidor para cargas de página más rápidas. La mayoría de los servidores web modernos y CDNs soportan HTTP/2 de forma nativa. Requiere HTTPS. Consulta la documentación de tu servidor/CDN para habilitarlo. HTTP/3 (QUIC) proporciona un rendimiento aún mejor.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| http2-https-required | ! aviso | HTTP/2 requiere HTTPS |

<details><summary><strong>http2-https-required:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>http2-https-required:</strong> 1 ítem(s)</summary>

- [HTTP/2 requiere HTTPS](http://localhost:3000/login)

</details>

---

#### Mapas de Fuente (Source Maps) *[INFO]*

`perf/source-maps`

> Comprueba la disponibilidad y configuración de los mapas de fuente

**Solución:**

Los mapas de fuente ayudan a depurar el código minificado pero pueden exponer el código fuente si son accesibles públicamente. Para producción: 1) Elimina los mapas de fuente por completo, 2) Restringe el acceso mediante la configuración del servidor, o 3) Usa mapas de fuente 'ocultos' subidos solo a servicios de seguimiento de errores. Los mapas de fuente expuestos pueden revelar la lógica de negocio e implementaciones de seguridad a los atacantes.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| source-maps-exposed | ! aviso | 188 potencial(es) mapa(s) de fuente detectado(s) |
| source-maps-inline | ! aviso | 1 mapa(s) de fuente en línea (inline) detectado(s) |

<details><summary><strong>source-maps-exposed:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>source-maps-exposed:</strong> 10 ítem(s)</summary>

- [desde /_next/static/chunks/d6d01_next_dist_compiled_react-dom_f1fb408c._.js](http://localhost:3000/_next/static/chunks/d6d01_next_dist_compiled_react-dom_f1fb408c._.js.map)
- [desde /_next/static/chunks/d6d01_next_dist_compiled_react-server-dom-turbopack_72500c45._.js](http://localhost:3000/_next/static/chunks/%22)
- [desde /_next/static/chunks/d6d01_next_dist_compiled_react-server-dom-turbopack_72500c45._.js](http://localhost:3000/_next/static/chunks/d6d01_next_dist_compiled_react-server-dom-turbopack_72500c45._.js.map)
- [desde /_next/static/chunks/d6d01_next_dist_0990a211._.js](http://localhost:3000/_next/static/chunks/index.js.map)
- [desde /_next/static/chunks/d6d01_next_dist_compiled_next-devtools_index_5a59b1b0.js](http://localhost:3000/_next/static/chunks/d6d01_next_dist_compiled_next-devtools_index_5a59b1b0.js.map)
- [desde /_next/static/chunks/d6d01_next_dist_compiled_8f78db6f._.js](http://localhost:3000/_next/static/chunks/helpers.js.map)
- [desde /_next/static/chunks/d6d01_next_dist_compiled_8f78db6f._.js](http://localhost:3000/_next/static/chunks/runtime.js.map)
- [desde /_next/static/chunks/d6d01_next_dist_compiled_8f78db6f._.js](http://localhost:3000/_next/static/chunks/d6d01_next_dist_compiled_8f78db6f._.js.map)
- [desde /_next/static/chunks/d6d01_next_dist_client_0dac9414._.js](http://localhost:3000/_next/static/chunks/asset-prefix.js.map)
- [desde /_next/static/chunks/d6d01_next_dist_client_0dac9414._.js](http://localhost:3000/_next/static/chunks/set-attributes-from-props.js.map)

</details>

<details><summary><strong>source-maps-inline:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>source-maps-inline:</strong> 1 ítem(s)</summary>

- [/_next/static/chunks/turbopack-_66236d78._.js](/_next/static/chunks/turbopack-_66236d78._.js)

</details>

---

### Accesibilidad

*1 error(s), 4 advertencia(s)*

#### Etiquetas de Formulario (Labels) **[ERROR]**

`a11y/form-labels`

> Comprueba que las entradas de formulario tienen etiquetas asociadas

**Solución:**

Cada entrada de formulario necesita una etiqueta accesible para los lectores de pantalla. Opciones: 1) Usa <label for='inputId'>Etiqueta</label> con el ID correspondiente. 2) Envuelve la entrada dentro de <label>Etiqueta <input></label>. 3) Usa aria-label o aria-labelledby para entradas donde las etiquetas visibles no sean factibles. Los marcadores de posición (placeholders) no son sustitutos suficientes para las etiquetas. Las entradas ocultas, botones de envío y botones de imagen no necesitan etiquetas.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| form-labels | X falla | 1 entrada(s) de formulario sin etiquetas |

<details><summary><strong>form-labels:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>form-labels:</strong> 1 ítem(s)</summary>

- shortId

</details>

---

#### Contraste de Color **[WARN]**

`a11y/color-contrast`

> Comprueba problemas de contraste de color en estilos y clases

**Solución:**

El texto debe tener suficiente contraste con su fondo para la legibilidad. La WCAG AA requiere 4.5:1 para texto normal y 3:1 para texto grande (18px+ o 14px+ negrita). Usa herramientas como WebAIM Contrast Checker para verificar. Problemas comunes: texto gris claro, texto sobre imágenes sin superposición. No confíes solo en el color para transmitir informaciónÔÇöañade iconos o etiquetas de texto.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| color-contrast | ! aviso | 4 posible(s) problema(s) de contraste de color |

<details><summary><strong>color-contrast:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

<details><summary><strong>color-contrast:</strong> 4 ítem(s)</summary>

- span con clase "text-xs text-slate-400..." puede tener bajo contraste
- p con clase "text-sm text-muted-foreground ..." puede tener bajo contraste
- Texto blanco (verificar fondo): 1 instancia(s)
- Color de texto muy claro: 1 instancia(s)

</details>

---

#### Un Landmark Principal **[WARN]**

`a11y/landmark-one-main`

> Comprueba que la página tiene exactamente un landmark principal

**Solución:**

Cada página debe tener exactamente un elemento <main> o elemento con role='main'. Esto ayuda a los usuarios de lectores de pantalla a navegar rápidamente al contenido principal. Múltiples landmarks principales confunden la navegación. Usa <aside>, <nav> u otros landmarks para contenido secundario.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| landmark-one-main | ! aviso | La página no tiene landmark principal |

<details><summary><strong>landmark-one-main:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

---

#### Enlace de Salto (Skip Link) **[WARN]**

`a11y/skip-link`

> Comprueba mecanismos de salto para la navegación por teclado

**Solución:**

Los enlaces de salto permiten a los usuarios de teclado saltar la navegación repetitiva e ir directamente al contenido principal. Añade un enlace oculto al principio de tu página: <a href='#main-content' class='skip-link'>Saltar al contenido principal</a>. Estilízalo para que sea visible al recibir el foco. Asegúrate de que el objetivo (#main-content) tenga tabindex='-1' si no es enfocable por naturaleza. Alternativa: usa roles de landmark como <main> a los que los lectores de pantalla pueden navegar directamente.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| skip-link | ! aviso | Sin mecanismo de salto para contenido repetitivo |

<details><summary><strong>skip-link:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

---

#### Regiones de Landmark *[INFO]*

`a11y/landmark-regions`

> Comprueba las regiones de landmark adecuadas (main, nav, footer)

**Solución:**

Las regiones de landmark ayudan a los usuarios de lectores de pantalla a navegar por la estructura de la página. Usa elementos semánticos HTML5: <main> para el contenido principal, <nav> para la navegación, <header> para la cabecera de la página, <footer> para el pie de página, <aside> para las barras laterales, y <section>/<article> para las secciones de contenido. Alternativamente, usa roles ARIA: role='main', role='navigation', etc. Cada página debe tener exactamente un elemento <main>.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| landmark-main | ! aviso | No se encontró el landmark <main> |

<details><summary><strong>landmark-main:</strong> 1 página(s) afectada(s)</summary>

- [/login](http://localhost:3000/login)

</details>

---

### E-E-A-T

*0 error(s), 5 advertencia(s)*

#### Página "Acerca de" **[WARN]**

`eeat/about-page`

> Comprueba la existencia de una página "acerca de / empresa" con contenido

**Solución:**

Una página "Acerca de" establece credibilidad y confianza. Incluye la historia de la empresa, misión, descripción del equipo y credenciales. Enlázala desde la navegación principal o el pie de página. Para E-E-A-T, explica tu experiencia y por qué los visitantes deberían confiar en ti. Incluye información de contacto y ubicación física si aplica.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| about-page | ! aviso | No se encontró la página "Acerca de" |

---

#### Autoría del Contenido (Bylines) **[WARN]**

`eeat/author-byline`

> Comprueba nombres de autor visibles en las páginas de contenido

**Solución:**

La autoría demuestra experiencia y responsabilidad. Muestra los nombres de los autores de forma destacada en artículos, publicaciones de blog y contenido experto. Incluye las credenciales del autor cuando sea relevante. Enlaza los nombres de los autores a sus páginas de biografía. Para contenidos YMYL (salud, finanzas), la transparencia del autor es especialmente importante para la evaluación E-E-A-T de Google.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| author-byline | ! aviso | Ninguna página de contenido tiene atribución de autor |

---

#### Página de Contacto **[WARN]**

`eeat/contact-page`

> Comprueba la página de contacto con múltiples métodos de contacto

**Solución:**

Una página de contacto con múltiples métodos genera confianza. Incluye: dirección de correo electrónico o formulario de contacto, número de teléfono (si aplica), dirección física y enlaces a redes sociales. Haz que la información de contacto sea fácil de encontrar desde cualquier página. Para negocios locales, incluye el horario de atención. Indicar las expectativas de tiempo de respuesta también es útil.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| contact-page | ! aviso | No se encontró la página de contacto |

---

#### Política de Privacidad **[WARN]**

`eeat/privacy-policy`

> Comprueba la página de política de privacidad enlazada desde el pie de página

**Solución:**

La política de privacidad es obligatoria por ley en muchas jurisdicciones (RGPD, CCPA) y es una señal de confiabilidad. Enlázala desde tu pie de página en cada página. Debe cubrir: qué datos recopilas, cómo los usas, intercambio con terceros, derechos del usuario y contacto para dudas sobre privacidad. Manténla actualizada cuando cambien las prácticas.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| privacy-policy | ! aviso | No se encontró la página de Política de Privacidad |

---

#### Fechas del Contenido **[WARN]**

`eeat/content-dates`

> Comprueba fechas de publicación y modificación en el contenido

**Solución:**

Las fechas visibles muestran la frescura del contenido y ayudan a los usuarios a evaluar su relevancia. Incluye datePublished y dateModified en el esquema de Artículo. Muestra las fechas de forma legible en las páginas. Actualiza dateModified al realizar cambios significativos. El contenido fresco indica mantenimiento continuo y experiencia. Las fechas obsoletas pueden perjudicar el posicionamiento en temas sensibles al tiempo.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| date-published | ! aviso | Ninguna página de contenido tiene datePublished |

---

### Cumplimiento Legal

*0 error(s), 1 advertencia(s)*

#### Política de Privacidad **[WARN]**

`legal/privacy-policy`

> Comprueba la presencia del enlace a la política de privacidad

**Solución:**

La política de privacidad es obligatoria por ley en muchas jurisdicciones (RGPD, CCPA). Enlaza a tu política de privacidad desde cada página, normalmente en el pie de página. La política debe explicar qué datos recopilas, cómo se usan y los derechos de los usuarios. Considera usar el marcado de schema.org para identificar la página de la política.

| Comprobación | Estado | Mensaje |
|-------|--------|---------|
| privacy-policy | ! aviso | No se encontró el enlace a la política de privacidad en el sitio |

---

---

*Generado por [squirrelscan](https://squirrelscan.com) v0.0.38*
