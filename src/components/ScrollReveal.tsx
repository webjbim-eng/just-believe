'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Thin progressive-enhancement wrapper: server-rendered content is fully
 * present and readable without JS (no opacity:0 baked into SSR markup that
 * would strand content invisible if hydration fails) — the reveal class
 * only gets added client-side once observed, then removed from
 * observation. See .reveal/.reveal.is-visible in globals.css.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: delay ? `${delay}ms` : undefined }}>
      {children}
    </div>
  )
}
