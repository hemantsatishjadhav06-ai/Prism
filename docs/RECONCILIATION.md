# Phase 0 — Content extraction & reconciliation report

**Date:** 2026-09-16
**Scope:** Spec §2.3 / §12 Phase 0. All five live URLs fetched, `content/site.ts` written, no components built.
**Rule applied throughout:** the live site wins on every conflict (spec §2.3, §13.1). Nothing below is paraphrased or invented.

> **Update — all four flagged DECISION items are now resolved.** The spec was
> amended (§2.3, §8.2, §13.2 items 10, 18, 19, 20) and the resolutions are
> applied in `content/site.ts`. The five resulting departures from live copy
> are enumerated machine-readably in `departuresFromLive` and explained for
> the client in `docs/CLIENT-QUESTIONS.md`. The DECISION labels below are
> retained as the record of what was found and why it was escalated.
>
> | Item | Resolution |
> |---|---|
> | §4.1 "30-day" | Corrected to "30 business days" in all three regulatory places; "day 31" → "the next business day". The commercial "30-day diagnostic" is untouched. |
> | §4.2 SOC 2 / HIPAA | "SOC 2 ready" dropped; "HIPAA-aligned" used site-wide. |
> | §5.5 PHI notice | §9's wording, moved above the message field. |
> | §8.1 Logo | Unmodified PNG on a white plate, as the live footer does. |

---

## 1. Headline findings

Five things change downstream decisions. Read these before anything else.

| # | Finding | Impact |
|---|---|---|
| 1 | **v1's eight product station names are real, not invented.** `/products` renders exactly eight modules whose names match v1's list character-for-character. Spec §2.3's claim that they "were invented in v1, not taken from the site" is **factually wrong**. | The instruction to discard them is moot — they are the live site's own product names, and I have taken them from the live DOM, not from v1. Spec §8.1's eight-station composition stands. |
| 2 | **`/services` has six service offerings *and* a four-step process.** v1 and §2.3 both assumed only a process, and §2.3 assumed its step count was unknown. Both exist, at different lengths. | The Services scene needs **6** stations plus a separate **4**-step HUD timeline. Two counts, not one (§8.0, §8.2). |
| 3 | **The testimonial attribution is a placeholder, not a person.** Live: "Dr. Anesthesiologist, MD" / "Out-of-Network Provider Group". | §13.2 item 2 triggers: cut the Testimonial station. Set `home.testimonial.render = false` (already done). Needs a client decision. |
| 4 | **The live site is a client-rendered SPA with zero copy in its HTML.** The served document is a 3,345-byte shell with an empty `<div id="root">`. | §10.3's "preserve existing ranking signal" has far less to preserve than assumed. See §3.3. |
| 5 | **There is no SVG logo, and no legal pages.** Only `/prism-logo.png` (480×270) exists; footer legal labels are plain `<span>`s, not links. | §2.1's `prism-logo.svg` path is wrong. `/privacy`, `/terms`, `/security` are net-new, with nothing to port verbatim (§2.4). |

---

## 2. Extraction method, and why it was necessary

`prism.inc` is a Create React App SPA hosted on Emergent. Every path — including `/products`, `/robots.txt`, and any nonexistent URL — returns the **same** 3,345-byte HTML shell with HTTP 200. That document contains no headings, no body copy, and no per-route metadata.

So a plain fetch of the five URLs yields no content. Copy was recovered in two passes:

1. **Application bundle** — `/static/js/main.472c0fe4.js` (491 KB), which contains all page components as minified JSX.
2. **Published sourcemap** — `/static/js/main.472c0fe4.js.map` (2.5 MB) exposes `sourcesContent`, i.e. the **original unminified JSX**. Nine app source files were recovered: `lib/constants.js`, `components/Navbar.jsx`, `components/Footer.jsx`, `pages/{Home,Products,Services,About,Contact}.jsx`, `App.js`.

Every string in `content/site.ts` was then verified character-for-character against that original source. **296 of 296 content strings matched verbatim.** The remaining fields in the file are either page metadata (verified separately against the served HTML), values assembled from two verified halves (`plain` forms of headings split by `<br />`), live-generated counters (`01 / 05`, module numbers), or explicitly-marked gaps.

Two mechanical normalizations, both documented in the file header:

- JSX source line-wrapping inside text nodes collapsed to single spaces — this is what the browser renders.
- `about.team.benchBackgrounds` drops a decorative `"· "` that the live markup hardcodes inside each `<li>`; the rebuild uses real list markers. Text is otherwise untouched.

Note also that the live source writes `&amp;` in several list items; the rendered text is `&`, and that is what is stored.

**Side observation:** publishing sourcemaps exposes the full application source. Do not do this in the rebuild.

---

## 3. Metadata & SEO — what actually exists

### 3.1 One title and one description for the entire site

There is no per-route metadata. All five routes serve this pair from `index.html`, verified byte-for-byte:

```
<title>PRISM Inc. — Payment Resolution & IDR System Management</title>
<meta name="description" content="PRISM Inc. — Payment Resolution & IDR System Management.
  Healthcare billing software and white-glove IDR consulting under the No Surprises Act.">
```

Spec §10.3 says to *preserve the existing title/description patterns*. The pattern is a single site-wide pair. It is stored verbatim on all five page objects.

**Open decision:** differentiating titles per page is a clear SEO improvement, but it means writing four new titles and descriptions. That is new marketing copy, so it is not mine to write (CLAUDE.md rule 1). Flagged, not filled. Nothing is blocked in the meantime — the live pair is faithfully preserved.

### 3.2 Absent entirely

| Item | Status on live site |
|---|---|
| `<link rel="canonical">` | Absent on all routes |
| Open Graph tags | Absent |
| Twitter card tags | Absent |
| `robots.txt` | Absent — returns the SPA shell |
| `sitemap.xml` | Absent — returns the SPA shell |
| `favicon.ico` | Absent |
| JSON-LD / structured data | Absent |
| Skip-to-content link | Absent |

All are additions in the rebuild, not ports. None requires new marketing copy.

### 3.3 Current crawlability is weak — which cuts both ways

Because every string is client-rendered, a crawler that does not execute JavaScript sees an empty page on all five routes. Google generally does render JS, but the site has no canonical, no sitemap, no `robots.txt`, and duplicate metadata across five routes.

**Consequence for §10.3:** the rebuild's server-rendered copy is a large, unambiguous improvement, and the risk of "throwing away working ranking signal" is lower than the spec assumes. This does not change the plan — preserve the URLs and the existing title/description — but it lowers the cost of differentiating metadata later.

### 3.4 Soft 404s

Every unmatched path returns HTTP 200 with the shell. The rebuild will return real 404s. That is correct behavior, but any junk URL currently indexed as a 200 will begin 404ing. No action needed beyond awareness; there is no evidence of indexed junk URLs to preserve.

---

## 4. Compliance findings

This is the section with legal exposure. Sub-items marked **DECISION** need a client or counsel answer before the affected string can ship.

### 4.1 "30-day" vs "30 business days" — **DECISION**

Spec §8.1 and §13.2 item 10 both assert the live page says **"30 business days"** and instruct me to match its wording. **It does not.** The live site says "30-day" in four places:

| Location | Live wording |
|---|---|
| `/products` → module 04 Negotiation Workflow | "tracks the **30-day** clock, and escalates to IDR initiation on day 31" |
| `/services` → Open Negotiation Management | "We run the entire **30-day** Open Negotiation window so you don't have to." |
| `/about` → Our mission | "Providers have a **30-day** window, one offer, and limited support." |
| `/services` → Engagement | "Most engagements start with a **30-day** diagnostic." |

The fourth is a PRISM commercial term, not a regulatory figure — it is fine as-is.

The first three describe the NSA open-negotiation period, which is statutorily **30 business days**. So the live copy is imprecise in exactly the way §10.4.5 warns against, and "day 31" compounds it.

This is a genuine conflict between two spec rules: "use the live wording" (§13.1) versus "regulatory specifics must be exact" (§10.4.5). I have **not** resolved it. Copy is stored verbatim as "30-day" with an inline flag in `content/site.ts`. My recommendation is to correct all three to "30 business days" (and rephrase "day 31"), because a factual correction to a regulatory figure is not a repositioning and §10.4.5 is the more specific rule — but that is the client's call to make, not mine.

### 4.2 Footer compliance claims — **DECISION**

The live footer reads:

> © {year} PRISM Inc. All rights reserved. **HIPAA compliant. SOC 2 ready.**

Two problems:

- **"SOC 2 ready" is not a certification.** It is not Type I, not Type II, not "audit in progress" — it is a marketing adjacency. §10.4.4 requires stating actual status, and §13.2 item 1 says ship no SOC 2 badge without written confirmation. The string is stored verbatim but must not be promoted into a badge, trust object, OG image, or meta description.
- **The live site contradicts itself on HIPAA.** The footer says "HIPAA **compliant**"; the Home "Compliance Shield" pillar says "Full HIPAA-**aligned** audit trail". "Aligned" is the defensible term and is the one §13.2 item 1 anticipates. Needs a single decision applied consistently.

Note the irony worth raising with the client: the site claims HIPAA compliance and SOC 2 readiness while shipping no privacy policy, no terms, and a session recorder (§4.4). An enterprise security reviewer will notice.

### 4.3 The "92% win rate" — live site is already compliant, keep it that way

Verified: on the live site the figure appears **only** inside the testimonial quotation, under a "Client outcome" label, and nowhere else. No badge, no counter, no metadata. This matches §10.4.1 exactly.

It must stay that way. And since the station is being cut for want of attribution (§4.5), the figure should not appear anywhere in the rebuild until a real attribution exists.

### 4.4 PostHog session recording — do not port

The live site loads PostHog with `session_recording` **enabled** (`recordCrossOriginIframes: true`), plus an Emergent loader script and a hidden Emergent badge.

Session recording captures form input. The live contact form has a free-text message field that its own notice concedes may attract medical information. This is precisely what §10.4.7 and CLAUDE.md forbid. Recorded in `extraction.notPortedForward`; no action needed beyond not carrying it over. Worth telling the client it is live on their current site today.

### 4.5 Testimonial attribution — **DECISION**

Live attribution is `Dr. Anesthesiologist, MD` / `Out-of-Network Provider Group`. That names no person, no title, and no organization — "Dr. Anesthesiologist" is a role used as a name.

§2.1 requires "exact name, title, and organization"; §13.2 item 2 says that if the live page has no name/title/org, **cut the Testimonial station** and replace the scroll range with a dwell on the Platform trust plate.

**Applied.** `home.testimonial.render = false`, with the quote stored verbatim so nothing needs re-fetching. Setting `render = true` is the content-flag escape hatch once the client supplies a real, consented attribution.

Scroll-map consequence for §6.1: the Testimonial's `0.82–0.92` scroll range and its `t` dwell at `0.80–0.84` now belong to the Platform trust-plate dwell. The Home scroll table does not otherwise change.

### 4.6 Positioning claims that are already correct

Checked, and no action needed — the live copy is careful in the places §10.4 worries about:

- **PRISM is not presented as an IDR entity.** Live says "Federal-certified IDR entity *selection*" and "representation *through* certified IDR entities". Consistent with §10.4.3.
- **No payer or repricer names anywhere.** Consistent with §10.4.8. (FAIR Health appears, but as a benchmark data source, not a payer.)
- **No aggregate performance claims.** The only performance figure is the quoted 92%. "Win rate" and "average uplift" appear solely as *dashboard feature labels* in the Recovery Analytics module, not as asserted outcomes — that reading holds, but keep them as feature labels and never render them with numbers attached.
- **Pricing claims** ("pay-on-results", "We charge on results, not hours") are commercial terms, not performance claims. Fine.

### 4.7 Stock photography — **DECISION**

Four hotlinked third-party stock photos, none licensed to this project:

| Page | Source | Alt text |
|---|---|---|
| Home / Platform | Unsplash | "PRISM analytics dashboard" |
| Home / Testimonial | Pexels | "Healthcare professional" |
| Services | Unsplash | "Doctor in white coat and white gloves" |
| About | Unsplash | "Modern hospital facility" |

Two issues. The alt text "PRISM analytics dashboard" describes a stock photo as PRISM's own product UI, which is misleading. And photographs of people adjacent to testimonial copy can imply they are actual PRISM clients or staff.

The rebuild replaces the first with the shader hologram (spec §7.4) and has no slot for the other three, so this largely resolves itself. URLs are recorded in `content/site.ts` for completeness only — do not hotlink them.

### 4.8 Contact form data handling

The live form posts `name, email, company, phone, service_interest, message` as JSON to `https://billing-hub-206.emergent.host/api/contact` — a third-party host, with no visible BAA, no privacy link on the form, and a phone number field. The rebuild's forward-and-forget design (§9, §13.2 item 5) is a strict improvement. The live endpoint must not be carried over.

---

## 5. Copy-level differences from spec §2.1

§2.1 was reconstructed from search-engine extraction and is explicitly subordinate to the live DOM. Every divergence is listed. **Live wording is what `content/site.ts` contains in all cases.**

### 5.1 Matches exactly — no action

Hero headline `Out-of-network claims, resolved with precision.` · hero kicker · both hero CTA labels · all four pillar names · IDR Strategy description · Compliance Shield description · Recovery Analytics description · company name `PRISM Inc.` · positioning line · wordmark casing `PRISM`.

Well reconstructed. One caveat: the **nav** CTA is Title Case (`Request Consultation`) while the **hero** CTA is sentence case (`Request consultation`). §2.1 captured only the hero form. The live site is internally inconsistent; spec §3.2 mandates sentence case, so the rebuild should use `Request consultation` in both places and I have stored both verbatim.

### 5.2 Differences

| § | Spec §2.1 text | Live text | Nature |
|---|---|---|---|
| Pillar 1 | "…benchmarks before filing, **including QPA comparison against FAIR Health and geographic data**." | "…benchmarks **before you file**." | Spec spliced a Platform bullet onto the end of the pillar description. Live is shorter. |
| Platform lead | "**Case management software that ingests** EOBs … **from a single workspace**." | "**Our case management software ingests** EOBs … **— all from one workspace**." | Paraphrase. |
| Positioning | "Proprietary IDR software combined with white-glove consulting to maximize recovery…" | "**PRISM combines** proprietary IDR software **with** white-glove consulting to maximize recovery…" | Paraphrase, **and located on the wrong page** — this is the Home hero lead, not About copy. |
| Framing line | "PRISM does the dispute math so **clients** can focus on patient care." | "**We** do the dispute math so **you** can focus on patient care." | Paraphrase; person changed. Same sentence as above on live — §2.1 split one live sentence into two entries. |
| Engagement scope | "…underpayment **through** final IDRE determination — … without disrupting **existing** revenue cycle workflow." | "…underpayment **to** final IDRE determination, … **— without** disrupting **your** revenue cycle workflow." | Paraphrase; also on Home (value-props intro), not About. |
| Testimonial | fragment: "from IDR backlog `chaos to a structured 92% win rate`" | "*PRISM took our IDR backlog from chaos to a structured 92% win rate. The white-glove team understands NSA math better than the payers do.*" | Spec captured a fragment and omitted the second sentence entirely. |
| Logo | `public/brand/prism-logo.svg` | `/prism-logo.png`, 480×270 raster. **No SVG exists.** | See §8. |

### 5.3 Platform feature bullets — the largest divergence

§2.1 and the live site both have **five** bullets, but only one matches exactly.

| # | Live bullet (authoritative) | Spec §2.1 status |
|---|---|---|
| 1 | Automated NSA eligibility screening | ✅ exact match (spec #2) |
| 2 | QPA comparison vs. FAIR Health & geographic data | ⚠️ missing from spec's bullet list — spec folded it into pillar 1's description |
| 3 | Open Negotiation & IDR initiation generators | ⚠️ spec #3 used "and" for "&" |
| 4 | IDRE batching & strategic offer modeling | ⚠️ spec #4 used "with" for "&" |
| 5 | Full audit trail & PHI-safe document vault | ❌ **absent from spec entirely** |

And two spec bullets do not exist on the live site at all:

- spec #1 "Ingests EOBs into a single workspace" — this content lives in the Platform *lead*, not a bullet.
- spec #5 "Real-time recovery and payer-behavior dashboards" — closely resembles the Recovery Analytics *pillar* description; appears to be a cross-contamination.

Net effect for §7.4: the count stays five, so the five callout anchors and SVG connectors are unaffected. The strings change.

### 5.4 Contact form fields differ from §9

| | Fields |
|---|---|
| **Live** | `name`, `email`, `company`, `phone`, `service_interest` (7-option select), `message` |
| **Spec §9** | name, work email, organization, role, message |

Differences: live has **phone** and a **service-of-interest select** that §9 omits; §9 has a **role** field the live form lacks; `company` vs `organization` is a label difference only.

Recorded verbatim in `contact.form.fields`. **Recommendation:** keep the live field set (it is what the business actually asks for, and the select doubles as useful routing), drop `phone` if the client is willing — an optional phone field adds a PII category for no clear gain — and treat §9's `role` as optional. This one is a product decision, so it is flagged rather than decided.

### 5.5 The PHI notice — **DECISION**

| | Text | Placement |
|---|---|---|
| **Live** | "We respect your PHI. No medical information should be shared via this form." | Below the message field, small grey text |
| **Spec §9** | "Please do not include patient information, claim numbers, or any protected health information in this form." | Above the message field, visible and non-dismissible |

The spec's wording is more specific (it names claim numbers) and better placed. This is a **risk control, not a marketing claim**, so "the live site wins" does not obviously govern — that rule exists to stop the rebuild asserting new things about a regulated business, and strengthening a warning asserts nothing.

**Recommendation:** use §9's wording and placement. Live text is stored as `phiNoticeLive` for the record. Flagged for explicit sign-off rather than silently swapped.

---

## 6. Structural differences from v1's assumptions

### 6.1 `/products` — eight stations, and v1's names were right

The live page renders **eight** modules, and its own lead copy says so: *"Eight integrated modules, one workspace, zero spreadsheets."*

| # | Live module name | v1's name | Match |
|---|---|---|---|
| 01 | Claims Ingest | Claims Ingest | ✅ |
| 02 | Eligibility Engine | Eligibility Engine | ✅ |
| 03 | QPA Validator | QPA Validator | ✅ |
| 04 | Negotiation Workflow | Negotiation Workflow | ✅ |
| 05 | IDRE Submission | IDRE Submission | ✅ |
| 06 | Recovery Analytics | Recovery Analytics | ✅ |
| 07 | Deadline Sentinel | Deadline Sentinel | ✅ |
| 08 | Audit Trail | Audit Trail | ✅ |

Eight for eight, in the same order.

**This contradicts spec §2.3**, which states the names "were invented in v1, not taken from the site" and instructs that they be discarded. They are the live site's own product names. The names in `content/site.ts` are taken from the live DOM on the live site's authority — not carried over on v1's — and the instruction to discard v1's list is satisfied by that provenance.

The descriptions are new material: v1 supplied names only, and all eight live descriptions are now captured verbatim.

**Recommended spec amendment:** strike the "invented in v1" claim from §2.3. It is the one place where the spec's own reconstruction was less accurate than v1, and leaving it in will mislead the next reader.

### 6.2 `/services` — six offerings *and* four steps

Neither v1 nor §2.3 anticipated the offerings list.

- **Six service offerings**, each with a summary and exactly **four** bullets: White-Glove IDR Calculation · Open Negotiation Management · Federal IDR Representation · Appeals & Underpayment Recovery · Outsourced IDR Operations · Training & Advisory.
- **Four engagement steps**: 01 Discovery · 02 Strategy · 03 Execution · 04 Reporting. v1's assumed count of four was correct.

So §8.2 needs both: a six-card negotiation chamber **and** a four-step HUD timeline. These are different lengths and must not be conflated.

### 6.3 `/about` — the acronym is confirmed, with live copy

§8.4 and §13.2 item 13 are vindicated. The live page has a dedicated acronym section (`data-testid="acronym-infographic"`) under the heading *"Five letters. One promise."* that spells out:

**P**ayment · **R**esolution · **I**DR · **S**ystem · **M**anagement

Each letter has its own body copy, now captured verbatim. §8.4's fallback ("if the page doesn't define the acronym, keep the words and pull the supporting sentence from §2.1") is unnecessary — use the live per-letter copy for the five ray HUD labels.

`/about` also has four sections v1 did not anticipate: **Who we help** (3 items), **Our mission**, **Four operating values** (4 items), and **Our team** (with 5 bench-background bullets). The live site names **no individuals** — no bios, no headshots, no titles — only category-level backgrounds.

### 6.4 Confirmed counts, and the scroll lengths they imply

Station counts are the input to §8.0's data-driven track. All are now known:

| Page | Content array | `n` | `totalVh = 180 + n × 70` |
|---|---|---|---|
| `/products` | modules | **8** | **740vh** |
| `/services` | offerings | **6** | **600vh** |
| `/services` | process steps | **4** | HUD timeline, not a track |
| `/about` | acronym letters | **5** | centerpiece, not a track |

Other confirmed counts: Home value props **4**, Home platform bullets **5**, Home FAQs **4**, About who-we-help **3**, About values **4**, About bench backgrounds **5**, Contact form fields **6**, Contact "what happens next" steps **4**.

Home's scroll table (§6.1) is unaffected except for the Testimonial removal noted in §4.5.

### 6.5 Heading hierarchy needs promotion

The live markup is semantically thin in one consistent way: **every card title is a `<div>`, not a heading.** This affects Home value props, Products modules, Services offerings, About acronym letters, About who-we-help, and About values.

What is already correct: each of the five pages has **exactly one `<h1>`**, real `<h2>`s for section heads, a `<main>` element, and `<header>`/`<footer>` landmarks.

Per §10.1 the rebuild promotes those card titles to `<h3>` under their section `<h2>`. This is a structural fix requiring no copy change, and it is why §10.1's "heading order never skips a level" is currently violated on four of five routes.

Two smaller notes: the live `.overline` class applies `text-transform: uppercase`, so eyebrows render all-caps although the **underlying strings are sentence case** — spec §3.2 bans all-caps eyebrows, and since the stored strings are already sentence case, no copy change is needed. And the live site uses Outfit + Manrope, not the spec's Instrument Serif / Inter / IBM Plex Mono; that is an intentional redesign (§3.2), not a conflict.

---

## 7. URL inventory and redirect map (§2.5)

### 7.1 Every URL found

The live client-side router declares **exactly five** routes. There are no others — no blog, no case studies, no legal pages, no hidden routes.

| Live URL | Exists | Rebuild path | Redirect needed |
|---|---|---|---|
| `https://prism.inc/` | ✅ | `/` | No — preserved |
| `https://prism.inc/products` | ✅ | `/products` | No — preserved |
| `https://prism.inc/services` | ✅ | `/services` | No — preserved |
| `https://prism.inc/about` | ✅ | `/about` | No — preserved |
| `https://prism.inc/contact` | ✅ | `/contact` | No — preserved |

**All five paths are preserved exactly. No 301 is required for any page URL** (§13.2 item 16 satisfied).

### 7.2 Asset URLs

| Live asset URL | Disposition |
|---|---|
| `/prism-logo.png` | Moves to `/brand/prism-logo.png` → **add a 301.** This is the only redirect the rebuild needs. |
| `/asset-manifest.json` | CRA artifact. Not carried over. |
| `/static/js/main.472c0fe4.js` | CRA bundle. Not carried over. |
| `/static/css/main.4e08b093.css` | CRA stylesheet. Not carried over. |
| `/static/js/main.472c0fe4.js.map` | Public sourcemap. **Do not publish sourcemaps.** |
| `/static/css/main.4e08b093.css.map` | Public sourcemap. Same. |

### 7.3 Net-new paths

`/privacy`, `/terms`, `/security`, `/robots.txt`, `/sitemap.xml`, `/favicon.ico` — none exist on the live site. Not redirects; new pages and files.

### 7.4 Resulting redirect map

```js
// next.config.js — the complete §2.5 redirect map
async redirects() {
  return [
    { source: '/prism-logo.png', destination: '/brand/prism-logo.png', permanent: true },
  ]
}
```

That is the entire diff. Worth stating plainly, because §2.5 anticipated a larger one.

### 7.5 External links

The live site links to **no** external domains — no social profiles, no LinkedIn, no partner sites. The only outbound references are the hotlinked stock images (§4.7) and third-party scripts (§4.4). Footer legal labels are non-link text.

---

## 8. The logo asset

Saved exactly as served, per instruction — no redraw, recolor, resize, or optimization.

| Property | Value |
|---|---|
| Live URL | `https://prism.inc/prism-logo.png` |
| Saved to | `public/brand/prism-logo.png` |
| Format | PNG, 8-bit RGBA, non-interlaced |
| Intrinsic size | **480 × 270** |
| File size | 15,948 bytes |
| SHA-256 | `cac2f10a093dd28f8f3084d7a99e8b8cf5f43406c759dfde3334761cd7c8e55c` |
| Live alt text | `PRISM` (identical in nav and footer) |
| Live render height | 120px in both nav and footer |
| Alpha channel | RGBA, but **0 transparent pixels — background is opaque white** |
| Artwork | Blue prism/pyramid bearing a caduceus, plus the `PRISM` wordmark |
| Brand blues (measured) | `#397FC1` dominant, `#1E58A7` and `#0D54A4` as shading |

**No SVG exists.** §2.1 specifies `public/brand/prism-logo.svg`; that path must become `.png`. Per §2.1's own raster fallback rule — "use it at 2x and do not upscale" — a 270px-tall source supports the live 120px render comfortably (2× would be 240px). **Do not render it taller than 135px** without a higher-resolution original.

### 8.1 The white background is a real problem for a dark site — **DECISION**

I decoded the PNG rather than assuming. Every one of its 129,600 pixels is fully opaque, and 106,911 of them are pure white: **this is a white-background raster, not a transparent one.** That is why the live navy footer wraps it in a white `p-3` swatch — it has to.

The rebuild's every surface is `--void` (`#05060A`) or `--void-2` (`#0B0D12`). Dropped in as-is, this asset renders a glaring white rectangle in the nav and footer of every page — the most prominent element on an otherwise near-black site.

There are only three honest options, and I cannot take the first two:

1. ~~Key out the white to transparency~~ — that is editing the supplied asset. CLAUDE.md and §13.4 forbid redrawing, recoloring, or optimizing it.
2. ~~Recolor the wordmark for dark backgrounds~~ — same prohibition.
3. **Reproduce the live site's own solution:** place the unmodified asset on a white plate, exactly as the live footer does. This is defensible precisely because it is what the brand already does in this situation.

**Applied for now:** option 3, since it uses the asset exactly as-is and has live precedent. **Recommended:** ask the client for a transparent-background or light-on-dark variant, which is the correct fix and a normal brand-asset request (§13.4 already anticipates the client owing assets). Until then the white plate is not a workaround to be hidden — it is a visible design consequence the client should see and approve.

No favicon exists either; one must be supplied or derived, and deriving it from this asset means cropping, which is also an edit. Flag it rather than doing it.

---

## 9. Still missing — client or counsel input required

Nothing here blocks Phase 1. Each item has a defined stand-in, and the content gate (§13.3) prevents any of it reaching production unresolved.

| # | Item | Status | Gate |
|---|---|---|---|
| 1 | Testimonial attribution — real name, title, organization | Live value is a placeholder (§4.5) | Station cut via `render: false`. No marker. |
| 2 | SOC 2 actual status — Type I / Type II / in progress | Live says only "SOC 2 ready" (§4.2) | No badge rendered (§13.2 item 1). |
| 3 | HIPAA wording — "compliant" or "aligned" | Live contradicts itself (§4.2) | Needs one decision, applied consistently. |
| 4 | "30-day" vs "30 business days" in 3 places | Live says "30-day" (§4.1) | Verbatim + inline flag. |
| 5 | Footer legal disclaimer (§10.4.6) | Absent on live | **`TODO(legal)`** in `footer.disclaimer` — blocks production build. |
| 6 | `/privacy`, `/terms`, `/security` content | Pages do not exist (§7.3) | Phase 1 scaffolds with `TODO(legal)` (§13.2 item 3). |
| 7 | Destination inbox for form delivery | `info@prism.inc` is published and may serve | `TODO(config)` per §13.4. |
| 8 | Phone number and postal address | Live publishes only "United States" | Omit — do not invent (§13.2 item 9). |
| 9 | Licensed photography, or confirmation to drop stock | 4 hotlinked stock photos (§4.7) | Rebuild has no slot for 3 of 4. |
| 10 | Per-page titles and descriptions | One site-wide pair (§3.1) | Live pair preserved verbatim. |
| 11 | **Transparent or light-on-dark logo variant** | Supplied PNG has an **opaque white background** (§8.1) | Unmodified asset on a white plate, as the live footer does. |
| 12 | Favicon | None exists; deriving one means cropping the logo (§8.1) | Omit until supplied. |

`content/site.ts` contains **exactly one** TODO marker — `TODO(legal)` on the footer disclaimer — which is correct and intentional: it is the one string the rebuild requires, the live site lacks, and I must not write.

---

## 10. Recommended spec amendments

The spec asks that conflicts be surfaced rather than silently resolved (§2.3). These are the places where `docs/PRISM-BUILD-SPEC.md` is now known to be wrong, listed so the next reader is not misled.

| Spec § | Current text | Correction |
|---|---|---|
| §2.3 | v1's eight station names "were invented in v1, not taken from the site… discard them" | **Wrong.** All eight match the live page exactly. §6.1 above. |
| §13.2 item 10, §8.1 | "**30 business days**, matching the live page's wording" | Live says "30-day". The spec's figure is statutorily right but is *not* the live wording. §4.1. |
| §2.1 | Logo at `public/brand/prism-logo.svg` | PNG only, 480×270. No SVG exists. §8. |
| §2.1 | Pillar 1 description, Platform lead, 5 platform bullets, positioning lines, testimonial quote | All differ from live. §5.2, §5.3. |
| §2.1 | Positioning/framing/engagement copy attributed to "About" | All three are **Home** page copy. §5.2. |
| §8.2 | Services = a process of unknown step count | Six offerings **and** four steps. §6.2. |
| §8.4 | "if the page doesn't define the acronym…" fallback | Live `/about` defines it with per-letter copy. Fallback unneeded. §6.3. |
| §10.3 | "preserve the existing title/description **patterns**" (plural) | One pair, site-wide. §3.1. |
| §2.4 | "check if privacy/terms already exist" | They do not. Footer labels are non-link text. §7.3. |
| §2.2 | Lists FAQ, attribution, footer, meta, and form fields as unretrievable | All now retrieved. §2. |

---

## 11. Phase 0 completion checklist

- [x] All five live URLs fetched (plus `/privacy`, `/terms`, `/security`, `robots.txt`, `sitemap.xml` probed)
- [x] Every §2.3 item extracted: title, description, canonical, OG, heading hierarchy, body copy in DOM order, all links, all feature/step lists with exact counts, form fields and submit target, footer, logo URL, wordmark casing
- [x] `content/site.ts` written — typed, one export per page, every required field non-optional, `null` only where the live site genuinely has no value
- [x] 296/296 content strings verified verbatim against original source; metadata verified against served HTML
- [x] Internal count consistency verified programmatically (12/12)
- [x] Logo saved byte-identical with recorded SHA-256
- [x] Full URL inventory and redirect map produced (§7)
- [x] v1's eight station names re-derived from the live DOM rather than carried over on v1's authority (§6.1)
- [x] No invented copy; exactly one intentional `TODO(legal)` marker
- [x] No components written — Phase 1 has not been started

**Blocking on nothing.** The four **DECISION** items in §4 and §5.5 need client answers before those specific strings ship, but Phase 1 (static site, zero WebGL) can begin immediately: every one has a defined stand-in and the content gate enforces the rest.
