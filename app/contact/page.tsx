import type { Metadata } from 'next';
import { ContactForm } from '@/components/dom/ContactForm';
import { contact, site, ui } from '@/content/site';

export const metadata: Metadata = {
  title: contact.meta.title,
  description: contact.meta.description,
  alternates: { canonical: '/contact' },
};

/**
 * Contact — a flat utility page (§8.3).
 *
 * Phase 2 adds at most a subtle *static* particle field behind the form. No
 * moving camera: a camera drifting behind a form someone is typing into is
 * actively hostile, and this is the page where a lead is won or lost.
 *
 * The <noscript> block below is the no-JS path (§9, §11.3): with JavaScript
 * disabled the form cannot submit, so the direct email must be present in the
 * HTML rather than only reachable through a script.
 */
export default function ContactPage() {
  return (
    <>
      <section className="border-b border-white/10 bg-[color:var(--void)]">
        <div className="container-prism pt-16 pb-14 md:pt-24 md:pb-16">
          <p className="overline">{contact.hero.overline}</p>
          <h1 className="mt-4 max-w-3xl text-display-xl text-[color:var(--ink-primary)]">
            {contact.hero.heading}
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-[color:var(--ink-muted)]">
            {contact.hero.lead}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="contact-form-heading"
        className="section-rhythm bg-[color:var(--void-2)]"
      >
        <div className="container-prism">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* ── Direct contact details + what happens next ──── */}
            <aside className="lg:col-span-4">
              <h2 className="overline">{contact.direct.overline}</h2>

              <ul className="mt-8 space-y-6">
                <li>
                  <p className="overline">{contact.direct.emailLabel}</p>
                  <a
                    href={`mailto:${contact.direct.email}`}
                    className="mt-1 block font-display text-[20px] text-[color:var(--ink-primary)] underline decoration-white/30 underline-offset-4 hover:decoration-white"
                  >
                    {contact.direct.email}
                  </a>
                </li>
                <li>
                  <p className="overline">{contact.direct.locationLabel}</p>
                  {/*
                    The live site publishes only "United States" — no street
                    address and no phone number. Nothing is invented to fill
                    the gap (§13.2 item 9); see CLIENT-QUESTIONS.md B9.
                  */}
                  <p className="mt-1 font-display text-[20px] text-[color:var(--ink-primary)]">
                    {contact.direct.location}
                  </p>
                </li>
              </ul>

              <div className="mt-12 border border-white/10 bg-[color:var(--void)] p-6">
                <h3 className="overline">{contact.whatHappensNext.overline}</h3>
                <ol className="mt-4 space-y-3">
                  {contact.whatHappensNext.steps.map((step) => (
                    <li key={step.step} className="flex gap-3 text-[15px]">
                      <span
                        aria-hidden="true"
                        className="font-mono text-[color:var(--ink-muted)]"
                      >
                        {step.step}
                      </span>
                      <span className="text-[color:var(--ink-primary)]">{step.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            {/* ── The form ─────────────────────────────────────── */}
            <div className="lg:col-span-8">
              <h2 id="contact-form-heading" className="sr-only">
                {ui.contactFormHeading}
              </h2>

              <noscript>
                <div className="mb-6 border-l-2 border-[color:var(--amber)] bg-[color:var(--amber)]/5 p-6">
                  <p className="text-[color:var(--ink-primary)]">
                    {ui.noscript.lead}{' '}
                    <a href={`mailto:${site.email}`} className="underline">
                      {site.email}
                    </a>{' '}
                    {ui.noscript.trail}
                  </p>
                  <p className="mt-3 text-[15px] text-[color:var(--ink-muted)]">
                    {contact.form.phiNotice}
                  </p>
                </div>
              </noscript>

              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
