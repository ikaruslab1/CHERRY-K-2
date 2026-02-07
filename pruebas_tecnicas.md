# Pruebas Técnicas: Validación de Funcionalidades PWA (Planes A y E)

Este documento detalla pruebas técnicas específicas para verificar la correcta implementación del plan PWA (Planes A, B, C, D, E) en dispositivos Android e iOS.
Por favor, asegúrese de tener la última versión desplegada. Si está probando localmente, use `npm run build && npm start` o similar para modo producción si es posible, o al menos `npm run dev` en un entorno accesible por red (host: 0.0.0.0 o similar para ver desde el móvil).

**Objetivo**: Validar A2HS (Instalación), Modo Offline, Caché y Sincronización en Segundo Plano.

---

## 📱 ANDROID (Chrome / Edge)

### Prueba 1: Experiencia de Instalación (A2HS) - Plan E

**Instrucciones:**

1.  Abre la aplicación en Google Chrome para Android.
2.  Navega por la aplicación unos segundos (15-30 seg).
3.  Busca en el **menú de navegación** (Sidebar/Nav) o en la pantalla. Deberías ver un botón destacado que diga **"Instalar App"** o similar (Personalizado, NO el banner azul predeterminado de Chrome abajo del todo).
4.  Si no ves el botón, abre el menú de opciones de Chrome (tres puntos) y verifica si aparece "Instalar aplicación".
5.  Presiona el botón de "Instalar App" de la interfaz.

**Resultado Deseado:**

- [ ] Debe aparecer el prompt nativo de instalación de Android al pulsar TU botón personalizado.
- [ ] La instalación se completa y el icono `fesa.png` aparece en el escritorio/cajón de aplicaciones.
- [ ] El nombre de la app es el correcto (definido en manifest).

### Prueba 2: Modo Offline y Persistencia (Plan A + C)

**Instrucciones:**

1.  Abre la aplicación **INSTALADA** (no desde el navegador).
2.  Asegúrate tener internet.
3.  Visita las secciones críticas: **Perfil, Tickets/Entradas, Agenda**. (Esto debería guardar datos en Dexie/Cache).
4.  **Activa el MODO AVIÓN** en el dispositivo.
5.  Cierra la aplicación completamente (mátala de la lista de apps recientes).
6.  Vuelve a abrir la aplicación.
7.  Navega a **Perfil** y **Tickets**.

**Resultado Deseado:**

- [ ] La aplicación abre SIN mostrar el "Dinosaurio" de Chrome.
- [ ] Los datos de Perfil y Tickets se muestran correctamente (leídos desde IndexedDB/Caché).
- [ ] Las imágenes de perfil o assets vistos anteriormente cargan bien.

### Prueba 3: Acción Offline y Background Sync (Plan D)

**Instrucciones:**

1.  Mantén el **MODO AVIÓN ACTIVADO**.
2.  Realiza una acción que requiera envío de datos (ej: Registrar Asistencia si eres Staff, o Editar Perfil si eres usuario).
3.  Observa si la UI te informa que la acción está "Pendiente de sincronización" o guardada localmente.
4.  Cierra la aplicación o déjala en segundo plano.
5.  **DESACTIVA EL MODO AVIÓN** (recupera internet).
6.  Abre la aplicación y espera unos segundos.

**Resultado Deseado:**

- [ ] Al recuperar la conexión, la aplicación envía los datos pendientes automáticamente.
- [ ] El indicador de "Pendiente" desaparece.
- [ ] Los cambios se reflejan en el servidor (puedes verificar refrescando o entrando desde otro dispositivo).

---

## 🍎 iOS (Safari)

### Prueba 1: Experiencia de Instalación Manual (Plan E)

**Instrucciones:**

1.  Abre la aplicación en **Safari**.
2.  Busca el botón **"Instalar App"** en el menú de navegación/sidebar.
3.  Presiónalo.

**Resultado Deseado:**

- [ ] Al presionar el botón, DEBE aparecer un **Modal o Tooltip con instrucciones visuales**.
- [ ] Las instrucciones deben indicar claramente:
  1.  Toca el botón "Compartir" (icono cuadrado con flecha hacia arriba).
  2.  Busca y selecciona "Agregar a Inicio" (+).
- [ ] El modal debe estar diseñado específicamente para iOS (no mostrar botón "Instalar" que no funciona en iOS).

### Prueba 2: Validación de Standalone y UI

**Instrucciones:**

1.  Sigue las instrucciones del paso anterior y agrégala al inicio.
2.  Abre la app desde el icono en el Home Screen.

**Resultado Deseado:**

- [ ] La aplicación se abre en pantalla completa (sin barras de navegación de Safari).
- [ ] El "Status Bar" del iPhone se ve integrado con el color del tema (`theme-color`).
- [ ] La navegación interna se siente como una app nativa (SPA), sin recargas blancas.

### Prueba 3: Fallback Offline (Plan B)

**Instrucciones:**

1.  En la app instalada o en Safari.
2.  **Activa el MODO AVIÓN**.
3.  Intenta navegar a una página **que nunca hayas visitado antes** (fuerza un error de red por falta de caché).

**Resultado Deseado:**

- [ ] En lugar de un error genérico del navegador, ves una **Página de Error Personalizada** ("Estás desconectado").
- [ ] La página ofrece un botón para volver al Inicio o reintentar.

---

## ✅ Checklist de Éxito Global

- [ ] Icono de App correcto (`fesa.png`) en ambos sistemas.
- [ ] Splash screen (pantalla de carga) visible al abrir la PWA instalada.
- [ ] Navegación fluida offline en secciones visitadas.
- [ ] Mensaje claro al instalar en iOS.
- [ ] Sincronización automática al recuperar conexión tras una acción offline.
