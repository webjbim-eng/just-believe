import type { Metadata } from 'next'
import { renderHeadingWithAccent } from '../../../lib/renderHeadingWithAccent'
import { Accordion } from '../../../components/Accordion'
import { ministryDefinitions } from '../../../seed/ministries'

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
          <h1 style={{ fontSize: 'var(--text-heading-lg)' }}>
            {renderHeadingWithAccent('Just Believe International Missions', 'International Missions')}
          </h1>
          <hr className="heading-underline heading-underline--center" />
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
          <div className="split-layout">
            <div
              className="split-layout-media"
              style={{
                backgroundImage: 'url(/images/worship-service.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 'var(--radius-card)',
                aspectRatio: '4 / 5',
                boxShadow: 'var(--shadow-card-lg)',
              }}
            />
            <div>
              <p className="section-eyebrow">Our Mission</p>
              <h2 style={{ fontSize: 'var(--text-heading)' }}>
                To glorify God by making disciples of Jesus Christ, <span className="text-accent">equipping believers</span>{' '}
                for Kingdom service.
              </h2>
              <p style={{ fontSize: 'var(--text-body)', marginBottom: '2rem' }}>
                Strengthening families, developing ethical leaders, and extending Christ&rsquo;s compassion to
                communities through evangelism, discipleship, education, leadership development, and practical
                outreach.
              </p>
              <hr className="heading-underline" />
              <p className="section-eyebrow">Our Vision</p>
              <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text)' }}>
                To see individuals, families, churches, and communities transformed by the Gospel of Jesus Christ,
                raising generations of spiritually mature believers and servant leaders who influence every sphere of
                society for the glory of God until Christ returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container container--narrow">
          <h2 style={{ textAlign: 'center' }}>
            What <span className="text-accent">We Do</span>
          </h2>
          <hr className="heading-underline heading-underline--center" />
          <p style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            Lasting change begins with transformed hearts — through evangelism, discipleship, leadership development,
            prayer, and compassionate outreach.
          </p>
          <Accordion items={ministryDefinitions.map((ministry) => ({ title: ministry.name, body: ministry.description }))} />
        </div>
      </section>

      <section className="section section--primary">
        <div className="container container--narrow">
          <h2 style={{ color: '#fff', textAlign: 'center' }}>
            Our <span className="text-accent">Approach</span>
          </h2>
          <hr className="heading-underline heading-underline--center" />
          <p style={{ color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: '2.5rem' }}>
            Our ministry is built upon four foundational commitments.
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1.75rem' }}>
            {commitments.map((commitment, index) => (
              <li key={commitment} className="numbered-item" style={{ borderBottom: index < commitments.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none', paddingBottom: '1.75rem' }}>
                <span className="numbered-item-index" style={{ opacity: 0.85 }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span style={{ color: '#fff', fontSize: 'var(--text-body)' }}>{commitment}</span>
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
          <h2>
            Join the <span className="text-accent">Mission</span>
          </h2>
          <hr className="heading-underline heading-underline--center" />
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
