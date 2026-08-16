import type { Metadata } from 'next'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { GetInvolvedTabs } from '../../../components/GetInvolvedTabs'

export const metadata: Metadata = {
  title: 'Get Involved — Just Believe International Missions',
  description: 'Volunteer with us, submit a prayer request, or request counseling from Just Believe International Missions.',
}

export default function GetInvolvedPage() {
  return (
    <main>
      <section className="section" style={{ paddingBottom: 0, textAlign: 'center' }}>
        <div className="container container--narrow">
          <ScrollReveal>
            <p className="section-eyebrow">Join Us</p>
            <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
              Get <span className="text-accent">Involved</span>
            </h1>
            <hr className="heading-underline heading-underline--center" />
            <p style={{ fontSize: 'var(--text-subheading)' }}>
              Whether you want to serve, need prayer, or would value a confidential conversation — we&rsquo;re here.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section decorative-flourish">
        <div className="container container--narrow">
          <ScrollReveal>
            <div className="card" style={{ padding: 'var(--card-padding)' }}>
              <GetInvolvedTabs />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
