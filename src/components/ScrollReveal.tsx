'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * 2026-08-11: rebuilt on `motion` (was hand-rolled IntersectionObserver +
 * CSS transition). Spring physics instead of a fixed ease curve, and
 * MotionConfig at the layout root (reducedMotion="user") handles
 * prefers-reduced-motion for every motion.* component site-wide, so this
 * no longer needs its own guard. `viewport={{ once: true }}` keeps the
 * same "reveal once, don't re-trigger on scroll-back" behavior the old
 * IntersectionObserver version had.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px', amount: 0.15 }}
      transition={{ type: 'spring', stiffness: 90, damping: 18, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  )
}
