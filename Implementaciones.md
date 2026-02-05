# Plan de Innovación y Mejora: Cherry-K Academic Platform

Este documento detalla una serie de implementaciones estratégicas para convertir la plataforma en una herramienta líder para la gestión de eventos académicos universitarios.

## 1. Nuevas Funciones para Incorporar

Estas funciones están diseñadas para enriquecer la experiencia del usuario y del ponente, yendo más allá de la simple asistencia.

### A. Módulo de "Networking Académico" (Conexiones)

**Concepto:** Durante congresos y coloquios, el networking es vital. Implementaremos un sistema donde cada usuario tenga un "QR de Presentación" (diferente al de acceso) que contenga sus datos básicos (nombre, carrera, interés). Otros usuarios pueden escanearlo para agregarlo a su lista de "Contactos del Evento".
**Valor:** Transforma el evento en una oportunidad profesional real.

**Plan de Ejecución con Antigravity:**

1.  **Base de Datos:** Pedir a Antigravity: _"Crea una migracion SQL para una tabla llamada 'connections' que vincule dos user_id y guarde la fecha de conexión."_
2.  **Vista de Tarjeta:** _"Crea un componente 'DigitalBadge' en el perfil del usuario que muestre un QR generado con información de contacto (vCard o enlace interno)."_
3.  **Escáner de Usuario:** _"Implementa una función de escaneo en el perfil del usuario que, al leer un QR de otro asistente, guarde la conexión en la base de datos."_
4.  **Lista de Contactos:** _"Crea una vista 'Mis Contactos' donde se listen las personas que he conocido en el evento."_

### B. Preguntas y Respuestas (Q&A) en Tiempo Real

**Concepto:** Permite a los estudiantes enviar preguntas al ponente desde su celular durante la conferencia. El ponente o un moderador (Staff) las ve en su pantalla y puede seleccionarlas.
**Valor:** Elimina el caos de los micrófonos y da voz a los tímidos.

**Plan de Ejecución con Antigravity:**

1.  **Base de Datos:** Pedir a Antigravity: _"Crea una tabla 'event_questions' con campos para evento, usuario, texto de la pregunta y estado (pendiente, respondida)."_
2.  **Interfaz de Ponente:** _"Modifica la vista del rol Ponente para incluir un panel de 'Preguntas en Vivo' que se actualice en tiempo real (usando Supabase realtime)."_
3.  **Interfaz de Usuario:** _"Añade un input de texto en la vista detallada del evento que solo aparezca cuando el evento esté 'En Curso'."_

### C. Agenda Personalizada y Recordatorios

**Concepto:** En congresos de varios días con múltiples tracks, el usuario puede marcar eventos como "Me interesa". La app generará una agenda filtrada y enviará notificaciones (o correos) recordatorios.
**Valor:** Mejora la organización personal del asistente.

**Plan de Ejecución con Antigravity:**

1.  **Lógica:** _"Modifica la tabla de base de datos para relacionar usuarios con eventos 'guardados' (favorites)."_
2.  **UI:** _"Añade un botón de marcador/corazón en las tarjetas de eventos."_
3.  **Vista:** _"Crea una pestaña 'Mi Agenda' que solo muestre los eventos guardados ordenados por hora."_

---

## 2. Mejoras Visuales (Visual & UX)

El objetivo es pasar de una "herramienta administrativa" a una "experiencia premium".

### A. Dashboard de Métricas en Vivo para Admin

**Concepto:** Reemplazar tablas estáticas con gráficos interactivos. Ver la asistencia entrando en tiempo real con un gráfico de líneas o barras.
**Componentes:** Uso de librerías como `recharts` o `chart.js`.

**Plan de Ejecución con Antigravity:**

1.  **Instalación:** _"Instala la librería 'recharts' en el proyecto."_
2.  **Desarrollo:** _"Crea un componente 'LiveAttendanceChart' que consuma los datos de asistencia en tiempo real y muestre la curva de ingresos por hora."_
3.  **Integración:** _"Coloca este gráfico en la página principal del Admin dashboard."_

---

## 3. Implementaciones a Gran Escala (Arquitectura)

Para hacer el proyecto escalable y robusto.

### A. PWA (Progressive Web App) con Modo Offline

**Concepto:** En auditorios la señal suele fallar. La app debe permitir descargar el QR de entrada y ver la agenda sin internet.
**Técnica:** Service Workers y almacenamiento local (LocalStorage/IndexedDB).

**Plan de Ejecución con Antigravity:**

1.  **Configuración:** _"Genera un manifiesto (manifest.json) para que la app sea instalable en Android/iOS."_
2.  **Service Worker:** _"Configura next-pwa para cachear archivos estáticos y rutas clave."_
3.  **Sincronización:** _"Implementa lógica para guardar asistencias (Staff) en local si no hay red, y subirlas a Supabase cuando vuelva la conexión."_

### B. Sistema Multi-Congreso (Multitenancy)

**Concepto:** Actualmente la app parece manejar "eventos", pero para una universidad grande, podrían ocurrir el "Congreso de Medicina" y la "Semana de Ingeniería" simultáneamente.
**Cambio:** Estructurar todo bajo una entidad padre "Congreso/Jornada".

**Plan de Ejecución con Antigravity:**

1.  **Base de Datos:** _"Crea una tabla 'conferences' y vincula todos los 'events' a un 'conference_id'."_
2.  **UI de Selección:** _"Crea una pantalla de bienvenida (Landing) donde el usuario seleccione a qué congreso desea entrar si hay varios activos."_
3.  **Contexto:** _"Implementa un Global Context en React que guarde el congreso activo y filtre toda la app en base a eso."_

---

### ¿Cómo proceder?

Elige una de estas categorías (por ejemplo, "1.A Networking") e indícale a este agente:

> "Antigravity, empecemos a implementar el plan 1.A de Networking. Sigue el paso 1 que describiste en el archivo Implementaciones.md"
