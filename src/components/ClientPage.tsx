'use client'

import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import dynamic from 'next/dynamic'

import Navigation from './Navigation'
import Hero from './Hero'
import About from './About'
import Projects from './Projects'
import Contact from './Contact'
import CursorGlow from './CursorGlow'
import IntroLoader from './IntroLoader'

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false })

gsap.registerPlugin(ScrollTrigger)

export default function ClientPage() {
  const mouseRef = useRef({ x: 0, y: 0 })
  const scrollProgress = useRef(0)
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })

    lenis.on('scroll', (e: { progress: number }) => {
      scrollProgress.current = e.progress
      ScrollTrigger.update()
    })

    const tickerFn = (time: number) => { lenis.raf(time * 1000) }
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) { lenis.scrollTo(value!) }
        return lenis.scroll ?? 0
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
      },
      pinType: document.body.style.transform ? 'transform' : 'fixed',
    })

    ScrollTrigger.refresh()

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      }
    }
    window.addEventListener('mousemove', handleMouse, { passive: true })

    return () => {
      lenis.destroy()
      gsap.ticker.remove(tickerFn)
      window.removeEventListener('mousemove', handleMouse)
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <>
      {!introDone && <IntroLoader onComplete={() => setIntroDone(true)} />}

      <CursorGlow mouseRef={mouseRef} />
      <Scene3D mouseRef={mouseRef} scrollProgress={scrollProgress} />
      <Navigation />

      <div className="vignette" />
      <div className="grain" />
      <div className="scanline" />

      <main className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Contact />

        <footer className="relative py-16 px-6">
          <div className="content-max-w mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <span className="text-xs tracking-[0.3em] text-white/20 uppercase font-body font-light">
              WATAHMAN © {new Date().getFullYear()}
            </span>
            <div className="flex items-center gap-8">
              {['Twitter', 'GitHub', 'Dribbble'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs tracking-[0.2em] text-white/20 hover:text-white/60 transition-colors duration-300 uppercase font-body font-light"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
