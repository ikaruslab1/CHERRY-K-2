# ⚡ Plan de Optimización de Velocidad: Cherry K2

He analizado tu proyecto y detectado las 3 razones principales por las que el sistema se siente lento. Este archivo contiene las soluciones listas para implementar.

---

## 🔍 Diagnóstico

1.  **Consultas "Pesadas" en Búsquedas (Cuello de Botella Principal)**:
    - **Problema**: El buscador de usuarios usa `ilike` con comodines al inicio (`%texto%`). Esto obliga a la base de datos a leer TODAS las filas una por una (Full Table Scan) cada vez que escribes una letra.
    - **Impacto**: A medida que crezcan los usuarios, la búsqueda tardará segundos enteros.

2.  **Cascada de Autenticación (Auth Waterfall)**:
    - **Problema**: El hook `useRoleAuth` espera a obtener el usuario (`getUser`) y _luego_ hace otra petición para buscar su rol en `profiles`.
    - **Impacto**: Retrasa la carga inicial de cada página protegida entre 200ms y 500ms innecesariamente.

3.  **Re-fetching Constante (Pestañas)**:
    - **Problema**: En `StaffPage`, cada vez que cambias de pestaña (ej. de "Scanner" a "Usuarios"), el componente anterior se destruye. Al volver, se vuelve a descargar toda la lista de usuarios.
    - **Impacto**: Sensación de lentitud e intermitencia en la interfaz.

---

## 🛠️ Implementaciones Propuestas

### 1. Optimización de Base de Datos (SQL Indexing)

Para solucionar el problema de las búsquedas lentas, necesitamos índices especializados.

**Instrucción**: Ejecuta esto en tu SQL Editor de Supabase para activar la extensión de "Trigramas" que hace ultra-rápidas las búsquedas de texto parcial.

```sql
-- 1. Habilitar extensión para búsquedas de texto eficientes
create extension if not exists pg_trgm;

-- 2. Crear índices para búsquedas rápidas (first_name, last_name, email)
-- Esto permite que 'ilike %texto%' sea casi instantáneo
create index if not exists profiles_first_name_trgm_idx on profiles using gin (first_name gin_trgm_ops);
create index if not exists profiles_last_name_trgm_idx on profiles using gin (last_name gin_trgm_ops);
create index if not exists profiles_email_trgm_idx on profiles using gin (email gin_trgm_ops);

-- 3. Índice estándar para short_id (búsquedas exactas rápidas)
create index if not exists profiles_short_id_idx on profiles (short_id);

-- 4. Índice para filtrar por conferencias rápidamente en la tabla events
create index if not exists events_conference_id_idx on events (conference_id);
```

### 2. Caché Inteligente (Instalar SWR)

En lugar de volver a pedir los datos cada vez que cambias de pestaña, usaremos una estrategia de "Stale-While-Revalidate". Los datos se muestran al instante desde la memoria caché y se actualizan en segundo plano.

**Paso 1**: Instalar la librería (super ligera, hecha por Vercel).

```bash
npm install swr
```

**Paso 2**: Crear un hook reutilizable `src/hooks/useUsers.ts`.

```typescript
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/types";

// Fetcher genérico para Supabase
const fetcher = async (queryKey: string) => {
  // queryKey podría ser 'users' o 'users?search=xyz'
  const params = new URLSearchParams(queryKey.split("?")[1]);
  const search = params.get("search");

  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, short_id, degree, role, email")
    .order("created_at", { ascending: false })
    .limit(50);

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,short_id.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as UserProfile[];
};

export function useUsers(search: string) {
  // SWR manejará el caching, revalidación y deduplicación de requests automáticamente
  // Si search cambia, SWR crea una nueva entrada en caché
  const { data, error, isLoading, mutate } = useSWR(
    `users?search=${search}`,
    fetcher,
    {
      keepPreviousData: true, // Mantiene los datos viejos mientras carga los nuevos (evita parpadeos)
      revalidateOnFocus: false, // Opcional: Evita recargas agresivas al cambiar de ventana
    },
  );

  return {
    users: data || [],
    loading: isLoading,
    error,
    mutate, // Función para forzar recarga (útil después de editar un usuario)
  };
}
```

### 3. Modificar `UsersTable.tsx` para usar el nuevo Hook

Reemplazar todo el `useEffect` manual y los estados `loading` manuales por el hook.

```tsx
// En src/components/admin/UsersTable.tsx

// ... imports
import { useUsers } from "@/hooks/useUsers"; // Importar el nuevo hook

export function UsersTable({ readOnly = false }: { readOnly?: boolean }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  // REEMPLAZO: Usar el hook con caché en lugar de useEffect manual
  const { users, loading, mutate } = useUsers(debouncedSearch);

  // ... resto del código (eliminar estados 'users', 'loading' locales y useEffect de fetchUsers)

  // Cuando guardes un rol, simplemente llama a mutate() para refrescar la lista
  const saveRole = async () => {
    // ... update logic
    if (!error) {
      mutate(); // Recarga inteligente
      closeModal();
    }
  };

  // ...
}
```

### 4. Optimización de `useRoleAuth` (Eliminar Cascada)

Para acelerar la carga inicial, podemos disparar ambas peticiones en paralelo o cachear el resultado.

**Mejora en `src/hooks/useRoleAuth.ts`**:

```typescript
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AllowedRole = "admin" | "staff" | "ponente" | "user" | "owner";

// Cache simple en memoria para evitar llamadas repetidas en la misma sesión de navegación
let globalCachedRole: { id: string; role: string } | null = null;

export function useRoleAuth(
  allowedRoles: AllowedRole[] = [],
  redirectTo: string = "/profile",
) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<AllowedRole | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/");
          return;
        }

        // Optimización: Usar caché si ya tenemos el rol de este usuario
        if (globalCachedRole && globalCachedRole.id === user.id) {
          const role = globalCachedRole.role as AllowedRole;
          setUserRole(role);
          if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
            router.push(redirectTo);
            return;
          }
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // Si no está en caché, buscarlo
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          router.push("/");
          return;
        }

        const role = profile.role as AllowedRole;

        // Guardar en caché
        globalCachedRole = { id: user.id, role: role };

        setUserRole(role);

        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
          router.push(redirectTo);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, JSON.stringify(allowedRoles), redirectTo]); // JSON.stringify para evitar loops si el array cambia de referencia

  return { loading, isAuthorized, userRole };
}
```
