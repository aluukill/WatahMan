'use client'

import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const projects = [
  {
    title: 'NEXUS',
    category: 'Interactive Experience',
    description: 'An immersive WebGL journey through a cyberpunk metropolis with real-time audio reactivity.',
    color: '#F59E0B',
    gradient: 'from-amber-500/20 to-emerald-500/10',
  },
  {
    title: 'AETHER',
    category: '3D Configurator',
    description: 'Real-time product configurator with ray-traced reflections and physics-based interactions.',
    color: '#10B981',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    title: 'OBLIVION',
    category: 'Brand Experience',
    description: 'Cinematic brand launch campaign featuring procedural animations and generative visuals.',
    color: '#F97316',
    gradient: 'from-orange-500/20 to-amber-500/10',
  },
]

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([null, null, null])
  const titleRef = useRef<HTMLHeadingElement>(null)

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

      tl.fromTo(titleRef.current, { opacity: 0, y: 60, rotateX: -15, filter: 'blur(10px)' }, { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', duration: 1, ease: 'power3.out' })

      cardsRef.current.forEach((card, i) => {
        if (!card) return
        tl.fromTo(card, { opacity: 0, y: 100, scale: 0.85, filter: 'blur(15px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }, i === 0 ? '-=0.3' : '-=0.5')
        const content = card.querySelector('.card-inner')
        if (content) {
          tl.fromTo(content, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        }
      })
    })

    return () => ctx.revert()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardsRef.current[index]
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left; const y = e.clientY - rect.top
    const cx = rect.width / 2; const cy = rect.height / 2
    card.style.transform = `perspective(1000px) rotateX(${((y - cy) / cy) * -8}deg) rotateY(${((x - cx) / cx) * 8}deg) scale3d(1.02,1.02,1.02)`
    const glow = card.querySelector('.card-glow') as HTMLElement
    if (glow) { glow.style.setProperty('--gx', `${(x / rect.width) * 100}%`); glow.style.setProperty('--gy', `${(y / rect.height) * 100}%`); glow.style.opacity = '1' }
  }, [])

  const handleMouseLeave = useCallback((index: number) => {
    const card = cardsRef.current[index]
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
    const glow = card.querySelector('.card-glow') as HTMLElement
    if (glow) glow.style.opacity = '0'
  }, [])

  const setRef = (el: HTMLDivElement | null, i: number) => { cardsRef.current[i] = el }

  return (
    <section id="projects" ref={sectionRef} className="relative min-h-screen py-32 px-6">
      <div className="content-max-w mx-auto">
        <h2 ref={titleRef} className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-gradient mb-16 md:mb-20" style={{ willChange: 'transform, opacity, filter' }}>
          Selected Work
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {projects.map((project, i) => (
            <div key={i} ref={(el) => setRef(el, i)} onMouseMove={(e) => handleMouseMove(e, i)} onMouseLeave={() => handleMouseLeave(i)}
              className="group relative rounded-3xl overflow-hidden cursor-pointer transition-transform duration-200 ease-out"
              style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity, filter' }}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl`} />
              <div className="card-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 rounded-3xl"
                style={{ background: `radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), ${project.color}15 0%, transparent 60%)` }} />

              <div className="card-inner glass rounded-3xl p-8 md:p-10 h-full flex flex-col relative z-10 transition-all duration-500 group-hover:bg-white/[0.06]">
                <div className="space-y-6 flex flex-col flex-1">
                  <div>
                    <span className="inline-block text-[10px] tracking-[0.3em] uppercase mb-3 font-medium" style={{ color: project.color }}>{project.category}</span>
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white group-hover:text-gradient-accent transition-all duration-500">{project.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-white/40 group-hover:text-white/60 transition-colors duration-500 flex-1">{project.description}</p>
                  <div className="flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-white/30 group-hover:text-white/60 transition-colors duration-500">
                    <span>View Project</span>
                    <span className="inline-block w-0 h-px bg-[#F59E0B] group-hover:w-8 transition-all duration-500" />
                    <span className="inline-block transform -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500">→</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[100px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" style={{ background: project.color }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
