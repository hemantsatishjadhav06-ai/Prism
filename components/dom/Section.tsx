import type { ReactNode } from 'react';

/**
 * Layout primitives shared by every page.
 *
 * These exist so that section rhythm (§3.3) and heading levels (§10.1) are
 * decided in one place. Nothing here hardcodes copy — every string is passed
 * in from content/site.ts.
 */

export function Section({
  children,
  surface = 'void',
  bordered = false,
  labelledBy,
}: {
  children: ReactNode;
  surface?: 'void' | 'void-2' | 'utility';
  bordered?: boolean;
  labelledBy?: string;
}) {
  const surfaceClass =
    surface === 'utility'
      ? 'utility-surface bg-[color:var(--utility-bg)] text-[color:var(--utility-ink)]'
      : surface === 'void-2'
        ? 'bg-[color:var(--void-2)]'
        : 'bg-[color:var(--void)]';

  return (
    <section
      aria-labelledby={labelledBy}
      className={`section-rhythm ${surfaceClass} ${bordered ? 'border-y border-white/10' : ''}`}
    >
      <div className="container-prism">{children}</div>
    </section>
  );
}

/**
 * Section header: a mono overline, an <h2>, and an optional intro paragraph.
 *
 * The overline is a plain <p>, never a heading — it is a label, and promoting
 * it would put a bogus level into the outline. `id` is wired to the section's
 * aria-labelledby so the landmark is named by its real heading.
 */
export function SectionHeader({
  id,
  overline,
  heading,
  intro,
  tone = 'dark',
}: {
  id: string;
  overline: string;
  heading: ReactNode;
  intro?: string;
  tone?: 'dark' | 'light';
}) {
  const mutedClass =
    tone === 'light' ? 'text-[color:var(--utility-muted)]' : 'text-[color:var(--ink-muted)]';
  const inkClass =
    tone === 'light' ? 'text-[color:var(--utility-ink)]' : 'text-[color:var(--ink-primary)]';

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <p className={`overline ${mutedClass}`}>{overline}</p>
        <h2 id={id} className={`mt-4 text-display-l ${inkClass}`}>
          {heading}
        </h2>
      </div>
      {intro && (
        <div className="flex items-end lg:col-span-6 lg:col-start-7">
          <p className={mutedClass}>{intro}</p>
        </div>
      )}
    </div>
  );
}

/**
 * A card in a hairline grid. `title` renders as <h3> so that card titles sit
 * correctly under their section's <h2> — the live site renders all of these
 * as <div>s, which is why its heading order skips a level on four of five
 * routes (docs/RECONCILIATION.md §6.5).
 */
export function Card({
  eyebrow,
  title,
  body,
  children,
  accent,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  children?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="hairline-cell flex flex-col p-8">
      {eyebrow && (
        <p className="font-mono text-label-sm text-[color:var(--ink-muted)]">{eyebrow}</p>
      )}
      {/*
        §10.1: nothing is conveyed by color alone. The accent bar is
        decorative — every station also carries its name as text.
      */}
      {accent && (
        <span
          aria-hidden="true"
          className="mt-4 block h-0.5 w-8"
          style={{ backgroundColor: accent }}
        />
      )}
      <h3 className="mt-4 text-[22px] text-[color:var(--ink-primary)]">{title}</h3>
      {body && <p className="mt-3 text-[15px] text-[color:var(--ink-muted)]">{body}</p>}
      {children}
    </div>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="measure space-y-5">{children}</div>;
}
