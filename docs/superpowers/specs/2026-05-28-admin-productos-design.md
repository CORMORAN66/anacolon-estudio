# Admin Productos — Especificación de Diseño
**Fecha:** 2026-05-28  
**Proyecto:** Ana Colón Estudio (Next.js 16 + Supabase + Vercel)

---

## Resumen

Reemplazar los formularios estáticos de crear/editar producto (inputs de URL de texto) por un flujo de admin completo con:
- Subida real de fotos (galería de hasta 8 imágenes, portada ⭐ y referencia IA ✨)
- Creación inline de categorías sin salir del formulario
- Página CRUD de categorías independiente
- Galería interactiva en la página pública del producto

---

## Contexto del código actual

- `src/app/admin/(protected)/productos/nuevo/page.tsx` — Server Component con form directo, `cover_image_url` es `type="url"` texto
- `src/app/admin/(protected)/productos/[id]/page.tsx` — mismo patrón
- `src/lib/admin/actions/products.ts` — `createProduct` y `updateProduct` hardcodean `images: []`, no manejan `ai_reference_image_url`
- `src/app/(public)/edicion-textil/[slug]/page.tsx` — thumbnails estáticos, no interactivos
- Bucket existente: `hero-media`. No existe `product-images`.
- Referencia de upload admin: `src/app/api/admin/hero/upload/route.ts`

---

## Diseño

### 1. Infraestructura de imágenes

**Bucket Supabase:** `product-images` (público, 10 MB por fichero, MIME: jpeg/png/webp)

**API Route:** `POST /api/admin/products/upload`
- Requiere usuario autenticado (admin)
- Acepta `FormData` con `file` + `folder` opcional (`products` o `projects`)
- Sube a `product-images/{folder}/{timestamp}-{random}.{ext}`
- Devuelve `{ url: publicUrl }`

---

### 2. Categorías

**Nueva página:** `/admin/categorias`
- Lista de categorías (nombre, slug, sort_order)
- Botón "+ Nueva categoría" → abre modal inline (no página separada)
- Botón editar por fila → modal con nombre y sort_order
- Botón eliminar (solo si la categoría no tiene productos activos)

**Nuevo sidebar link:** "Categorías" entre "Productos" y "Blog"
- Permisos: `superadmin` y `editor` (igual que Productos)

**Server actions:** `src/lib/admin/actions/categories.ts`
```typescript
export async function createCategory(data: { name: string; slug: string; sort_order?: number }): Promise<ProductCategory | { error: string }>
export async function updateCategory(id: string, data: { name: string; sort_order: number }): Promise<void | { error: string }>
export async function deleteCategory(id: string): Promise<void | { error: string }>
```
Nota: `createCategory` devuelve la categoría creada (no `redirect`) — el cliente la usa para seleccionarla.

---

### 3. ProductForm (componente cliente)

**Archivo:** `src/components/admin/ProductForm.tsx`

Client component (`'use client'`) con 4 secciones apiladas. Recibe como props:
```typescript
interface ProductFormProps {
  action: (formData: FormData) => Promise<void>
  categories: { id: string; name: string }[]
  defaultValues?: Partial<Product>  // para edición
}
```

**Estado interno del componente:**
- `coverImageUrl: string` — URL Supabase de la foto ⭐
- `aiRefImageUrl: string` — URL Supabase de la foto ✨
- `galleryImages: string[]` — hasta 8 URLs adicionales
- `uploading: boolean`
- `categories: { id: string; name: string }[]` — inicia con prop, puede crecer
- `showCategoryModal: boolean`
- `selectedCategoryId: string`

**Sección ① Información básica:**
- Nombre *, Slug * (auto-generado desde nombre)
- Selector de categoría (dropdown) + botón "+ Nueva" → `CategoryQuickCreate`
- Colección
- Checkbox "Activo"
- Input oculto: `sort_order`

**Sección ② Galería de fotos:**
- Grid 5 columnas de thumbnails cuadrados:
  - Slot ⭐: foto de portada → aparece en catálogo y encabeza página de producto
  - Slot ✨: foto ref IA → la usa el Visualizador IA (puede ser la misma o recortada sin fondo)
  - Hasta 6 slots de galería adicional
  - Botón "+ Subir" para cada slot vacío
- Cada foto tiene botón × para eliminar
- Haz clic en ☆ de cualquier foto de galería para convertirla en portada (mueve URLs)
- Upload: `onChange` → `fetch('/api/admin/products/upload')` → actualiza estado → escribe hidden inputs

**Sección ③ Descripción y ficha técnica:**
- Textarea Descripción (convence, no solo informa)
- Material / Composición
- Dimensiones / Ancho de rollo

**Sección ④ Publicar:**
- Botón "Guardar producto" + "Cancelar"
- Hidden inputs: `cover_image_url`, `ai_reference_image_url`, `images` (JSON.stringify del array)

**Envío:** el form usa `action={props.action}` — server action estándar con `redirect`. Los hidden inputs llevan las URLs de imagen al server action.

---

### 4. CategoryQuickCreate

**Archivo:** `src/components/admin/CategoryQuickCreate.tsx`

Modal inline (no página). Props:
```typescript
interface CategoryQuickCreateProps {
  onCreated: (category: { id: string; name: string }) => void
  onClose: () => void
}
```
- Campo Nombre → auto-genera slug en tiempo real
- Botón "Crear" → llama `createCategory()` → `onCreated(newCat)` → cierra modal
- El ProductForm añade la nueva categoría al dropdown y la selecciona automáticamente

---

### 5. Actualizar server actions de productos

**`src/lib/admin/actions/products.ts`**

Añadir al `productSchema`:
```typescript
ai_reference_image_url: z.string().url().optional().or(z.literal('')),
images: z.string().default('[]'),  // JSON array de URLs
```

En `createProduct`:
```typescript
const images = JSON.parse(parsed.data.images) as string[]
const data = {
  ...parsed.data,
  images,
  ai_reference_image_url: parsed.data.ai_reference_image_url === '' ? null : parsed.data.ai_reference_image_url,
  // cover_image_url ya existía
}
```

En `updateProduct`: mismo tratamiento de `images` y `ai_reference_image_url`.

---

### 6. Actualizar páginas admin de producto

**`src/app/admin/(protected)/productos/nuevo/page.tsx`:**
- Sigue siendo Server Component (carga categorías del servidor)
- Renderiza `<ProductForm action={createProduct} categories={categories} />`

**`src/app/admin/(protected)/productos/[id]/page.tsx`:**
- Renderiza `<ProductForm action={updateWithId} categories={categories} defaultValues={product} />`

---

### 7. Galería interactiva pública

**`src/components/public/ProductGallery.tsx`** — Client component (`'use client'`):
```typescript
interface ProductGalleryProps {
  coverImageUrl: string
  images: string[]
  productName: string
}
```
- Imagen principal grande (por defecto `coverImageUrl`)
- Strip de thumbnails clicables: primer thumbnail = cover, resto = `images`
- Clic en thumbnail → cambia imagen principal con transición suave
- No lightbox (diferente a ProjectGallery)

**`src/app/(public)/edicion-textil/[slug]/page.tsx`:**
- Reemplaza el bloque de cover + static thumbnails por `<ProductGallery coverImageUrl={...} images={product.images} productName={product.name} />`

---

## Archivos

### Nuevos
| Archivo | Responsabilidad |
|---|---|
| `supabase/migrations/005_product_images_bucket.sql` | Bucket `product-images` + políticas |
| `src/app/api/admin/products/upload/route.ts` | Upload de imágenes de producto (y proyecto) |
| `src/lib/admin/actions/categories.ts` | CRUD de categorías |
| `src/app/admin/(protected)/categorias/page.tsx` | Lista y gestión de categorías |
| `src/components/admin/ProductForm.tsx` | Form completo de producto (client) |
| `src/components/admin/CategoryQuickCreate.tsx` | Modal inline nueva categoría |
| `src/components/public/ProductGallery.tsx` | Galería interactiva pública |

### Modificados
| Archivo | Cambio |
|---|---|
| `src/lib/admin/actions/products.ts` | Schema + parsing de `images` y `ai_reference_image_url` |
| `src/app/admin/(protected)/productos/nuevo/page.tsx` | Usa `ProductForm` |
| `src/app/admin/(protected)/productos/[id]/page.tsx` | Usa `ProductForm` |
| `src/components/admin/AdminSidebar.tsx` | Añade link Categorías |
| `src/lib/admin/permissions.ts` | Permisos para `/admin/categorias` |
| `src/app/(public)/edicion-textil/[slug]/page.tsx` | Usa `ProductGallery` |

---

## Fuera de alcance

- Reordenado de galería por drag & drop (interacción compleja; los botones ⬆ ⬇ son suficientes)
- Eliminación de imágenes del bucket Supabase al borrar producto (los objetos son baratos de almacenar)
- Panel de imágenes huérfanas
