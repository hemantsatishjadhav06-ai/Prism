import type { Metadata } from 'next';
import Link from 'next/link';
import { Faq } from '@/components/dom/Faq';
import { Card, Section, SectionHeader } from '@/components/dom/Section';
import { home } from '@/content/site';
import { bands } from '@/lib/theme';

export const metadata: Metadata = {
  title: home.meta.title,
  description: home.meta.description,
  alternates: { canonical: '/' },
};

/**
 * Home — Phase 1, zero WebGL.
 *
 * DOM order is reading order is crawl order (§7.1): nav, h1 hero, four module
 * sections, platform, [testimonial — disabled], FAQ, footer. The 3D sits
 * behind all of it from Phase 2 and changes none of this markup.
 *
 * The test for §10 being satisfied: delete the canvas and the page still
 * reads correctly top to bottom. In Phase 1 there is no canvas, so this is
 * the page in its load-bearing form.
 *
 * Both hero CTAs are real <a> elements present in the HTML from the first
 * byte — never conditionally rendered behind an animation (§7.2). A CTA that
 * only exists after a scroll trigger is a CTA that does not exist for a
 * crawler.
 */
export default function HomePage() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="border-b border-white/10 bg-[color:var(--void)]">
        <div className="container-prism pt-16 pb-20 md:pt-24 md:pb-28">
          <p className="overline flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-12 bg-white/25" />
            {home.hero.overline}
          </p>

          {/*
            §7.2: the full headline is real DOM text in Instrument Serif —
            crisp, selectable, crawlable, translatable. From Phase 2 the
            particles form the PRISM wordmark behind it, not this sentence.
            The LCP element must be this <h1>, never the canvas (§11.1).
          */}
          <h1 className="mt-6 text-display-xl text-[color:var(--ink-primary)]">
            {home.hero.heading.line1}{' '}
            <span className="block text-[color:var(--violet)]">
              {home.hero.heading.line2}
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-[color:var(--ink-muted)]">
            {home.hero.lead}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={home.hero.primaryCta.href}
              className="inline-flex h-12 items-center rounded-md bg-[color:var(--ink-primary)] px-6 font-medium text-[color:var(--void)] transition-colors hover:bg-white"
            >
              {home.hero.primaryCta.label}
            </Link>
            <Link
              href={home.hero.secondaryCta.href}
              className="inline-flex h-12 items-center rounded-md border border-white/20 px-6 font-medium text-[color:var(--ink-primary)] transition-colors hover:bg-white/5"
            >
              {home.hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Four service pillars ───────────────────────────────── */}
      <Section labelledBy="value-props-heading">
        <SectionHeader
          id="value-props-heading"
          overline={home.valueProps.overline}
          heading={home.valueProps.heading}
          intro={home.valueProps.intro}
        />

        {/*
          Four pillars, four bands (§7.3). Rose is deliberately unused here —
          it is reserved for the About `M` and the Testimonial accent.
          The band color is decorative; each pillar also carries its name as
          text, so nothing is conveyed by color alone (§10.1).
        */}
        <div className="hairline-grid mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {home.valueProps.items.map((item, i) => (
            <Card
              key={item.title}
              title={item.title}
              body={item.desc}
              accent={bands[i]!.hex}
            />
          ))}
        </div>
      </Section>

      {/* ── Platform ───────────────────────────────────────────── */}
      <Section surface="void-2" bordered labelledBy="platform-heading">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="overline">{home.platform.overline}</p>
            <h2 id="platform-heading" className="mt-4 text-display-l text-[color:var(--ink-primary)]">
              {home.platform.heading}
            </h2>
            <p className="measure mt-6 text-[color:var(--ink-muted)]">{home.platform.lead}</p>

            <ul className="mt-8 space-y-3">
              {home.platform.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-[15px]">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--cyan)]"
                  />
                  <span className="text-[color:var(--ink-primary)]">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/*
            Phase 2 replaces this panel with the wireframe hologram dashboard
            (§7.4) — a shader-drawn chart, no image asset. The live site's
            Unsplash photo captioned "PRISM analytics dashboard" is not
            carried over: it is unlicensed and it describes a stock photo as
            PRISM's product UI.

            Whatever renders here stays visually abstract — no axis numbers,
            no dollar values, no percentages — so nobody mistakes decorative
            chart data for real client results (§7.4, §10.4.2).
          */}
          <div className="lg:col-span-5">
            <div className="flex aspect-[4/5] flex-col justify-end border border-white/10 bg-[color:var(--void)] p-6">
              <p className="overline">{home.platform.imageCaptionOverline}</p>
              <p className="mt-1 text-[19px] text-[color:var(--ink-primary)]">
                {home.platform.imageCaptionTitle}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/*
        ── Testimonial: intentionally not rendered ───────────────

        home.testimonial.render === false. The live attribution is
        "Dr. Anesthesiologist, MD / Out-of-Network Provider Group", which
        names no person, title, or organisation, so §13.2 item 2 applies:
        cut the station rather than ship an unattributed performance claim.
        From Phase 4 this scroll range becomes a dwell on the Platform trust
        plate instead — the camera beat survives, the liability does not.

        The quote is stored verbatim in content/site.ts and this block
        re-enables with a single flag once a real, consented attribution
        arrives (CLIENT-QUESTIONS.md B6). The 92% figure must never appear
        outside that blockquote (§10.4.1).
      */}
      {home.testimonial.render && (
        <Section labelledBy="testimonial-heading">
          <h2 id="testimonial-heading" className="overline">
            {home.testimonial.overline}
          </h2>
          <figure className="mt-6 border-l-2 border-[color:var(--rose)] pl-8">
            <blockquote className="max-w-3xl text-display-m text-[color:var(--ink-primary)]">
              {home.testimonial.quote}
            </blockquote>
            <figcaption className="mt-6 text-[15px]">
              <cite className="not-italic text-[color:var(--ink-primary)]">
                {home.testimonial.attributionName}
              </cite>
              <span className="mt-1 block text-[color:var(--ink-muted)]">
                {home.testimonial.attributionOrg}
              </span>
            </figcaption>
          </figure>
        </Section>
      )}

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <Section surface="utility" bordered labelledBy="faq-heading">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="overline text-[color:var(--utility-muted)]">{home.faq.overline}</p>
            <h2 id="faq-heading" className="mt-4 text-display-l text-[color:var(--utility-ink)]">
              {home.faq.heading}
            </h2>
            <p className="mt-6 text-[color:var(--utility-muted)]">{home.faq.footnote}</p>
            <Link
              href={home.faq.cta.href}
              className="mt-4 inline-flex h-11 items-center rounded-md border border-[color:var(--utility-line)] px-5 text-[15px] font-medium text-[color:var(--utility-ink)] transition-colors hover:bg-white"
            >
              {home.faq.cta.label}
            </Link>
          </div>

          <div className="lg:col-span-8">
            <Faq items={home.faq.items} />
          </div>
        </div>
      </Section>

      {/*
        The live Home page ends at the FAQ; the footer follows. No closing
        CTA section is invented here — §13.2 item 9: if there is no copy for
        a section, omit the section. The FAQ block already carries a
        "Talk to an expert" CTA.

        From Phase 2 the canvas idles across the flat FAQ range above:
        frameloop "never" plus visibility:hidden. Never display:none — a
        display:none canvas reports zero dimensions, R3F computes
        aspect = 0/0 = NaN on the next resize, and the scene returns blank
        (§1.1, §6.5).
      */}
    </>
  );
}
