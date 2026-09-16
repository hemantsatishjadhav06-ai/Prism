import type { Metadata } from 'next';
import Link from 'next/link';
import { Section } from '@/components/dom/Section';
import { services, ui } from '@/content/site';
import { spectrumForCount } from '@/lib/theme';

export const metadata: Metadata = {
  title: services.meta.title,
  description: services.meta.description,
  alternates: { canonical: '/services' },
};

/**
 * Services — Phase 1, zero WebGL.
 *
 * TWO content structures with TWO different counts, per §8.2:
 *
 *   • six offerings       → the six card-plane stations of the negotiation
 *                           chamber (n = 6 → totalVh = 180 + 6 × 70 = 600vh)
 *   • four process steps  → a separate horizontal HUD timeline that
 *                           progresses with camera travel across the chamber
 *
 * They are not merged. The live page presents them as separate sections and
 * they are different things — v1 assumed only a four-step process, which is
 * why this needed flagging in Phase 0 (docs/RECONCILIATION.md §6.2).
 *
 * "Open Negotiation Management" carries the 30-business-day correction
 * (§13.2 item 10).
 */
export default function ServicesPage() {
  const offeringColors = spectrumForCount(services.offerings.length);

  return (
    <>
      <section className="border-b border-white/10 bg-[color:var(--void)]">
        <div className="container-prism pt-16 pb-14 md:pt-24 md:pb-20">
          <p className="overline">{services.hero.overline}</p>
          <h1 className="mt-4 max-w-4xl text-display-xl text-[color:var(--ink-primary)]">
            {services.hero.heading}
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[color:var(--ink-muted)]">
            {services.hero.lead}
          </p>
        </div>
      </section>

      {/* ── Structure 1 of 2: the six offerings ────────────────── */}
      <Section surface="void-2" bordered labelledBy="offerings-heading">
        <h2 id="offerings-heading" className="sr-only">
          {services.hero.heading}
        </h2>

        <div className="hairline-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {services.offerings.map((offering, i) => (
            <div key={offering.title} className="hairline-cell flex flex-col p-8 lg:p-10">
              <span
                aria-hidden="true"
                className="block h-0.5 w-8"
                style={{ backgroundColor: offeringColors[i] }}
              />
              <h3 className="mt-5 text-[22px] text-[color:var(--ink-primary)]">
                {offering.title}
              </h3>
              <p className="mt-3 text-[15px] text-[color:var(--ink-muted)]">
                {offering.summary}
              </p>
              <ul className="mt-6 space-y-2">
                {offering.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-[15px]">
                    <span aria-hidden="true" className="text-[color:var(--ink-muted)]">
                      —
                    </span>
                    <span className="text-[color:var(--ink-primary)]">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 font-mono text-label-sm text-[color:var(--ink-muted)]">
          {services.offerings.length} {ui.countServices}
        </p>
      </Section>

      {/* ── Structure 2 of 2: the four-step engagement timeline ── */}
      <Section labelledBy="engagement-heading">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="overline">{services.engagement.overline}</p>
            <h2
              id="engagement-heading"
              className="mt-4 text-display-l text-[color:var(--ink-primary)]"
            >
              {services.engagement.heading}
            </h2>
            {/*
              "Most engagements start with a 30-day diagnostic" is PRISM's own
              commercial term, not the statutory open-negotiation period, so
              it is left exactly as the live site words it (§13.2 item 10
              covers the three regulatory instances only).
            */}
            <p className="measure mt-6 text-[color:var(--ink-muted)]">
              {services.engagement.lead}
            </p>
          </div>

          {/*
            A real <ol>: the steps are an ordered sequence, and the numbering
            is content rather than decoration. From Phase 5 this same array
            drives the HUD timeline.
          */}
          <div className="lg:col-span-7">
            <ol className="hairline-grid grid grid-cols-1">
              {services.engagement.steps.map((step) => (
                <li
                  key={step.step}
                  className="hairline-cell grid grid-cols-12 items-baseline gap-4 p-6"
                >
                  <span
                    aria-hidden="true"
                    className="col-span-2 font-mono text-[28px] text-[color:var(--cyan)]"
                  >
                    {step.step}
                  </span>
                  <h3 className="col-span-10 text-[19px] text-[color:var(--ink-primary)] sm:col-span-3">
                    {step.title}
                  </h3>
                  <p className="col-span-12 text-[15px] text-[color:var(--ink-muted)] sm:col-span-7">
                    {step.desc}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-6 font-mono text-label-sm text-[color:var(--ink-muted)]">
              {services.engagement.steps.length} {ui.countSteps}
            </p>
          </div>
        </div>
      </Section>

      <Section surface="void-2" bordered labelledBy="why-white-glove-heading">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="overline">{services.whyWhiteGlove.overline}</p>
            <h2
              id="why-white-glove-heading"
              className="mt-4 text-display-l text-[color:var(--ink-primary)]"
            >
              {services.whyWhiteGlove.heading}
            </h2>
            <p className="measure mt-6 text-[color:var(--ink-muted)]">
              {services.whyWhiteGlove.body}
            </p>
            <Link
              href={services.whyWhiteGlove.cta.href}
              className="mt-8 inline-flex h-12 items-center rounded-md bg-[color:var(--ink-primary)] px-6 font-medium text-[color:var(--void)] transition-colors hover:bg-white"
            >
              {services.whyWhiteGlove.cta.label}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
