# PRISM website rebuild — changes from your current copy, and what we need from you

**Date:** 2026-09-16
**Status:** Phase 1 (static site) built. Nothing here blocks the build; each item has a working stand-in.

This document exists so that nothing about your regulated copy changes without you seeing it in writing.

It has two parts:

- **Part A — seven changes we made to your current wording**, and why. These are live in the build now. Each is reversible with a one-line content edit.
- **Part B — thirteen items we need from you.** Several are blocking *launch* (not the build): a production deploy is blocked automatically until the legal items are resolved.

Everything else on the new site is your existing copy, word for word. We extracted all of it from prism.inc and verified 296 of 296 strings character-for-character. Where your current site has no copy for something, we left it empty rather than writing something plausible.

---

## Part A — Changes we made to your current wording

### A1. "30-day" → "30-business-day" in three places

**This is the most important item in this document.** Please have whoever advises you on No Surprises Act compliance confirm it.

Your current site describes the NSA open negotiation period as a **30-day** window. The statutory period is **30 business days**, which is roughly six calendar weeks, not four. We corrected three places:

| Page | Your current wording | New wording |
|---|---|---|
| Products, module 04 *Negotiation Workflow* | "tracks the **30-day** clock, and escalates to IDR initiation **on day 31**" | "tracks the **30-business-day** clock, and escalates to IDR initiation **the next business day**" |
| Services, *Open Negotiation Management* | "We run the entire **30-day** Open Negotiation window…" | "We run the entire **30-business-day** Open Negotiation window…" |
| About, *Our mission* | "Providers have a **30-day** window, one offer…" | "Providers have a **30-business-day** window, one offer…" |

**Why we changed it rather than asking first:** a provider reading "30-day" could plan around the wrong deadline. For a company whose product is deadline tracking, that is a material inaccuracy, and it is the one case where we judged correcting your copy to be safer than reproducing it.

**We did not change** "Most engagements start with a 30-day diagnostic" on the Services page. That is your own commercial term, not a regulatory figure.

**If your counsel prefers the original wording, we revert in one line.** Tell us and it is done.

### A2. "SOC 2 ready" removed from the footer

Your current footer reads: *"© 2026 PRISM Inc. All rights reserved. HIPAA compliant. SOC 2 ready."*

We removed "SOC 2 ready". SOC 2 has defined states — Type I, Type II, or an audit in progress — and "ready" is not one of them. An enterprise security reviewer at a hospital will ask you to produce the report, and being unable to is worse than never having mentioned it.

**To put a SOC 2 statement back**, send us the actual status in writing and we will add it with the correct qualifier. There is a slot waiting for it. See B2.

### A3. "HIPAA compliant" → "HIPAA-aligned"

Your current site uses both phrasings: the footer says "HIPAA **compliant**", the homepage Compliance Shield card says "Full HIPAA-**aligned** audit trail". We standardised on **HIPAA-aligned** everywhere.

Both are your own words — we picked the more conservative of the two. "Compliant" reads as a certification that HIPAA does not actually issue; "aligned" describes your posture accurately and is materially easier to defend.

Tell us if you would rather standardise the other way, and we will — though we would advise against it.

### A4. Stronger wording on the contact form's PHI notice

| | Wording | Placement |
|---|---|---|
| **Your current form** | "We respect your PHI. No medical information should be shared via this form." | Small grey text *below* the message box |
| **New form** | "Please do not include patient information, claim numbers, or any protected health information in this form." | Directly *above* the message box, in normal body text |

Naming claim numbers matters: it is the specific thing a billing manager is most likely to paste in without thinking. And a warning below the field arrives after the typing is done.

### A5. Your logo sits on a white panel

Your logo file (`prism-logo.png`, 480×270) has a **solid white background** — not a transparent one. The new site is near-black throughout, so the logo is placed on a white panel in the header and footer.

This is exactly what your current site does in its navy footer, so it is consistent with how your brand already handles this. But it is a visible design compromise and you should see it and approve it. See B11 for the fix.

**We did not edit your logo** — no recolouring, no cropping, no keying out the white. It is byte-for-byte the file your site serves today.

### A6. One letter recased on the header button

Your current site writes the same button two ways: the header says "Request **C**onsultation", the homepage hero says "Request **c**onsultation". We standardised on the hero's sentence case, because the new site uses sentence case throughout. Same words; one capital letter.

### A7. Form labels say "(required)" instead of "*"

Your form marks required fields with an asterisk — "Full name *". We changed that to "Full name (required)".

A bare asterisk is read out inconsistently by screen readers: some announce "star", some skip it entirely, so a blind user may not learn the field is mandatory until the form rejects it. The wording is otherwise untouched.

---

## Part B — What we need from you

Ordered by urgency. "Blocks launch" means an automated build check refuses to publish until it is resolved — by design, so an unfinished item cannot ship by accident.

### Blocks launch

| # | Item | Why we can't decide it | Stand-in today |
|---|---|---|---|
| **B1** | **Privacy Policy content** | Legal text specific to your data handling and vendors. We will not draft privacy commitments on your behalf. | `/privacy` page exists, marked `TODO(legal)`. |
| **B2** | **Terms of Service content** | Same. | `/terms` page exists, marked `TODO(legal)`. |
| **B3** | **Security page content, and your actual SOC 2 status** | We need the real status (Type I / Type II / audit in progress / none) plus your HIPAA posture in your own words. Enterprise healthcare buyers look for this page first; its absence reads as a red flag. | `/security` page exists, marked `TODO(legal)`. |
| **B4** | **Footer legal disclaimer** — that the site is informational and not legal advice | Standard for this vertical, but the exact wording should come from your counsel. | `TODO(legal)` marker in the footer. |
| **B5** | **Where contact form submissions should be delivered** | We need a real inbox. `info@prism.inc` is published on your site — confirm we should use it, or give us another. | `TODO(config)`; the form falls back to a `mailto:` link. |

Your current site has **no** privacy policy and **no** terms of service. The footer shows "Privacy Policy", "Terms of Service" and "Compliance" as plain grey text that isn't clickable. Since you currently advertise HIPAA compliance and SOC 2 readiness, this gap is worth closing quickly, independent of the rebuild.

### Needed before launch, not blocking the build

| # | Item | Detail |
|---|---|---|
| **B6** | **Testimonial attribution — or permission to drop the testimonial** | Your 92% win-rate quote is currently attributed to "Dr. Anesthesiologist, MD / Out-of-Network Provider Group". That names no person and no organisation. We have **removed the testimonial from the new site**. To restore it we need a real name, title and organisation, plus that person's written consent to be quoted. Until then, presenting a 92% figure with a placeholder attribution is a claim you could be asked to substantiate and could not. Reinstating it is a one-line change once you have the attribution. |
| **B7** | **Turn off session recording on your current site** | Your live site runs PostHog with session recording enabled. It records what visitors type into your contact form — including anything a hospital biller pastes in. Given that your own form warns against sending PHI, this is worth switching off today, on the current site, regardless of the rebuild. The new site does not include it. |
| **B8** | **Stock photography** | Your current site hot-links four stock photos from Unsplash and Pexels, none licensed to this project. One is captioned "PRISM analytics dashboard" although it is a stock photo, not your product. The new design replaces that one with a live rendering and has no slots for the other three. If you want photography, we need licensed images. |
| **B9** | **Phone number and mailing address** | Your site publishes only "United States". We left it at that rather than inventing detail. If you want a phone number or address in the footer, send them. |
| **B10** | **Per-page titles and descriptions** (optional, recommended) | All five of your pages currently serve the *same* title and description. We preserved that exactly. Giving each page its own would help search visibility, but it means writing new marketing copy — your call. |
| **B11** | **A transparent or light-version logo** (recommended) | See A5. A transparent PNG or, ideally, an SVG would let the logo sit directly on the dark background and look considerably better. Drop-in replacement, no rebuild needed. |
| **B12** | **A favicon** | You don't currently have one. We could derive one from your logo, but that means cropping it, which we won't do without permission. |
| **B13** | **Confirm the five page URLs stay as they are** | `/`, `/products`, `/services`, `/about`, `/contact` are all preserved exactly, so existing search rankings and any links people have saved keep working. Just confirming we shouldn't rename anything. |

---

## Things we checked that are fine

So you know where we *did not* change anything:

- **The 92% win rate** appears on your current site only inside a quotation, never as a badge or statistic. That is the right way to handle it, and we have kept that rule — the figure will never appear as a standalone claim.
- **You never describe PRISM as a certified IDR entity.** Your copy consistently says you *select* certified IDR entities and represent clients *through* them. That distinction is correct and we preserved it precisely.
- **No payer names** (Aetna, BCBS, Cigna, UHC, or repricers) appear anywhere on your site. We kept it that way.
- **No aggregate performance claims** beyond the single quoted testimonial. "Win rate" and "average uplift" appear only as names of dashboard features, never with numbers attached.
- **Your headline, all four service pillars, all eight product modules, all six services, the four-step process, the PRISM acronym copy, and all four FAQ answers** are reproduced word for word.

---

## Summary

**Seven changes to your copy:** three regulatory corrections (30 business days), two compliance tightenings (SOC 2 and HIPAA wording), a stronger form warning, and two small accessibility/consistency fixes (button casing, "(required)" instead of "*"). Plus your logo on a white panel. All reversible.

**Five items block launch:** three legal pages, a footer disclaimer, and a delivery inbox.

**One item we'd act on today regardless of the rebuild:** session recording on your current site (B7).

Reply inline on any item and we will apply it.
