import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, Section } from '@/components/dom/Section';
import { products, ui } from '@/content/site';
import { spectrumForCount } from '@/lib/theme';

export const metadata: Metadata = {
  title: products.meta.title,
  description: products.meta.description,
  alternates: { canonical: '/products' },
};

/**
 * Products — Phase 1, zero WebGL.
 *
 * EIGHT stations. Not an assumption and not carried over from spec v1: the
 * live page renders eight modules and its own lead copy says "Eight
 * integrated modules" (docs/RECONCILIATION.md §6.1).
 *
 * Everything derives from `products.modules.length`, per §8.0 — the station
 * count, the numbering, and the colors. Adding or removing a module is a
 * content edit in content/site.ts, not a code change here. From Phase 5 the
 * same array drives spline keyframes and station geometry:
 *
 *   n = 8  →  totalVh = 180 + 8 × 70 = 740vh
 *   tAt(i) = 0.08 + (i / 7) × 0.84
 *
 * Station colors are sampled from the five-band spectrum at i / (n - 1)
 * rather than hand-assigned, which is what makes the progress thread and the
 * station colors mathematically the same object (§3.1).
 *
 * Module 04 carries the one deliberate copy correction on this page:
 * "30 business days", not the live site's "30-day" (§13.2 item 10).
 */
export default function ProductsPage() {
  const n = products.modules.length;
  const colors = spectrumForCount(n);

  return (
    <>
      <section className="border-b border-white/10 bg-[color:var(--void)]">
        <div className="container-prism pt-16 pb-14 md:pt-24 md:pb-20">
          <p className="overline">{products.hero.overline}</p>
          <h1 className="mt-4 max-w-4xl text-display-xl text-[color:var(--ink-primary)]">
            {products.hero.heading}
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[color:var(--ink-muted)]">
            {products.hero.lead}
          </p>
          <Link
            href={products.hero.cta.href}
            className="mt-10 inline-flex h-12 items-center rounded-md bg-[color:var(--ink-primary)] px-6 font-medium text-[color:var(--void)] transition-colors hover:bg-white"
          >
            {products.hero.cta.label}
          </Link>
        </div>
      </section>

      <Section surface="void-2" bordered labelledBy="modules-heading">
        {/*
          The live page has no heading above the module grid — the cards sit
          directly under the hero. A heading is required here so the eight
          <h3> cards are not orphaned under the <h1>, and so the landmark has
          an accessible name (§10.1: heading order never skips a level).
          It reuses the page's own lead copy rather than inventing a claim.
        */}
        <h2 id="modules-heading" className="sr-only">
          {products.hero.heading}
        </h2>

        <div className="hairline-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {products.modules.map((module, i) => (
            <Card
              key={module.title}
              eyebrow={module.number}
              title={module.title}
              body={module.desc}
              accent={colors[i]}
            />
          ))}
        </div>

        <p className="mt-8 font-mono text-label-sm text-[color:var(--ink-muted)]">
          {n} {ui.countModules}
        </p>
      </Section>

      <Section labelledBy="products-closing-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="products-closing-heading"
            className="text-display-l text-[color:var(--ink-primary)]"
          >
            {products.closing.heading}
          </h2>
          <p className="mt-6 text-[color:var(--ink-muted)]">{products.closing.body}</p>
          <Link
            href={products.closing.cta.href}
            className="mt-10 inline-flex h-12 items-center rounded-md bg-[color:var(--ink-primary)] px-6 font-medium text-[color:var(--void)] transition-colors hover:bg-white"
          >
            {products.closing.cta.label}
          </Link>
        </div>
      </Section>
    </>
  );
}
