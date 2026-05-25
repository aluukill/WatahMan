'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)
  const [formState, setFormState] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'top 30%',
          toggleActions: 'play none none reverse',
        },
      })

      tl.fromTo(panelRef.current, { opacity: 0, y: 60, scale: 0.95, filter: 'blur(15px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power3.out' })

      if (formRef.current) {
        const inputs = formRef.current.querySelectorAll('.form-field')
        tl.fromTo(inputs, { opacity: 0, y: 30, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.12, ease: 'power2.out' }, '-=0.6')
        tl.fromTo(formRef.current.querySelector('.form-btn'), { opacity: 0, scale: 0.85, filter: 'blur(5px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'back.out(1.7)' }, '-=0.2')
      }

      tl.to(orbRef.current, { scale: 1.15, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' }, '-=0.5')
    })

    return () => ctx.revert()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault() }

  return (
    <section id="contact" ref={sectionRef} className="relative min-h-screen flex items-center justify-center py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-t from-[#F59E0B]/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-[#F59E0B]/5 blur-[120px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-[#10B981]/5 blur-[100px] pointer-events-none" />

      <div ref={panelRef} className="content-max-w glass rounded-3xl p-10 md:p-16 lg:p-20 relative overflow-hidden" style={{ willChange: 'transform, opacity, filter' }}>
        <div ref={orbRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 40%, rgba(245,158,11,0.08) 0%, rgba(16,185,129,0.04) 30%, transparent 60%)',
          willChange: 'transform',
        }} />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <span className="text-[10px] tracking-[0.4em] text-[#F59E0B] uppercase mb-4 inline-block">Get in Touch</span>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-gradient mb-6">
            Let&apos;s Create<br />
            <span className="text-gradient-accent">Something</span><br />
            Extraordinary
          </h2>
          <p className="text-sm md:text-base text-white/40 font-light mb-12 max-w-md mx-auto">
            Have a project in mind? We&apos;d love to hear about it. Drop us a message and let&apos;s build the future together.
          </p>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
            <div className="form-field grid md:grid-cols-2 gap-5">
              <input type="text" name="name" placeholder="Your Name" value={formState.name} onChange={handleChange}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-[#F59E0B]/50 focus:bg-[#F59E0B]/[0.03] focus:shadow-[0_0_30px_rgba(245,158,11,0.1)]" />
              <input type="email" name="email" placeholder="Your Email" value={formState.email} onChange={handleChange}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-[#10B981]/50 focus:bg-[#10B981]/[0.03] focus:shadow-[0_0_30px_rgba(16,185,129,0.1)]" />
            </div>
            <textarea name="message" placeholder="Your Message" rows={4} value={formState.message} onChange={handleChange}
              className="form-field w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 focus:border-[#F59E0B]/50 focus:bg-[#F59E0B]/[0.03] focus:shadow-[0_0_30px_rgba(245,158,11,0.1)] resize-none" />
            <button type="submit"
              className="form-btn relative group overflow-hidden rounded-xl px-10 py-4 text-xs tracking-[0.3em] uppercase text-white font-medium transition-all duration-500 w-full">
              <span className="absolute inset-0 bg-gradient-to-r from-[#F59E0B] via-[#10B981] to-[#F59E0B] bg-[length:200%_100%] animate-shimmer transition-all duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Send Message
                <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
