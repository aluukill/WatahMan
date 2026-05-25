'use client'

import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const charRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const chars = charRefs.current.filter(Boolean) as HTMLSpanElement[]
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.fromTo(
      taglineRef.current?.querySelectorAll('.tw') || [],
      { opacity: 0, x: -40, filter: 'blur(12px)' },
      { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.1, ease: 'power2.out' }
    )

    chars.forEach((char, i) => {
      tl.fromTo(
        char,
        {
          opacity: 0,
          y: -80,
          scale: 3,
          rotation: i % 2 === 0 ? -30 : 30,
          filter: 'blur(25px)',
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'back.out(1.8)',
        },
        `-=0.${Math.max(4, 7 - i)}`
      )
    })

    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.01 },
      `-=${0.2 + chars.length * 0.035}`
    )

    tl.to(cursorRef.current, { opacity: 0, duration: 0.4, repeat: -1, yoyo: true, ease: 'steps(1)' }, '-=0.1')

    tl.fromTo(scrollRef.current, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.1')
      .to(scrollRef.current, { y: 10, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })

    tl.fromTo(glowRef.current, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, ease: 'power2.out' }, '-=1.5')

    return () => { tl.kill() }
  }, [])

  const setCharRef = useCallback((el: HTMLSpanElement | null, i: number) => { charRefs.current[i] = el }, [])

  const titleChars = 'WATAHMAN'.split('')

  return (
    <section id="hero" ref={sectionRef} className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ pointerEvents: 'none' }}>
      <div ref={glowRef} className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full pointer-events-none" style={{
        background: 'radial-gradient(circle at center, rgba(245,158,11,0.08) 0%, rgba(16,185,129,0.03) 30%, rgba(249,115,22,0.015) 50%, transparent 70%)',
        willChange: 'transform, opacity',
      }} />

      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
        <div ref={taglineRef} className="flex items-center gap-4 text-[10px] tracking-[0.45em] text-white/20 uppercase mb-2 font-body font-light">
          <span className="tw inline-block w-8 h-px bg-white/10" />
          {['Where', 'Vision', 'Meets', 'Motion'].map((w, i) => (
            <span key={i} className="tw inline-block">{w}</span>
          ))}
          <span className="tw inline-block w-8 h-px bg-white/10" />
        </div>

        <h1 ref={titleRef} className="flex flex-wrap items-center justify-center gap-[0.02em] text-[clamp(3.5rem,15vw,12rem)] font-display font-bold leading-none tracking-tight text-white select-none">
          {titleChars.map((char, i) => (
            <span key={i} ref={(el) => setCharRef(el, i)} className="inline-block" style={{
              willChange: 'transform, opacity, filter',
              textShadow: '0 0 60px rgba(245,158,11,0.2), 0 0 120px rgba(245,158,11,0.08)',
            }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>

        <div className="flex items-center gap-4 my-1">
          <span className="w-16 h-px bg-gradient-to-r from-transparent via-[#F59E0B] to-transparent" />
          <span className="w-2 h-2 rotate-45 border border-[#F59E0B]/50" />
          <span className="w-16 h-px bg-gradient-to-r from-transparent via-[#10B981] to-transparent" />
        </div>

        <p ref={subtitleRef} className="text-sm md:text-base tracking-[0.3em] text-white/30 uppercase font-light max-w-xl mx-auto font-body">
          Crafting immersive digital realities
          <span ref={cursorRef} className="inline-block ml-1 w-[2px] h-[1em] bg-[#F59E0B] align-middle" style={{ opacity: 0 }}>_</span>
        </p>
      </div>

      <div ref={scrollRef} className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3" style={{ willChange: 'transform, opacity' }}>
        <span className="text-[9px] tracking-[0.45em] text-white/12 uppercase font-body font-light">Scroll</span>
        <div className="w-px h-20 bg-gradient-to-b from-[#F59E0B]/40 via-[#10B981]/20 to-transparent" />
      </div>
    </section>
  )
}
