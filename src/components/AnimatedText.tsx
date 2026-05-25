'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface Props {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  animation?: 'chars' | 'words' | 'fade'
  delay?: number
  stagger?: number
}

export default function AnimatedText({
  text,
  className = '',
  as: Tag = 'h1',
  animation = 'chars',
  delay = 0,
  stagger = 0.03,
}: Props) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const targets = animation === 'chars'
      ? el.querySelectorAll('.ac')
      : animation === 'words'
        ? el.querySelectorAll('.aw')
        : [el]

    if (!targets.length) return

    const tl = gsap.timeline({ delay })
    tl.fromTo(
      targets,
      { opacity: 0, y: 60, scale: 1.2, filter: 'blur(15px)' },
      { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.9, stagger, ease: 'back.out(1.6)' }
    )

    return () => { tl.kill() }
  }, [text, animation, delay, stagger])

  const renderContent = () => {
    if (animation === 'chars') {
      return text.split('').map((char, i) => (
        <span key={i} className="ac inline-block" style={{ willChange: 'transform, opacity, filter' }}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))
    }
    if (animation === 'words') {
      return text.split(' ').map((word, i) => (
        <span key={i} className="aw inline-block" style={{ willChange: 'transform, opacity, filter' }}>
          {word}{i < text.split(' ').length - 1 ? '\u00A0' : ''}
        </span>
      ))
    }
    return text
  }

  return (
    <Tag ref={containerRef as React.Ref<HTMLDivElement>} className={className}>
      {renderContent()}
    </Tag>
  )
}
