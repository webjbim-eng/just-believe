import type { Metadata } from 'next'
import type React from 'react'

export const metadata: Metadata = {
  title: 'Just Believe International Missions',
  description:
    "Proclaiming the Gospel of Jesus Christ, equipping believers for spiritual maturity, and mobilizing intercessors worldwide.",
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
