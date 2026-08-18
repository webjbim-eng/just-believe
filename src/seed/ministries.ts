/**
 * Real ministry copy, verbatim from docs/source/About us -
 * JustBelieveInt.docx's "What We Do" section — not placeholder content.
 * Seeded as actual Ministry records so MinistryFeatureGrid (homepage) and
 * /ministries have real content instead of an empty state.
 *
 * shortDescription (2026-08-11): one sentence each, condensed from the
 * existing `description` copy below (not new claims) — for card/overview
 * contexts. `description` is the full text, individual ministry page
 * only; never render it in a card grid (2026-08-11 design directive).
 *
 * image: a real, licensed stock photo path — same "mood-appropriate
 * photography, not a claim of a specific real event" reasoning already
 * used everywhere else on the site. Not a Payload `media` upload (the
 * schema's `image` field expects one), since seeding real Media documents
 * for purely decorative fallback imagery is unnecessary complexity — an
 * admin can upload a real photo via /admin's `image` field for any
 * ministry at any time, which will automatically take over from this
 * fallback without any component changes (see MinistryContentCard /
 * ministries pages, which check ministry.image first).
 */
export type MinistrySeed = {
  name: string
  shortDescription: string
  description: string
  image: string
}

export const ministryDefinitions: MinistrySeed[] = [
  {
    name: 'Evangelism & Discipleship',
    shortDescription: 'Proclaiming the Gospel and building lifelong disciples through outreach, teaching, and missions.',
    description:
      'We proclaim the Gospel of Jesus Christ through outreach programs, Bible teaching, conferences, missions, digital ministry, and structured discipleship. Our goal is to help believers develop an authentic and lifelong relationship with Christ, firmly rooted in Scripture and empowered by the Holy Spirit.',
    image: '/images/worship-service.jpg',
  },
  {
    name: 'Prayer & Intercession',
    shortDescription: 'Raising intercessors who stand in the gap for individuals, families, churches, and nations.',
    description:
      'Prayer is central to everything we do. JBIM raises intercessors, gatekeepers, and watchmen who stand in prayer for individuals, families, churches, communities, and nations. Through prayer gatherings, fasting initiatives, and biblical teaching, we encourage believers to cultivate a deeper life of intimacy with God and faithful spiritual stewardship.',
    image: '/images/prayer-silhouette.jpg',
  },
  {
    name: 'Leadership Development',
    shortDescription: 'Equipping leaders with biblical character and practical skill to lead with integrity.',
    description:
      'We equip emerging and established leaders with biblical principles, practical skills, and servant-hearted character necessary to lead with integrity, wisdom, humility, and accountability. Our leadership programs prepare individuals to influence churches, ministries, workplaces, educational institutions, businesses, and communities.',
    image: '/images/pastoral-moment.jpg',
  },
  {
    name: 'Family & Kingdom Parenting',
    shortDescription: 'Strengthening families through biblical teaching and intentional, godly parenting.',
    description:
      "Strong families build strong communities. JBIM partners with parents and caregivers by providing biblical teaching, practical resources, mentoring, and family support that promote healthy relationships, godly parenting, and the intentional nurturing of children to fulfill God's purpose for their lives.",
    image: '/images/hands-on-bible.jpg',
  },
  {
    name: "Children's Education",
    shortDescription: 'Nurturing the next generation through Christ-centered education and mentorship.',
    description:
      "We are committed to nurturing the next generation through Christ-centered education that supports children's spiritual, academic, and character development. Through biblical teaching, educational enrichment, mentorship, leadership formation, and values-based learning, we help children grow in wisdom, confidence, integrity, and purpose.",
    image: '/images/open-bible.jpg',
  },
  {
    name: 'Youth & Young Adult Development',
    shortDescription: 'Mentoring young people to discover their identity and purpose in Christ.',
    description:
      'We mentor and encourage young people to discover their identity in Christ and pursue lives of purpose, excellence, and integrity. Through mentorship, leadership training, career guidance, educational support, and faith-based development, we prepare young adults to become positive influences within society and the marketplace.',
    image: '/images/worship-hands-raised.jpg',
  },
  {
    name: "Women's/Men's Empowerment",
    shortDescription: 'Equipping women and men for healing, restoration, and confident Kingdom service.',
    description:
      "We believe women and men play a vital role in God's redemptive work within families, churches, and communities. JBIM equips them through biblical teaching, mentorship, leadership development, and supportive relationships that encourage healing, restoration, spiritual growth, and confident service.",
    image: '/images/congregation-seated.jpg',
  },
  {
    name: 'Compassion & Community Outreach',
    shortDescription: 'Serving vulnerable communities with practical help and the love of Christ.',
    description:
      'Faith expresses itself through love in action. JBIM serves vulnerable communities by providing practical assistance, supporting children, widows, families in need, and underserved populations through compassionate outreach initiatives, partnerships, and community development programs that promote dignity, hope, and sustainable transformation.',
    image: '/images/community-hands.jpg',
  },
]
