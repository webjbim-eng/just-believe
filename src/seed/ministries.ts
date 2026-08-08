/**
 * Real ministry copy, verbatim from docs/source/About us -
 * JustBelieveInt.docx's "What We Do" section — not placeholder content.
 * Seeded as actual Ministry records so MinistriesOverview (homepage) and
 * /ministries have real content instead of an empty state.
 */
export type MinistrySeed = {
  name: string
  description: string
}

export const ministryDefinitions: MinistrySeed[] = [
  {
    name: 'Evangelism & Discipleship',
    description:
      'We proclaim the Gospel of Jesus Christ through outreach programs, Bible teaching, conferences, missions, digital ministry, and structured discipleship. Our goal is to help believers develop an authentic and lifelong relationship with Christ, firmly rooted in Scripture and empowered by the Holy Spirit.',
  },
  {
    name: 'Prayer & Intercession',
    description:
      'Prayer is central to everything we do. JBIM raises intercessors, gatekeepers, and watchmen who stand in prayer for individuals, families, churches, communities, and nations. Through prayer gatherings, fasting initiatives, and biblical teaching, we encourage believers to cultivate a deeper life of intimacy with God and faithful spiritual stewardship.',
  },
  {
    name: 'Leadership Development',
    description:
      'We equip emerging and established leaders with biblical principles, practical skills, and servant-hearted character necessary to lead with integrity, wisdom, humility, and accountability. Our leadership programs prepare individuals to influence churches, ministries, workplaces, educational institutions, businesses, and communities.',
  },
  {
    name: 'Family & Kingdom Parenting',
    description:
      "Strong families build strong communities. JBIM partners with parents and caregivers by providing biblical teaching, practical resources, mentoring, and family support that promote healthy relationships, godly parenting, and the intentional nurturing of children to fulfill God's purpose for their lives.",
  },
  {
    name: "Children's Education",
    description:
      "We are committed to nurturing the next generation through Christ-centered education that supports children's spiritual, academic, and character development. Through biblical teaching, educational enrichment, mentorship, leadership formation, and values-based learning, we help children grow in wisdom, confidence, integrity, and purpose.",
  },
  {
    name: 'Youth & Young Adult Development',
    description:
      'We mentor and encourage young people to discover their identity in Christ and pursue lives of purpose, excellence, and integrity. Through mentorship, leadership training, career guidance, educational support, and faith-based development, we prepare young adults to become positive influences within society and the marketplace.',
  },
  {
    name: "Women's Empowerment",
    description:
      "We believe women play a vital role in God's redemptive work within families, churches, and communities. JBIM equips women through biblical teaching, mentorship, leadership development, and supportive relationships that encourage healing, restoration, spiritual growth, and confident service.",
  },
  {
    name: 'Compassion & Community Outreach',
    description:
      'Faith expresses itself through love in action. JBIM serves vulnerable communities by providing practical assistance, supporting children, widows, families in need, and underserved populations through compassionate outreach initiatives, partnerships, and community development programs that promote dignity, hope, and sustainable transformation.',
  },
]
