import Link from 'next/link';
import { nav, ui } from '@/content/site';

/**
 * Real 404.
 *
 * The live site is an SPA catch-all: every unmatched path returns HTTP 200
 * with the shell, so today's unknown URLs are soft-404s. Returning a genuine
 * 404 is the correct behavior and is a deliberate change from live
 * (docs/RECONCILIATION.md §3.4).
 */
export default function NotFound() {
  return (
    <section className="section-rhythm bg-[color:var(--void)]">
      <div className="container-prism">
        <p className="overline">{ui.notFound.overline}</p>
        <h1 className="mt-4 text-display-l text-[color:var(--ink-primary)]">
          {ui.notFound.heading}
        </h1>
        <p className="measure mt-6 text-[color:var(--ink-muted)]">
          {ui.notFound.body}
        </p>

        <ul className="mt-8 space-y-3">
          {nav.links.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                className="text-[color:var(--ink-primary)] underline decoration-white/30 underline-offset-4 hover:decoration-white"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
