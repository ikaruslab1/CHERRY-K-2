# Cherry K-2

**Sistema integral de gestión de eventos masivos, control de asistencia y emisión de constancias digitales.**

Este proyecto es una plataforma web progresiva (PWA) de alto rendimiento diseñada para administrar conferencias y eventos académicos. Utiliza un stack moderno enfocado en la velocidad, seguridad y experiencia de usuario.

---

## 🚀 Estado Actual del Proyecto

El sistema ha pasado por un proceso intensivo de **refactorización y aseguramiento (Q1 2026)**, cubriendo deuda técnica crítica y optimizando la arquitectura para producción.

### 🛡️ Mejoras de Seguridad y Arquitectura

- **Autenticación Server-Side**: Migración completa a **Server Actions** (`src/actions/auth.ts`). Las credenciales y lógica sensible se ejecutan exclusivamente en el servidor, utilizando cookies seguras (`HttpOnly`) para la gestión de sesiones.
- **Roles y Permisos Granulares**: Implementación de políticas **RLS (Row Level Security)** robustas en Supabase.
  - Roles soportados: `Owner` (Superadmin), `Admin`, `Staff`, `Ponente`, `VIP`, `User`.
  - Prevención de recursión infinita en políticas de base de datos mediante funciones `SECURITY DEFINER`.
- **Integridad de Datos**: Lógica de registro con **Transacciones Atómicas** (simuladas con rollback automático) para evitar usuarios "zombis" en caso de fallos de red.
- **Estrategia PWA**: Configuración de caché `NetworkOnly` para rutas críticas de API, garantizando que los usuarios siempre vean datos de asistencia y eventos en tiempo real.

---

## 📋 Características Principales

### 🎓 Gestión Académica

- **Agenda Dinámica**: Visualización de eventos por día, tipo y sede.
- **Multi-Rol**: Interfaz adaptativa según el nivel de usuario (Panel de Staff, Panel de Admin, Vista de Asistente).
- **Constancias Automatizadas**: Generación de certificados PDF con diseño responsive.
  - **Tipos**: Asistencia, Ponente, Staff, Organizador.
  - **Validación**: Lógica de desbloqueo basada en porcentaje de asistencia o fecha del evento.

### 📱 Experiencia Móvil (PWA)

- **Instalable**: Funciona como una app nativa en iOS y Android.
- **Escáner QR**: Herramienta integrada para toma de asistencia rápida por parte del Staff.
- **Modo Offline (UI)**: Interfaz resiliente a desconexiones momentáneas.

### 🛠️ Panel de Administración

- **Control Total**: Gestión de usuarios, asignación de roles y métricas de eventos.
- **Diseñador de Constancias**: Herramienta visual para personalizar plantillas de certificados.

---

## 💻 Stack Tecnológico

- **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (Tipado estricto)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Base de Datos & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Infraestructura**: Vercel (Hosting) + Upstash (Redis/QStash para colas - _en progreso_)
- **Estado Global**: React Context + Hooks Personalizados (ej. `useCertificates`, `useConference`).

---

## 📂 Estructura del Proyecto

La arquitectura sigue una organización modular por dominios:

```bash
src/
├── actions/        # Server Actions (Lógica de negocio segura)
│   ├── auth.ts     # Registro, Login, Recuperación
│   └── ...
├── app/            # Rutas de Next.js (App Router)
├── components/     # UI Reutilizable
│   ├── auth/       # Formularios de acceso
│   ├── profile/    # Vistas de usuario y certificados
│   └── ui/         # Librería de componentes base (Botones, Inputs, Modales)
├── hooks/          # Lógica de estado reactiva (useCertificates, etc.)
├── lib/            # Clientes de servicios (Supabase Admin, Utils)
├── types/          # Definiciones TypeScript compartidas
└── middleware.ts   # Gestión de sesiones y protección de rutas
```

**Base de Datos (Supabase):**

- `supabase/schema.sql`: **Fuente de verdad** del esquema de base de datos.
- `supabase/migrations/`: Historial de cambios evolutivos en la DB.

---

## ⚙️ Instalación Local

1.  **Clonar:**

    ```bash
    git clone <URL_REPO>
    cd cherry-k-2
    ```

2.  **Instalar:**

    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno (`.env.local`):**

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
    SUPABASE_SERVICE_ROLE_KEY=tu_secret_key_admin  # Requerido para Server Actions de Admin
    ```

4.  **Correr:**
    ```bash
    npm run dev
    ```

---

## 🤝 Contribución y Estándares

- **Code Style**: Se utiliza ESLint y Prettier.
- **Commits**: Seguir convención de commits semánticos si es posible.
- **Base de Datos**: Cualquier cambio en DB debe reflejarse en una nueva migración en `supabase/migrations/`.

---

© 2026 Cherry K-2 Team. Propiedad Privada.
