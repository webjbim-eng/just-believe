const DAY_ORDER = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
const DAY_LABELS: Record<(typeof DAY_ORDER)[number], string> = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
}

/**
 * "Every Saturday" (1 day), "Sunday – Thursday" (contiguous range), or a
 * comma list for anything non-contiguous (e.g. "Sunday, Wednesday") — a
 * schedule entry's `daysOfWeek` is a multi-select, and every real schedule
 * given so far (Saturday only, Sun-Thu, Mon-Fri) is one contiguous block,
 * so collapsing to a range reads far more naturally than a raw list
 * without needing an admin-editable override field.
 */
export function formatDaysOfWeek(days: string[]): string {
  const ordered = DAY_ORDER.filter((d) => days.includes(d))
  if (ordered.length === 0) return ''
  if (ordered.length === 1) return `Every ${DAY_LABELS[ordered[0]]}`

  const indices = ordered.map((d) => DAY_ORDER.indexOf(d))
  const isContiguous = indices.every((idx, i) => i === 0 || idx === indices[i - 1] + 1)
  if (isContiguous) {
    return `${DAY_LABELS[ordered[0]]} – ${DAY_LABELS[ordered[ordered.length - 1]]}`
  }

  return ordered.map((d) => DAY_LABELS[d]).join(', ')
}
