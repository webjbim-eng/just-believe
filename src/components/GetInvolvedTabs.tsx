'use client'

import { useState, type CSSProperties } from 'react'
import { VolunteerApplicationForm } from './VolunteerApplicationForm'
import { PrayerRequestForm } from './PrayerRequestForm'
import { CounselingRequestForm } from './CounselingRequestForm'

type Tab = 'volunteer' | 'prayer' | 'counseling'

const TABS: { value: Tab; label: string; description: string }[] = [
  { value: 'volunteer', label: 'Volunteer', description: 'Offer your time and gifts to serve alongside our ministry teams.' },
  { value: 'prayer', label: 'Prayer Request', description: 'Share what’s on your heart — our prayer team will stand with you.' },
  { value: 'counseling', label: 'Counseling', description: 'Request a confidential conversation with our counseling team.' },
]

/**
 * One page, three real intake forms — Jimmy's correction (2026-08-16):
 * these each need their own working form, not a redirect to the generic
 * Contact page. A tab switcher (same toggle pattern as GiveForm's payment
 * method selector) keeps it as one focused page instead of three thin,
 * near-identical stacked forms.
 */
export function GetInvolvedTabs() {
  const [tab, setTab] = useState<Tab>('volunteer')
  const active = TABS.find((t) => t.value === tab)!

  function tabStyle(isActive: boolean): CSSProperties {
    return {
      padding: '0.75rem 1.5rem',
      borderRadius: 'var(--radius-button)',
      border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
      background: isActive ? 'var(--color-accent)' : 'var(--color-surface)',
      color: isActive ? 'var(--color-on-accent)' : 'var(--color-text)',
      fontWeight: isActive ? 700 : 500,
      fontSize: 'var(--text-body-sm)',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {TABS.map((t) => (
          <button key={t.value} type="button" style={tabStyle(tab === t.value)} onClick={() => setTab(t.value)}>
            {t.label}
          </button>
        ))}
      </div>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{active.description}</p>
      {tab === 'volunteer' && <VolunteerApplicationForm />}
      {tab === 'prayer' && <PrayerRequestForm />}
      {tab === 'counseling' && <CounselingRequestForm />}
    </div>
  )
}
