'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const statsContainerRef = useRef<HTMLDivElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)
  const separatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          if (separatorRef.current) {
            const s = Math.min(1, self.progress * 3)
            separatorRef.current.style.transform = `scaleX(${s})`
            separatorRef.current.style.opacity = String(s)
          }
        },
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'top 30%',
          toggleActions: 'play none none reverse',
        },
      })

      tl.fromTo(maskRef.current, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power3.inOut' })
        .fromTo(panelRef.current, { opacity: 0, y: 80, scale: 0.92, filter: 'blur(20px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out' }, '-=0.6')

      const lines = titleRef.current?.querySelectorAll('.line')
      if (lines && lines.length > 0) {
        tl.fromTo(lines, { y: 60, opacity: 0, rotateX: -15, filter: 'blur(5px)' }, { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12, ease: 'power2.out' }, '-=0.6')
      }

      tl.fromTo(textRef.current, { opacity: 0, y: 30, filter: 'blur(5px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' }, '-=0.4')

      const stats = statsContainerRef.current?.querySelectorAll('.stat-item')
      if (stats && stats.length > 0) {
        tl.fromTo(stats, { opacity: 0, y: 30, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.6)' }, '-=0.3')
      }
    })

    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="relative min-h-screen py-32 px-6">
      <div ref={separatorRef} className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/30 to-transparent" style={{ transformOrigin: 'center', opacity: 0 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F59E0B]/[0.015] to-transparent pointer-events-none" />

      <div className="content-max-w mx-auto">
        <div ref={maskRef} className="inline-block mb-10" style={{ willChange: 'clip-path' }}>
          <span className="text-xs tracking-[0.4em] text-[#F59E0B]/60 uppercase font-medium">About the studio</span>
        </div>

        <div ref={panelRef} className="glass rounded-3xl p-10 md:p-16 lg:p-20 relative overflow-hidden" style={{ willChange: 'transform, opacity, filter' }}>
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#F59E0B]/5 blur-[100px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#10B981]/5 blur-[100px]" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div>
              <h2 ref={titleRef} className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight">
                <span className="line block text-gradient">Crafting</span>
                <span className="line block text-gradient-accent">Digital</span>
                <span className="line block text-gradient">Realities</span>
              </h2>
            </div>
            <div className="space-y-8">
              <p ref={textRef} className="text-sm md:text-base leading-relaxed text-white/50 font-light">
                We blend cutting-edge technology with cinematic artistry to create immersive digital experiences that transcend the ordinary. Every project is an opportunity to push the boundaries of what&apos;s possible on the web.
              </p>
              <div ref={statsContainerRef} className="flex flex-wrap gap-8 md:gap-12">
                {[
                  { value: '08+', label: 'Years Experience' },
                  { value: '120+', label: 'Projects Delivered' },
                  { value: '30+', label: 'Global Clients' },
                ].map((stat, i) => (
                  <div key={i} className="stat-item space-y-1">
                    <span className="text-3xl md:text-4xl font-display font-bold text-gradient-accent">{stat.value}</span>
                    <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
