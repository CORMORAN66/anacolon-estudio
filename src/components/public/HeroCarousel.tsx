'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { HeroSlide } from '@/lib/supabase/types'

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  return m?.[1] ?? null
}

function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/)
  return m?.[1] ?? null
}

function buildEmbedUrl(videoUrl: string, slideId: string): string {
  const ytId = extractYouTubeId(videoUrl)
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`
  }
  const vimeoId = extractVimeoId(videoUrl)
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1&loop=1&background=1`
  }
  return videoUrl
}

interface SlideProps {
  slide: HeroSlide
  active: boolean
  muted: boolean
  iframeRef?: React.RefObject<HTMLIFrameElement | null>
  videoRef?: React.RefObject<HTMLVideoElement | null>
  audioRef?: React.RefObject<HTMLAudioElement | null>
}

function SlideLayer({ slide, active, muted, iframeRef, videoRef, audioRef }: SlideProps) {
  useEffect(() => {
    if (!active) return
    if (audioRef?.current) {
      audioRef.current.muted = muted
      if (!muted) audioRef.current.play().catch(() => {})
    }
  }, [active, muted, audioRef])

  useEffect(() => {
    if (!videoRef?.current) return
    videoRef.current.muted = muted
  }, [muted, videoRef])

  useEffect(() => {
    if (!iframeRef?.current) return
    const cmd = muted ? 'mute' : 'unMute'
    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: cmd, args: '' }),
      '*'
    )
  }, [muted, iframeRef])

  const overlayGradient =
    'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.5) 100%)'

  return (
    <div
      className="absolute inset-0 transition-opacity duration-700"
      style={{ opacity: active ? 1 : 0, zIndex: active ? 1 : 0 }}
      aria-hidden={!active}
    >
      {/* Fondo del slide */}
      {slide.media_type === 'image' && slide.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slide.image_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: `${slide.focal_x}% ${slide.focal_y}%` }}
        />
      )}

      {slide.media_type === 'video_url' && slide.video_url && active && (
        <iframe
          ref={iframeRef}
          src={buildEmbedUrl(slide.video_url, slide.id)}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scale(1.1)' }}
          allow="autoplay; encrypted-media"
          frameBorder="0"
          title="hero video"
        />
      )}

      {slide.media_type === 'video_file' && slide.video_url && (
        <video
          ref={videoRef}
          src={slide.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay={active}
          muted={muted}
          loop
          playsInline
        />
      )}

      {/* Audio de fondo (imagen + audio) */}
      {slide.audio_url && slide.media_type === 'image' && (
        <audio ref={audioRef} src={slide.audio_url} loop autoPlay muted={muted} />
      )}

      {/* Gradiente oscuro */}
      <div className="absolute inset-0" style={{ background: overlayGradient }} />

      {/* Contenido superpuesto */}
      {(slide.overlay_title || slide.overlay_subtitle || slide.cta_text) && (
        <div className="relative z-10 h-full flex items-end pb-20 px-8 md:px-16 max-w-5xl mx-auto">
          <div>
            {slide.overlay_title && (
              <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">
                {slide.overlay_title}
              </h1>
            )}
            {slide.overlay_subtitle && (
              <p className="text-lg md:text-xl text-white/85 mb-6 max-w-lg">
                {slide.overlay_subtitle}
              </p>
            )}
            {slide.cta_text && slide.cta_url && (
              <Link
                href={slide.cta_url}
                className="inline-block px-8 py-3 bg-gold hover:bg-gold/90 text-white font-semibold rounded-lg transition-colors"
              >
                {slide.cta_text}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  slides: HeroSlide[]
}

export function HeroCarousel({ slides }: Props) {
  const [current, setCurrent] = useState(0)
  const [muted, setMuted] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])

  const hasSound = slides.some(
    (s) => s.media_type === 'video_url' || s.media_type === 'video_file' || s.audio_url
  )
  const currentSlide = slides[current]
  const currentHasSound =
    currentSlide &&
    (currentSlide.media_type === 'video_url' ||
      currentSlide.media_type === 'video_file' ||
      !!currentSlide.audio_url)

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length < 2) return
    timerRef.current = setInterval(advance, 6000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [advance, slides.length])

  function goTo(idx: number) {
    setCurrent(idx)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(advance, 6000)
  }

  if (slides.length === 0) return null

  return (
    <section className="relative w-full min-h-[90vh] overflow-hidden bg-zinc-900">
      {slides.map((slide, i) => {
        const iframeRef = { current: iframeRefs.current[i] ?? null } as React.RefObject<HTMLIFrameElement | null>
        const videoRef = { current: videoRefs.current[i] ?? null } as React.RefObject<HTMLVideoElement | null>
        const audioRef = { current: audioRefs.current[i] ?? null } as React.RefObject<HTMLAudioElement | null>
        return (
          <SlideLayer
            key={slide.id}
            slide={slide}
            active={i === current}
            muted={muted}
            iframeRef={slide.media_type === 'video_url' ? iframeRef : undefined}
            videoRef={slide.media_type === 'video_file' ? videoRef : undefined}
            audioRef={slide.audio_url && slide.media_type === 'image' ? audioRef : undefined}
          />
        )
      })}

      {/* Controles inferiores */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-3">
        {slides.length > 1 &&
          slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className="transition-all duration-300 rounded-full bg-white/70 hover:bg-white"
              style={{
                width: i === current ? '2rem' : '0.5rem',
                height: '0.5rem',
              }}
            />
          ))}
      </div>

      {/* Botón mute/unmute — solo si el slide actual tiene audio */}
      {currentHasSound && (
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Activar sonido' : 'Silenciar'}
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors text-white"
        >
          {muted ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
      )}
    </section>
  )
}
