# Ana Colón Studio — Plataforma Digital Completa
**Spec Date:** 2026-05-26  
**Project Root:** `D:\Claude\Projects\ANACOLON`  
**Production URL:** anacolonestudio.com  
**Status:** Approved for implementation

---

## 1. Visión General

Ana Colón Studio es un estudio de interiorismo consciente en Madrid con una línea textil propia (Edición Textil / Kannatura). Este proyecto construye desde cero la plataforma digital más completa para un estudio de decoración en España: sitio público con SEO, visualizador de espacios con IA, panel de administración completo, y herramientas profesionales (presupuestos PDF, contratos, portal de cliente).

**Objetivo principal:** Convertir visitantes en leads cualificados y clientes activos, y dar a Ana Colón herramientas profesionales para gestionar su negocio desde un solo lugar.

---

## 2. Arquitectura General

```
D:\Claude\Projects\ANACOLON\
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Rutas públicas del sitio
│   │   ├── (admin)/            # Panel de administración (protegido)
│   │   ├── (client-portal)/    # Portal privado del cliente (protegido)
│   │   └── api/                # API Routes (server-side)
│   ├── components/
│   │   ├── public/             # Componentes del sitio público
│   │   ├── admin/              # Componentes del panel admin
│   │   ├── visualizer/         # Módulo AI Visualizador
│   │   └── ui/                 # shadcn/ui base components
│   ├── lib/
│   │   ├── supabase/           # Cliente Supabase + tipos generados
│   │   ├── openai/             # Cliente OpenAI + prompt templates
│   │   ├── pdf/                # Generador PDF (presupuestos/contratos)
│   │   ├── email/              # Plantillas y cliente Resend
│   │   └── cloudinary/         # Upload + transformaciones
│   └── types/                  # TypeScript types globales
├── public/                     # Assets estáticos
├── docs/superpowers/specs/     # Este directorio
└── supabase/
    ├── migrations/             # SQL migrations
    └── seed.sql                # Datos iniciales
```

### Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| Frontend + API | Next.js 15 (App Router) | SSR/SSG para SEO + API Routes server-side |
| Base de datos | Supabase (PostgreSQL) | DB + Auth + Storage + Realtime |
| UI Components | Tailwind CSS + shadcn/ui | Sitio público + admin |
| IA Visualizador | OpenAI `gpt-image-1` | Generación de imágenes con referencia |
| Imágenes / CDN | Cloudinary | Upload, transformación, CDN global |
| Emails | Resend + React Email | Transaccionales: leads, presupuestos, confirmaciones |
| PDF | `@react-pdf/renderer` | Presupuestos y contratos profesionales |
| Deploy | Vercel | CI/CD automático desde main branch |
| Dominio | anacolonestudio.com | DNS apuntando a Vercel |

**Coste de infraestructura estimado:** ~35–50€/mes en producción (Supabase Pro €25 + Cloudinary free tier + Vercel Pro €20 + OpenAI usage variable).

---

## 3. Módulo 1 — Sitio Público

### 3.1 Rutas

| Ruta | Descripción |
|------|------------|
| `/` | Home |
| `/estudio` | Portfolio de proyectos |
| `/estudio/[slug]` | Ficha individual de proyecto |
| `/edicion-textil` | Catálogo de productos textiles |
| `/edicion-textil/[slug]` | Ficha individual de producto |
| `/visualizador` | Visualizador de espacios con IA |
| `/blog` | Listado de artículos |
| `/blog/[slug]` | Artículo individual |
| `/contacto` | Página de contacto |
| `/aviso-legal` | Aviso legal |
| `/privacidad` | Política de privacidad |
| `/cookies` | Política de cookies |

### 3.2 Home (`/`)

**Secciones en orden:**
1. **Hero** — Imagen de fondo a pantalla completa, tagline "Interiorismo Consciente / Espacios con alma", dos CTAs: "Cuéntanos tu proyecto" (→ /contacto) y "Ver nuestros espacios" (→ /estudio)
2. **Servicios** — Dos columnas: Interiorismo + Edición Textil, cada una con descripción breve y CTA
3. **Proyectos destacados** — Grid de 3–4 proyectos recientes (dinámico desde DB)
4. **Visualizador teaser** — Banner "Prueba cómo quedaría en tu espacio" con CTA → /visualizador
5. **Proceso** — 4 pasos horizontales: Consulta → Propuesta → Ejecución → Entrega
6. **Testimonios** — Carrusel de 3–5 testimonios de clientes
7. **Instagram feed** — Grid estático de 6 fotos gestionable desde admin (subida manual), o integración con [Behold.so](https://behold.so) (widget gratuito, sin API keys propias)
8. **CTA final** — "¿Tienes un proyecto? Hablemos." + formulario inline simplificado

### 3.3 Portfolio (`/estudio` + `/estudio/[slug]`)

**Listado:** Grid masonry con hover overlay (nombre + tipo). Filtros: Residencial / Comercial / Reforma.

**Ficha de proyecto:** Hero image · Metadata strip (tipo, m², año, ciudad) · Descripción en 2 columnas · Galería (lightbox) · CTA al final · Navegación prev/next.

**Modelo de datos:**
```typescript
Project {
  id: uuid
  slug: string          // URL-friendly
  name: string
  type: 'residential' | 'commercial' | 'renovation'
  city: string
  area_m2: number
  year: number
  short_description: string   // max 120 chars
  long_description: string    // rich text (HTML)
  cover_image_url: string
  gallery_images: string[]    // array de URLs Cloudinary
  published: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### 3.4 Catálogo Textil (`/edicion-textil` + `/edicion-textil/[slug]`)

**Listado:** Grid de productos con filtro por categoría. Cada tarjeta tiene imagen, nombre, categoría y botón "Ver en mi espacio" (→ abre visualizador con producto preseleccionado).

**Ficha de producto:** Galería de imágenes · Descripción · Especificaciones técnicas (material, dimensiones, colección) · CTA "Solicitar muestras" · CTA "Ver en mi espacio" · Productos relacionados.

**Modelo de datos:**
```typescript
Product {
  id: uuid
  slug: string
  name: string
  category_id: uuid           // FK → ProductCategory
  collection: string          // "Kannatura I", "Kannatura II", etc.
  description: string
  material: string
  dimensions: string
  images: string[]            // Cloudinary URLs
  cover_image_url: string
  ai_reference_image_url: string  // imagen de referencia para el visualizador IA
  active: boolean
  sort_order: number
  created_at: timestamp
}

ProductCategory {
  id: uuid
  name: string                // "Revestimientos", "Estores", "Papeles", "Textiles"
  slug: string
  sort_order: number
}
```

### 3.5 Blog (`/blog` + `/blog/[slug]`)

**Listado:** Grid de artículos con imagen, categoría, título, extracto y fecha.

**Artículo:** Rich text · Imagen destacada · Categoría · Tiempo de lectura · Compartir en redes · Artículos relacionados · CTA al final.

**Modelo:**
```typescript
Post {
  id: uuid
  slug: string
  title: string
  excerpt: string
  content: string           // rich text HTML
  cover_image_url: string
  category: string
  author: string            // "Ana Colón"
  published: boolean
  published_at: timestamp
  reading_time_minutes: number
  seo_title: string
  seo_description: string
  created_at: timestamp
}
```

### 3.6 Contacto (`/contacto`)

**Layout 2 columnas (desktop):**
- Izquierda: Formulario (Nombre, Email, Teléfono opcional, Tipo de consulta [select], Descripción del proyecto [textarea])
- Derecha: Datos de contacto, mapa Google Maps embed, horario showroom

**On submit:** Guardar lead en Supabase + enviar email de notificación a blanca@anacolonestudio.com (via Resend) + email de confirmación al usuario.

### 3.7 SEO Técnico

- `<title>` y `<meta description>` únicos por página (via Next.js Metadata API)
- Schema markup JSON-LD `InteriorDesigner` + `LocalBusiness` en Home
- `sitemap.xml` generado dinámicamente
- `robots.txt`
- Open Graph images por página
- Imágenes con `alt` descriptivo, `loading="lazy"`, `width`/`height` explícitos
- Core Web Vitals optimizados (Next.js Image component, font optimization)

---

## 4. Módulo 2 — Visualizador de Espacios con IA

### 4.1 Flujo de usuario

**Ruta dedicada:** `/visualizador` (ítem en nav principal)  
**Trigger por producto:** botón "Ver en mi espacio" en `/edicion-textil/[slug]` → abre modal o navega a `/visualizador?producto=[slug]`

**Pasos:**
1. **Upload de foto** — Drag & drop o click. Validación: JPG/PNG/HEIC, max 10MB. Preview inmediata. Nota de privacidad ("Tu foto no se guarda. Solo se usa para generar la visualización.")
2. **Selección de producto(s)** — Grid del catálogo activo, multi-selección hasta 3. Si viene con `?producto=`, ese producto aparece pre-seleccionado. Filtros por categoría.
3. **Generación** — Spinner + pasos animados + barra de progreso. Tiempo estimado: 15–25 segundos.
4. **Resultado** — Slider antes/después interactivo + panel de acciones.

### 4.2 Panel de resultado (Opción D)

- Slider interactivo antes/después (drag handle central)
- Botón primario: **"Solicitar muestras"** → pre-rellena formulario de contacto con el producto seleccionado
- Botón secundario: **"Probar otro producto"** → vuelve al paso 2 manteniendo la foto
- Compartir con watermark: Instagram, WhatsApp, descarga directa
- "¿Te gusta el resultado? Cuéntanos tu proyecto" → CTA a /contacto

### 4.3 API Route: `/api/visualize`

```typescript
// POST /api/visualize
// Request:
{
  room_image_base64: string      // imagen del usuario (comprimida en frontend)
  product_ids: string[]          // 1-3 IDs de productos
}

// Response:
{
  result_url: string             // URL Cloudinary de la imagen generada
  generation_id: string          // para tracking
}
```

**Proceso interno:**
1. Descargar `ai_reference_image_url` de cada producto seleccionado desde Cloudinary
2. Construir prompt dinámico basado en categorías de los productos (ej: "Apply this wall covering texture to the walls of this room...")
3. Llamar a `openai.images.edit()` con `gpt-image-1`, pasando imagen del usuario + imágenes de referencia
4. Subir resultado a Cloudinary (carpeta `visualizations/`, con TTL de 24h)
5. Registrar en tabla `Visualization` (para analytics)
6. Devolver URL

**Manejo de errores:** Retry automático (2 intentos), timeout de 60s, mensaje de error amigable al usuario.

**Rate limiting:** Max 5 visualizaciones por IP por hora (via Supabase o middleware).

### 4.4 Modelo de datos

```typescript
Visualization {
  id: uuid
  room_image_url: string       // URL temporal Cloudinary (TTL 24h)
  product_ids: string[]
  result_url: string           // URL resultado Cloudinary
  created_at: timestamp
  ip_hash: string              // para rate limiting (hasheada, no PII)
  led_to_contact: boolean      // true si el usuario luego usó el CTA de contacto
}
```

---

## 5. Módulo 3 — Panel de Administración

### 5.1 Acceso

Ruta: `/admin` — protegida por Supabase Auth (email + contraseña). Solo usuarios con rol `admin` en tabla `profiles`.

### 5.2 Secciones del Admin

#### Dashboard (`/admin`)
- Métricas clave: leads esta semana, visualizaciones IA, proyectos publicados, productos activos
- Feed de leads recientes (con opción de responder rápido)
- Gráfico simple de leads por semana (últimas 8 semanas)

#### Gestión de Productos (`/admin/productos`)
- Tabla con búsqueda, filtro por categoría, toggle activo/inactivo
- Formulario de creación/edición:
  - Nombre, categoría, colección, descripción
  - Uploader de imágenes múltiple con drag & drop (Cloudinary direct upload)
  - Campo específico "Imagen de referencia para IA" (la que usa el visualizador)
  - Especificaciones (material, dimensiones)
  - Vista previa de la ficha pública
- Gestión de categorías (CRUD simple)

#### Gestión de Portfolio (`/admin/portfolio`)
- Tabla con filtro por tipo y estado (publicado/draft)
- Formulario: nombre, tipo, ciudad, m², año, descripción corta y larga (rich text editor)
- Uploader galería con drag & drop y reordenamiento
- Toggle publicar/despublicar

#### Gestión de Blog (`/admin/blog`)
- Listado de artículos con estado
- Editor rich text (TipTap o similar)
- Campos SEO: título meta, descripción meta
- Programar publicación

#### Gestión de Leads (`/admin/leads`)
- Tabla de todos los leads con estado: Nuevo / Contactado / En proyecto / Archivado
- Vista detalle: mensaje completo, fecha, tipo de consulta, producto de interés si viene del visualizador
- Acciones: cambiar estado, añadir nota, crear cliente en CRM, enviar presupuesto

#### Analytics (`/admin/analytics`)
- Visualizaciones IA: total, por producto, conversión a lead
- Leads: total, por canal (contacto, visualizador, blog), por semana
- Productos más vistos, proyectos más visitados

---

## 6. Módulo 4 — CRM + Documentos Profesionales

### 6.1 CRM Clientes (`/admin/clientes`)

**Ficha de cliente:**
- Datos personales: nombre, email, teléfono, dirección
- Tipo: Particular / Empresa
- Fuente: Contacto web / Referido / Instagram / Visualizador IA
- Estado del lead: Prospecto / Activo / Proyecto completado / Archivado
- Historial: proyectos asociados, presupuestos enviados, contratos firmados, notas
- Acciones rápidas: enviar presupuesto, crear proyecto, añadir nota

**Modelo:**
```typescript
Client {
  id: uuid
  name: string
  email: string
  phone: string
  address: string
  client_type: 'individual' | 'company'
  company_name?: string
  nif?: string
  source: 'web' | 'referral' | 'instagram' | 'visualizer' | 'other'
  status: 'prospect' | 'active' | 'completed' | 'archived'
  notes: string
  created_at: timestamp
}
```

### 6.2 Generador de Presupuestos (`/admin/presupuestos`)

**Constructor visual:**
1. Seleccionar cliente (o crear nuevo inline)
2. Datos del proyecto: nombre, descripción, dirección del espacio
3. Partidas del presupuesto (tabla editable):
   - Descripción de la partida
   - Unidades, precio unitario
   - IVA (0% / 10% / 21%)
   - Importe total por partida (calculado)
4. Resumen: subtotal, IVA desglosado, total
5. Condiciones de pago: texto libre (ej: "50% al inicio, 50% a la entrega")
6. Validez del presupuesto: fecha de expiración
7. Notas adicionales

**Acciones:**
- Vista previa PDF en tiempo real
- Guardar borrador
- **Enviar al cliente por email** (Resend) — el cliente recibe email con PDF adjunto + link para aceptar online
- Duplicar presupuesto
- Convertir a proyecto

**PDF Output:**
- Cabecera con logo de Ana Colón Estudio
- Datos del estudio y del cliente
- Tabla de partidas con formato profesional
- Totales con IVA desglosado
- Condiciones de pago y validez
- Firma del presupuesto (generada automáticamente)
- Pie con datos legales (Sánchez Pacheco 47, Madrid · NIF · etc.)

**Modelo:**
```typescript
Quote {
  id: uuid
  quote_number: string        // "PPTO-2026-001" (auto-incremental)
  client_id: uuid
  project_name: string
  project_address: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  items: QuoteItem[]
  subtotal: number
  tax_breakdown: { rate: number, amount: number }[]
  total: number
  payment_terms: string
  valid_until: date
  notes: string
  pdf_url?: string
  sent_at?: timestamp
  accepted_at?: timestamp
  created_at: timestamp
}

QuoteItem {
  id: uuid
  quote_id: uuid
  description: string
  quantity: number
  unit_price: number
  tax_rate: number            // 0, 10, or 21
  total: number
  sort_order: number
}
```

### 6.3 Contratos y Documentos (`/admin/contratos`)

**Plantillas disponibles (editables por el admin):**
1. **Contrato de interiorismo** — Encargo de proyecto, honorarios, plazos, propiedad intelectual, condiciones de resolución
2. **Contrato de edición textil** — Pedido de productos, condiciones de entrega, devoluciones
3. **Carta de encargo** — Versión simplificada para proyectos pequeños
4. **Hoja de visita** — Registro de visita al showroom con datos del cliente y productos de interés

**Variables automáticas:** `{{nombre_cliente}}`, `{{fecha}}`, `{{proyecto}}`, `{{importe}}`, `{{direccion}}`, `{{nif_cliente}}`, etc.

**Flujo:**
1. Seleccionar plantilla
2. Completar variables (formulario o vinculado a cliente/presupuesto)
3. Vista previa del documento
4. Generar PDF firmado
5. Enviar al cliente por email con botón de **firma digital** (firma con nombre + fecha + checkbox de aceptación)

**Modelo:**
```typescript
Contract {
  id: uuid
  contract_number: string     // "CONT-2026-001"
  template_id: uuid
  client_id: uuid
  quote_id?: uuid
  variables: Record<string, string>   // valores rellenados
  status: 'draft' | 'sent' | 'signed' | 'cancelled'
  pdf_url?: string
  sent_at?: timestamp
  signed_at?: timestamp
  signed_by_name?: string
  created_at: timestamp
}
```

### 6.4 Portal del Cliente (`/portal/[token]`)

Acceso mediante link único (token seguro) enviado por email — sin necesidad de crear cuenta.

**El cliente puede:**
- Ver presupuestos pendientes de aprobación → botón "Aceptar presupuesto"
- Ver y firmar contratos → formulario de firma digital (nombre + aceptación)
- Ver estado de su proyecto (fases: consulta / diseño / ejecución / entrega)
- Subir documentos (planos, fotos del espacio)
- Ver historial de documentos firmados

**El cliente NO puede:**
- Editar presupuestos
- Ver datos de otros clientes
- Acceder al panel admin

---

## 7. Base de Datos — Esquema Completo Supabase

### Tablas principales

```sql
-- Auth: gestionado por Supabase Auth (tabla auth.users)
-- Perfil admin
profiles (id, role, name, email)

-- Sitio público
projects (id, slug, name, type, city, area_m2, year, short_description, long_description, cover_image_url, gallery_images, published, created_at, updated_at)
product_categories (id, name, slug, sort_order)
products (id, slug, name, category_id, collection, description, material, dimensions, images, cover_image_url, ai_reference_image_url, active, sort_order, created_at)
posts (id, slug, title, excerpt, content, cover_image_url, category, published, published_at, seo_title, seo_description, created_at)

-- Leads y CRM
leads (id, name, email, phone, inquiry_type, message, product_id, source, status, created_at)
clients (id, name, email, phone, address, client_type, company_name, nif, source, status, notes, created_at)

-- Documentos
quotes (id, quote_number, client_id, project_name, project_address, status, subtotal, total, payment_terms, valid_until, notes, pdf_url, sent_at, accepted_at, created_at)
quote_items (id, quote_id, description, quantity, unit_price, tax_rate, total, sort_order)
contract_templates (id, name, content, variables, created_at, updated_at)
contracts (id, contract_number, template_id, client_id, quote_id, variables, status, pdf_url, sent_at, signed_at, signed_by_name, created_at)

-- Visualizador IA
visualizations (id, product_ids, result_url, created_at, ip_hash, led_to_contact)
```

### Row Level Security (RLS)
- Tablas de contenido público (projects, products, posts): lectura pública, escritura solo admin
- Tablas de negocio (leads, clients, quotes, contracts): solo admin
- Visualizations: inserción pública (anónima), lectura solo admin

---

## 8. Emails Transaccionales (Resend)

| Trigger | Destinatario | Asunto |
|---------|-------------|--------|
| Nuevo lead desde formulario | blanca@anacolonestudio.com | 🔔 Nuevo mensaje de [nombre] |
| Nuevo lead (confirmación) | Cliente | Tu mensaje ha llegado a Ana Colón Estudio |
| Presupuesto enviado | Cliente | Tu presupuesto de Ana Colón Estudio · [número] |
| Contrato enviado | Cliente | Documento para firmar · [número] |
| Contrato firmado | blanca@anacolonestudio.com | ✅ [nombre] ha firmado el contrato |
| Presupuesto aceptado | blanca@anacolonestudio.com | ✅ [nombre] ha aceptado el presupuesto |

---

## 9. Variables de Entorno Necesarias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_BASE_URL=https://anacolonestudio.com
ADMIN_EMAIL=blanca@anacolonestudio.com
```

---

## 10. Plan de Fases

### Fase 1 — Sitio Público (~3–4 semanas)
Setup Next.js 15 + Supabase + Tailwind + shadcn · Diseño system (tipografía, colores, componentes base) · Home · Portfolio con fichas · Catálogo textil · Blog · Contacto + formulario · SEO técnico completo · Deploy en Vercel · DNS

### Fase 2 — AI Visualizador (~2 semanas)
API route `/api/visualize` · Integración OpenAI gpt-image-1 · Upload component · Selector de productos · Slider antes/después · Panel de resultado · Rate limiting · Watermark · Integración en catálogo textil (botón por producto)

### Fase 3 — Panel Admin (~2–3 semanas)
Auth admin (Supabase) · Dashboard con métricas · CRUD productos + categorías · CRUD portfolio · Editor de blog (TipTap) · Gestión de leads · Analytics básico

### Fase 4 — CRM + Documentos (~3 semanas)
CRM clientes · Constructor de presupuestos + PDF · Plantillas de contratos + PDF · Envío por email (Resend) · Firma digital · Portal del cliente (link único)

---

## 11. Decisiones de Diseño Visual

- **Tipografía:** Cormorant Garamond (headers, serif, elegancia) + Inter (body, limpio)
- **Paleta:** Blanco base `#FFFFFF` · Off-white `#F9F7F4` · Negro texto `#1A1A1A` · Acento dorado `#C9A96E` · Gris neutro `#888888`
- **Estilo:** Minimalismo de lujo. Mucho espacio en blanco. Imágenes dominantes. Sin decoraciones superfluas.
- **Animaciones:** Solo fade-in on scroll (Intersection Observer). Sin parallax agresivo.
- **Mobile-first:** Todos los componentes diseñados desde 375px.
- **Admin:** shadcn/ui con tema neutro (zinc). Funcional sobre estético.

---

---

## 12. Aclaraciones Pendientes del Cliente

Los siguientes datos son necesarios antes de entrar a producción pero no bloquean el desarrollo:

| Item | Necesario para | Prioridad |
|------|---------------|-----------|
| NIF/CIF del estudio | PDF presupuestos + contratos + pie legal | Fase 4 |
| Horario showroom (días y horas) | Página de contacto | Fase 1 |
| Fotografía de todos los productos del catálogo | Catálogo + visualizador | Fase 1–2 |
| Textos definitivos (sobre el estudio, proceso, bio) | Home + Estudio | Fase 1 |
| Testimonios reales de clientes | Sección testimonios | Fase 1 |
| Logos de prensa/colaboraciones (si existen) | Home (sección social proof) | Fase 1 |
| Plantillas de contrato (texto legal real) | Módulo contratos | Fase 4 |

> **Nota sobre "firma digital":** La firma implementada es una aceptación simple (nombre + fecha + checkbox de aceptación de condiciones), suficiente para el flujo comercial habitual de un estudio de interiorismo. No es una firma electrónica cualificada (QES) conforme al Reglamento eIDAS — si se requiere validez legal plena para contratos de gran importe, se puede integrar posteriormente con Signaturit o DocuSign.

*Spec aprobado el 2026-05-26. Implementación en D:\Claude\Projects\ANACOLON.*
