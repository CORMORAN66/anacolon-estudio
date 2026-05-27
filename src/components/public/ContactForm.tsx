'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { leadSchema, type LeadInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ContactFormProps {
  defaultInquiryType?: string
  defaultMessage?: string
}

export function ContactForm({ defaultInquiryType, defaultMessage }: ContactFormProps) {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      inquiry_type: defaultInquiryType ?? 'interiorismo',
      message: defaultMessage,
      source: 'contact_form',
    },
  })

  async function onSubmit(data: LeadInput) {
    setServerError(null)
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      setSent(true)
    } else {
      setServerError('Ha ocurrido un error. Por favor, inténtalo de nuevo o escríbenos directamente.')
    }
  }

  if (sent) {
    return (
      <div className="text-center py-12">
        <p className="font-heading text-3xl font-bold text-ink mb-3">¡Mensaje recibido!</p>
        <p className="text-muted">Blanca te escribirá en menos de 48 horas. 🙏</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input id="name" {...register('name')} className="mt-1" placeholder="Tu nombre" aria-required="true" />
          {errors.name && <p className="text-red-500 text-xs mt-1" role="alert">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1" placeholder="tu@email.com" aria-required="true" />
          {errors.email && <p className="text-red-500 text-xs mt-1" role="alert">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" {...register('phone')} className="mt-1" placeholder="+34 600 000 000" />
        </div>
        <div>
          <Label htmlFor="inquiry_type">Tipo de consulta *</Label>
          <Select
            defaultValue={defaultInquiryType ?? 'interiorismo'}
            onValueChange={(v) => { if (v) setValue('inquiry_type', v) }}
          >
            <SelectTrigger className="mt-1" id="inquiry_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interiorismo">Proyecto de interiorismo</SelectItem>
              <SelectItem value="muestras">Edición Textil / Muestras</SelectItem>
              <SelectItem value="showroom">Visita al showroom</SelectItem>
              <SelectItem value="general">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="message">Cuéntanos tu proyecto</Label>
        <Textarea
          id="message"
          {...register('message')}
          className="mt-1 min-h-[140px]"
          placeholder="Describe brevemente el espacio, lo que buscas conseguir, plazos si los tienes..."
        />
      </div>

      {serverError && <p className="text-red-500 text-sm" role="alert">{serverError}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gold hover:bg-gold/90 text-white py-6 text-base"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar consulta →'}
      </Button>
    </form>
  )
}
