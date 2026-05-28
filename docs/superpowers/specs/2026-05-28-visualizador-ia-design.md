# Visualizador IA — Especificación de Diseño
**Fecha:** 2026-05-28  
**Proyecto:** Ana Colón Estudio (Next.js 16 + Supabase + Vercel)

---

## Resumen

Herramienta pública en `/visualizador` que permite a cualquier visitante subir una foto de su espacio, seleccionar uno o varios productos del catálogo de Ana Colón (o subir imágenes de productos propios), y generar una visualización IA de cómo quedaría el espacio decorado. Al ver el resultado, se invita al cliente a dejar sus datos para recibir una propuesta personalizada de Blanca.

---

## Flujo del cliente

1. **Sube foto del espacio** — drag & drop o clic. JPG/PNG, máx. 10 MB.
2. **Añade productos** — hasta 4, combinando:
   - Del catálogo de Ana Colón (modal con buscador)
   - Imagen propia subida (tela, estor, accesorio externo)
3. **Pulsa "Visualizar"** — spinner + mensaje "La IA está decorando tu espacio…" (~8-15 seg).
4. **Ve el resultado split** — foto original (izquierda) | resultado IA (derecha).
5. **Lead capture** — botón "Me gusta — quiero saber más" abre modal con nombre, email, teléfono → guarda lead en BD con referencia a los productos usados.

---

## Rate limiting

- **Límite:** 3 generaciones gratuitas por dispositivo por día (24 h).
- **Identificación:** combinación de IP del request + UUID almacenado en `localStorage` (fingerprint de dispositivo).
- **Al alcanzar el límite:** mensaje informativo + botón directo al lead capture (el límite se convierte en embudo de conversión).
- **Tabla nueva:** `visualizer_usage` — registra IP, fingerprint, count y fecha.

---

## UI — Estructura de la página

```
Sección hero:
  Título: "Visualizador de Espacios"
  Subtítulo: "Sube tu foto, elige los productos y descubre tu espacio transformado"

Zona de upload:
  Área drag & drop (foto del espacio)
  Previsualización de la foto subida

Zona de productos:
  Chips de productos añadidos (con miniatura y botón ×)
  Botón "+ Del catálogo" → abre CatalogModal
  Botón "+ Foto propia" → file picker

Botón CTA:
  "✨ Visualizar mi espacio"
  - Deshabilitado si no hay foto
  - Loading state: spinner + "La IA está decorando tu espacio…"
  - Límite alcanzado: texto + botón al lead capture

Zona de resultado (aparece tras generar):
  Vista dividida: original | resultado IA
  Botón "Regenerar" (si quedan generaciones disponibles)
  Botón "💛 Me gusta — quiero saber más" → abre lead capture modal

Modal lead capture:
  Título: "¡Este espacio puede ser tuyo!"
  Subtítulo: "Blanca te prepara una propuesta personalizada con estos productos"
  Campos: Nombre, Email, Teléfono
  CTA: "Solicitar mi propuesta"
  → Guarda lead + nombre de productos usados en notes
```

---

## Arquitectura técnica

### Archivos nuevos

| Archivo | Responsabilidad |
|---|---|
| `src/app/(public)/visualizador/page.tsx` | Componente cliente — orquesta todo el flujo |
| `src/app/api/visualizar/route.ts` | API Route — valida rate limit, llama OpenAI, guarda resultado |
| `src/components/public/CatalogModal.tsx` | Modal con buscador de productos del catálogo |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/lib/supabase/types.ts` | Añadir tipo `VisualizerUsage` |
| `supabase/migrations/004_visualizer.sql` | Nueva tabla + bucket Storage |

---

## Base de datos

### Tabla `visualizer_usage`
```sql
create table visualizer_usage (
  id uuid primary key default uuid_generate_v4(),
  ip text not null,
  fingerprint text not null,
  count int not null default 1,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (ip, fingerprint, date)
);
```

### Tabla `leads` (sin cambios de esquema)
- `source` = `'visualizador'`
- `message` = nombres de los productos usados en la visualización
- `notes` = URL de la imagen generada

### Bucket Storage: `visualizaciones`
- Público, para guardar las imágenes generadas por la IA
- Evita que los links de OpenAI expiren

---

## API `/api/visualizar` — Lógica

El cliente NO envía la imagen en base64 al API route (sería hasta 13 MB en JSON).
En cambio, la foto se sube primero a Supabase Storage y se envía la URL.

```
POST /api/visualizar
Body: {
  roomImageUrl: string,          // URL pública en Supabase Storage (bucket "visualizaciones/temp/")
  products: [                    // 1-4 productos
    { name: string, imageUrl: string }
  ],
  fingerprint: string            // UUID del localStorage
}

1. Extrae IP del request headers (x-forwarded-for)
2. Consulta visualizer_usage — si count >= 3 hoy → 429 (generationsLeft: 0)
3. Fetch de roomImageUrl → Buffer → File objeto para el SDK de OpenAI
4. Construye prompt:
   "Interior design visualization. Preserve the room's exact structure,
    lighting, perspective and proportions. Naturally incorporate these
    design elements: [product1 name], [product2 name].
    Result must look realistic and professionally styled."
5. Llama OpenAI images.edit (gpt-image-1) via SDK oficial:
   - image: File (buffer de la foto)
   - prompt: texto construido
   - size: "1024x1024"
6. Sube imagen resultante a bucket "visualizaciones/results/"
7. Upsert en visualizer_usage (incrementa count)
8. Devuelve { resultUrl: string, generationsLeft: number }
```

---

## Dependencias y variables de entorno

**Nueva dependencia npm:**
```
npm install openai
```

**Variables de entorno** (añadir a `.env.local` y a Vercel):
```
OPENAI_API_KEY=sk-...
```

**Archivos modificados adicionales:**
- `src/lib/admin/actions/visualizer.ts` — server action para guardar lead del visualizador
- `package.json` — dependencia `openai`

---

## Lead capture

- **No** usa el endpoint público `/api/leads` (que no permite escribir `notes`)
- Usa una **server action** nueva `src/lib/admin/actions/visualizer.ts` con `createServiceClient`
- Campos guardados: `name`, `email`, `phone`, `source: 'visualizador'`, `message` (nombres de productos), `notes` (URL de la imagen generada), `inquiry_type: 'visualizador'`
- Sin cambios en el esquema de la tabla `leads`

---

## Fuera de alcance (no incluido en esta fase)

- Guardado de visualizaciones en perfil de usuario (requeriría autenticación)
- Panel admin para ver visualizaciones generadas
- Variantes de estilo (realista / boceto / mood board)
- Exportar resultado en PDF o alta resolución
