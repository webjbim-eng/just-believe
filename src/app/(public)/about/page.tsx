import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Just Believe International Missions',
  description: "Christ-centered, faith-based nonprofit committed to advancing God's Kingdom by transforming lives, strengthening families, developing leaders, and serving communities around the world.",
}

const commitments = [
  'Biblical truth as the foundation for every ministry initiative.',
  'Christ-centered discipleship that produces spiritual maturity.',
  'Servant leadership characterized by integrity, humility, and accountability.',
  'Compassionate service that reflects the love of Jesus Christ in practical ways.',
]

export default function AboutPage() {
  return (
    <main>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container container--narrow" style={{ textAlign: 'center' }}>
          <p className="section-eyebrow">About Us</p>
          <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>Just Believe International Missions</h1>
          <p style={{ fontSize: 'var(--text-subheading)' }}>
            A Christ-centered, faith-based nonprofit organization committed to advancing God&rsquo;s Kingdom by transforming
            lives, strengthening families, developing leaders, and serving communities around the world.
          </p>
          <p>
            Founded on the unchanging truth of God&rsquo;s Word, JBIM exists to proclaim the Gospel of Jesus Christ while
            equipping individuals to grow in spiritual maturity, discover their God-given purpose, and become agents of
            lasting transformation within their homes, churches, workplaces, and communities.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid">
            <div className="card">
              <p className="card-eyebrow">Our Mission</p>
              <p style={{ color: 'var(--color-text)' }}>
                To glorify God by making disciples of Jesus Christ, equipping believers for Kingdom service, strengthening
                families, developing ethical leaders, and extending Christ&rsquo;s compassion to communities through
                evangelism, discipleship, education, leadership development, and practical outreach.
              </p>
            </div>
            <div className="card">
              <p className="card-eyebrow">Our Vision</p>
              <p style={{ color: 'var(--color-text)' }}>
                To see individuals, families, churches, and communities transformed by the Gospel of Jesus Christ, raising
                generations of spiritually mature believers and servant leaders who influence every sphere of society for
                the glory of God until Christ returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--primary">
        <div className="container container--narrow">
          <h2 style={{ color: '#fff', textAlign: 'center' }}>Our Approach</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: '2.5rem' }}>
            Our ministry is built upon four foundational commitments.
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1rem' }}>
            {commitments.map((commitment) => (
              <li
                key={commitment}
                style={{
                  color: '#fff',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'var(--radius-card)',
                  padding: '1.25rem 1.5rem',
                }}
              >
                {commitment}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container container--narrow" style={{ textAlign: 'center' }}>
          <p className="section-eyebrow">Our Commitment</p>
          <p style={{ fontSize: 'var(--text-body)' }}>
            As a legally registered nonprofit organization in the United States, Just Believe International Missions is
            committed to faithful stewardship, ethical governance, financial integrity, and accountability in every
            aspect of our work. We strive to honor God through responsible management of the resources entrusted to us
            while partnering with churches, ministries, organizations, volunteers, and supporters who share our passion
            for advancing God&rsquo;s Kingdom.
          </p>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container container--narrow" style={{ textAlign: 'center' }}>
          <h2>Join the Mission</h2>
          <p style={{ fontSize: 'var(--text-subheading)', marginBottom: '2rem' }}>
            Whether through prayer, volunteering, financial partnership, community outreach, or collaborative ministry,
            we invite you to join us in sharing the hope of Jesus Christ and helping transform lives around the world.
          </p>
          <a className="btn-accent" href="/contact">
            Get In Touch
          </a>
        </div>
      </section>
    </main>
  )
}
