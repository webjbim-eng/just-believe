import type { Metadata } from 'next'

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
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container container--narrow">
          <p className="section-eyebrow">Get In Touch</p>
          <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
            Contact <span className="text-accent">Us</span>
          </h1>
          <hr className="heading-underline heading-underline--center" />
          <p style={{ fontSize: 'var(--text-subheading)', marginBottom: '3rem' }}>
            Whether through prayer, volunteering, financial partnership, community outreach, or collaborative ministry —
            we&rsquo;d love to hear from you.
          </p>
          <div className="grid">
            {contactLinks.map((link) => (
              <a key={link.label} href={link.href} className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
                <p className="card-eyebrow">{link.label}</p>
                <p style={{ color: 'var(--color-text)', fontWeight: 600, margin: 0 }}>{link.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
