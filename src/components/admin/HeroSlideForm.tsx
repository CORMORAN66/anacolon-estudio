'use client'

import { useRef, useState } from 'react'
import type { HeroSlide } from '@/lib/supabase/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props {
  slide?: HeroSlide
  action: (formData: FormData) => Promise<any>
  cancelHref: string
}

type MediaType = 'image' | 'video_url' | 'video_file'

export function HeroSlideForm({ slide, action, cancelHref }: Props) {
  const [mediaType, setMediaType] = useState<MediaType>(slide?.media_type ?? 'image')
  const [imageUrl, setImageUrl] = useState(slide?.image_url ?? '')
  const [videoUrl, setVideoUrl] = useState(slide?.video_url ?? '')
  const [audioUrl, setAudioUrl] = useState(slide?.audio_url ?? '')
  const [focalX, setFocalX] = useState(slide?.focal_x ?? 50)
  const [focalY, setFocalY] = useState(slide?.focal_y ?? 50)
  const [uploading, setUploading] = useState<'image' | 'video' | 'audio' | null>(null)
  const [uploadError, setUploadError] = useState('')
  const imageRef = useRef<HTMLImageElement>(null)

  async function uploadFile(file: File, folder: string): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/admin/hero/upload', { method: 'POST', body: fd })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Error al subir')
    return json.url as string
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading('image')
    try {
      const url = await uploadFile(file, 'images')
      setImageUrl(url)
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setUploading(null)
    }
  }

  async function handleVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading('video')
    try {
      const url = await uploadFile(file, 'videos')
      setVideoUrl(url)
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setUploading(null)
    }
  }

  async function handleAudioFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading('audio')
    try {
      const url = await uploadFile(file, 'audio')
      setAudioUrl(url)
    } catch (err) {
      setUploadError((err as Error).message)
    } finally {
      setUploading(null)
    }
  }

  function handleFocalClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    setFocalX(x)
    setFocalY(y)
  }

  const inputClass =
    'w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold'
  const labelClass = 'text-sm font-medium text-ink block mb-1'

  return (
    <form action={action} className="bg-white rounded-xl border border-zinc-100 p-6 space-y-6">
      {/* Tipo de media */}
      <div>
        <label className={labelClass}>Tipo de media *</label>
        <div className="flex gap-4">
          {(['image', 'video_url', 'video_file'] as MediaType[]).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="media_type"
                value={t}
                checked={mediaType === t}
                onChange={() => setMediaType(t)}
                className="accent-gold"
              />
              <span className="text-sm text-ink">
                {t === 'image' ? 'Imagen' : t === 'video_url' ? 'Video YouTube/Vimeo' : 'Video subido'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Imagen */}
      {mediaType === 'image' && (
        <div>
          <label className={labelClass}>Imagen</label>
          <div className="flex gap-2 mb-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageFile}
              className="hidden"
              id="img-upload"
            />
            <label
              htmlFor="img-upload"
              className="px-4 py-2 bg-zinc-100 text-sm font-medium rounded-lg cursor-pointer hover:bg-zinc-200 transition-colors"
            >
              {uploading === 'image' ? 'Subiendo…' : 'Elegir imagen'}
            </label>
            {imageUrl && (
              <span className="text-xs text-green-600 self-center">✓ Imagen cargada</span>
            )}
          </div>
          {uploadError && <p className="text-xs text-red-600 mb-2">{uploadError}</p>}
          <input type="hidden" name="image_url" value={imageUrl} />

          {/* Focal point */}
          {imageUrl && (
            <div className="mt-3">
              <p className="text-xs text-muted mb-1">
                Punto focal: <strong>{focalX}% {focalY}%</strong> — haz clic en la imagen para ajustar
              </p>
              <div
                className="relative w-full max-w-md h-48 overflow-hidden rounded-lg cursor-crosshair border border-zinc-200"
                onClick={handleFocalClick}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `${focalX}% ${focalY}%` }}
                />
                <div
                  className="absolute w-4 h-4 rounded-full border-2 border-white bg-gold/80 shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: `${focalX}%`, top: `${focalY}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video URL (YouTube / Vimeo) */}
      {mediaType === 'video_url' && (
        <div>
          <label className={labelClass}>URL del video (YouTube o Vimeo)</label>
          <input
            name="video_url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </div>
      )}

      {/* Video subido */}
      {mediaType === 'video_file' && (
        <div>
          <label className={labelClass}>Video (MP4 / WebM)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoFile}
              className="hidden"
              id="vid-upload"
            />
            <label
              htmlFor="vid-upload"
              className="px-4 py-2 bg-zinc-100 text-sm font-medium rounded-lg cursor-pointer hover:bg-zinc-200 transition-colors"
            >
              {uploading === 'video' ? 'Subiendo…' : 'Elegir video'}
            </label>
            {videoUrl && (
              <span className="text-xs text-green-600 self-center">✓ Video cargado</span>
            )}
          </div>
          {uploadError && <p className="text-xs text-red-600 mb-2">{uploadError}</p>}
          {videoUrl && mediaType === 'video_file' && (
            <video
              src={videoUrl}
              className="w-full max-w-md rounded-lg mt-2 h-36 object-cover"
              muted
              preload="metadata"
            />
          )}
          <input type="hidden" name="video_url" value={videoUrl} />
        </div>
      )}

      {/* Hidden inputs para coordenadas del focal point */}
      <input type="hidden" name="focal_x" value={focalX} />
      <input type="hidden" name="focal_y" value={focalY} />

      {/* Audio (opcional, para cualquier tipo) */}
      <div>
        <label className={labelClass}>Audio de fondo (opcional — MP3, OGG, WAV)</label>
        <div className="flex gap-2 mb-1">
          <input
            type="file"
            accept="audio/mpeg,audio/ogg,audio/wav,audio/mp4"
            onChange={handleAudioFile}
            className="hidden"
            id="aud-upload"
          />
          <label
            htmlFor="aud-upload"
            className="px-4 py-2 bg-zinc-100 text-sm font-medium rounded-lg cursor-pointer hover:bg-zinc-200 transition-colors"
          >
            {uploading === 'audio' ? 'Subiendo…' : 'Elegir audio'}
          </label>
          {audioUrl && (
            <>
              <span className="text-xs text-green-600 self-center">✓ Audio cargado</span>
              <button
                type="button"
                onClick={() => setAudioUrl('')}
                className="text-xs text-red-500 hover:underline self-center"
              >
                Quitar
              </button>
            </>
          )}
        </div>
        {audioUrl && <audio src={audioUrl} controls className="w-full max-w-md mt-1" />}
        <input type="hidden" name="audio_url" value={audioUrl} />
      </div>

      {/* Texto superpuesto */}
      <div className="border-t border-zinc-100 pt-4 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Texto superpuesto (opcional)</p>
        <div>
          <label className={labelClass}>Título</label>
          <input
            name="overlay_title"
            defaultValue={slide?.overlay_title ?? ''}
            placeholder="Espacios con alma"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Subtítulo</label>
          <input
            name="overlay_subtitle"
            defaultValue={slide?.overlay_subtitle ?? ''}
            placeholder="Interiorismo consciente en Madrid"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Texto del botón CTA</label>
            <input
              name="cta_text"
              defaultValue={slide?.cta_text ?? ''}
              placeholder="Ver proyectos"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>URL del botón CTA</label>
            <input
              name="cta_url"
              defaultValue={slide?.cta_url ?? ''}
              placeholder="/estudio"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Configuración */}
      <div className="border-t border-zinc-100 pt-4 grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Orden</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={slide?.sort_order ?? 0}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            id="active"
            name="active"
            value="true"
            defaultChecked={slide?.active ?? true}
            className="w-4 h-4 rounded border-zinc-300 accent-gold"
          />
          <label htmlFor="active" className="text-sm font-medium text-ink">Activo</label>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={uploading !== null}
          className="px-6 py-2 bg-gold text-white text-sm font-semibold rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          Guardar
        </button>
        <a
          href={cancelHref}
          className="px-6 py-2 border border-zinc-200 text-ink text-sm font-semibold rounded-lg hover:bg-zinc-50 transition-colors"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
