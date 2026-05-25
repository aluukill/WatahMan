'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

export default function IntroLoader({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setTimeout(() => onComplete(), 200)
      },
    })

    tl.set(overlayRef.current, { opacity: 1 })
      .set(flashRef.current, { opacity: 1, scale: 0.3 })
      .to(flashRef.current, {
        opacity: 0,
        scale: 4,
        duration: 0.6,
        ease: 'power2.out',
      })
      .fromTo(
        textRef.current,
        { opacity: 0, y: 40, scale: 0.8, filter: 'blur(20px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(
        barRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, ease: 'power2.inOut', transformOrigin: 'left center' },
        '-=0.4'
      )
      .to(barRef.current, {
        scaleX: 0,
        transformOrigin: 'right center',
        duration: 0.5,
        ease: 'power2.inOut',
      })
      .to(
        textRef.current,
        { opacity: 0, y: -30, scale: 0.9, filter: 'blur(15px)', duration: 0.6, ease: 'power2.in' },
        '-=0.3'
      )
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
      })

    return () => { tl.kill() }
  }, [onComplete])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#020205]"
      style={{ opacity: 0 }}
    >
      <div
        ref={flashRef}
        className="absolute inset-0 bg-white pointer-events-none"
        style={{ opacity: 0, transformOrigin: 'center' }}
      />

      <h1
        ref={textRef}
        className="text-[clamp(2.5rem,10vw,8rem)] font-display font-bold tracking-tight text-white select-none"
        style={{ opacity: 0, willChange: 'transform, opacity, filter' }}
      >
        WATAHMAN
      </h1>

      <div className="mt-8 w-32 h-[2px] overflow-hidden">
        <div
          ref={barRef}
          className="w-full h-full bg-gradient-to-r from-accent via-accent-secondary to-accent"
          style={{ transformOrigin: 'left center', transform: 'scaleX(0)' }}
        />
      </div>
    </div>
  )
}
