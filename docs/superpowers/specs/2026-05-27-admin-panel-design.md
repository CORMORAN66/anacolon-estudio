# Admin Panel — Design Spec

**Goal:** Panel de administración multi-usuario con roles para gestionar todo el contenido del site de Ana Colón Estudio.

**Architecture:** Next.js App Router route group `(admin)` con layout propio (sidebar), Supabase Auth para autenticación con email/contraseña, tabla `admin_profiles` para roles, middleware que protege todas las rutas `/admin/*`.

**Tech Stack:** Next.js 15 App Router, Supabase Auth, @supabase/ssr, Tailwind v4, shadcn/ui, react-hook-form + zod

---

## Roles y permisos

| Sección | Superadmin | Editor | Comercial |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Proyectos | ✅ CRUD + publicar | ✅ CRUD + publicar | ❌ |
| Productos textiles | ✅ CRUD | ✅ CRUD | ❌ |
| Blog | ✅ CRUD + publicar | ✅ CRUD + publicar | ❌ |
| Leads / contactos | ✅ ver + cambiar estado + notas | ❌ | ✅ ver + cambiar estado + notas |
| Testimonios | ✅ CRUD | ✅ CRUD | ❌ |
| Gestión de usuarios | ✅ único | ❌ | ❌ |

Sin borrado permanente — todo se archiva (`active: false` o `published: false`).

---

## Rutas

```
/admin                      → redirect a /admin/dashboard
/admin/login                → login público (sin sidebar)
/admin/dashboard            → resumen con tarjetas de métricas
/admin/proyectos            → lista paginada
/admin/proyectos/nuevo      → formulario crear
/admin/proyectos/[id]       → formulario editar
/admin/productos            → lista paginada
/admin/productos/nuevo      → formulario crear
/admin/productos/[id]       → formulario editar
/admin/blog                 → lista paginada
/admin/blog/nuevo           → formulario crear
/admin/blog/[id]            → formulario editar
/admin/leads                → bandeja con filtro por estado
/admin/leads/[id]           → detalle de lead + cambiar estado + notas
/admin/testimonios          → lista + inline edit
/admin/usuarios             → lista de admins (solo superadmin)
/admin/usuarios/nuevo       → invitar admin (solo superadmin)
```

---

## Flujo de autenticación

1. Usuario entra a cualquier ruta `/admin/*`
2. `src/middleware.ts` verifica sesión Supabase Auth
3. Sin sesión → redirect a `/admin/login`
4. Con sesión → lee rol de `admin_profiles`
5. Rol sin permiso para esa sección → redirect a `/admin/dashboard`
6. Login exitoso → Supabase crea sesión → redirect a `/admin/dashboard`
7. Logout → Supabase invalida sesión → redirect a `/admin/login`

---

## Modelo de datos

### Nueva tabla: `admin_profiles`

```sql
create table admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('superadmin', 'editor', 'comercial')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Solo service_role puede leer/escribir
alter table admin_profiles enable row level security;
create policy "service role only" on admin_profiles using (false);
```

### Modificación tabla `leads`

```sql
alter table leads add column notes text;
alter table leads add column updated_at timestamptz default now();
```

### Invitación de usuarios

1. Superadmin rellena formulario: email, nombre, rol
2. Server action llama a `supabase.auth.admin.inviteUserByEmail(email, { data: {} })`
3. Se crea registro en `admin_profiles` con el rol asignado
4. Nuevo usuario recibe email con enlace para establecer contraseña

---

## Estructura de archivos

```
src/
  app/
    admin/
      login/
        page.tsx              ← formulario login (layout propio, sin sidebar)
    (admin)/
      layout.tsx              ← layout con sidebar (solo admins autenticados)
      dashboard/
        page.tsx
      proyectos/
        page.tsx              ← lista
        nuevo/page.tsx
        [id]/page.tsx         ← editar
      productos/
        page.tsx
        nuevo/page.tsx
        [id]/page.tsx
      blog/
        page.tsx
        nuevo/page.tsx
        [id]/page.tsx
      leads/
        page.tsx
        [id]/page.tsx
      testimonios/
        page.tsx
      usuarios/
        page.tsx              ← solo superadmin
        nuevo/page.tsx
  components/
    admin/
      AdminSidebar.tsx        ← navegación lateral con links por rol
      AdminHeader.tsx         ← barra superior con nombre, rol, logout
      AdminTable.tsx          ← tabla reutilizable con paginación
      AdminForm.tsx           ← wrapper de formulario con react-hook-form
      LeadStatusBadge.tsx     ← badge de estado (nuevo/contactado/etc)
      DashboardCard.tsx       ← tarjeta de métrica para dashboard
  lib/
    admin/
      permissions.ts          ← matriz de permisos por rol
      actions/
        projects.ts           ← server actions CRUD proyectos
        products.ts           ← server actions CRUD productos
        posts.ts              ← server actions CRUD blog
        leads.ts              ← server actions actualizar leads
        testimonials.ts       ← server actions CRUD testimonios
        users.ts              ← server actions gestión usuarios
  middleware.ts               ← protección rutas /admin/*
```

---

## UI / Layout

**Sidebar** (256px fijo en desktop, colapsable en móvil):
- Logo "ANA COLÓN · Admin" arriba
- Links de navegación filtrados por rol
- Separador antes de "Usuarios" (solo superadmin)

**Header** (barra superior):
- Nombre de la sección actual
- Avatar/nombre del usuario + rol
- Botón cerrar sesión

**Listas** — tabla con columnas, botón "Nuevo" arriba a la derecha, acciones por fila (Editar, Archivar). Sin borrado permanente.

**Formularios** — campos con validación Zod + react-hook-form. Textarea para descripciones largas. Imágenes: campo URL (sin subida de archivos en esta fase).

**Dashboard** — 4 tarjetas: Leads nuevos, Proyectos publicados, Productos activos, Posts publicados.

**Leads** — filtros por estado en tabs. Vista de bandeja. Detalle con formulario de notas y selector de estado.

**Estilo** — fondo `#F9F7F4` (off-white), sidebar blanco con borde derecho, acentos `#C9A96E` (gold), tipografía coherente con el site público.

---

## Middleware

`src/middleware.ts` — intercepta todas las rutas `/admin/*` excepto `/admin/login`:

```typescript
// Pseudocódigo
// Rutas excluidas del middleware: /admin/login
const session = await getSession(request)
if (!session) return redirect('/admin/login')

const profile = await getAdminProfile(session.user.id)
if (!profile?.active) return redirect('/admin/login')

const allowed = checkPermission(profile.role, pathname)
if (!allowed) return redirect('/admin/dashboard')
```

---

## Consideraciones

- **Sin borrado permanente**: `active: false` o `published: false` en lugar de DELETE
- **Imágenes**: campo URL en esta fase. Subida directa a Cloudinary en fase posterior.
- **Editor de texto**: textarea simple. Editor rich text (Tiptap) en fase posterior si se necesita.
- **Paginación**: 20 ítems por página en todas las listas.
- **Mobile**: sidebar colapsable. Panel usable en tablet para uso en campo.
