# Admin Proyectos — Especificación de Diseño
**Fecha:** 2026-05-28  
**Proyecto:** Ana Colón Estudio (Next.js 16 + Supabase + Vercel)

---

## Resumen

Reemplazar el formulario estático de crear/editar proyecto (inputs de URL de texto) por un flujo con subida real de fotos: portada + galería de imágenes. La página pública en `/estudio/[slug]` ya tiene el componente `ProjectGallery` funcionando — solo necesita imágenes reales.

---

## Contexto del código actual

- `src/app/admin/(protected)/proyectos/nuevo/page.tsx` — form directo, `cover_image_url` es `type="url"` texto
- `src/app/admin/(protected)/proyectos/[id]/page.tsx` — mismo patrón
- `src/lib/admin/actions/projects.ts` — `createProject` hardcodea `gallery_images: []`; `updateProject` nunca guarda `gallery_images`
- `src/app/(public)/estudio/[slug]/page.tsx` — ya usa `<ProjectGallery images={project.gallery_images} />`, pero el array siempre está vacío
- `src/components/public/ProjectGallery.tsx` — ya existe, funciona con lightbox, no necesita cambios
- Bucket `product-images` creado por la spec de productos — se reutiliza con carpeta `projects/`

---

## Diseño

### 1. ProjectForm (componente cliente)

**Archivo:** `src/components/admin/ProjectForm.tsx`

Client component (`'use client'`) con 3 secciones apiladas. Props:
```typescript
interface ProjectFormProps {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Project>
}
```

**Estado interno:**
- `coverImageUrl: string` — URL Supabase de la foto portada
- `galleryImages: string[]` — hasta 10 URLs de galería adicional
- `uploading: boolean`

**Sección ① Datos básicos:**
- Nombre *, Slug * (auto-generado)
- Tipo (select: Residencial / Comercial / Reforma)
- Ciudad, Año, Superficie m²
- Checkbox "Publicado"
- Input oculto: `sort_order`

**Sección ② Galería:**
- Slot de portada (grande, 2:1): drag & drop o clic → upload → muestra preview
  - Botón × para reemplazar
- Grid de fotos adicionales (hasta 10):
  - Thumbnails cuadrados existentes con botón ×
  - Botón "+ Subir foto" para añadir más
- Upload: `onChange` → `fetch('/api/admin/products/upload', { body: formData con folder:'projects' })` → actualiza estado → escribe hidden inputs

**Sección ③ Descripción:**
- Descripción corta (textarea, 1-2 líneas → aparece en la lista del estudio)
- Descripción larga (textarea grande → aparece en el detalle del proyecto, admite HTML básico)

**Envío:** form con `action={props.action}`, hidden inputs con URLs de imagen como JSON.

---

### 2. Actualizar server actions de proyectos

**`src/lib/admin/actions/projects.ts`**

Añadir al `projectSchema`:
```typescript
gallery_images: z.string().default('[]'),  // JSON array de URLs
```

En `createProject`:
```typescript
const gallery_images = JSON.parse(parsed.data.gallery_images) as string[]
const data = {
  ...parsed.data,
  gallery_images,
  // cover_image_url ya existía
}
// eliminar la línea: gallery_images: []
```

En `updateProject`:
```typescript
const gallery_images = JSON.parse(parsed.data.gallery_images) as string[]
const data = {
  ...parsed.data,
  gallery_images,
}
```

---

### 3. Actualizar páginas admin de proyecto

**`src/app/admin/(protected)/proyectos/nuevo/page.tsx`:**
- Sigue siendo Server Component
- Renderiza `<ProjectForm action={createProject} />`

**`src/app/admin/(protected)/proyectos/[id]/page.tsx`:**
- Renderiza `<ProjectForm action={updateWithId} defaultValues={project} />`

---

### 4. Página pública — sin cambios

`src/app/(public)/estudio/[slug]/page.tsx` y `src/components/public/ProjectGallery.tsx` **no requieren modificación**. Con `gallery_images` correctamente guardado en BD, la galería funcionará automáticamente.

---

## Dependencia con spec de productos

Esta spec depende de que la migración `005_product_images_bucket.sql` y la ruta `/api/admin/products/upload` de la spec de productos estén implementadas primero. `ProjectForm` reutiliza ese endpoint con `folder: 'projects'`.

---

## Archivos

### Nuevos
| Archivo | Responsabilidad |
|---|---|
| `src/components/admin/ProjectForm.tsx` | Form completo de proyecto (client) |

### Modificados
| Archivo | Cambio |
|---|---|
| `src/lib/admin/actions/projects.ts` | Schema + parsing de `gallery_images` |
| `src/app/admin/(protected)/proyectos/nuevo/page.tsx` | Usa `ProjectForm` |
| `src/app/admin/(protected)/proyectos/[id]/page.tsx` | Usa `ProjectForm` |

---

## Fuera de alcance

- Reordenado por drag & drop de la galería
- Eliminación de imágenes del bucket al borrar proyecto
- Editor de texto enriquecido para `long_description` (texto plano o HTML básico es suficiente)
