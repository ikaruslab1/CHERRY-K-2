# Plan de Implementación 3.B: Sistema Multi-Congreso (Multitenancy)

## 1. Objetivo General

Transformar la arquitectura de "Evento Único" a "Multi-Congreso", permitiendo que múltiples jornadas (ej. "Congreso Medicina", "Semana Ingeniería") coexistan simultáneamente en la misma plataforma. Se introduce el rol **"Owner"** para la gestión global de estos congresos.

## 2. Análisis del Estado Actual

- **Base de Datos**: Los eventos (`events`) existen en un namespace global. No hay agrupación superior.
- **Roles**: Existen `admin`, `staff`, `ponente`, `user`. El `admin` actual gestiona "todo", pero en un entorno multi-congreso, su alcance debe limitarse al congreso activo (o elevarse, según diseño, pero aquí usaremos al Owner como super-admin).
- **Frontend**: La aplicación asume un solo contexto de eventos.

## 3. Plan de Arquitectura y Base de Datos

### A. Base de Datos (Supabase)

1.  **Nueva Tabla: `conferences`**
    - `id` (uuid, PK)
    - `title` (text)
    - `description` (text)
    - `start_date` (timestamp)
    - `end_date` (timestamp)
    - `is_active` (boolean)
    - `created_at` (timestamp)
    - `owner_id` (uuid, FK references auth.users) - Opcional, para auditoría.

2.  **Modificación de Tabla: `events`**
    - Agregar columna `conference_id` (uuid, FK references conferences.id).
    - **Importante**: La columna debe ser requerida (NOT NULL) eventualmente. Para la migración inicial, se debe crear un "Congreso Default" y asignar todos los eventos existentes a él.

3.  **Actualización de Roles (`profiles`)**
    - Modificar el check constraint o enum de `role` para incluir `'owner'`.
    - Roles resultantes: `'owner'`, `'admin'`, `'staff'`, `'ponente'`, `'user'`.

### B. Seguridad (RLS Policies)

- **Owner**: Acceso total (`ALL`) a `conferences` y `events`.
- **Admin/Staff/Ponente/User**: Acceso a `events` limitado por el `conference_id` seleccionado (requerirá lógica de filtrado en cliente o políticas RLS avanzadas usando variables de sesión, por simplicidad iniciaremos con filtrado en cliente + RLS básico).

## 4. Frontend y Lógica de Aplicación

### A. Definición de Tipos

Actualizar `src/types/index.ts`:

```typescript
export interface Conference {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
  // ... fechas
}

export type UserRole = "owner" | "admin" | "staff" | "ponente" | "user";

// Actualizar UserProfile e Event con los nuevos campos
```

### B. Gestión de Estado Global (ConferenceContext)

Crear un Contexto `ConferenceContext` que envuelva la aplicación (o parte de ella):

- **Estado**: `currentConference` (Conference | null).
- **Persistencia**: Guardar `conference_id` en `localStorage` o cookies para mantener la sesión del congreso al recargar.
- **Middleware**: Verificar si hay una conferencia seleccionada. Si no, redirigir al "Selector de Congreso".

### C. Nuevas Vistas y Componentes

1.  **Landing / Selector (`/select-conference` o Root)**:
    - Si el usuario no ha seleccionado congreso, mostrar lista de `conferences` activas.
    - Al seleccionar, setear `ConferenceContext` y redirigir al Home del congreso.
2.  **Dashboard del Owner (`/owner`)**:
    - CRUD de Congresos (Crear, Editar, Activar/Desactivar).
    - Vista global de métricas.

### D. Modificación de Vistas Existentes

Todas las vistas que listan eventos (Agenda, Admin Panel, etc.) deben actualizarse para filtrar por `currentConference.id`.

- _Ejemplo_: `supabase.from('events').select('*').eq('conference_id', currentConference.id)...`

## 5. Estrategia de Implementación (Paso a Paso)

### Fase 1: Datos y Backend (Crítico)

1.  Crear migración SQL para tabla `conferences`.
2.  Insertar registro "Congreso Inicial" (para migración).
3.  Alterar tabla `events` agregando `conference_id`.
4.  Ejecutar script para asignar todos los eventos actuales al "Congreso Inicial".
5.  Actualizar restricción de roles en DB para aceptar 'owner'.

### Fase 2: Core Frontend

1.  Actualizar Interfaces TS.
2.  Implementar `ConferenceContext`.
3.  Crear página de Selección de Congreso.
4.  Actualizar `useRoleAuth` para manejar el rol 'owner'.

### Fase 3: Filtrado y Adaptación

1.  Refactorizar llamadas a API en `AgendaView`, `EventsManager`, etc., inyectando el filtro `eq('conference_id', id)`.
2.  Asegurar que al crear un evento nuevo (Admin Panel), se asigne automáticamente el ID del congreso activo.

### Fase 4: Panel del Owner

1.  Crear ruta protegida `/owner`.
2.  Implementar gestión de `conferences`.

## 6. Consideraciones

- **Retrocompatibilidad**: Al iniciar, todo debe apuntar al "Congreso Inicial" para que la app no se rompa.
- **URLs**: Idealmente, las rutas deberían cambiar a `/[conference_slug]/agenda`, pero para minimizar impacto inicial, usaremos Contexto + LocalStorage.
