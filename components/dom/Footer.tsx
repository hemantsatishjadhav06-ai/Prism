import Link from 'next/link';
import { footer, site, ui } from '@/content/site';
import { Logo } from './Logo';

/**
 * Footer.
 *
 * Two deliberate differences from the live site, both authorised:
 *
 *  - The copyright line reads "HIPAA-aligned." where the live site says
 *    "HIPAA compliant. SOC 2 ready." — §13.2 items 1 and 19. "SOC 2 ready"
 *    is not a SOC 2 status, and "HIPAA-aligned" is the more conservative of
 *    the live site's own two phrasings.
 *  - The legal labels are real links. On the live site they are plain
 *    <span>s pointing nowhere, because the pages do not exist (§2.4).
 *
 * The §10.4.6 disclaimer is a TODO(legal) marker: the live site has none and
 * drafting legal-advice disclaimer text is out of bounds. The content gate
 * blocks production while it remains.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/10 bg-[color:var(--void-2)]">
      <div className="container-prism py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo height={56} />
            <p className="measure mt-6 text-[color:var(--ink-muted)]">{footer.description}</p>
          </div>

          <nav className="md:col-span-3" aria-label={ui.footerLandmarkLabel}>
            <h2 className="overline">{footer.navHeading}</h2>
            <ul className="mt-6 space-y-3">
              {footer.navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-[15px] text-[color:var(--ink-muted)] transition-colors hover:text-[color:var(--ink-primary)]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <h2 className="overline">{footer.contactHeading}</h2>
            <ul className="mt-6 space-y-4 text-[15px]">
              <li>
                <a
                  href={`mailto:${footer.email}`}
                  className="text-[color:var(--ink-muted)] transition-colors hover:text-[color:var(--ink-primary)]"
                >
                  {footer.email}
                </a>
              </li>
              <li className="text-[color:var(--ink-muted)]">{footer.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          {/*
            §10.4.6 requires an "informational, not legal advice" disclaimer.
            The live site has none and I must not draft one. Gate-enforced.
          */}
          <p className="measure text-label-sm text-[color:var(--ink-muted)]">
            {footer.disclaimer}
          </p>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-label-sm text-[color:var(--ink-muted)]">
              © {year} {site.name} {footer.copyrightSuffix}
            </p>
            <ul className="flex flex-wrap gap-6">
              {ui.legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-label-sm text-[color:var(--ink-muted)] transition-colors hover:text-[color:var(--ink-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
