'use client'

import { useRef, useEffect, useState } from 'react'

interface MouseRef {
  current: { x: number; y: number }
}

export default function CursorGlow({ mouseRef }: { mouseRef: MouseRef }) {
  const glowRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const glow = glowRef.current
    const dot = dotRef.current
    if (!glow || !dot) return

    const handleHoverIn = () => setHovered(true)
    const handleHoverOut = () => setHovered(false)
    const interactive = document.querySelectorAll('a, button, input, textarea, [role="button"]')
    interactive.forEach((el) => {
      el.addEventListener('mouseenter', handleHoverIn)
      el.addEventListener('mouseleave', handleHoverOut)
    })

    let rafId: number
    const loop = () => {
      const mx = mouseRef.current.x; const my = mouseRef.current.y
      const x = (mx + 1) * window.innerWidth / 2; const y = (-my + 1) * window.innerHeight / 2
      glow.style.transform = `translate(${x - 150}px, ${y - 150}px)`
      dot.style.transform = `translate(${x - 3}px, ${y - 3}px)`
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      interactive.forEach((el) => {
        el.removeEventListener('mouseenter', handleHoverIn)
        el.removeEventListener('mouseleave', handleHoverOut)
      })
    }
  }, [mouseRef])

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 w-[6px] h-[6px] rounded-full pointer-events-none z-[999]" style={{
        background: '#FFFFFF',
        transition: 'width 0.3s, height 0.3s',
        width: hovered ? '14px' : '6px',
        height: hovered ? '14px' : '6px',
        boxShadow: '0 0 10px rgba(245,158,11,0.4)',
      }} />
      <div ref={glowRef} className="fixed top-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none z-[998]" style={{
        background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, rgba(16,185,129,0.03) 40%, transparent 70%)',
        transition: 'transform 0.15s ease-out, opacity 0.3s',
        opacity: hovered ? 0.6 : 0.35,
        willChange: 'transform',
      }} />
    </>
  )
}
