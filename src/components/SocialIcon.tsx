// Minimal inline brand icons + real brand colors — RTNM's "Follow Us"
// pattern used colored circular platform badges rather than plain text
// links. Covers the platforms actually offered on the Footer/Navigation
// collections' `platform` select options.
const BRAND_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E1306C',
  youtube: '#FF0000',
  x: '#000000',
  tiktok: '#000000',
}

const PATHS: Record<string, string> = {
  facebook:
    'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12',
  youtube:
    'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5V8.5L15.8 12Z',
  instagram:
    'M12 2c2.7 0 3.1 0 4.1.1 1.1 0 1.8.2 2.3.4a5 5 0 0 1 1.8 1.2 5 5 0 0 1 1.2 1.8c.2.5.4 1.2.4 2.3.1 1 .1 1.4.1 4.1s0 3.1-.1 4.1c0 1.1-.2 1.8-.4 2.3a5 5 0 0 1-1.2 1.8 5 5 0 0 1-1.8 1.2c-.5.2-1.2.4-2.3.4-1 .1-1.4.1-4.1.1s-3.1 0-4.1-.1c-1.1 0-1.8-.2-2.3-.4a5 5 0 0 1-1.8-1.2 5 5 0 0 1-1.2-1.8c-.2-.5-.4-1.2-.4-2.3C2 15.1 2 14.7 2 12s0-3.1.1-4.1c0-1.1.2-1.8.4-2.3a5 5 0 0 1 1.2-1.8 5 5 0 0 1 1.8-1.2c.5-.2 1.2-.4 2.3-.4C8.9 2 9.3 2 12 2Zm0 3.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4Zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.4-10.5a1.4 1.4 0 1 1-2.9 0 1.4 1.4 0 0 1 2.9 0Z',
}

export function SocialIcon({ platform }: { platform: string }) {
  const key = platform.toLowerCase()
  const color = BRAND_COLORS[key] ?? 'var(--color-accent)'
  const path = PATHS[key]

  return (
    <span
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {path ? (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true">
          <path d={path} />
        </svg>
      ) : (
        <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{key.charAt(0)}</span>
      )}
    </span>
  )
}
