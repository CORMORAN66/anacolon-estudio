import { z } from 'zod'

export const leadSchema = z.object({
  name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email no válido'),
  phone: z.string().optional(),
  inquiry_type: z.string().min(1, 'Selecciona el tipo de consulta'),
  message: z.string().optional(),
  product_id: z.string().uuid().optional(),
  source: z.string().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>
