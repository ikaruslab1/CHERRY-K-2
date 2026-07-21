# Guía del Proyecto y Mapa de Arquitectura (Para Agentes de IA)

Esta guía sirve como punto de partida y mapa técnico para que cualquier modelo de IA o desarrollador entienda la estructura, flujos principales y convenciones de este repositorio.

---

## 🚀 1. Arquitectura Técnica

El proyecto está construido con **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4** y **Supabase** como Backend-as-a-Service (BaaS).

### Flujo de Datos y Autenticación
1. **Autenticación en Servidor (Server Actions):** Todo el flujo de registro, inicio de sesión y recuperación está en [src/actions/auth.ts](file:///d:/Proyectos/cherry-k-2/src/actions/auth.ts). Se comunica con Supabase Auth y persiste la sesión en cookies seguras utilizando `@supabase/ssr`.
2. **Consultas a Base de Datos:**
   - **Públicas / Caché (ISR):** Consultas estáticas como la landing del evento ([src/app/event/\[conferenceId\]/page.tsx](file:///d:/Proyectos/cherry-k-2/src/app/event/%5BconferenceId%5D/page.tsx)) usan un cliente de Supabase puro sin cookies, permitiendo almacenamiento en caché al Edge de Vercel.
   - **Privadas (Cliente):** Componentes interactivos usan el cliente de Supabase del navegador ([src/lib/supabase.ts](file:///d:/Proyectos/cherry-k-2/src/lib/supabase.ts)) respetando las políticas RLS.

---

## 📂 2. Estructura de Directorios

- **[src/actions/](file:///d:/Proyectos/cherry-k-2/src/actions/)**: Lógica transaccional segura ejecutada en el servidor (ej: `auth.ts`, `notifications.ts`).
- **[src/app/](file:///d:/Proyectos/cherry-k-2/src/app/)**: Enrutamiento de Next.js.
  - `/` -> Redirecciona dinámicamente según sesión y cookies.
  - `/login` -> Portal bilingüe de acceso y registro.
  - `/profile` -> Panel principal del Asistente (gafete, agenda, constancias y FAQ - estilo "Acid Editorial" en modo oscuro y BottomNav para móvil).
  - `/admin` -> Portal de Control Administrativo (Dashboard de métricas, Gestor de eventos, Control de usuarios, Diseñador de constancias, Editor de landing, Embeddings y Lector QR). Administrado mediante subrutas `/admin/events`, `/admin/users`, `/admin/certificates`, `/admin/landing`, `/admin/embeddings` y `/admin/scanner`.
  - `/event/[conferenceId]` -> Landing page personalizada e indexable de cada evento.
- **[src/components/](file:///d:/Proyectos/cherry-k-2/src/components/)**: Componentes UI y controladores modulares.
- **[src/context/](file:///d:/Proyectos/cherry-k-2/src/context/)**: Contextos globales de React:
  - `ConferenceContext` -> Controla la conferencia activa seleccionada y sus metadatos.
  - `LanguageContext` -> Soporte bilingüe ES/EN persistido en `localStorage`.
- **[src/hooks/](file:///d:/Proyectos/cherry-k-2/src/hooks/)**: Ganchos de sincronización y validación.
- **[src/services/](file:///d:/Proyectos/cherry-k-2/src/services/)**: Abstracciones de llamadas a Supabase RPC y queries.
- **[supabase/](file:///d:/Proyectos/cherry-k-2/supabase/)**: Estructura de base de datos SQL.
  - `schema.sql` -> Esquema base y triggers iniciales.
  - `migrations/` -> Historial de modificaciones de base de datos.

---

## 🗄️ 3. Esquema de Base de Datos (Supabase / Postgres)

### Tablas Principales
1. **`profiles`**: Datos de usuarios registrados.
   - `id` (UUID, primary key)
   - `short_id` (TEXT, único, clave de acceso auto-generada ej: `CK2-ABCD`)
   - `role` (ENUM: `user`, `staff`, `admin`, `ponente`, `owner`, `vip`)
2. **`conferences`**: Congresos o eventos globales que agrupan conferencias individuales.
   - Contiene campos de personalización de marca (`accent_color`, `badge_icon`, `certificate_config`) y `conference_landing_config`.
3. **`conference_roles`**: Permite asignar roles específicos a un usuario para una conferencia particular.
4. **`events`**: Actividades, talleres o ponencias individuales pertenecientes a una conferencia.
5. **`attendance`**: Registros de pases de lista (escaneo de gafetes QR).
6. **`event_interests`**: Eventos añadidos a la agenda personal de los usuarios.

### 🛡️ Row Level Security (RLS) y Recursión
Para evitar recursiones infinitas en las políticas RLS de Supabase, no se consulta directamente la tabla de perfiles dentro de la política de perfiles. En su lugar, se utilizan funciones **`SECURITY DEFINER`** que se ejecutan con permisos de bypass:
- `is_admin(conference_id)`: Valida si el usuario autenticado tiene rol de administrador u owner.
- `is_staff_or_admin()`: Valida si es staff, admin u owner global.

Ejemplo de uso de política:
```sql
CREATE POLICY "Admins manage events"
ON events FOR ALL TO authenticated
USING (is_admin(conference_id));
```

---

## 📲 4. Estrategia Offline y PWA (Paso de Asistencia)

La plataforma está diseñada para funcionar resiliente a fallas de red mediante Service Workers y bases de datos locales:
1. **Sincronización Local (Dexie.js):** [useSyncData.ts](file:///d:/Proyectos/cherry-k-2/src/hooks/useSyncData.ts) sincroniza al iniciar sesión la agenda e intereses del usuario a IndexedDB.
2. **Escáner QR Offline:** Si el staff escanea asistencia sin internet:
   - [useOfflineSync.ts](file:///d:/Proyectos/cherry-k-2/src/hooks/useOfflineSync.ts) guarda la cola de registros en `localStorage` (`offline_attendance_queue`).
   - Al recuperar la conexión (`window.addEventListener('online')`), se sincroniza automáticamente con Supabase mediante el servicio `attendanceService`.

---

## 🎨 5. Identidad Visual "Acid Editorial"

El diseño sigue una estrategia editorial neo-grotesca inspirada en el brutalismo suizo:
- **Colores:** Extremos. Fondo negro profundo (`--color-void`: `#050505`), texto blanco papel (`--color-chalk`: `#f2f2f2`), y acentos dinámicos adaptados a la conferencia (`--color-acid` y `--color-acid-gradient`).
- **Tipografías:** `Geist Sans` para todo el cuerpo y titulares (limpieza de trazos), `JetBrains Mono` para datos técnicos, fechas e identificadores.
- **Variables CSS inyectadas:** [DynamicTheme.tsx](file:///d:/Proyectos/cherry-k-2/src/components/theme/DynamicTheme.tsx) lee el color de la conferencia y define en el `:root`:
  - `--color-acid` (Hex sólido compatible con bordes y textos).
  - `--color-acid-gradient` (Gradiente CSS completo para fondos y banners).
  - `--color-acid-text` (Color contrastante automático, negro o blanco, para texto sobre el acento).

---

## 📝 6. Reglas de Codificación (Para Agentes de IA)

1. **Internacionalización (i18n):** Nunca quemar textos en el HTML. Usar el gancho `const { t } = useLanguage()` y declarar las claves correspondientes en `src/locales/es.json` y `src/locales/en.json`. Para datos de DB, consultar usando sufijos `_en` mediante helpers.
2. **Evitar Placeholders:** Todos los componentes visuales deben presentar datos estructurados o mockups con buen aspecto estético. No usar textos temporales de relleno.
3. **Lazy-Loading:** Componentes administrativos de control pesados (ej: `UsersTable`, `EventsManager`, `MetricsView`) consumidos solo por Staff/Admin deben cargarse dinámicamente (`next/dynamic` con `ssr: false`) en vistas compartidas como `/profile`.
4. **Modificaciones de DB:** Cualquier alteración del esquema SQL debe ser creada en un nuevo script dentro de [supabase/migrations/](file:///d:/Proyectos/cherry-k-2/supabase/migrations/) respetando el orden cronológico del prefijo numérico.
5. **Compilación / Servidor de Desarrollo:** En entornos locales, si Turbopack genera errores de detección de la raíz del proyecto (`Turbopack Error: Next.js package not found`), ejecutar el servidor de desarrollo forzando el empaquetador Webpack mediante `next dev --webpack` (o corriendo `pnpm dev` que ya tiene el flag configurado por defecto).

