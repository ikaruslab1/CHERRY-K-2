# Cherry K 2

Sistema integral de gestión de eventos, asistencia y control de usuarios, desarrollado con tecnologías web modernas.

## 📋 Descripción

Este proyecto es una plataforma web diseñada para administrar eventos, controlar la asistencia mediante códigos QR y gestionar la emisión de constancias. Cuenta con un sistema de roles (Administrador, Staff, Usuario/Ponente) que permite adaptar la interfaz y funcionalidades según el tipo de usuario.

## 🚀 Características Principales

- **Gestión de Eventos:** Visualización de agenda, creación y edición de eventos.
- **Control de Asistencia:** Escaneo de códigos QR para registrar la asistencia de los participantes.
- **Gestión de Usuarios:** Registro, autenticación y perfiles de usuario.
- **Constancias:** Generación y visualización de certificados de participación.
- **Roles y Permisos:**
  - **Admin:** Control total del sistema, gestión de eventos y usuarios.
  - **Staff:** Herramientas optimizadas para el registro de asistencia en sitio.
  - **Usuario/Ponente:** Acceso a agenda personal, perfil y descarga de constancias.

## 🛠️ Tecnologías Utilizadas

Este proyecto utiliza un stack moderno y eficiente:

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend & Autenticación:** [Supabase](https://supabase.com/)
- **Formularios:** React Hook Form + Zod
- **Iconos:** Lucide React
- **Utilidades:** QR Code Scanner/Generator

## ⚙️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

1.  **Clonar el repositorio:**

    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd cherry-k-2
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    # o
    pnpm install
    # o
    yarn install
    ```

3.  **Configurar variables de entorno:**

    Crea un archivo `.env.local` en la raíz del proyecto y agrega las credenciales de tu proyecto Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
    ```

4.  **Ejecutar el servidor de desarrollo:**

    ```bash
    npm run dev
    ```

    Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📂 Estructura del Proyecto

El código fuente se encuentra organizado principalmente en `src`:

- `src/app/`: Define las rutas de la aplicación utilizando el App Router de Next.js (`admin`, `staff`, `profile`, etc.).
- `src/components/`: Contiene los componentes de React organizados por funcionalidad:
  - `auth`: Formularios de autenticación.
  - `events`: Componentes de agenda y gestión de eventos.
  - `attendance`: Lógica y UI para el escáner de asistencia.
  - `ui`: Componentes base reutilizables.
- `src/services/`: Lógica de interacción con la base de datos (Supabase).
- `src/types/`: Definiciones de tipos e interfaces TypeScript.

## 🤝 Contribución

Para mantener la calidad del código, por favor considera las siguientes buenas prácticas:

- Tipado estricto con TypeScript.
- Uso de componentes funcionales y Hooks.
- Diseño responsivo y accesible utilizando Tailwind CSS.

## 📄 Licencia

Propiedad exclusiva. Todos los derechos reservados.
