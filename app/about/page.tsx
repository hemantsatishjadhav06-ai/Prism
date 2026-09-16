import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, Section, SectionHeader } from '@/components/dom/Section';
import { about } from '@/content/site';
import { bands } from '@/lib/theme';

export const metadata: Metadata = {
  title: about.meta.title,
  description: about.meta.description,
  alternates: { canonical: '/about' },
};

/**
 * About — Phase 1, zero WebGL.
 *
 * The live page defines the PRISM acronym explicitly, exactly as §8.4 and
 * §13.2 item 13 predicted: P·R·I·S·M = Payment · Resolution · IDR · System ·
 * Management, with its own body copy per letter. §8.4's fallback ("if the
 * page doesn't define the acronym…") is therefore unnecessary — the five HUD
 * ray labels use the live copy below (docs/RECONCILIATION.md §6.3).
 *
 * Five letters, five bands, in order — this is the one place all five are
 * used, including Rose for the M. From Phase 6 a white beam strikes the glass
 * prism and refracts into these five rays, each terminating in a
 * particle-formed letter. The argument is "one dispute, five disciplines",
 * which is why the mapping has to be exactly this one.
 *
 * "Our mission" carries the 30-business-day correction (§13.2 item 10).
 */
export default function AboutPage() {
  return (
    <>
      <section className="border-b border-white/10 bg-[color:var(--void)]">
        <div className="container-prism pt-16 pb-14 md:pt-24 md:pb-20">
          <p className="overline">{about.hero.overline}</p>
          <h1 className="mt-4 max-w-4xl text-display-xl text-[color:var(--ink-primary)]">
            {about.hero.heading.line1}{' '}
            <span className="block text-[color:var(--violet)]">
              {about.hero.heading.line2}
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[color:var(--ink-muted)]">
            {about.hero.lead}
          </p>
        </div>
      </section>

      {/* ── The acronym: the About centerpiece ─────────────────── */}
      <Section surface="void-2" bordered labelledBy="acronym-heading">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="overline">{about.acronym.overline}</p>
            <h2 id="acronym-heading" className="mt-4 text-display-l text-[color:var(--ink-primary)]">
              {about.acronym.heading.line1}
              <span className="block">{about.acronym.heading.line2}</span>
            </h2>
          </div>
          <div className="flex items-end lg:col-span-6 lg:col-start-7">
            <p className="text-[color:var(--ink-muted)]">
              {about.acronym.intro.before}
              <strong className="font-semibold text-[color:var(--ink-primary)]">
                {about.acronym.intro.strong}
              </strong>
              {about.acronym.intro.after}
            </p>
          </div>
        </div>

        <div className="hairline-grid mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {about.acronym.letters.map((entry, i) => (
            <div key={entry.letter} className="hairline-cell flex flex-col p-8">
              {/*
                The giant letterform is decorative — the word and its
                description carry the meaning as text, so nothing depends on
                seeing it (§10.1). aria-hidden keeps screen readers from
                announcing a bare "P" before the real content.
              */}
              <span
                aria-hidden="true"
                className="font-display text-[110px] leading-none"
                style={{ color: bands[i]!.hex }}
              >
                {entry.letter}
              </span>
              <p className="overline mt-4">{about.acronym.standsForLabel}</p>
              <h3 className="mt-2 text-[24px] text-[color:var(--ink-primary)]">{entry.word}</h3>
              <p className="mt-4 flex-1 text-[15px] text-[color:var(--ink-muted)]">
                {entry.desc}
              </p>
              <p className="mt-6 border-t border-white/10 pt-4 font-mono text-label-sm text-[color:var(--ink-muted)]">
                {entry.counter}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-baseline gap-x-3 gap-y-2 border border-white/15 bg-[color:var(--void)] p-8 lg:p-10">
          <span className="overline mr-2">{about.acronym.lockupLabel}</span>
          <span className="font-display text-[26px] text-[color:var(--ink-primary)] sm:text-[30px]">
            {about.acronym.lockupText}
          </span>
        </div>
      </Section>

      {/* ── Who we help ────────────────────────────────────────── */}
      <Section labelledBy="who-we-help-heading">
        <SectionHeader
          id="who-we-help-heading"
          overline={about.whoWeHelp.overline}
          heading={
            <>
              {about.whoWeHelp.heading.line1}
              <span className="block">{about.whoWeHelp.heading.line2}</span>
            </>
          }
          intro={about.whoWeHelp.intro}
        />
        <div className="hairline-grid mt-14 grid grid-cols-1 md:grid-cols-3">
          {about.whoWeHelp.items.map((item) => (
            <Card key={item.title} title={item.title} body={item.desc} />
          ))}
        </div>
      </Section>

      {/* ── Mission ────────────────────────────────────────────── */}
      <Section surface="void-2" bordered labelledBy="mission-heading">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="overline">{about.mission.overline}</p>
            <h2 id="mission-heading" className="mt-4 text-display-l text-[color:var(--ink-primary)]">
              {about.mission.heading}
            </h2>
            <p className="measure mt-6 text-[color:var(--ink-muted)]">{about.mission.body}</p>
          </div>
        </div>
      </Section>

      {/* ── Operating values ───────────────────────────────────── */}
      <Section labelledBy="values-heading">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="overline">{about.values.overline}</p>
            <h2 id="values-heading" className="mt-4 text-display-l text-[color:var(--ink-primary)]">
              {about.values.heading}
            </h2>
          </div>
          <div className="lg:col-span-8">
            <div className="hairline-grid grid grid-cols-1 md:grid-cols-2">
              {about.values.items.map((item) => (
                <Card key={item.title} title={item.title} body={item.desc} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Team ───────────────────────────────────────────────── */}
      <Section surface="void-2" bordered labelledBy="team-heading">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="overline">{about.team.overline}</p>
            <h2 id="team-heading" className="mt-4 text-display-l text-[color:var(--ink-primary)]">
              {about.team.heading}
            </h2>
            <p className="measure mt-6 text-[color:var(--ink-muted)]">{about.team.body}</p>
          </div>

          {/*
            The live site names no individuals — no bios, no headshots, no
            titles — only category-level backgrounds. Nothing is added here;
            inventing named leadership would be fabrication.
          */}
          <div className="lg:col-span-5">
            <div className="border border-white/15 bg-white/[0.03] p-8">
              <h3 className="overline">{about.team.benchHeading}</h3>
              <ul className="mt-6 space-y-3">
                {about.team.benchBackgrounds.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px]">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[color:var(--cyan)]"
                    />
                    <span className="text-[color:var(--ink-primary)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section labelledBy="about-closing-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="about-closing-heading"
            className="text-display-l text-[color:var(--ink-primary)]"
          >
            {about.closing.heading}
          </h2>
          <Link
            href={about.closing.cta.href}
            className="mt-10 inline-flex h-12 items-center rounded-md bg-[color:var(--ink-primary)] px-6 font-medium text-[color:var(--void)] transition-colors hover:bg-white"
          >
            {about.closing.cta.label}
          </Link>
        </div>
      </Section>
    </>
  );
}
