import type { Metadata } from 'next';
import { Instrument_Serif, Inter, IBM_Plex_Mono } from 'next/font/google';
import { Nav } from '@/components/dom/Nav';
import { Footer } from '@/components/dom/Footer';
import { site, ui } from '@/content/site';
import './globals.css';

/**
 * Fonts via next/font/google (§3.2). Next self-hosts these at build time, so
 * there is no runtime request to Google — which also avoids a third-party
 * request finding in an enterprise security review, and matters for an
 * audience browsing from locked-down hospital networks.
 *
 * From Phase 2 the particle glyph sampler must await document.fonts.ready
 * before rasterising Instrument Serif, or it samples the fallback serif and
 * the letterforms come out subtly wrong (§3.2, §7.2).
 */
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-sans',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

/**
 * Indexing is gated on NEXT_PUBLIC_INDEXABLE being exactly 'true' and fails
 * closed (§10.3). Mirrored in next.config.js (X-Robots-Tag) and
 * app/robots.ts (Disallow: /) so all three agree.
 */
const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === 'true';

export const metadata: Metadata = {
  metadataBase: new URL(site.origin),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: '/' },
  // Belt and braces alongside the header and robots.txt. Three independent
  // signals, all defaulting to blocked.
  robots: INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: site.origin,
    locale: 'en_US',
  },
};

/**
 * JSON-LD: Organization + ProfessionalService (§10.3).
 *
 * Deliberately NO Review or AggregateRating. A single unverified customer
 * quote marked up as structured review data is a rich-results policy
 * violation and risks a manual action — and the testimonial is disabled
 * anyway for want of a real attribution (§13.2 item 2).
 *
 * No SOC 2 or HIPAA claim is emitted here either; compliance posture belongs
 * in prose the client has approved, not in machine-readable claims.
 */
function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${site.origin}/#organization`,
        name: site.name,
        url: site.origin,
        description: site.tagline,
        email: site.email,
        logo: {
          '@type': 'ImageObject',
          url: `${site.origin}${site.logo.src}`,
          width: site.logo.width,
          height: site.logo.height,
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'US',
        },
      },
      {
        '@type': 'ProfessionalService',
        '@id': `${site.origin}/#service`,
        name: site.name,
        url: site.origin,
        description: site.tagline,
        provider: { '@id': `${site.origin}/#organization` },
        areaServed: { '@type': 'Country', name: 'United States' },
      },
    ],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.lang} className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-screen flex-col">
        {/* §10.1: first focusable element on the page. */}
        <a href="#main-content" className="skip-link">
          {ui.skipToContent}
        </a>

        <Nav />

        {/*
          Phase 1 is deliberately zero-WebGL (§12). The persistent <Canvas>
          and the r3f tunnel Out arrive in Phase 2, mounted here behind this
          content at z-index 0. Everything below must keep reading correctly
          with the canvas absent — that is the test for §10 being satisfied.
        */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        <Footer />

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()) }}
        />
      </body>
    </html>
  );
}
