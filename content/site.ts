/**
 * content/site.ts — the single source of truth for every string on the site.
 *
 * PROVENANCE (Phase 0, spec §2.3)
 * Extracted 2026-09-16 from the live prism.inc production build.
 *
 * prism.inc is a client-rendered React SPA: the served HTML is a 3,345-byte
 * shell with an empty <div id="root">. No body copy exists in the HTML
 * response, so copy was recovered from the application bundle
 * (/static/js/main.472c0fe4.js) and then verified character-for-character
 * against the original unminified JSX recovered from the published
 * sourcemap (/static/js/main.472c0fe4.js.map, sourcesContent).
 *
 * Every string below is verbatim from that source. Nothing is paraphrased,
 * improved, or invented. Where the live site has no value for something the
 * rebuild requires, the field is `null` or carries a TODO marker — never a
 * plausible-sounding substitute (spec §13.2 item 9, CLAUDE.md rule 1).
 *
 * Two documented normalizations, both mechanical:
 *   1. JSX source line-wrapping inside text nodes is collapsed to single
 *      spaces, which is what the browser renders.
 *   2. `about.team.benchBackgrounds` drops a decorative "· " prefix that the
 *      live markup hardcodes inside each <li>; the rebuild uses real list
 *      markers. Flagged in docs/RECONCILIATION.md §6.
 *
 * Divergences between this file and spec §2.1 are catalogued in
 * docs/RECONCILIATION.md. The live site wins on every conflict (spec §2.3).
 */

/* ------------------------------------------------------------------ *
 * Types — every required field is non-optional (spec §13.3).
 * `null` is used only to record "the live site genuinely has none".
 * ------------------------------------------------------------------ */

/** Page <head> data. Absent values are `null`, never omitted. */
export interface PageMeta {
  /** Exact <title> served for this route. */
  title: string;
  /** Exact <meta name="description"> served for this route. */
  description: string;
  /** Live <link rel="canonical">. `null` = the live site emits none. */
  canonical: string | null;
  /** Live Open Graph tags. Empty object = the live site emits none. */
  openGraph: Record<string, never>;
  /** Live Twitter card tags. Empty object = the live site emits none. */
  twitter: Record<string, never>;
}

/** A heading the live markup splits across an explicit <br />. */
export interface SplitHeading {
  /** Text before the <br />. */
  line1: string;
  /** Text after the <br />. */
  line2: string;
  /** Full heading as a screen reader / crawler reads it. */
  plain: string;
}

export interface CtaLink {
  label: string;
  href: string;
}

export interface NavLink {
  name: string;
  path: string;
}

/** Small-caps label above a section head. Sentence case in the DOM. */
export type Overline = string;

export interface TitledItem {
  title: string;
  desc: string;
}

export interface ExternalImage {
  src: string;
  alt: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ProductModule {
  /** Live HUD number, rendered as 0{i+1}. */
  number: string;
  title: string;
  desc: string;
}

export interface ServiceOffering {
  title: string;
  summary: string;
  bullets: readonly string[];
}

export interface ProcessStep {
  step: string;
  title: string;
  desc: string;
}

export interface AcronymLetter {
  letter: string;
  word: string;
  desc: string;
  /** Live counter, rendered as 0{i+1} / 05. */
  counter: string;
}

export interface ValueItem {
  title: string;
  desc: string;
}

export interface FormField {
  /** Live input id / payload key. */
  id: string;
  /** Exact <label> text, including the live "*" required marker. */
  label: string;
  /**
   * Label without the live "*" marker, which is what actually renders.
   * A bare asterisk is announced inconsistently across screen readers, so
   * the shipped form pairs this with an explicit "(required)". Presentation
   * change only — the words are the live site's.
   */
  labelPlain: string;
  /** HTML input type as served. */
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  /** Exact placeholder text. `null` = the live field has none. */
  placeholder: string | null;
  /** Whether the live form enforces this field client-side. */
  required: boolean;
  /** Options for `type: 'select'`; empty for all other types. */
  options: readonly string[];
}

/* ------------------------------------------------------------------ *
 * Site identity (live: src/lib/constants.js)
 * ------------------------------------------------------------------ */

export const site = {
  /** Legal name, with the period. Never "PRISM Inc" or "Prism". */
  name: 'PRISM Inc.',
  /** Positioning line / acronym expansion. Uses "&", not "and". */
  tagline: 'Payment Resolution & IDR System Management',
  /** Wordmark casing. Always all-caps; never "Prism". */
  wordmark: 'PRISM',
  /**
   * The live site serves ONE title and ONE description for all five routes.
   * Preserved verbatim (§10.3). Per-page differentiation would be an SEO
   * improvement but means writing new marketing copy — CLIENT-QUESTIONS.md B10.
   */
  title: 'PRISM Inc. — Payment Resolution & IDR System Management',
  description:
    'PRISM Inc. — Payment Resolution & IDR System Management. Healthcare billing software and white-glove IDR consulting under the No Surprises Act.',
  email: 'info@prism.inc',
  /** The only location the live site publishes. No street address or phone. */
  address: 'United States',
  /** The live site publishes no telephone number anywhere. */
  phone: null,
  lang: 'en',
  origin: 'https://prism.inc',
  logo: {
    /** Path in this repo. Saved byte-identical to the served asset. */
    src: '/brand/prism-logo.png',
    /** Live URL it was served from (root, not /brand/). */
    liveSrc: 'https://prism.inc/prism-logo.png',
    /** Exact alt text used on the live site, in both nav and footer. */
    alt: 'PRISM',
    /** Intrinsic pixel size of the supplied raster. */
    width: 480,
    height: 270,
    /** Only a raster exists — there is no SVG. Do not redraw or recolor. */
    format: 'png',
    /** Live render height in both nav and footer. */
    renderedHeight: 120,
    /**
     * Max safe render height. Source is 270px tall; §2.1 allows 2x and
     * forbids upscaling, so do not exceed this without a new original.
     */
    maxRenderedHeight: 135,
    /**
     * The asset has NO transparency — all 129,600 pixels are opaque and
     * ~82% of them are pure white. On this site's dark surfaces it must sit
     * on a white plate (which is exactly what the live navy footer does).
     * Do not key out the white or recolor the wordmark to "fix" this —
     * that is editing the supplied asset (CLAUDE.md, spec §13.4).
     * A transparent / light-on-dark variant is an open client request.
     * See docs/RECONCILIATION.md §8.1.
     */
    hasTransparency: false,
    requiresLightPlateOnDark: true,
    sha256: 'cac2f10a093dd28f8f3084d7a99e8b8cf5f43406c759dfde3334761cd7c8e55c',
  },
} as const;

/* ------------------------------------------------------------------ *
 * Global nav (live: src/components/Navbar.jsx)
 * ------------------------------------------------------------------ */

export const nav = {
  links: [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ] as readonly NavLink[],
  /**
   * What ships. The live nav says "Request Consultation" (Title Case) while
   * the live hero says "Request consultation" (sentence case) — the live site
   * is internally inconsistent, and §3.2 mandates sentence case throughout.
   * Same words either way; only the casing of one letter differs.
   */
  cta: { label: 'Request consultation', href: '/contact' } as CtaLink,
  /** The live nav's Title Case form, retained for the record. Not rendered. */
  ctaLabelLive: 'Request Consultation',
  mobileToggleAriaLabel: 'Toggle menu',
} as const;

/* ------------------------------------------------------------------ *
 * Footer (live: src/components/Footer.jsx)
 * ------------------------------------------------------------------ */

export const footer = {
  logoAlt: 'PRISM',
  description:
    "Payment Resolution & IDR System Management. We help healthcare providers recover what they're owed under the No Surprises Act through proprietary software and white-glove IDR consulting.",
  navHeading: 'Navigate' as Overline,
  navLinks: [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ] as readonly NavLink[],
  contactHeading: 'Contact' as Overline,
  email: 'info@prism.inc',
  address: 'United States',
  /**
   * DEPARTURE FROM LIVE COPY (spec §13.2 items 1 and 19).
   *
   * Live: `© {year} PRISM Inc. All rights reserved. HIPAA compliant. SOC 2 ready.`
   *
   * Two changes, both using words the live site already uses elsewhere:
   *  - "HIPAA compliant" → "HIPAA-aligned", the more conservative of the
   *    live site's own two phrasings (the Compliance Shield pillar already
   *    says "HIPAA-aligned").
   *  - "SOC 2 ready" dropped entirely — "ready" is not a SOC 2 status, and
   *    §13.2 item 1 forbids any SOC 2 claim without written Type I/II
   *    confirmation.
   *
   * Still applies: never promote this string into a badge, trust object,
   * OG image, or meta description. See CLIENT-QUESTIONS.md Q2 and Q3.
   */
  copyrightSuffix: 'All rights reserved. HIPAA-aligned.',
  /**
   * Live legal labels are plain <span> elements, NOT links — there are no
   * privacy, terms, or compliance pages on prism.inc. Spec §2.4 asks whether
   * they already exist: they do not. Phase 1 must create them.
   */
  legalLabels: ['Privacy Policy', 'Terms of Service', 'Compliance'] as readonly string[],
  /**
   * Spec §10.4.6 requires an "informational, not legal advice" disclaimer.
   * The live site has none, and inventing regulatory disclaimer text is
   * out of bounds (CLAUDE.md rule 1). Client/counsel must supply it; the
   * content gate (§13.3) blocks production until this marker is replaced.
   */
  disclaimer: 'TODO(legal): client/counsel-supplied "informational, not legal advice" disclaimer',
} as const;

/* ------------------------------------------------------------------ *
 * Shared <head> data
 *
 * The live SPA serves ONE title and ONE description for all five routes
 * from index.html. There are no per-route meta tags, no canonical link,
 * and no OG/Twitter tags anywhere. Spec §10.3 says to preserve existing
 * title/description patterns: the pattern is a single site-wide pair,
 * reproduced verbatim below and reused per page.
 * See RECONCILIATION.md §3 for the per-page differentiation decision.
 * ------------------------------------------------------------------ */

const liveMeta = (): PageMeta => ({
  title: site.title,
  description: site.description,
  canonical: null,
  openGraph: {},
  twitter: {},
});

/* ------------------------------------------------------------------ *
 * / — Home (live: src/pages/Home.jsx)
 * ------------------------------------------------------------------ */

export const home = {
  route: '/',
  meta: liveMeta(),

  hero: {
    /** Kicker above the h1. */
    overline: 'Payment Resolution & IDR System Management' as Overline,
    heading: {
      line1: 'Out-of-network claims,',
      line2: 'resolved with precision.',
      plain: 'Out-of-network claims, resolved with precision.',
    } as SplitHeading,
    lead:
      'PRISM combines proprietary IDR software with white-glove consulting to maximize recovery under the No Surprises Act. We do the dispute math so you can focus on patient care.',
    primaryCta: { label: 'Request consultation', href: '/contact' } as CtaLink,
    secondaryCta: { label: 'Explore the platform', href: '/products' } as CtaLink,
  },

  /**
   * The four service pillars. Count confirmed: 4 (spec §2.1 correct).
   * Live markup renders each title as a <div>; the rebuild promotes these
   * to <h3> per spec §10.1. See RECONCILIATION.md §6.
   */
  valueProps: {
    overline: 'What PRISM does' as Overline,
    heading: 'Built for the entire IDR lifecycle.',
    intro:
      'From the moment a payer issues an underpayment to final IDRE determination, PRISM handles the legal mechanics, the math, and the documentation — without disrupting your revenue cycle workflow.',
    items: [
      {
        title: 'QPA Validation',
        desc:
          'Forensic analysis of every Qualifying Payment Amount against geographic and specialty benchmarks before you file.',
      },
      {
        title: 'IDR Strategy',
        desc:
          'Federal-certified IDR entity selection, batching logic, and offer modeling tuned to your case mix.',
      },
      {
        title: 'Compliance Shield',
        desc:
          'Full HIPAA-aligned audit trail, deadline tracking, and NSA Open Negotiation documentation.',
      },
      {
        title: 'Recovery Analytics',
        desc:
          'Real-time dashboards on payer behavior, win rates, dispute aging, and net recovery per claim.',
      },
    ] as readonly TitledItem[],
  },

  /** Platform section. Bullet count confirmed: 5. */
  platform: {
    overline: 'The PRISM Platform' as Overline,
    heading: 'Every dispute. Every dollar. One source of truth.',
    lead:
      'Our case management software ingests EOBs, validates QPAs, runs eligibility screens, drafts Open Negotiation letters, and tracks each dispute through the IDRE process — all from one workspace.',
    bullets: [
      'Automated NSA eligibility screening',
      'QPA comparison vs. FAIR Health & geographic data',
      'Open Negotiation & IDR initiation generators',
      'IDRE batching & strategic offer modeling',
      'Full audit trail & PHI-safe document vault',
    ] as readonly string[],
    /**
     * Hotlinked Unsplash stock photo. Not a PRISM asset and not licensed to
     * this project. The rebuild replaces it with the shader hologram
     * (spec §7.4); recorded here only for extraction completeness.
     */
    image: {
      src:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODh8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwZGF0YSUyMGFuYWx5dGljcyUyMGRhc2hib2FyZHxlbnwwfHx8fDE3Nzg1NDU1Mjd8MA&ixlib=rb-4.1.0&q=85',
      alt: 'PRISM analytics dashboard',
    } as ExternalImage,
    imageCaptionOverline: 'Live Case Dashboard' as Overline,
    imageCaptionTitle: 'Real-time IDR pipeline visibility',
  },

  /**
   * Testimonial.
   *
   * COMPLIANCE HOLD — do not render this station yet.
   * The live attribution is "Dr. Anesthesiologist, MD" / "Out-of-Network
   * Provider Group". That is a non-identifying placeholder, not a real
   * name, title, and organization. Spec §13.2 item 2 says: if the live page
   * has no name/title/org, cut the Testimonial station and replace the
   * scroll range with a dwell on the Platform trust plate.
   *
   * `render` is the content flag that re-enables it once the client supplies
   * a real, written-consent attribution. The quote below is stored verbatim
   * so nothing has to be re-fetched — it is simply not rendered.
   *
   * The "92% win rate" figure must never leave this blockquote: no badge,
   * counter, trust object, OG image, or meta description (spec §10.4.1).
   */
  testimonial: {
    render: false,
    overline: 'Client outcome' as Overline,
    /** Verbatim, including the live straight double-quote characters. */
    quote:
      '"PRISM took our IDR backlog from chaos to a structured 92% win rate. The white-glove team understands NSA math better than the payers do."',
    attributionName: 'Dr. Anesthesiologist, MD',
    attributionOrg: 'Out-of-Network Provider Group',
    /** False = the live attribution does not identify a real person or org. */
    attributionIsIdentifying: false,
    image: {
      src:
        'https://images.pexels.com/photos/19438562/pexels-photo-19438562.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      alt: 'Healthcare professional',
    } as ExternalImage,
  },

  /** FAQ. Count confirmed: 4. These are the real live answers. */
  faq: {
    overline: 'FAQ' as Overline,
    heading: 'The IDR process, demystified.',
    footnote: 'Still have questions?',
    cta: { label: 'Talk to an expert', href: '/contact' } as CtaLink,
    items: [
      {
        q: 'What is the No Surprises Act IDR process?',
        a:
          "The Federal Independent Dispute Resolution (IDR) process is a baseball-style arbitration created under the No Surprises Act. When a payer and out-of-network provider can't agree on a payment for emergency or covered ancillary services, either party can initiate IDR. A certified IDR entity selects one of the two offers based on the QPA and additional credible information.",
      },
      {
        q: 'How is PRISM different from a billing service?',
        a:
          'PRISM is purpose-built for NSA IDR — not generic revenue cycle work. Our platform automates eligibility checks, QPA challenges, batching, and certified IDRE filings, while our consultants build the case strategy. We charge on results, not hours.',
      },
      {
        q: 'What types of providers do you serve?',
        a:
          'Emergency medicine, anesthesiology, radiology, pathology, hospitalist groups, air ambulance, and any provider rendering out-of-network NSA-covered services. We work with private practices, hospital-affiliated groups, and MSOs.',
      },
      {
        q: 'What information do I need to get started?',
        a:
          'A sample of denied or underpaid out-of-network EOBs, your current payer mix, and basic claims volume. We sign a BAA before reviewing any PHI.',
      },
    ] as readonly FaqItem[],
  },
} as const;

/* ------------------------------------------------------------------ *
 * /products (live: src/pages/Products.jsx)
 *
 * STATION COUNT: 8. Not an assumption — the live page renders eight
 * modules and its own lead copy says "Eight integrated modules".
 * The eight names below are the live site's own product names.
 * ------------------------------------------------------------------ */

export const products = {
  route: '/products',
  meta: liveMeta(),

  hero: {
    overline: 'Product' as Overline,
    heading: 'The PRISM IDR Platform.',
    lead:
      'A complete operating system for No Surprises Act dispute management. Eight integrated modules, one workspace, zero spreadsheets.',
    cta: { label: 'Book a demo', href: '/contact' } as CtaLink,
  },

  /**
   * The eight platform modules, verbatim and in live DOM order.
   *
   * Module 04 "Negotiation Workflow" is the one string on this page that
   * departs from live copy: live said "the 30-day clock" and "day 31", and
   * spec §13.2 item 10 resolves that to "30 business days" because the
   * statutory NSA open-negotiation period is 30 BUSINESS days and §10.4.5
   * (regulatory exactness) outranks §13.1 (live wording) when they
   * conflict. Flagged to the client in CLIENT-QUESTIONS.md Q1.
   */
  modules: [
    {
      number: '01',
      title: 'Claims Ingest',
      desc:
        'Pull EOBs and remits from your clearinghouse via SFTP, X12 835 parsing, or direct payer portal scraping.',
    },
    {
      number: '02',
      title: 'Eligibility Engine',
      desc:
        'Auto-classifies each claim under NSA, state surprise law, ERISA, or out-of-scope — with the supporting CFR citations.',
    },
    {
      number: '03',
      title: 'QPA Validator',
      desc:
        "Compares the payer's QPA to FAIR Health, geographic medians, and historical contracted rates; flags low outliers for challenge.",
    },
    {
      number: '04',
      title: 'Negotiation Workflow',
      /**
       * DEPARTURE FROM LIVE COPY (spec §13.2 item 10).
       * Live: "tracks the 30-day clock, and escalates to IDR initiation on
       * day 31." Corrected because the statutory NSA open-negotiation
       * period is 30 BUSINESS days; §10.4.5 outranks §13.1 on regulatory
       * exactness. See `departuresFromLive` below and CLIENT-QUESTIONS.md Q1.
       */
      desc:
        'Auto-drafts Open Negotiation letters, tracks the 30-business-day clock, and escalates to IDR initiation the next business day.',
    },
    {
      number: '05',
      title: 'IDRE Submission',
      desc:
        'Generates compliant IDR filings with credible information packets tuned to your service line and IDRE history.',
    },
    {
      number: '06',
      title: 'Recovery Analytics',
      desc:
        'Win rate, average uplift, payer-level performance, denial trends — exportable to your BI tool.',
    },
    {
      number: '07',
      title: 'Deadline Sentinel',
      desc:
        'Federal IDR deadlines are unforgiving. PRISM tracks every clock and routes overdue items before they expire.',
    },
    {
      number: '08',
      title: 'Audit Trail',
      desc:
        'Every action, document, and timestamp is preserved in an immutable, BAA-covered record.',
    },
  ] as readonly ProductModule[],

  closing: {
    heading: 'See PRISM resolve a live dispute.',
    body:
      "45-minute working demo with our IDR strategists. Bring a real EOB and we'll walk through eligibility, QPA validation, and the recommended offer in front of you.",
    cta: { label: 'Schedule demo', href: '/contact' } as CtaLink,
  },
} as const;

/* ------------------------------------------------------------------ *
 * /services (live: src/pages/Services.jsx)
 *
 * STATION COUNT: 6 service offerings (NOT 4).
 * PROCESS STEP COUNT: 4 engagement steps.
 * v1 assumed a single "4-step engagement process" and no service list;
 * the live page has both, and they are different lengths.
 * ------------------------------------------------------------------ */

export const services = {
  route: '/services',
  meta: liveMeta(),

  hero: {
    overline: 'Services' as Overline,
    heading: 'White-glove IDR consulting.',
    lead:
      "Software alone doesn't win disputes — strategy does. PRISM's IDR specialists handle the entire arbitration lifecycle on your behalf, with results-based pricing.",
  },

  /**
   * Six service offerings, verbatim and in live DOM order.
   * Each has exactly four bullets.
   *
   * "Open Negotiation Management" carries the same 30-business-day
   * correction as products module 04 (spec §13.2 item 10).
   */
  offerings: [
    {
      title: 'White-Glove IDR Calculation',
      summary: 'Hand-calculated, defensible IDR offers built around your case specifics.',
      bullets: [
        'Custom QPA challenge methodology',
        'Geographic & specialty benchmarking',
        'Outlier identification with credible info packets',
        'Offer modeling against IDRE patterns',
      ],
    },
    {
      title: 'Open Negotiation Management',
      /** DEPARTURE: "30-day" → "30-business-day" (§13.2 item 10). */
      summary: "We run the entire 30-business-day Open Negotiation window so you don't have to.",
      bullets: [
        'Open Negotiation initiation',
        'Payer follow-up & escalation',
        'Settlement evaluation',
        'Clean handoff to IDR if needed',
      ],
    },
    {
      title: 'Federal IDR Representation',
      summary: 'Full-service representation through certified IDR entities.',
      bullets: [
        'IDRE selection strategy',
        'Compliant initiation filing',
        'Credible information assembly',
        'Final offer submission & response',
      ],
    },
    {
      title: 'Appeals & Underpayment Recovery',
      summary: 'Beyond NSA — ERISA, state surprise law, and contracted underpayments.',
      bullets: [
        'ERISA Level 1 & 2 appeals',
        'State-specific dispute pathways',
        'Contractual underpayment audits',
        'Take-back & recoupment defense',
      ],
    },
    {
      title: 'Outsourced IDR Operations',
      summary: 'Fully delegated IDR operations for groups without in-house bandwidth.',
      bullets: [
        'Dedicated case team',
        'Weekly performance reporting',
        'Payer-by-payer scorecards',
        'Pay-on-results pricing',
      ],
    },
    {
      title: 'Training & Advisory',
      summary: 'Build in-house IDR muscle with PRISM-led training and advisory.',
      bullets: [
        'NSA compliance workshops',
        'QPA challenge bootcamps',
        'Custom SOP development',
        'Quarterly regulatory briefings',
      ],
    },
  ] as readonly ServiceOffering[],

  /** Engagement timeline. Count confirmed: 4 (matches v1's assumption). */
  engagement: {
    overline: 'Engagement' as Overline,
    heading: 'How we work.',
    lead:
      'Most engagements start with a 30-day diagnostic. From there, we move to a pay-on-results retainer aligned to net recovery.',
    steps: [
      {
        step: '01',
        title: 'Discovery',
        desc: 'We review a sample of EOBs and your payer mix under a signed BAA.',
      },
      {
        step: '02',
        title: 'Strategy',
        desc:
          'Custom IDR playbook tied to your specialty, state, and largest payer counterparties.',
      },
      {
        step: '03',
        title: 'Execution',
        desc:
          'PRISM team and platform handle Open Negotiation, IDR filings, and IDRE submissions.',
      },
      {
        step: '04',
        title: 'Reporting',
        desc: 'Weekly recovery reports and quarterly business reviews with your finance team.',
      },
    ] as readonly ProcessStep[],
  },

  whyWhiteGlove: {
    overline: 'Why white-glove' as Overline,
    heading: 'Specialists, not generalists.',
    body:
      'Our IDR team is staffed by former payer auditors, healthcare attorneys, and actuarial analysts. Every dispute is owned by a named lead — not a queue.',
    cta: { label: 'Schedule a strategy call', href: '/contact' } as CtaLink,
    /** Hotlinked Unsplash stock photo; not a licensed project asset. */
    image: {
      src:
        'https://plus.unsplash.com/premium_photo-1673953509982-632a317d1f8c?fm=jpg&q=60&w=1600&auto=format&fit=crop',
      alt: 'Doctor in white coat and white gloves',
    } as ExternalImage,
  },
} as const;

/* ------------------------------------------------------------------ *
 * /about (live: src/pages/About.jsx)
 *
 * The live page defines the PRISM acronym explicitly, exactly as spec
 * §8.4 / §13.2 item 13 predicted: P·R·I·S·M =
 * Payment · Resolution · IDR · System · Management.
 * The per-letter copy below is the live site's own, so the About
 * centerpiece no longer needs fallback copy from §2.1.
 * ------------------------------------------------------------------ */

export const about = {
  route: '/about',
  meta: liveMeta(),

  hero: {
    overline: 'Payment Resolution & IDR System Management' as Overline,
    heading: {
      line1: 'Fair compensation,',
      line2: 'for the people who deliver care.',
      plain: 'Fair compensation, for the people who deliver care.',
    } as SplitHeading,
    lead:
      'PRISM exists to help providers, facilities, and the communities they serve — by making sure that the care delivered is the care that gets paid for. We turn the No Surprises Act from a paperwork burden into your competitive advantage.',
  },

  /** Acronym section. Letter count confirmed: 5. */
  acronym: {
    overline: 'The PRISM acronym' as Overline,
    heading: {
      line1: 'Five letters.',
      line2: 'One promise.',
      plain: 'Five letters. One promise.',
    } as SplitHeading,
    /** Live intro wraps the tagline in <strong>. Parts preserved. */
    intro: {
      before: 'PRISM stands for ',
      strong: 'Payment Resolution & IDR System Management',
      after:
        " — the full stack of work it takes to get providers paid fairly under the No Surprises Act. Here's what each letter does for you.",
      plain:
        "PRISM stands for Payment Resolution & IDR System Management — the full stack of work it takes to get providers paid fairly under the No Surprises Act. Here's what each letter does for you.",
    },
    /** Live "Stands for" label above each word. */
    standsForLabel: 'Stands for' as Overline,
    letters: [
      {
        letter: 'P',
        word: 'Payment',
        desc:
          'Every dollar earned at the bedside, recovered. We make sure the care your team delivered is the care your group gets paid for.',
        counter: '01 / 05',
      },
      {
        letter: 'R',
        word: 'Resolution',
        desc:
          "Disputes closed decisively. We don't just file — we drive payer negotiations to fair, defensible outcomes that hold up under scrutiny.",
        counter: '02 / 05',
      },
      {
        letter: 'I',
        word: 'IDR',
        desc:
          'Federal Independent Dispute Resolution under the No Surprises Act. The arbitration process built to level the playing field — we make it work for you.',
        counter: '03 / 05',
      },
      {
        letter: 'S',
        word: 'System',
        desc:
          'Purpose-built software that scales with your practice. From a single ER group to a multi-state facility network, the platform handles the volume.',
        counter: '04 / 05',
      },
      {
        letter: 'M',
        word: 'Management',
        desc:
          'End-to-end handling — eligibility, negotiation, IDR filing, follow-through. Your clinicians stay focused on patients; we run the rest.',
        counter: '05 / 05',
      },
    ] as readonly AcronymLetter[],
    /** Live lockup strip beneath the letter grid. */
    lockupLabel: 'PRISM =' as Overline,
    lockupText: 'Payment Resolution & IDR System Management',
  },

  /** Audience section. Count confirmed: 3. */
  whoWeHelp: {
    overline: 'Who we help' as Overline,
    heading: {
      line1: 'Built for providers.',
      line2: 'Felt by communities.',
      plain: 'Built for providers. Felt by communities.',
    } as SplitHeading,
    intro:
      "When providers and facilities are paid fairly for the care they deliver, healthcare works the way it's supposed to. Practices stay viable, clinicians stay at the bedside, and the communities they serve keep access to care.",
    items: [
      {
        title: 'Providers',
        desc:
          'Emergency physicians, anesthesiologists, radiologists, hospitalists, pathologists — anyone delivering care out-of-network deserves fair compensation. We make sure they get it.',
      },
      {
        title: 'Facilities',
        desc:
          'Hospitals, surgery centers, freestanding ERs, and air ambulance providers. We strengthen your revenue cycle so your facility stays sustainable and your doors stay open.',
      },
      {
        title: 'Communities',
        desc:
          'When providers are paid fairly, practices stay viable, clinicians stay at the bedside, and patients keep access to the care their community needs.',
      },
    ] as readonly TitledItem[],
  },

  mission: {
    overline: 'Our mission' as Overline,
    heading: 'Return underpaid dollars to the people who earned them.',
    /** DEPARTURE: "30-day window" → "30-business-day window" (§13.2 item 10). */
    body:
      "The No Surprises Act protects patients from surprise bills — that's a good thing. But the dispute process built around it is heavily tilted toward payers. Providers have a 30-business-day window, one offer, and limited support. PRISM levels that playing field, so the people delivering care aren't the ones left short.",
    /** Hotlinked Unsplash stock photo; not a licensed project asset. */
    image: {
      src:
        'https://images.unsplash.com/photo-1764885415480-558e5631d371?fm=jpg&q=60&w=1600&auto=format&fit=crop',
      alt: 'Modern hospital facility',
    } as ExternalImage,
  },

  /** Operating values. Count confirmed: 4, and the heading says "Four". */
  values: {
    overline: 'What guides us' as Overline,
    heading: 'Four operating values.',
    items: [
      {
        title: 'Provider-first',
        desc:
          'Every decision starts with one question: does this help the provider get paid fairly? Nothing else takes priority.',
      },
      {
        title: 'Defensible math',
        desc:
          'Every offer we make is supported by citations, benchmarks, and statistically valid comparables — built to withstand any IDRE review.',
      },
      {
        title: 'Aligned pricing',
        desc:
          'Pay-on-results. We only win when you do, which means our incentives are identical to yours from day one.',
      },
      {
        title: 'Operational rigor',
        desc:
          'Every case has a named owner, a documented playbook, and a full audit trail. No queues, no black boxes.',
      },
    ] as readonly ValueItem[],
  },

  /**
   * Team section. Note: the live site names no individuals — no leadership
   * bios, no headshots, no titles. Only category-level backgrounds.
   */
  team: {
    overline: 'Our team' as Overline,
    heading: 'Seasoned operators from the other side of the table.',
    body:
      'Most of our team has worked inside payer dispute departments — as auditors, healthcare regulatory attorneys, board-certified physicians, and credentialed actuaries. We know how payers staff, score, and settle disputes because we used to do it ourselves.',
    benchHeading: 'Backgrounds on our bench' as Overline,
    /**
     * Live markup hardcodes a decorative "· " inside each <li>. Dropped here;
     * the rebuild uses real list markers. Text is otherwise verbatim.
     */
    benchBackgrounds: [
      'Former payer provider-disputes leads',
      'Healthcare regulatory attorneys',
      'Board-certified emergency & anesthesia physicians',
      'Credentialed actuaries (FSA, ASA)',
      'Revenue cycle & clearinghouse operators',
    ] as readonly string[],
  },

  closing: {
    heading: 'Ready to see what fair compensation looks like for your group?',
    cta: { label: 'Start with a free diagnostic', href: '/contact' } as CtaLink,
  },
} as const;

/* ------------------------------------------------------------------ *
 * /contact (live: src/pages/Contact.jsx)
 * ------------------------------------------------------------------ */

export const contact = {
  route: '/contact',
  meta: liveMeta(),

  hero: {
    overline: 'Contact' as Overline,
    heading: "Let's talk recovery.",
    lead:
      "Tell us about your practice and current IDR pain points. We'll respond within one business day with a recommended next step.",
  },

  direct: {
    overline: 'Reach us directly' as Overline,
    emailLabel: 'Email',
    email: 'info@prism.inc',
    locationLabel: 'Location',
    location: 'United States',
  },

  /** "What happens next" ordered list. Count confirmed: 4. */
  whatHappensNext: {
    overline: 'What happens next' as Overline,
    steps: [
      { step: '01', text: 'We review your inquiry within 1 business day.' },
      { step: '02', text: '30-minute discovery call with an IDR specialist.' },
      { step: '03', text: 'BAA signed; we analyze a sample of EOBs.' },
      { step: '04', text: 'Recovery diagnostic + recommended engagement.' },
    ] as readonly { step: string; text: string }[],
  },

  /**
   * The live form.
   *
   * Live fields:        name, email, company, phone, service_interest, message
   * Spec §9 fields:     name, work email, organization, role, message
   * These do not match. The live set is recorded verbatim below; the field
   * reconciliation and recommendation are in RECONCILIATION.md §5.2.
   *
   * Live submit target (observed):
   *   POST https://billing-hub-206.emergent.host/api/contact
   * i.e. `${REACT_APP_BACKEND_URL}/api/contact`, via axios, JSON body.
   * The rebuild replaces this with `app/api/contact/route.ts` + Resend and
   * stores nothing (spec §9, §13.2 item 5). The live endpoint is on a
   * third-party Emergent host and must NOT be carried over.
   */
  form: {
    fields: [
      {
        id: 'name',
        label: 'Full name *',
        labelPlain: 'Full name',
        type: 'text',
        placeholder: 'Jane Doe',
        required: true,
        options: [],
      },
      {
        id: 'email',
        label: 'Work email *',
        labelPlain: 'Work email',
        type: 'email',
        placeholder: 'jane@practice.com',
        required: true,
        options: [],
      },
      {
        id: 'company',
        label: 'Company / Practice',
        labelPlain: 'Company / Practice',
        type: 'text',
        placeholder: 'Atlantic Emergency Physicians',
        required: false,
        options: [],
      },
      {
        /**
         * The live phone input carries NO `type` attribute, so it renders as
         * `type="text"`. Recorded as served. The rebuild should use
         * `type="tel"` for mobile keyboards — an accessibility improvement,
         * not an extraction finding.
         */
        id: 'phone',
        label: 'Phone',
        labelPlain: 'Phone',
        type: 'text',
        placeholder: '(555) 123-4567',
        required: false,
        options: [],
      },
      {
        id: 'service_interest',
        label: 'Service of interest',
        labelPlain: 'Service of interest',
        type: 'select',
        placeholder: 'Select a service',
        required: false,
        options: [
          'IDR Software Platform',
          'White-Glove IDR Consulting',
          'Open Negotiation Management',
          'Federal IDR Representation',
          'Appeals & Underpayment Recovery',
          'Training & Advisory',
          'Other / Not Sure',
        ],
      },
      {
        id: 'message',
        label: 'How can we help? *',
        labelPlain: 'How can we help?',
        type: 'textarea',
        placeholder:
          'Tell us about your claim volume, current IDR challenges, and what success looks like...',
        required: true,
        options: [],
      },
    ] as readonly FormField[],

    /**
     * The notice that ships, per spec §9 and §13.2 item 20.
     *
     * DEPARTURE FROM LIVE COPY. It is more specific than the live notice
     * (it names claim numbers) and it must render ABOVE the message field,
     * visible and non-dismissible — the live site puts a weaker version
     * below the field in small grey text. §13.2 item 20: this is a risk
     * control, not a claim, and "live site wins" governs claims.
     */
    phiNotice:
      'Please do not include patient information, claim numbers, or any protected health information in this form.',
    /** The live wording, retained for the record only. Not rendered. */
    phiNoticeLive: 'We respect your PHI. No medical information should be shared via this form.',

    submitLabel: 'Send inquiry',
    submittingLabel: 'Sending...',

    /** Live client-side validation message when a required field is empty. */
    validationError: 'Please fill in name, email, and message.',
    /** Live toast on success. */
    successToast: "Inquiry sent. We'll be in touch within one business day.",
    /** Live generic failure toast. */
    errorToast: 'Failed to send. Please try again.',

    success: {
      heading: 'Thank you.',
      body:
        'Your inquiry is in our queue. An IDR specialist will reach out within one business day.',
      resetLabel: 'Send another inquiry',
    },

    /** Recorded for reference only; not reused. See note above. */
    liveSubmitTarget: 'https://billing-hub-206.emergent.host/api/contact',
    liveSubmitMethod: 'POST',
  },
} as const;

/* ------------------------------------------------------------------ *
 * Site chrome.
 *
 * Strings the rebuild needs that have no live-site equivalent: skip link,
 * landmark names, the 404 page, count captions, and the form's own UI text.
 *
 * None of these is marketing copy and none makes a claim about PRISM or
 * about NSA/IDR process — that is the line. They live here rather than in
 * components so that the §11.3 QA item ("every on-screen string traces to
 * content/site.ts") is literally true and a copy edit never means a code
 * edit (CLAUDE.md rule 1).
 * ------------------------------------------------------------------ */

export const ui = {
  skipToContent: 'Skip to content',
  /** Accessible names for the landmarks. */
  navLandmarkLabel: 'Main',
  footerLandmarkLabel: 'Footer',
  homeLinkLabel: `${site.name} — home`,

  /** Explicit required marker; a bare "*" is announced inconsistently. */
  requiredMarker: '(required)',
  /** sr-only heading naming the contact form section. */
  contactFormHeading: 'Send an inquiry',
  formFallbackLead: 'You can also email us directly at',

  /** Count captions beneath the data-driven station grids (§8.0). */
  countModules: 'modules',
  countServices: 'services',
  countSteps: 'steps',

  notFound: {
    overline: 'Error 404',
    heading: 'That page doesn’t exist.',
    body: 'The link may be out of date. Everything on the site is one step away:',
  },

  /** Shown only with JavaScript disabled (§9, §11.3). */
  noscript: {
    lead: 'This form needs JavaScript to submit. Email us directly at',
    trail: 'and we’ll respond within one business day.',
  },

  /** Footer legal links. The live site's labels, now as real links. */
  legalLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/security' },
  ] as readonly CtaLink[],
} as const;

/* ------------------------------------------------------------------ *
 * Legal page scaffolds (spec §13.2 item 3).
 *
 * These three pages have NO live equivalent: the live footer shows
 * "Privacy Policy", "Terms of Service" and "Compliance" as plain
 * non-linking <span>s (docs/RECONCILIATION.md §7.3). So there is nothing to
 * port verbatim, and drafting privacy commitments, contract terms, or
 * HIPAA/SOC 2 posture on the client's behalf is out of bounds.
 *
 * Each page therefore ships real, navigable and honest about being
 * unfinished. Every `awaiting` entry carries a literal TODO(legal) marker so
 * the content gate refuses to let these reach production, and the markers
 * live here — in content/ — where the gate scans.
 * ------------------------------------------------------------------ */

export interface LegalPageContent {
  route: string;
  overline: string;
  heading: string;
  /** Neutral description of the page's purpose. No commitments, no claims. */
  summary: string;
  /** What the client must supply. Each entry carries its own marker. */
  awaiting: readonly string[];
}

export const legalUi = {
  awaitingHeading: 'This page is awaiting approved content',
  awaitingBody:
    'We have deliberately not drafted this text. Legal and compliance wording for a regulated healthcare vendor has to come from PRISM and its counsel, not from the site build.',
  awaitingListHeading: 'Needed to complete this page',
  contactLead: 'In the meantime, questions about privacy, security or terms can go to',
  returnHome: 'Return home',
} as const;

/*
 * Exported individually rather than looked up by route. A module-scope
 * `legalPageFor(route)` call in a page file resolved to `undefined` at
 * runtime under Next 14's App Router chunking — the pages 500'd while the
 * build still prerendered them successfully, which is a nasty failure mode.
 * Direct const imports have no such ambiguity.
 */
export const privacyPage: LegalPageContent = {
  route: '/privacy',
  overline: 'Legal',
  heading: 'Privacy Policy',
  summary: 'How PRISM handles information submitted through this website.',
  awaiting: [
    'TODO(legal): What information the contact form collects, and how long it is retained',
    'TODO(legal): Named subprocessors (email delivery, hosting, analytics) and their locations',
    'TODO(legal): Whether a Business Associate Agreement is offered, and at what point in the engagement',
    'TODO(legal): Data subject rights process and the contact route for requests',
    'TODO(legal): Cookie and analytics disclosure — the rebuild uses no cookies and no session recording',
    'TODO(legal): Counsel sign-off on the final text',
  ],
};

export const termsPage: LegalPageContent = {
  route: '/terms',
  overline: 'Legal',
  heading: 'Terms of Service',
  summary: 'The terms governing use of this website and the information on it.',
  awaiting: [
    'TODO(legal): Acceptable use terms for the website itself',
    'TODO(legal): Disclaimer that site content is informational and not legal, billing, or clinical advice',
    'TODO(legal): Limitation of liability and governing law / jurisdiction',
    'TODO(legal): Whether platform or consulting engagement terms are referenced here or handled separately in an MSA',
    'TODO(legal): Intellectual property and permitted-use statement',
    'TODO(legal): Counsel sign-off on the final text',
  ],
};

export const securityPage: LegalPageContent = {
  route: '/security',
  overline: 'Trust',
  heading: 'Security',
  summary:
    'PRISM’s security posture, compliance status, and how to reach the team with a security question.',
  awaiting: [
    'TODO(legal): Actual SOC 2 status in writing — Type I, Type II, audit in progress, or none. Do not publish an unqualified claim',
    'TODO(legal): HIPAA posture in PRISM’s own words, and confirmation that "HIPAA-aligned" is the approved phrasing site-wide',
    'TODO(legal): Whether a Business Associate Agreement is executed with clients, and at what stage',
    'TODO(legal): Encryption posture in transit and at rest, and the hosting/subprocessor list',
    'TODO(legal): Access control, audit logging, and personnel background-check practices',
    'TODO(legal): Security contact address and vulnerability disclosure process',
    'TODO(legal): Incident response and breach notification commitments',
  ],
};

/** All three, for iteration (sitemap, footer links, gate reporting). */
export const legalPages: readonly LegalPageContent[] = [privacyPage, termsPage, securityPage];

/* ------------------------------------------------------------------ *
 * Live URL inventory — input to the §2.5 redirect map.
 * ------------------------------------------------------------------ */

export const liveUrlInventory = {
  /**
   * Every route the live client-side router matches. There are exactly five.
   * All five are preserved at identical paths in the rebuild, so no 301 is
   * required for any of them.
   */
  routes: [
    { path: '/', exists: true, preserved: true },
    { path: '/products', exists: true, preserved: true },
    { path: '/services', exists: true, preserved: true },
    { path: '/about', exists: true, preserved: true },
    { path: '/contact', exists: true, preserved: true },
  ] as readonly { path: string; exists: boolean; preserved: boolean }[],

  /** Static assets served from the live origin. */
  assets: [
    { path: '/prism-logo.png', note: 'Logo. Moves to /brand/prism-logo.png — needs a 301.' },
    { path: '/asset-manifest.json', note: 'CRA build artifact. Not carried over.' },
    { path: '/static/js/main.472c0fe4.js', note: 'CRA bundle. Not carried over.' },
    { path: '/static/css/main.4e08b093.css', note: 'CRA stylesheet. Not carried over.' },
    { path: '/static/js/main.472c0fe4.js.map', note: 'Public sourcemap. Do not publish one.' },
    { path: '/static/css/main.4e08b093.css.map', note: 'Public sourcemap. Do not publish one.' },
  ] as readonly { path: string; note: string }[],

  /**
   * Confirmed ABSENT on the live site. Not redirects — net-new pages.
   * Footer references Privacy Policy / Terms of Service / Compliance as
   * plain text, so there is nothing to port verbatim (spec §2.4).
   */
  absent: ['/privacy', '/terms', '/security', '/robots.txt', '/sitemap.xml', '/favicon.ico'] as readonly string[],

  /**
   * The live origin is an SPA catch-all: EVERY unmatched path returns
   * HTTP 200 with the shell, so unknown URLs are soft-404s today. The
   * rebuild returns real 404s, which is correct but will change status
   * codes for any junk URL currently indexed. See RECONCILIATION.md §7.
   */
  unmatchedPathBehavior: 'HTTP 200 + SPA shell (soft 404)',
} as const;

/* ------------------------------------------------------------------ *
 * Deliberate departures from live copy.
 *
 * Every string on this site traces either to the live-site extraction or
 * to one of the entries below (spec §11.3 QA item). There are five, all
 * authorised by named §13.2 decisions, and all disclosed to the client in
 * docs/CLIENT-QUESTIONS.md. Nothing else differs from the live site.
 * ------------------------------------------------------------------ */

export const departuresFromLive = [
  {
    id: 'Q1a',
    field: 'products.modules[3].desc',
    live: 'Auto-drafts Open Negotiation letters, tracks the 30-day clock, and escalates to IDR initiation on day 31.',
    shipped:
      'Auto-drafts Open Negotiation letters, tracks the 30-business-day clock, and escalates to IDR initiation the next business day.',
    authority: '§13.2 item 10',
    reason:
      'The statutory NSA open-negotiation period is 30 business days. §10.4.5 regulatory exactness outranks §13.1 live wording.',
  },
  {
    id: 'Q1b',
    field: 'services.offerings[1].summary',
    live: "We run the entire 30-day Open Negotiation window so you don't have to.",
    shipped:
      "We run the entire 30-business-day Open Negotiation window so you don't have to.",
    authority: '§13.2 item 10',
    reason: 'Same statutory correction.',
  },
  {
    id: 'Q1c',
    field: 'about.mission.body',
    live: 'Providers have a 30-day window, one offer, and limited support.',
    shipped: 'Providers have a 30-business-day window, one offer, and limited support.',
    authority: '§13.2 item 10',
    reason: 'Same statutory correction.',
  },
  {
    id: 'Q2+Q3',
    field: 'footer.copyrightSuffix',
    live: 'All rights reserved. HIPAA compliant. SOC 2 ready.',
    shipped: 'All rights reserved. HIPAA-aligned.',
    authority: '§13.2 items 1 and 19',
    reason:
      '"HIPAA-aligned" is the more conservative of the live site\'s own two phrasings. "SOC 2 ready" is not a SOC 2 status and needs written Type I/II confirmation.',
  },
  {
    id: 'A-nav-case',
    field: 'nav.cta.label',
    live: 'Request Consultation',
    shipped: 'Request consultation',
    authority: '§3.2',
    reason:
      'The live nav is Title Case while the live hero is sentence case for the same CTA. §3.2 mandates sentence case throughout; same words, one letter recased.',
  },
  {
    id: 'A-required-marker',
    field: 'contact.form.fields[*].label',
    live: 'Full name *  /  Work email *  /  How can we help? *',
    shipped: 'Full name (required)  /  Work email (required)  /  How can we help? (required)',
    authority: '§9, §10.1',
    reason:
      'A bare asterisk is announced inconsistently across screen readers. The words are unchanged; the required marker is made explicit. Live labels retained in `label`, shipped text in `labelPlain`.',
  },
  {
    id: 'Q4',
    field: 'contact.form.phiNotice',
    live: 'We respect your PHI. No medical information should be shared via this form.',
    shipped:
      'Please do not include patient information, claim numbers, or any protected health information in this form.',
    authority: '§13.2 item 20, §9',
    reason:
      'A risk control, not a marketing claim. More specific, and moved above the message field.',
  },
] as const;

/**
 * Live strings deliberately NOT rendered anywhere, kept only so that a
 * reviewer can diff against the live site without re-fetching it.
 */
export const retainedButNotRendered = [
  'home.testimonial.* — station disabled pending real attribution (§13.2 item 2)',
  'contact.form.phiNoticeLive — superseded by phiNotice (§13.2 item 20)',
  'nav.ctaLabelLive — superseded by nav.cta.label (sentence case, §3.2)',
  'contact.form.fields[*].label — live "*" form; labelPlain ships instead',
  'contact.form.validationError — the shipped form reports errors per field via zod, which is more useful than one combined message',
  'contact.form.successToast — the shipped form shows an inline success panel; no toast library is added (§4 "do not add")',
  'contact.form.liveSubmitTarget — third-party endpoint, replaced by /api/contact (§9)',
  'home.platform.image / home.testimonial.image / services.whyWhiteGlove.image / about.mission.image — unlicensed stock photos (§4.7 of RECONCILIATION.md)',
] as const;

/* ------------------------------------------------------------------ *
 * Extraction provenance — lets a later reviewer re-verify every string.
 * ------------------------------------------------------------------ */

export const extraction = {
  date: '2026-09-16',
  origin: 'https://prism.inc',
  method:
    'Client-rendered SPA. Copy recovered from the production JS bundle and verified against the original JSX in the published sourcemap.',
  bundle: '/static/js/main.472c0fe4.js',
  sourcemap: '/static/js/main.472c0fe4.js.map',
  stylesheet: '/static/css/main.4e08b093.css',
  sourceFilesRecovered: [
    'src/lib/constants.js',
    'src/components/Navbar.jsx',
    'src/components/Footer.jsx',
    'src/pages/Home.jsx',
    'src/pages/Products.jsx',
    'src/pages/Services.jsx',
    'src/pages/About.jsx',
    'src/pages/Contact.jsx',
    'src/App.js',
  ] as readonly string[],
  /** Counts that drive the data-driven scene tracks (spec §8.0). */
  confirmedCounts: {
    homeValueProps: 4,
    homePlatformBullets: 5,
    homeFaqs: 4,
    productsModules: 8,
    servicesOfferings: 6,
    servicesProcessSteps: 4,
    aboutAcronymLetters: 5,
    aboutWhoWeHelp: 3,
    aboutValues: 4,
    aboutBenchBackgrounds: 5,
    contactFormFields: 6,
    contactWhatHappensNext: 4,
  },
  /**
   * Present on the live site and deliberately NOT carried over:
   * PostHog with session_recording enabled (captures form input, which on
   * this site may include PHI — forbidden by spec §10.4.7), the Emergent
   * badge and loader script, the third-party form endpoint, three hotlinked
   * stock photos, and a publicly served sourcemap.
   */
  notPortedForward: [
    'PostHog analytics + session recording',
    'Emergent badge and assets.emergent.sh loader',
    'billing-hub-206.emergent.host form endpoint',
    'Hotlinked Unsplash/Pexels stock photography',
    'Public JS/CSS sourcemaps',
    'Google Fonts runtime stylesheet request',
  ] as readonly string[],
} as const;
