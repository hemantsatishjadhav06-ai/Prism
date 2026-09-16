import Link from 'next/link';
import { legalUi, site, type LegalPageContent } from '@/content/site';

/**
 * Shared scaffold for /privacy, /terms and /security (spec §13.2 item 3).
 *
 * All copy comes from `legalPages` in content/site.ts — including the
 * TODO(legal) markers, which must live in content/ or app/ for the content
 * gate to see them. A marker synthesised inside this component would be
 * invisible to the gate and these pages could reach production unfinished,
 * which is the exact failure §13.3 exists to prevent.
 *
 * Legal pages are not optional garnish here: the site describes HIPAA
 * alignment, and a privacy and security page are the first things an
 * enterprise healthcare buyer looks for. Their absence reads as a red flag
 * (§2.4).
 */
export function LegalPage({ page }: { page: LegalPageContent }) {
  return (
    <>
      <section className="border-b border-white/10 bg-[color:var(--void)]">
        <div className="container-prism pt-16 pb-12 md:pt-24 md:pb-16">
          <p className="overline">{page.overline}</p>
          <h1 className="mt-4 max-w-3xl text-display-l text-[color:var(--ink-primary)]">
            {page.heading}
          </h1>
          <p className="measure mt-6 text-[color:var(--ink-muted)]">{page.summary}</p>
        </div>
      </section>

      <section className="section-rhythm bg-[color:var(--void)]" aria-labelledby="awaiting-heading">
        <div className="container-prism">
          <div className="measure border-l-2 border-[color:var(--amber)] bg-[color:var(--amber)]/5 p-6">
            <h2 id="awaiting-heading" className="text-[20px] text-[color:var(--ink-primary)]">
              {legalUi.awaitingHeading}
            </h2>
            <p className="mt-3 text-[15px] text-[color:var(--ink-muted)]">
              {legalUi.awaitingBody}
            </p>

            <h3 className="mt-6 text-[15px] font-medium text-[color:var(--ink-primary)]">
              {legalUi.awaitingListHeading}
            </h3>
            <ul className="mt-3 space-y-2">
              {page.awaiting.map((item) => (
                <li key={item} className="text-[15px] text-[color:var(--ink-muted)]">
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-6 text-[15px] text-[color:var(--ink-muted)]">
              {legalUi.contactLead}{' '}
              <a href={`mailto:${site.email}`} className="underline">
                {site.email}
              </a>
              .
            </p>
          </div>

          <p className="mt-10 text-[15px]">
            <Link
              href="/"
              className="text-[color:var(--ink-muted)] underline hover:text-[color:var(--ink-primary)]"
            >
              {legalUi.returnHome}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
