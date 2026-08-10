'use client'

import { motion, type Transition } from 'motion/react'
import type { ReactNode } from 'react'

const containerVariants = {
  hidden: {},
  visible: (staggerDelay: number) => ({
    transition: { staggerChildren: staggerDelay, delayChildren: 0.05 },
  }),
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const itemTransition: Transition = { type: 'spring', stiffness: 100, damping: 18 }

/**
 * Cascading-children counterpart to ScrollReveal — for card grids and
 * lists (PhotoCaptionGrid, MinistryFeatureGrid, /ministries' directory)
 * where every item fading in at once reads as flat/mechanical.
 * `Stagger` triggers once on scroll-into-view and hands the timing down;
 * each `StaggerItem` just declares hidden/visible, no viewport logic of
 * its own — same "everything is emphasized, nothing is emphasized" fix
 * the wider design directive calls for, applied to motion timing.
 */
export function Stagger({
  children,
  className,
  staggerDelay = 0.08,
  role,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
  /** motion.div renders a real <div> — role/aria-* pass through like any DOM attribute, e.g. role="list" when StaggerItem children should read as listitem to assistive tech. */
  role?: string
}) {
  return (
    <motion.div
      className={className}
      role={role}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -60px 0px', amount: 0.1 }}
      variants={containerVariants}
      custom={staggerDelay}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return (
    <motion.div className={className} role={role} variants={itemVariants} transition={itemTransition}>
      {children}
    </motion.div>
  )
}
