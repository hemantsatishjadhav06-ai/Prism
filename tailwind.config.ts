import type { Config } from 'tailwindcss';

/**
 * Tailwind is the DOM/UI layer only (spec §4). Colors reference the CSS
 * custom properties defined in app/globals.css so there is exactly one
 * definition of each token; lib/theme.ts mirrors the same hexes as plain
 * strings for three.js, which cannot read CSS variables (§3.1).
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        'void-2': 'var(--void-2)',
        // Geometry only — never text. See the note in globals.css.
        structure: 'var(--structure)',
        'ink-primary': 'var(--ink-primary)',
        'ink-muted': 'var(--ink-muted)',
        'utility-bg': 'var(--utility-bg)',
        'utility-ink': 'var(--utility-ink)',
        'utility-muted': 'var(--utility-muted)',
        'utility-line': 'var(--utility-line)',
        violet: 'var(--violet)',
        cyan: 'var(--cyan)',
        emerald: 'var(--emerald)',
        amber: 'var(--amber)',
        rose: 'var(--rose)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Type scale from §3.2.
        'display-xl': ['clamp(40px, 6.2vw, 84px)', { lineHeight: '1.05', letterSpacing: '-0.5px' }],
        'display-l': ['clamp(30px, 4vw, 48px)', { lineHeight: '1.12' }],
        'display-m': ['clamp(24px, 2.6vw, 34px)', { lineHeight: '1.18' }],
        body: ['16.5px', { lineHeight: '1.6' }],
        label: ['13px', { letterSpacing: '0.02em' }],
        'label-sm': ['12px', { letterSpacing: '0.02em' }],
      },
      maxWidth: {
        // §3.3: content 1180px, body copy line-length cap 640px.
        content: '1180px',
        copy: '640px',
      },
      spacing: {
        // §3.3: section vertical rhythm, 4px base unit.
        section: '140px',
        'section-mobile': '80px',
        gutter: '40px',
        'gutter-mobile': '24px',
      },
    },
  },
  plugins: [],
};

export default config;
