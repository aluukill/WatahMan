'use client'

import { useEffect, useState } from 'react'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Navigation() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let last = 0
    const fn = () => {
      const cur = window.scrollY
      setHidden(cur > last && cur > 100)
      setScrolled(cur > 50)
      last = cur
    }
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${hidden ? '-translate-y-full' : 'translate-y-0'} ${scrolled ? 'glass' : 'bg-transparent'}`} style={{ backdropFilter: scrolled ? 'blur(48px)' : 'none' }}>
      <div className="content-max-w flex items-center justify-between px-8 py-5 mx-auto">
        <a href="#hero" onClick={(e) => handleClick(e, '#hero')} className="text-sm font-display font-bold tracking-[0.1em] text-white/80 hover:text-white transition-colors duration-300 uppercase">
          WATAHMAN
        </a>
        <div className="flex items-center gap-10">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} onClick={(e) => handleClick(e, item.href)} className="text-xs tracking-[0.25em] text-white/50 hover:text-white transition-all duration-300 uppercase relative group font-body font-light">
              {item.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#F59E0B] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a href="#contact" onClick={(e) => handleClick(e, '#contact')} className="text-xs tracking-[0.25em] text-white uppercase px-5 py-2 rounded-full border border-white/10 hover:border-[#F59E0B] hover:bg-[#F59E0B]/10 transition-all duration-300 font-body font-light">
            Let&apos;s Talk
          </a>
        </div>
      </div>
    </nav>
  )
}
