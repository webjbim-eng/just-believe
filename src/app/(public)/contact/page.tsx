import type { Metadata } from 'next'
import { ScrollReveal } from '../../../components/ScrollReveal'
import { Stagger, StaggerItem } from '../../../components/Stagger'
import { ContactForm } from '../../../components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Just Believe International Missions',
  description: 'Get in touch with Just Believe International Missions.',
}

const contactLinks = [
  { label: 'Email', value: 'justbelieveinthot@gmail.com', href: 'mailto:justbelieveinthot@gmail.com' },
  { label: 'YouTube', value: '@jbiminc', href: 'https://youtube.com/@jbiminc?si=Q26o6jq34zseGPaF' },
  { label: 'Facebook', value: 'Just Believe International Missions', href: 'https://www.facebook.com/profile.php?id=61570983282514' },
]

export default function ContactPage() {
  return (
    <main>
      <section className="section decorative-flourish">
        <div className="container">
          <ScrollReveal>
            <div className="split-layout">
              <div
                className="split-layout-media"
                style={{
                  backgroundImage: 'url(/images/hands-on-bible.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 'var(--radius-card)',
                  aspectRatio: '4 / 5',
                  boxShadow: 'var(--shadow-card-lg)',
                }}
              />
              <div>
                <p className="section-eyebrow">Get In Touch</p>
                <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
                  Contact <span className="text-accent">Us</span>
                </h1>
                <hr className="heading-underline" />
                <p style={{ fontSize: 'var(--text-subheading)', marginBottom: '2rem' }}>
                  Whether through prayer, volunteering, financial partnership, community outreach, or collaborative
                  ministry — we&rsquo;d love to hear from you.
                </p>
                <Stagger role="list" staggerDelay={0.1}>
                  {contactLinks.map((link, index) => (
                    <StaggerItem key={link.label} role="listitem">
                      <a
                        href={link.href}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '1rem',
                          padding: '1rem 0',
                          textDecoration: 'none',
                          borderBottom: index < contactLinks.length - 1 ? '1px solid var(--color-border)' : 'none',
                        }}
                      >
                        <span className="card-eyebrow" style={{ minWidth: '5.5rem', margin: 0 }}>
                          {link.label}
                        </span>
                        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{link.value}</span>
                      </a>
                    </StaggerItem>
                  ))}
                </Stagger>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container container--narrow">
          <ScrollReveal>
            <h2 style={{ textAlign: 'center' }}>Send Us a Message</h2>
            <hr className="heading-underline heading-underline--center" />
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
