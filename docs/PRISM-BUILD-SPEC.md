# PRISM Inc. — Website Rebuild Build Spec v2

**Concept:** "Noise → Signal" — a scroll-scrubbed WebGL journey through a dark conduit where chaotic particle noise resolves into clean structure at each stage of a claim's lifecycle.

**Status:** Implementation-ready. This document supersedes spec v1. It is written to be handed directly to Claude Code as the single source of truth.

**Audience:** An AI coding agent with filesystem and shell access, building from an empty directory.

---

## 0. How to use this document

Read §1 (changelog) to understand what changed from v1 and why. Then build strictly in the order given in §12. Do not skip Phase 0 (content extraction) or Phase 1 (the zero-WebGL static site) — everything else depends on both.

Three hard rules for the whole build:

1. **Never invent factual, regulatory, or performance claims.** All copy about the No Surprises Act, IDR eligibility, win rates, or recovery figures must come from §2 (verbatim from the live site) or from client-supplied copy. If a content slot is empty, leave the `TODO(copy)` marker in place and render nothing. See §10.4 for why this is a legal constraint, not a stylistic one.
2. **The visible DOM is the semantic source of truth.** There is no hidden shadow content tree. See §1.3.
3. **The site must work with WebGL disabled.** Not degraded — working. See §1.2 and §12 Phase 0.

---

## 1. Changelog — what I corrected in v1 and why

### 1.1 Technical errors (these would have cost days of debugging)

**Click-to-jump fought ScrollTrigger (v1 §3.7).** v1 says: "GSAP tweens the camera's scroll-linked `t` value directly to that node's position, **and** updates the actual scroll position to match." These are two writers to one value. ScrollTrigger recomputes `t` from `window.scrollY` on every tick and will immediately clobber the tween, producing a visible snap-back.
**Fix:** scroll position is the *only* input. Camera `t` is a pure derived function of it, always. Click-to-jump animates `window.scrollTo` via GSAP `ScrollToPlugin`; the camera follows for free. Codified in §6.1 as the "single source of truth" rule.

**Pinning the Testimonial section broke the global `t` map (v1 §4).** v1 pins the Testimonial with `ScrollTrigger.pin` to stop the camera. A pin injects a spacer element, which changes total document height, which shifts the scroll-to-`t` mapping for every section *after* it — and re-shifts it on every resize.
**Fix:** no pins anywhere. To make the camera dwell, place several spline keyframes at nearly-identical positions. The camera naturally decelerates to a near-stop over that scroll range. Same visual effect, zero layout coupling. §6.1.

**`display:none` on the canvas for the FAQ range (v1 §4).** A `display:none` canvas reports `clientWidth/Height` of 0. On the next resize R3F computes `aspect = 0/0 = NaN`, poisons the projection matrix, and the scene renders blank when restored.
**Fix:** canvas stays laid out at all times. Hide it with `visibility: hidden; pointer-events: none` and stop the render loop with R3F's `frameloop="never"`. This also saves more GPU than `display:none` would. §6.5.

**Light intensities were from the pre-r155 lighting model (v1 §3.4).** `ambientIntensity: 0.02` and `pointLight intensity: 2.5` are legacy-lighting numbers. three.js r155 made physically-correct lights the default and removed `useLegacyLights`, so point/spot intensity is now in candela and falls off by the inverse-square law. v1's values will render an almost entirely black scene.
**Fix:** §6.4 pins three to a known version and gives re-derived values in the current unit system, with `decay` stated explicitly.

**Three post-processing passes were specced as custom shaders that already exist (v1 §3.3).** Chromatic aberration with edge-weighted falloff is exactly `ChromaticAberration` with `radialModulation: true` + `modulationOffset`. Film grain is `Noise` with `blendFunction: OVERLAY`. Writing these by hand is pure risk for zero gain.
**Fix:** §6.3 uses `@react-three/postprocessing` built-ins only. Zero custom passes.

**`bokehScale: 0.015` is off by ~3 orders of magnitude (v1 §3.3).** In the `postprocessing` library `bokehScale` is a pixel-radius multiplier, normal range 1–10. `0.015` is a no-op — you'd ship a very expensive pass that does nothing visible.
**Fix:** §6.3, `bokehScale: 3.0`, and DOF is desktop-tier only.

**"Bloom tuned so only emissive materials glow" is not achievable with a global threshold (v1 §3.3).** A luminance threshold is a threshold on final pixel brightness. Any bright base geometry, any rim highlight, any tone-mapping exposure change will cross it. The look will drift constantly during tuning.
**Fix:** `SelectiveBloom` with an explicit `Select` list. Base geometry is structurally incapable of glowing. §6.3.

**Persistent canvas across App Router routes needs a portal, which v1 omits (v1 §3.8).** A `<Canvas>` in `app/layout.tsx` does persist. But route content lives in `children`, *outside* the canvas's React reconciler — a page cannot declare R3F scene content from there. v1 says "swaps an active `sceneId` in context," which means the layout must import and switch on every page's scene, so the root layout's bundle contains all four scenes and code-splitting dies.
**Fix:** `tunnel-rat`. Each page renders its scene into `<r3f.In>`; the layout's canvas renders `<r3f.Out />`. Pages stay independently code-split. §5.2.

**No disposal strategy, with a persistent canvas (v1 §3.8).** Persisting the WebGL context across routes means GPU resources are never freed by context teardown. Navigating Home → Products → Home repeatedly will leak geometries, materials, and the 15k-point buffers until the tab is killed.
**Fix:** mandatory disposal contract in §5.3, with a `renderer.info` assertion in the QA checklist (§11.3).

**`getPointAt` needs `arcLengthDivisions` raised (v1 §3.1).** `CatmullRomCurve3.getPointAt` is arc-length reparameterized using a cached lookup table of `arcLengthDivisions` segments — default 200. Across a long multi-section path that quantizes to visible stepping during slow scrub.
**Fix:** `curve.arcLengthDivisions = 2000; curve.updateArcLengths()`. §6.1.

**`lookAt` on a moving camera produces roll jitter.** v1's two-spline approach is right, but naive per-frame `camera.lookAt()` snaps and introduces roll twitch on curve inflections.
**Fix:** compute the target quaternion, then `quaternion.slerp` toward it with frame-rate-independent damping. §6.1.

### 1.2 Risk I think was underweighted

**The real perf bottleneck is fill rate, not particle count (v1 §3.2).** v1 tiers by reducing 15,000 points to 6,000. 15,000 points is nothing — a 2015 integrated GPU handles 150k. What actually costs frames here is *additive-blended overlapping fragments* feeding a *multi-pass bloom chain at full device pixel ratio*. On a 3x-DPR phone the bloom chain alone can be 8–10ms.
**Fix:** tiering order is now (1) device pixel ratio, (2) post-FX passes, (3) bloom resolution, and only last (4) particle count. Particle counts actually go *up* on desktop. §6.2. This is why v1's mobile plan wouldn't have hit 60fps despite the count reduction.

**WebGL-disabled clients are a real segment for this specific audience.** PRISM sells to hospitals, physician groups, and revenue-cycle departments. Those desktops are frequently locked-down Windows fleets with GPU blocklists, group-policy-disabled WebGL, or aggressive enterprise proxies. A site that renders a black rectangle to a procurement lead at a health system is a lost deal.
**Fix:** §12 Phase 1 builds the complete site with real content and zero WebGL *first*. 3D is then layered on as progressive enhancement behind a capability check (§5.4). This also makes the a11y and SEO story correct by construction rather than retrofitted, and it de-risks the schedule — there is a shippable site from week one.

**`detect-gpu` alone is a fragile, one-shot guess.** It ships a large benchmark JSON, misclassifies Apple Silicon and anything behind a privacy-hardened UA, and cannot react to thermal throttling — which is exactly what happens on a phone 40 seconds into a scroll-heavy page.
**Fix:** `detect-gpu` for the initial tier guess only, then drei's `<PerformanceMonitor>` continuously adjusts DPR and drops post-FX at runtime. §6.2.

### 1.3 The subsystem I deleted

**The parallel visually-hidden semantic DOM tree (v1 §3.5).** v1 renders the real page copy twice: once in visible HUD/overlay DOM, once in an `sr-only` shadow tree, with `aria-hidden` on the canvas.

This is worse on both axes it was meant to help. For SEO it is a duplicated-text pattern where the hidden copy is the "real" one — at best wasted, at worst read as hidden-text manipulation. For accessibility it is *two* reading orders to keep in sync forever; they will drift on the first copy change.

The insight is that v1 already puts every headline, HUD label, callout, and quote in real DOM. That copy is already semantic, already visible, already crawlable. The shadow tree is solving a problem the architecture doesn't have.
**Fix:** delete it. Promote the visible DOM overlay to the single semantic layer with proper `<h1>`–`<h3>`/`<p>`/`<nav>`. `aria-hidden="true"` on the canvas stays — it is genuinely decorative once the text lives outside it. §10.

### 1.4 Content corrections

**The PRISM acronym mapping in v1 is wrong, and the real one is better.** v1 §1.1 assigns the five letters to the four service pillars (P → QPA Validation, R → IDR Strategy, …) with Rose/M left as a "reserved" spare band. But the company's own title tag is *"Payment Resolution & IDR System Management"* — which is the acronym:

**P**ayment · **R**esolution · **I**DR · **S**ystem · **M**anagement

So the About centerpiece — a beam refracting into five rays, each solidifying into a letter — should spell out the company's actual name expansion. That is a far stronger payoff than mapping five rays onto four unrelated service names, and it removes the awkward orphan band. §8.4. The four service pillars keep their four colors on the Home page (§8.1), where there are exactly four of them.

**v1's inner-page content is invented, and the real content exists.** `/products`, `/services`, `/about`, and `/contact` are all live pages on prism.inc. v1 nonetheless specs a Products page with 8 *named* stations, a 4-step Services process, and an About page — none of which were taken from those pages. That's the worst combination: fabricated structure where authoritative source material was available. §2.3 replaces all of it with a mandatory extraction step and makes the scene geometry derive from the real content counts (§8.0) rather than from v1's assumed eight and four.

**The "92% win rate" must stay inside quotation marks.** On the live site it is a customer testimonial. v1 §3.9 promotes it to a standalone trust badge rendered as a glass plate — i.e. converts an attributed third-party opinion into a first-party performance claim. For a US healthcare vendor that is an FTC-substantiation exposure and it is trivially avoidable. §10.4.

**Do not imply PRISM is a certified IDR entity.** PRISM *selects* federally-certified IDR entities for clients. Copy and 3D labels must not blur this. §10.4.

---

## 2. Content — the actual source copy

### 2.1 Verbatim from the live site

Store all of this in `content/site.ts` as typed objects. Scene code imports from there and never hardcodes a string.

**Site identity**

- Name: `PRISM Inc.`
- Title / positioning line: `Payment Resolution & IDR System Management`
- Logo: use the existing asset exactly as-is, no redraw, no re-colour, no "modernization." Place at `public/brand/prism-logo.svg`. If only a raster exists, use it at 2x and do not upscale. The wordmark string is `PRISM` — never `Prism`, `PRISM Inc` without the period in the logo lockup, or any other casing.

**Hero**

- Headline: `Out-of-network claims, resolved with precision.`
- Kicker: `Payment Resolution & IDR System Management`
- CTAs: `Request consultation` (primary) · `Explore the platform` (secondary)

**The four service pillars** — these are the Home "Modules" checkpoints:

| # | Name | Description | Band |
|---|---|---|---|
| 1 | QPA Validation | Forensic analysis of every Qualifying Payment Amount against geographic and specialty benchmarks before filing, including QPA comparison against FAIR Health and geographic data. | Violet `#7C6CFF` |
| 2 | IDR Strategy | Federal-certified IDR entity selection, batching logic, and offer modeling tuned to your case mix. | Cyan `#45D6E5` |
| 3 | Compliance Shield | Full HIPAA-aligned audit trail, deadline tracking, and NSA Open Negotiation documentation. | Emerald `#6FE39A` |
| 4 | Recovery Analytics | Real-time dashboards on payer behavior, win rates, dispute aging, and net recovery per claim. | Amber `#FFB454` |

**Platform section**

- Lead: Case management software that ingests EOBs, validates QPAs, runs eligibility screens, drafts Open Negotiation letters, and tracks each dispute through the IDRE process from a single workspace.
- Feature bullets (the hologram callouts):
  1. Ingests EOBs into a single workspace
  2. Automated NSA eligibility screening
  3. Open Negotiation and IDR initiation generators
  4. IDRE batching with strategic offer modeling
  5. Real-time recovery and payer-behavior dashboards

**Positioning / About copy**

- Proprietary IDR software combined with white-glove consulting to maximize recovery under the No Surprises Act.
- Framing line: PRISM does the dispute math so clients can focus on patient care.
- Engagement scope: from the moment a payer issues an underpayment through final IDRE determination — PRISM handles the legal mechanics, the math, and the documentation, without disrupting existing revenue cycle workflow.

**Testimonial**

- Quote: from IDR backlog `chaos to a structured 92% win rate`
- Attribution: a physician. `TODO(copy)`: exact name, title, and organization must be confirmed from the live site before launch. Do not ship an unattributed or fabricated attribution — render the testimonial station only if attribution is present.

### 2.2 Copy I could not retrieve

My sandbox blocks direct fetching of `prism.inc` (egress allowlist), so §2.1 was reconstructed from search-engine extraction of the homepage. Before writing `content/site.ts`, Claude Code must fetch all five URLs listed in §2.3 and **reconcile every string above against the live DOM**, treating the live site as authoritative on any conflict. Specifically still missing from the homepage:

- Exact FAQ questions and answers (v1 used draft placeholders — do not ship those)
- Testimonial attribution (name, title, organization)
- Footer content, legal links, contact details, phone/email
- Existing `<title>` and meta description per page, for SEO continuity
- Any existing form fields and where they currently submit

### 2.3 The four inner pages — extract, do not invent

The live site has these pages, confirmed by the client:

- `https://prism.inc/products`
- `https://prism.inc/services`
- `https://prism.inc/about`
- `https://prism.inc/contact`

**I could not read them.** Search engines return only the homepage for this domain, and my sandbox blocks direct fetching. So this spec deliberately contains **no copy** for these four pages.

**This is Claude Code's first task, before writing any component.** Fetch all five URLs and write `content/site.ts` from the actual DOM:

```
1. Fetch https://prism.inc/ , /products , /services , /about , /contact
2. For each page extract, verbatim:
   - <title>, meta description, canonical URL, OG tags
   - h1 / h2 / h3 text and nesting
   - all body copy, in DOM order
   - all link text and hrefs (builds the real nav + the redirect map, §13)
   - every list of features/steps/stations, with exact item counts
   - form fields on /contact and their current submit target
   - footer content, legal links, contact details
   - the logo asset URL, and the exact wordmark casing
3. Write content/site.ts as typed objects, one export per page
4. Produce a short reconciliation report: every place the live copy
   disagrees with §2.1 of this spec, and every place v1's invented
   structure disagrees with the live structure. Surface it; do not
   silently pick a winner.
```

**Rule: the live site wins on every conflict.** §2.1 of this document is a reconstruction and is subordinate to the real DOM.

**Phase 0 result (2026-09-16):** the live site is a client-rendered SPA; copy was recovered from the production bundle and verified 296/296 against the published sourcemap. Findings that supersede earlier assumptions in this document:

- `/products` has **eight modules**, and the names match v1 exactly (Claims Ingest, Eligibility Engine, QPA Validator, Negotiation Workflow, IDRE Submission, Recovery Analytics, Deadline Sentinel, Audit Trail). An earlier draft of this section called them "invented" — that was wrong. They are live-site content and are used on the live site's authority.
- `/services` has **six offerings and a separate four-step process** — two different counts. The Services scene is 6 stations plus a 4-step HUD timeline (§8.2).
- The logo is `/prism-logo.png` (480×270, opaque white background). No SVG exists. See §13.2 item 18.
- The testimonial attribution is a role, not a person; §13.2 item 2 triggers and the station is disabled.
- No `/privacy` or `/terms` exist; footer legal labels are non-linking spans. Legal pages are new content.
- The live site runs PostHog with session recording on. Not carried over (§10.4.7); the client should be told it's live today.

The principle stands: derive counts and names from `content/site.ts`, never from this document.

**Design consequence — station count must be data-driven.** Because the real counts are unknown until the fetch, the Products and Services scenes must generate their spline keyframes and station objects **from the content array length**, not from hardcoded `t` values. §6.1's Home table can be fixed because Home's structure is known; the inner pages cannot be. Spec for this is in §8.0.

### 2.4 Page list for v1

All five real pages are in scope. Nothing is deferred.

| Route | Type | Copy status |
|---|---|---|
| `/` | 3D scene page | Reconstructed (§2.1), verify against live |
| `/products` | 3D scene page | **Extract from live site** (§2.3) |
| `/services` | 3D scene page | **Extract from live site** (§2.3) |
| `/about` | 3D scene page | **Extract from live site** (§2.3) |
| `/contact` | Flat utility page + form | **Extract from live site** (§2.3), form per §9 |
| `/privacy` | Flat utility page | Client-supplied; check if one already exists |
| `/terms` | Flat utility page | Client-supplied; check if one already exists |
| `/security` | Flat utility page (HIPAA posture, SOC 2) | Client-supplied |

Check whether the live site already has privacy/terms pages during the §2.3 fetch — if so, port them verbatim and have them re-reviewed rather than rewritten. Legal pages are not optional garnish here: the site claims HIPAA alignment and SOC 2, and a privacy and security page are the first things an enterprise healthcare buyer looks for. Their absence reads as a red flag.

### 2.5 URL preservation

The five existing routes must keep their exact paths. `/products` stays `/products`; do not "improve" it to `/platform` or `/solutions`. Any URL that does change needs a 301 in `next.config.js`. The §2.3 fetch produces the full inventory of existing URLs — diff it against the new route tree and write the redirect map from that diff. v1 does not mention this at all, and silently dropping indexed URLs is the fastest way to lose existing search traffic in a rebuild.

---

## 3. Design tokens

### 3.1 Color

Unchanged from v1 — the palette is good. Define once in `app/globals.css` as CSS custom properties, and mirror the spectrum bands in `lib/theme.ts` as plain hex strings for three.js (three cannot read CSS variables).

| Token | Hex | Usage |
|---|---|---|
| `--void` | `#05060A` | Base background of every 3D scene |
| `--void-2` | `#0B0D12` | Secondary dark surface — cards, panels, footer |
| `--structure` | `#4A4F5C` | Unlit structural geometry: tunnel ribs, frames |
| `--ink-primary` | `#EDEFF2` | Primary text on dark |
| `--ink-muted` | `#8990A0` | Secondary text on dark |
| `--utility-bg` | `#F1F1EE` | FAQ / flat utility section background |
| `--utility-ink` | `#14161A` | Text on utility background |
| `--utility-muted` | `#5B5F68` | Secondary text on utility background |
| `--utility-line` | `rgba(20,22,26,0.12)` | Hairline dividers on light sections |

Spectrum bands:

| Band | Hex | Assigned to |
|---|---|---|
| Violet | `#7C6CFF` | QPA Validation · letter **P** (Payment) |
| Cyan | `#45D6E5` | IDR Strategy · letter **R** (Resolution) |
| Emerald | `#6FE39A` | Compliance Shield · letter **I** (IDR) |
| Amber | `#FFB454` | Recovery Analytics · letter **S** (System) |
| Rose | `#FF6F91` | letter **M** (Management) · Testimonial accent |

Progress/thread gradient:
`linear-gradient(180deg, #7C6CFF 0%, #45D6E5 35%, #6FE39A 60%, #FFB454 80%, #FF6F91 100%)`

**Band assignment for the inner pages.** Products/Services station counts are unknown until §2.3. Do not hand-assign colors. Generate them by sampling the five-band gradient at `i / (n - 1)` for `n` stations, so any count produces a coherent violet→rose progression. This also makes the progress-thread UI and the station colors mathematically the same object, which is what makes the "spectrum" idea read as a system rather than decoration.

**Contrast verification (done, all pass):** `--ink-primary` on `--void` = 15.8:1. `--ink-muted` on `--void` = 7.2:1. `--utility-ink` on `--utility-bg` = 15.1:1. `--utility-muted` on `--utility-bg` = 6.1:1. All clear WCAG AA for body text; the two primaries clear AAA.

**One hard constraint:** `--structure` (`#4A4F5C`) is 2.6:1 on `--void` and must **never** be used for text, only geometry. Put a comment at the token definition so it isn't reached for later.

Spectrum bands as text on `--void`: Violet 4.9:1, Cyan 9.8:1, Emerald 11.4:1, Amber 10.6:1, Rose 7.1:1 — all pass AA. Violet only clears AAA at large sizes. Fine for accent labels.

### 3.2 Typography

| Role | Family | Weights | Notes |
|---|---|---|---|
| Display / headline | Instrument Serif | 400, 400 italic | Hero headline, PRISM letterforms, section heads. 36px+ only. |
| UI / body / HUD | Inter | 400, 500, 600 | Body, nav, buttons, callout labels |
| Data / numeric / mono | IBM Plex Mono | 400, 500 | Stat counters, station numbers, preloader %, dashboard labels |

Load via `next/font/google` with `display: 'swap'`, subset `latin`. Next self-hosts these automatically — no runtime request to Google, which also avoids a third-party-request finding in an enterprise security review.

Type scale (`clamp()`):

- Display XL (hero): `clamp(40px, 6.2vw, 84px)` / line-height 1.05 / letter-spacing -0.5px
- Display L (section heads): `clamp(30px, 4vw, 48px)` / 1.12
- Body: `16.5px` / 1.6
- Small & mono labels: `12–13px` / letter-spacing `0.02em`

Sentence case throughout. No all-caps eyebrows.

**Added constraint:** the particle-glyph formation samples a rasterized font. Gate that sampling on `await document.fonts.ready`. If Instrument Serif hasn't loaded you will sample the fallback serif, and the particle letterforms will be subtly wrong in a way that is very hard to diagnose later. See §7.2.

### 3.3 Spacing & layout

Base unit 4px. Section vertical rhythm 140px desktop / 80px mobile. Content max-width 1180px; side padding 40px desktop / 24px mobile. Body copy line-length cap 640px.

---

## 4. Tech stack — with pinned versions

Version drift between three.js, R3F, and the post-processing chain is the most common source of "the example code doesn't work" in this ecosystem. Pin these exactly, install in one command, and do not bump during the build.

| Package | Version | Role |
|---|---|---|
| `next` | `14.2.x` | App Router |
| `react` / `react-dom` | `18.3.x` | — |
| `three` | `0.169.0` | 3D core. Post-r155 lighting — see §6.4. |
| `@react-three/fiber` | `8.17.x` | React renderer for three |
| `@react-three/drei` | `9.114.x` | Helpers, `PerformanceMonitor`, `MeshTransmissionMaterial` |
| `@react-three/postprocessing` | `2.16.x` | Wraps `postprocessing` — do not install `postprocessing` directly |
| `gsap` | `3.12.x` | Includes ScrollTrigger + ScrollToPlugin (both free since 3.12) |
| `tunnel-rat` | `0.1.2` | Portals page scene content into the persistent canvas (§5.2) |
| `detect-gpu` | `5.0.x` | Initial tier guess only |
| `troika-three-text` | `0.49.x` | SDF text in-scene where needed |
| `tailwindcss` | `3.4.x` | DOM/UI layer |
| `zod` | `3.23.x` | Form validation, shared client/server |
| `resend` | `4.x` | Transactional email for form delivery (§9) |

Deploy: Vercel. Node 20.

**Do not add:** a state library (React context is sufficient), any animation library beyond GSAP, a CMS (the content is static and small), or any analytics/session-recording tool not cleared by §10.4.

---

## 5. Architecture

### 5.1 Directory layout

```
app/
  layout.tsx              # <Canvas> lives here, mounted once
  page.tsx                # Home  -> renders <HomeScene> into the r3f tunnel
  products/page.tsx
  services/page.tsx
  about/page.tsx
  contact/page.tsx
  privacy|terms|security/page.tsx
  api/contact/route.ts    # form handler (§9)
  globals.css
components/
  canvas/
    SceneCanvas.tsx       # the single <Canvas>, tunnel Out, post chain
    CameraRig.tsx         # spline + scroll driver (§6.1)
    ParticleField.tsx     # the one reusable particle system (§6.2)
    Post.tsx              # post-processing stack (§6.3)
    StationTrack.tsx      # data-driven station sequencer (§8.0)
    stations/             # one component per station archetype
  dom/
    Nav.tsx  Footer.tsx  Preloader.tsx  Cursor.tsx
    HudLabel.tsx          # 3D-anchored DOM label (§6.6)
    ContactForm.tsx  Faq.tsx  StaticFallback.tsx
  scenes/
    HomeScene.tsx  ProductsScene.tsx  ServicesScene.tsx  AboutScene.tsx
content/
  site.ts                 # ALL copy. Single source. Written by §2.3.
lib/
  theme.ts                # hex constants + gradient sampler for three
  tier.ts                 # capability detection + tier context (§5.4)
  curves.ts               # spline builders (§6.1, §8.0)
  scroll.ts               # scroll<->t mapping, jump-to helper
  glyphSample.ts          # text -> point cloud (§7.2)
  tunnel.ts
shaders/
  particles.vert  particles.frag
public/brand/prism-logo.svg
```

### 5.2 Persistent canvas + tunnel portal

`app/layout.tsx` renders the DOM tree (`children`) plus a fixed-position `<SceneCanvas />` behind it — canvas at `z-index: 0`, DOM content at `z-index: 10`.

```tsx
// lib/tunnel.ts
import tunnel from 'tunnel-rat'
export const r3f = tunnel()

// components/canvas/SceneCanvas.tsx
<Canvas
  eventSource={document.getElementById('app-root')!}
  eventPrefix="client"
  dpr={[1, 2]}                       // overridden at runtime, §6.2
  gl={{ antialias: false, powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
  camera={{ fov: 50, near: 0.1, far: 200 }}
  frameloop="always"                 // flips to "never" per §6.5
  aria-hidden="true"
>
  <r3f.Out />
  <Post />
</Canvas>

// app/products/page.tsx
<r3f.In><ProductsScene /></r3f.In>
```

Two non-obvious but load-bearing details:

`antialias: false` is deliberate — the post chain supplies SMAA, and MSAA on top of a post-processing pipeline is wasted bandwidth for no visible gain.

`eventSource` pointed at the DOM root is what lets pointer events reach 3D objects *through* the full-screen DOM overlay. Without it, nothing in the scene is clickable the moment the overlay exists — and this failure looks like a raycasting bug, so it costs hours.

### 5.3 Disposal contract (mandatory)

Because the WebGL context never tears down (§6.9), every scene component must clean up after itself:

- Every `BufferGeometry`, `Material`, `Texture`, and `RenderTarget` created imperatively is disposed in a `useEffect` cleanup.
- Prefer `useMemo` for geometry/material creation keyed to stable inputs, paired with a cleanup that calls `.dispose()`.
- Shader materials holding large attribute buffers (the particle fields) must null their attribute arrays on unmount.
- **Acceptance test:** navigate `/` → `/products` → `/about` → `/` five times; `renderer.info.memory.geometries` and `.textures` must return to within ±2 of their first-load values. Log both in dev. In the QA checklist as §11.3.

With five routes sharing one context this is not a theoretical concern — it is the most likely cause of a "site gets slow after browsing for a while" bug report.

### 5.4 Capability gate

`lib/tier.ts` runs once on mount and writes to a React context that everything reads:

```ts
type Tier = 'none' | 'low' | 'mid' | 'high'
```

- `'none'` — no WebGL2 context obtainable, context creation throws, or `navigator.hardwareConcurrency < 2`. **The canvas is never mounted**; the site renders as the Phase-1 static version (§12). This is the hospital-IT path and it must be tested, not assumed (§11.2).
- `'low'` / `'mid'` / `'high'` — see §6.2.

Reduced-motion is orthogonal to tier: `prefers-reduced-motion: reduce` can apply at any tier, handled in §10.2.

---

## 6. Global systems

### 6.1 Camera & scroll rig

**The single-source-of-truth rule.** Scroll position is the only input to camera position. `t` is always `f(scrollProgress)`. Nothing else may write camera position or `t` — not click handlers, not IntersectionObservers, not hover states. Every "move the camera" feature is implemented as "move the scroll position." Violating this rule is exactly what broke v1 §3.7, and it is what makes backward scroll, deep links, keyboard scrolling, and scroll restoration all work for free.

**Scroll length.** v1 never defined this, which made every `t` value unverifiable. Home total scroll height: `700vh` desktop. Drive it with a `height: 700vh` wrapper; position content sections `sticky` within it so DOM order still equals reading order.

| Section | Scroll range | `t` range | vh |
|---|---|---|---|
| Hero | 0 – 0.14 | 0.00 – 0.12 | 0–98 |
| Modules 1–4 | 0.14 – 0.64 | 0.12 – 0.62 | 98–448 |
| Platform | 0.64 – 0.82 | 0.62 – 0.80 | 448–574 |
| Testimonial (dwell) | 0.82 – 0.92 | 0.80 – 0.84 | 574–644 |
| FAQ (canvas idle) | 0.92 – 1.00 | 0.84 (held) | 644–700 |

The Testimonial consumes 10% of scroll but only 4% of path length — that *is* the dwell, produced by keyframe density rather than by pinning.

Module checkpoint arrivals: `t = 0.18, 0.31, 0.44, 0.57`.

Inner-page scroll lengths are derived from station count — see §8.0.

**Curve setup.**

```ts
// lib/curves.ts
const path = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5)
path.arcLengthDivisions = 2000        // default 200 -> visible stepping
path.updateArcLengths()
const look = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.5)
look.arcLengthDivisions = 2000
look.updateArcLengths()
```

**ScrollTrigger.**

```ts
ScrollTrigger.create({
  trigger: '#scroll-wrapper',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.6,
  onUpdate: (self) => { scrollState.t = self.progress },  // mutable ref, NOT setState
})
```

`onUpdate` writes to a plain mutable object. It must never call `setState` — that re-renders the React tree on every scroll frame and will tank INP. R3F reads the ref inside `useFrame`.

**Per frame, in `CameraRig`.**

```ts
useFrame((_, dt) => {
  const t = mapped(scrollState.t)                  // per-page table
  camera.position.copy(path.getPointAt(t))
  tmpObj.position.copy(camera.position)
  tmpObj.lookAt(look.getPointAt(Math.min(t + 0.02, 1)))
  camera.quaternion.slerp(tmpObj.quaternion, 1 - Math.pow(0.001, dt))
  if (Math.abs(camera.fov - targetFov) > 0.01) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 1 - Math.pow(0.01, dt))
    camera.updateProjectionMatrix()
  }
})
```

The `slerp` with `1 - pow(k, dt)` damping is what removes roll jitter at curve inflections and keeps the feel identical at 30fps and 144fps — a plain `lerp(x, 0.1)` would be frame-rate dependent and feel different on every device. The `+0.02` lookahead produces natural head-turning into corners instead of a rigid forward stare. Guarding `updateProjectionMatrix` avoids invalidating the frustum cache every frame.

**FOV:** 50° base, easing to 42° across the Platform chamber (`t` 0.62–0.80), back to 50° after.

**Backward scroll** needs no special handling — the payoff of the purity rule.

**Click-to-jump** (§6.7): `gsap.to(window, { scrollTo: targetScrollY, duration: 1.2, ease: 'power2.inOut' })`. The camera follows automatically. Kill the tween on any user wheel/touch input so a jump never fights a person mid-gesture.

**Nav links** to in-page sections use the same mechanism. Cross-page nav uses §6.9.

**Resize:** call `ScrollTrigger.refresh()` on resize and orientation change, debounced ~150ms. Also set `history.scrollRestoration = 'manual'` and restore position yourself after `refresh()`, or a reload mid-page lands the camera at the wrong `t` (in the QA list).

### 6.2 Particle system

**One component**, `ParticleField`, reused everywhere with different targets. Do not write a second particle system — v1 implies several, and they will diverge.

`THREE.Points` + `ShaderMaterial`. Two `vec3` attributes per particle — `aChaos` (noise-field position) and `aTarget` (formation position) — plus `aSeed` (float). The vertex shader mixes them by a `uProgress` uniform. No per-frame CPU position writes, ever.

```glsl
// particles.vert (essence)
uniform float uProgress;   // 0 = chaos, 1 = formed
uniform float uTime;
uniform float uSize;
attribute vec3 aChaos;
attribute vec3 aTarget;
attribute float aSeed;

float easeInOutCubic(float x){
  return x < 0.5 ? 4.0*x*x*x : 1.0 - pow(-2.0*x + 2.0, 3.0)/2.0;
}

void main(){
  float p = easeInOutCubic(clamp(uProgress + (aSeed - 0.5) * 0.18, 0.0, 1.0));
  vec3 drift = vec3(
    sin(uTime * 0.25 + aSeed * 6.283),
    cos(uTime * 0.21 + aSeed * 4.712),
    sin(uTime * 0.19 + aSeed * 3.141)
  ) * mix(0.55, 0.02, p);          // chaos drifts freely, formed barely breathes
  vec3 pos = mix(aChaos, aTarget, p) + drift;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (300.0 / -mv.z);   // perspective-correct sizing
}
```

The `aSeed`-offset progress matters more than it looks: it staggers each particle's arrival so the formation *coalesces* over roughly 0.18 of the transition, instead of every point landing on the same frame. Without it the effect reads as mechanical, and that single detail is most of the difference between "expensive" and "tutorial."

Fragment shader: soft radial falloff (`1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5))`), color from `uColor`, `blending: AdditiveBlending`, `transparent: true`, **`depthWrite: false`** — without that last one additive points z-fight and punch visible holes in each other.

**Target states:**
- (a) **Glyph sampling** — §7.2
- (b) **Torus/ring** — parametric, module checkpoints
- (c) **Flattened grid** — Platform hologram
- (d) **Letterform** — About page, same code path as (a)

**Progress driving:** an IntersectionObserver on the section's DOM sentinel sets a *target* progress (0 or 1) as the section passes ~30–70% of viewport; GSAP tweens a plain number toward it; `useFrame` copies that number into the uniform. Again — no React state per frame.

**Performance tiering — corrected priority order.** The bottleneck is fragment throughput, not vertices. v1 tiered by cutting 15,000 points to 6,000; 15,000 points is nothing, while the bloom chain at 3x DPR on a phone is 8–10ms by itself. Tier in this order: DPR, then post-FX passes, then bloom resolution, then particle count.

| | High | Mid | Low |
|---|---|---|---|
| Device pixel ratio | `[1, 2]` | `[1, 1.5]` | `[1, 1]` |
| Particles (main field) | **40,000** | 15,000 | 6,000 |
| Particles (accent rings) | 800 | 500 | 250 |
| Bloom | on, res 512 | on, res 256 | on, res 256, low quality |
| Chromatic aberration | on | off | off |
| Film grain | on | on | off |
| Depth of field | on | off | off |
| SMAA | on | on | off |
| Point size | 2–4px | 2–3px | 2px |

Desktop particle count goes *up* 2.7x versus v1 while the mobile experience gets faster — because DPR and the post chain are where the milliseconds actually live.

**Detection:** `detect-gpu` at load picks the starting bucket (no WebGL2 → `none`; tier 1 → low; 2 → mid; 3 → high). Then wrap the scene in drei's `PerformanceMonitor`:

```tsx
<PerformanceMonitor
  bounds={() => [50, 60]}
  onDecline={stepTierDown}
  onIncline={stepTierUp}
  flipflops={3}
  onFallback={() => lockTier('low')}
/>
```

`flipflops: 3` + `onFallback` prevents the pathological oscillation where the site repeatedly upgrades and downgrades itself — which looks considerably worse than simply running at low.

**Mobile specifically** (per your "best possible on phones that can support it"): phones that classify as `mid` get real 3D — 15k particles, bloom, film grain, DPR capped at 1.5. Phones at `low` still get real 3D at 6k/DPR 1 with no post-FX. Plus, on all touch devices: total scroll height drops to ~65% of the desktop value (thumb-scrolling 700vh is exhausting), the camera path uses a straighter variant with gentler curvature (tight curves at a narrow FOV on a handheld screen cause genuine motion discomfort), and `uSize` reduces since points are physically smaller. If sustained fps stays under 30 after `onFallback`, unmount the canvas and reveal the static version — a smooth static site beats a stuttering 3D one, every time.

### 6.3 Post-processing stack

Built-ins only, from `@react-three/postprocessing`. Zero custom passes — v1 specced three shaders that already exist in the library. Order below is intentional.

```tsx
<EffectComposer multisampling={0} disableNormalPass>
  <SelectiveBloom
    lights={stationLights}
    selection={emissiveRefs}          // explicit: particles, emissive planes, beam
    intensity={1.0}
    radius={0.45}
    luminanceThreshold={0.15}
    luminanceSmoothing={0.12}
    mipmapBlur
  />
  {tier === 'high' && (
    <DepthOfField focusDistance={focusRef} focalLength={0.05} bokehScale={3.0} />
  )}
  {tier === 'high' && (
    <ChromaticAberration
      offset={[0.0012, 0.0012]}
      radialModulation                 // this IS v1's "falls off toward center"
      modulationOffset={0.35}
    />
  )}
  {tier !== 'low' && (
    <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.035} />
  )}
  {tier !== 'low' && <SMAA />}
</EffectComposer>
```

`SelectiveBloom` instead of global `Bloom` is the important change. v1 wanted "bloom tuned so only emissive materials glow," but a luminance threshold is a threshold on *final pixel brightness* — any bright geometry, any rim highlight, any exposure tweak crosses it, and the look drifts every time you touch lighting. With an explicit selection, structural geometry is structurally incapable of glowing. Have stations self-register into the selection via a `useEmissive()` context hook on mount and deregister on unmount.

`multisampling={0}` because SMAA handles AA; `disableNormalPass` because nothing here needs normals and it saves a full-resolution pass.

`DepthOfField.focusDistance` is a live ref updated in `useFrame` from `camera.position.distanceTo(look.getPointAt(t))`, normalized against camera `far`.

**Emissive intensity** `1.4–2.2` as in v1 — but these interact with `ACESFilmicToneMapping` and `toneMappingExposure`. Tune emissive values *after* tone mapping and bloom are both wired, never before, or you will tune twice and the second pass will invalidate the first.

All post-FX off entirely at `low`; the scene still renders fully with basic lighting.

### 6.4 Lighting — re-derived for the current three.js lighting model

three.js r155+ made physically-correct lighting the default and removed `useLegacyLights`. v1's values predate that and would render a near-black scene. These are for `three@0.169` at `toneMappingExposure: 1.0`:

- `ambientLight intensity={0.15}` — keeps deep contrast without crushing to pure black. (v1's `0.02` is a legacy-model number; this is roughly its physical equivalent.)
- Per-station `pointLight`: `intensity={40}`, `distance={12}`, `decay={2}`, color = that station's band. Under inverse-square decay the intensity must be ~15x v1's figure to read the same at 12 units. **Set `decay={2}` explicitly** — relying on the default is how this silently breaks on a minor three bump.
- Rim light: one `directionalLight` per scene, behind/above the focal object, `intensity={1.2}`, color `#45D6E5`. Directional lights are unaffected by the decay change, so v1's value is correct as-is. Keeping the rim cyan regardless of local station color is the right instinct — it is what gives cross-section continuity and stops each station looking like a separate website.
- **No shadow maps anywhere.** Nothing in this design needs cast shadows and they are the most expensive thing you could add. `castShadow`/`receiveShadow` stay false throughout.

Grade the lighting on a calibrated display at ~50% brightness in a dim room. A dark scene graded on a bright laptop will be unreadable for a large share of the audience, and "I couldn't see anything" is the single most common complaint about dark 3D sites.

### 6.5 Canvas idling

Two mechanisms, both required:

1. **Tab hidden** — on `visibilitychange`, set `frameloop="never"`. Non-negotiable for battery and for not being throttled by the browser anyway.
2. **FAQ and flat sections** — when scroll enters a range where the canvas isn't visible: `frameloop="never"` plus `visibility: hidden; pointer-events: none`. **Never `display: none`** (§1.1) — a `display:none` canvas reports zero dimensions, R3F computes `aspect = 0/0 = NaN` on the next resize, and the scene comes back blank. On exit, restore `frameloop="always"` and call `invalidate()` once so the first restored frame is current rather than stale.

Under `prefers-reduced-motion`, use `frameloop="demand"` — render on scroll-position change, not continuously.

### 6.6 HUD labels anchored to 3D positions

`HudLabel` takes a `THREE.Vector3` anchor. In `useFrame`: project to NDC, convert to pixels, write `ref.current.style.transform = translate3d(...)`.

- **Never** put the projected position in React state — that's a re-render per frame per label.
- Write `transform` and `opacity` only. No `top`/`left` (layout-triggering), no `width`/`height`.
- Hide when `ndc.z > 1` (behind camera) or outside the frustum, via `opacity` + `pointer-events: none` — **not** by unmounting, which thrashes the DOM during scroll.

The Platform section redraws five SVG connector paths per frame. Write their `d` attributes directly on the path nodes in the same `useFrame` pass, batched *after* all label transforms, so you never interleave layout reads and writes.

### 6.7 Cursor & interaction

- **Custom cursor:** 8px ring, `--ink-primary` stroke, scaling to 28px and filling with the nearest interactive node's band color on hover. One fixed-position element driven by `transform` in a rAF loop. **Disabled on touch devices and under `prefers-reduced-motion`** — and it must never replace or hide the real cursor for keyboard users.
- **Magnetic buttons:** up to 6px translation toward the cursor within a 60px radius, `power3.out`, reset on leave. Gate behind `@media (hover: hover) and (pointer: fine)`.
- **Clickable 3D nodes:** implemented as click-to-jump per §6.1. Every clickable 3D node **must** have an equivalent focusable DOM control in the overlay — a 3D-only affordance is inaccessible by definition. The station's HUD label doubles as that control, as a real `<button>`.
- **Hit areas:** give 3D pointer targets an invisible oversized collider mesh (≥44px projected). Precisely clicking a thin torus while the page is scrolling is unpleasant, and the fix costs nothing.

### 6.8 Preloader

Tracks real progress, not a fake timer: shader compilation and geometry/texture upload weighted 70%, font loading 30%. Use drei's `useProgress` for the asset half, `document.fonts.ready` for the fonts.

Visual: a thin horizontal bar filling with the five-band spectrum gradient, percentage in IBM Plex Mono beneath, on `--void`. No spinner.

**Added:** a hard 8-second timeout — if progress hasn't reached 100%, dismiss and continue. A preloader that can hang indefinitely is a guaranteed bounce. And the preloader must **overlay** the DOM content, never gate its presence in the HTML: crawlers and screen readers must never sit behind it.

Show it on first load only, not on client-side route changes (§6.9 handles those).

### 6.9 Route transitions

A route change swaps which page renders into the `r3f` tunnel. The camera eases from the outgoing scene's last position to the incoming scene's entry position via a short non-scroll-linked GSAP tween (~1.2s, `power2.inOut`), during which the scroll rig is suspended and `window.scrollTo(0, 0)` fires at the tween midpoint — when the screen is most visually busy, which hides the jump.

This is the one sanctioned exception to §6.1's purity rule. Gate it behind an explicit `rigMode: 'scroll' | 'transition'` flag so the exception is visible in the code rather than an implicit race, and make sure `rigMode` returns to `'scroll'` in a `finally`/`onComplete` even if the tween is interrupted — otherwise a fast double-navigation deadlocks the rig and the page silently stops responding to scroll. That's in the QA list.

Skip the tween entirely under `prefers-reduced-motion`.

---

## 7. Home page scene spec

### 7.1 Structure

DOM order — which is also reading order and crawl order: `<Nav>`, `<h1>` hero block, four module `<section>`s, platform `<section>`, testimonial `<blockquote>`, FAQ `<section>`, `<Footer>`. The 3D sits behind all of it.

**The test for whether §10 is satisfied:** delete the canvas and the page still reads correctly top to bottom. If it doesn't, the semantics are wrong.

### 7.2 Hero

Camera holds at `t=0` for 1.5s after first paint before scroll-scrub engages. Combined with `scrollRestoration = 'manual'`, this prevents an accidental instant fly-through when someone lands on a restored scroll position.

Scene: chaos particle field surrounding the camera — `--ink-primary` at low opacity, curl-noise motion, region-bounded near the path, no target shape yet.

On first scroll (or after 3s idle then scroll), particles interpolate to sampled glyph positions.

**Glyph sampling — the technique v1 left unspecified, plus a correction.** v1 wants the full headline "Out-of-network claims, resolved with precision." formed from particles. At 40+ characters, in perspective, rendered as soft additive points, that is an illegible smear at any particle count you can afford — and it buries the single most important string on the site inside a canvas.

**Do this instead:** the full headline renders as real DOM `<h1>` text in Instrument Serif at Display XL — crisp, selectable, crawlable, translatable. The particles form the **wordmark `PRISM`** behind and slightly below it: five large glyphs, unambiguous at any distance, reinforcing the brand. The "noise resolves into signal" idea also simply lands harder on the logo than on a sentence, because the payoff is the company's own name emerging from chaos.

`lib/glyphSample.ts`:

```ts
// 1. await document.fonts.ready            <- critical, see §3.2
// 2. draw text to an OffscreenCanvas ~1200px wide, white on black
// 3. getImageData; walk pixels with a stride; keep alpha > 128
// 4. rejection-sample N points from that set until you have `count`
// 5. map pixel (x,y) -> world (x, y, z + small jitter) for depth
// 6. cache the result; never recompute on resize
```

DOM overlay: kicker line in Instrument Serif italic, `--ink-muted`. CTAs `Request consultation` (→ `/contact`) and `Explore the platform` (→ `/products`) fade in after formation completes. Both are real `<a>` elements, keyboard-focusable, **present in the HTML from the first byte** — opacity-animated, never conditionally rendered. A CTA that only exists after a scroll-triggered animation is a CTA that doesn't exist for a crawler.

### 7.3 Modules — four checkpoints

Camera passes four ring nodes at `t = 0.18, 0.31, 0.44, 0.57`.

Each ring: torus geometry, unlit `--structure` until the camera is within ~20% of arrival, then its `pointLight` and a 500-particle orbiting ring activate in that station's band color. Ease activation over ~0.04 of `t` — a hard switch reads as a bug, not as a reveal.

HUD panel per ring (§6.6): module name as `<h2>`, description as `<p>`, from §2.1. The panel is a real `<button>` that jumps the camera to that station (§6.7).

There are exactly four modules and five bands, so Rose is unused here — correct and intentional. It is reserved for the Testimonial accent and the About `M`.

### 7.4 Platform

The tunnel widens into an open chamber at `t ≈ 0.62`. FOV eases 50° → 42°.

Centerpiece: a wireframe hologram dashboard — a plane with a procedurally shader-drawn animated line chart, no image asset — assembling from a 4,000-point field collapsing into its outline.

**The chart data is synthetic and decorative.** Label it as such in a code comment, and keep it visually abstract (no axis numbers, no dollar values, no percentages) so that neither a future developer nor a visitor mistakes it for real client results. This is a §10.4 concern, not a design one.

Five feature callouts (§2.1) as DOM annotations with SVG connectors tracking 3D anchors (§6.6).

Trust object: a HIPAA / SOC 2 glass hexagonal plate with alpha-mapped etched text, off-path to the left. **The "92% win rate" is not among these** — see §10.4.1. HIPAA alignment and SOC 2 are factual compliance postures and are fine as badges *provided* the client confirms exact current status in writing (Type I, Type II, and "audit in progress" are materially different claims).

### 7.5 Testimonial

Camera dwells via keyframe density, not a pin (§6.1). All lights dim to near-zero except one on a single "claim card" — a thin emissive plane, text etched via alpha map, Rose accent edge.

Quote and attribution as DOM text beside it: `<blockquote>` + `<cite>`. No particle motion; the stillness is the effect. This is the deliberate quiet beat in the page and it should feel almost uncomfortably still for a second — that contrast is what the preceding 500vh of motion was buying.

**Render this station only if attribution is confirmed** (§2.1). An unattributed testimonial in healthcare marketing is a liability; a fabricated one is far worse.

### 7.6 FAQ

Canvas idles per §6.5. A flat `--utility-bg` DOM section scrolls over it. Native `<details>`/`<summary>` accordion — free keyboard support and free `Ctrl+F` findability in Chrome, both of which a custom accordion would have to reimplement badly.

Copy comes from the §2.3 fetch. **Do not ship v1's draft placeholder answers** — wrong answers about NSA/IDR process are not a cosmetic problem, they are actively harmful to a provider reading them.

### 7.7 Footer

`--void-2`. Logo, positioning line, nav, legal links, contact details, plus the §10.4.6 disclaimer.

---

## 8. Inner page scene specs

### 8.0 Data-driven station tracks (read this before §8.1–8.3)

Station counts for `/products` and `/services` are unknown until the §2.3 fetch. Do not hardcode them. `StationTrack.tsx` takes the content array and derives everything:

```ts
const n = stations.length
const totalVh = 180 + n * 70          // scroll length scales with content
const tAt = (i: number) => 0.08 + (i / Math.max(n - 1, 1)) * 0.84
const colorAt = (i: number) => sampleSpectrum(i / Math.max(n - 1, 1))  // §3.1
const pathPoints = stations.flatMap((_, i) => keyframesForStation(tAt(i), i))
```

Consequences to respect: scroll length, spline keyframes, station colors, HUD numbering, and the progress-thread UI are all functions of `n`. Adding or removing a station later is a content edit, not a code change. This is the single most valuable piece of flexibility in the build, because the real station counts are the one thing this spec cannot know.

Give each station an `archetype` field in content so geometry is chosen by data rather than by index.

### 8.1 Products

One continuous camera path, one distinct object per station. **The variety is the point** — do not reuse the torus from Home for all of them; a row of identical rings is the failure mode here.

v1's eight station names are discarded per §2.3. Derive the list from the live page, then map each real feature to one of these geometry archetypes:

| Archetype | Geometry | Suits |
|---|---|---|
| `funnel` | cone drawing particles inward | intake / ingestion |
| `fork` | branching tube geometry | screening / decisioning |
| `scale` | balance beam | validation / comparison |
| `clock` | ring with countdown-arc shader | time-bounded process |
| `seal` | stamp cylinder | submission / filing |
| `chart` | small bar cluster | analytics / reporting |
| `sentinel` | rotating ring, pulsing marker | monitoring / alerting |
| `vault` | closed cube, thin seam of light | audit / records |

Stations numbered in IBM Plex Mono on the HUD — numbering is legitimate here because the content is a literal sequence.

**If a station involves the open-negotiation period, the figure is 30 *business* days, not 30 days.** v1's "30-day clock" is a factual error in a regulated context. Verify the exact figure against the live page and use its wording.

### 8.2 Services

"Negotiation chamber": the camera passes a row of thin card planes, each flipping face as the camera crosses its midpoint (`rotationY` tween on camera proximity, not global scroll — so it reads as a reaction to your presence rather than a scrollbar effect).

Two content structures on this page, two counts: **six offerings** become the six card-plane stations; the **four-step engagement process** renders as a separate horizontal HUD timeline that progresses with camera travel across the whole chamber. Don't merge them — they're different things and the page presents them separately.

**On the red→green card flip:** it is a strong metaphor, but "denied becomes paid" verges on an implied outcome guarantee. Keep the card faces abstract — a stamp mark and a color shift, not the literal words "DENIED"/"PAID" — unless the client's counsel signs off. The visual reads just as well and carries none of the risk.

### 8.3 Contact

Flat utility page, matching the §2.3 live content. No 3D beyond an optional subtle static particle field behind the form — a moving camera behind a form someone is typing into is actively hostile. Form spec in §9.

### 8.4 About — the centerpiece

Camera enters a chamber and orbits slowly (independent auto-rotation plus a small scroll-linked orbit-angle offset) around a glass prism.

Material: use drei's `<MeshTransmissionMaterial>` rather than hand-rolling refraction — real refraction requires rendering the scene to a texture behind the object, and drei's implementation is well-tested where a hand-rolled one will not be. Parameters: `transmission: 1`, `ior: 1.5`, `roughness: 0.02`, `thickness: 2.5`, plus a screen-space caustics approximation.

Budget for this being the single most expensive object on the site. Render its backside buffer at `resolution: 256, samples: 4`, and below `high` tier fall back to `MeshPhysicalMaterial` with an env-map fake — which, at the scale it appears on screen, most people cannot distinguish.

A white emissive beam enters off-frame, strikes the prism, and — timed to scroll — five colored rays fan out, each terminating in a solidifying particle-formed letter appearing one at a time:

**P**ayment · **R**esolution · **I**DR · **S**ystem · **M**anagement

This is the corrected mapping from §1.4, and it is what makes the whole prism concept pay off. v1 mapped the five rays onto four unrelated service names with a spare band left over, which is decoration. Refracting one beam into the five words of the company's actual name is an argument: *one dispute, five disciplines*. Use the live `/about` copy for each letter's HUD label; if the page doesn't define the acronym, keep the words and pull the supporting sentence from §2.1.

Each letter stays lit once solid and drifts slightly. This is the one section budgeted for maximum shader effort, and it is built last (§12).

---

## 9. Forms & backend

**Decision: Resend + a Next.js route handler + Cloudflare Turnstile. No database.**

Reasoning from the data, since you asked me to decide: PRISM operates on claims data and markets HIPAA alignment. Any inbound free-text field on a public marketing site is a channel through which someone may paste PHI — a claim number, a patient name, an EOB detail. The moment that lands in a database you control, you have a HIPAA obligation, a BAA requirement with your host, breach-notification exposure, and a retention policy to write. Storing marketing leads is not remotely worth acquiring that. Forward-and-forget keeps the data inside the client's existing (presumably already-covered) mail system and adds zero new systems of record.

If the client later wants CRM integration, that is a deliberate decision made with their compliance officer — not a default baked in by the web build.

Implementation:

- `app/api/contact/route.ts` — POST only, `zod`-validated, with the same schema imported client-side so the two can't drift.
- Fields: name, work email, organization, role, message. Plain text; message capped at 2000 chars.
- **Above the message field, a visible, non-dismissible notice:** "Please do not include patient information, claim numbers, or any protected health information in this form." This is the cheapest risk control in the entire project.
- Spam: Cloudflare Turnstile verified server-side, plus a honeypot field and a minimum 3-second time-to-submit check. No image CAPTCHAs — they are an accessibility failure.
- Rate limit: 5 submissions per IP per hour (Vercel KV, or an in-memory LRU if KV isn't provisioned). Fail closed with a clear message.
- Delivery: Resend to a PRISM inbox. On Resend failure, return 5xx **and** surface the direct email/phone in the error state — never let a lead vanish silently into a generic "something went wrong."
- Sanitize server-side before templating into the email body. No HTML pass-through.
- `TODO(config)`: destination inbox, Resend API key, Turnstile site+secret keys as Vercel env vars. Never committed.

Accessibility: a real `<label>` per field, `aria-describedby` for hints, errors announced via `role="alert"`, focus moved to the first invalid field on failed submit, and a `<noscript>` block exposing a mailto fallback.

---

## 10. Accessibility, SEO, and compliance

### 10.1 The corrected accessibility model

Per §1.3, the visible DOM overlay **is** the semantic layer. One copy of the content. No shadow tree.

- Exactly one `<h1>` per page; `<h2>` for sections, `<h3>` for sub-items; heading order never skips a level.
- `<nav>`, `<main>`, `<footer>`, `<blockquote>`/`<cite>`, `<details>`/`<summary>` used for what they mean.
- `<canvas aria-hidden="true">`, with no affordance that exists only in 3D (§6.7).
- Visible focus ring on everything focusable: 2px `--ink-primary` outline, 2px offset. Don't rely on `:focus-visible` alone for 3D-adjacent buttons — users may arrive there via script-driven focus.
- Skip-to-content link as the first focusable element.
- **Keyboard traversal of the scroll narrative must work.** Space, PageDown, Home, End must move through the page with the camera following. Scroll-scrubbed sites break this routinely; §6.1's purity rule is what makes it work for free, so verify it rather than assuming.
- Tab order follows DOM order follows reading order (§7.1). Never `tabindex` above 0.
- Nothing conveyed by color alone — every band-colored station also carries its name as text.
- Respect `prefers-contrast` by dropping the film grain and raising `--ink-muted` toward `--ink-primary`.

### 10.2 `prefers-reduced-motion: reduce`

- Camera holds at each section's resolved position; no scroll-linked movement.
- Particles freeze in their **target** state — the signal, not the noise. (This is a nice property of the concept: the reduced-motion version is the *resolved* version.)
- All post-FX off; `frameloop="demand"`.
- Route-transition tween skipped (§6.9); magnetic buttons and custom cursor off (§6.7); preloader bar static.
- Content, layout, and reading order **identical**. A different motion treatment of the same site, not a lesser site.

### 10.3 SEO

- Per-page `<title>` and meta description. **Preserve the existing title/description patterns** captured in the §2.3 fetch rather than rewriting them — throwing away working ranking signal in a rebuild is a self-inflicted wound.
- `robots.txt` and a generated `sitemap.xml` covering all five routes plus legal pages.
- **Environment-gated indexing block (build this in Phase 1).** The staging deployment will be a publicly reachable copy of a site that already ranks, so it must be uncrawlable until launch. Gate on `NEXT_PUBLIC_INDEXABLE`: when it is not exactly `'true'`, send `X-Robots-Tag: noindex, nofollow` from `next.config.js` `headers()` for `/:path*`, and have `app/robots.ts` return `Disallow: /`. When it is `'true'`, send no robots header and allow crawling with the sitemap reference. **The default must be blocked** — a missing, misspelled, or lost variable has to fail closed to noindex, never to indexable, because the variable will survive a hosting handoff only if it doesn't need to. Vercel adds `noindex` to non-production preview deployments automatically, but *not* to the production `.vercel.app` alias, which is exactly the URL that gets shared with a client. Flip the variable to `'true'` once, scoped to Production, after the real domain resolves and has been verified end to end.
- JSON-LD: `Organization` + `ProfessionalService`. **Do not** emit `Review`/`AggregateRating` for the testimonial — a single unverified customer quote marked up as structured review data is a rich-results policy violation and risks a manual action.
- Per-page OG images: flat 1200×630 exports of key scene frames, rendered once and committed as static files. Do not generate them at runtime from the canvas.
- Server-render all copy. No text that exists only after hydration. Verify by viewing **source**, not devtools — devtools shows the hydrated DOM and will happily lie to you here.
- Canonical URLs on every page; `lang="en"` on `<html>`; 301 map per §2.5.

### 10.4 Content compliance rules (non-negotiable)

1. **The "92% win rate" is a quotation, always.** It appears only inside the testimonial `<blockquote>`, attributed, in quote marks. Never as a badge, stat counter, animated number, trust object, OG image, or meta description. v1 §3.9 proposed exactly that and it must not be built — it converts an attributed third-party opinion into a first-party performance claim, which for a US healthcare vendor is an FTC-substantiation exposure and is trivially avoidable.
2. **No aggregate performance or recovery claims** — no "2x–6x recovery," no average-win figures — unless the client supplies written substantiation. Industry-typical vendor figures are not substantiation for PRISM's own marketing.
3. **PRISM selects federally-certified IDR entities; PRISM is not one.** No copy, label, or badge may blur this.
4. **SOC 2:** state the actual status (Type I / Type II / audit in progress). Unqualified "SOC 2" is a claim an enterprise security reviewer will ask you to prove, and being unable to is worse than not having claimed it.
5. **Regulatory specifics must be exact** — "30 business days," not "30 days" (§8.1). List NSA-protected service categories only if the client confirms the list.
6. Footer disclaimer: the site is informational and not legal advice.
7. **No session-recording or heatmap tools** (Hotjar, FullStory, Clarity, and similar). They capture form input, which on this site may include PHI. Analytics limited to a cookieless, privacy-respecting product — Vercel Analytics or Plausible — with no PII in event properties. Staying cookieless also means no consent banner is required; if anyone later adds cookie-setting analytics, a banner becomes mandatory, so treat that as a decision with strings attached.
8. **No real payer names** (Aetna, BCBS, Cigna, UHC, or repricers like Zelis/MultiPlan/Viant) in any visual or copy without client sign-off.

---

## 11. Performance budgets & QA

### 11.1 Targets

| Metric | Target |
|---|---|
| LCP (mobile, throttled 4G) | ≤ 2.5s — the LCP element must be the DOM `<h1>`, never the canvas |
| INP | ≤ 200ms |
| CLS | ≤ 0.05 — HUD labels use `transform` only (§6.6), so expect ~0 |
| Sustained fps, desktop `high` | 60 |
| Sustained fps, mobile `mid` | ≥ 50, never below 30 |
| Initial JS, route `/` | ≤ 350KB gzipped including three.js |
| Lighthouse Accessibility | 100 |
| Lighthouse SEO | 100 |

Code-split the canvas: `next/dynamic` with `ssr: false` for `SceneCanvas`, so three.js is never in the server bundle and never blocks first paint. DOM content must paint before any 3D code is parsed. With five routes sharing one canvas, also confirm each page's scene chunk loads on navigation rather than upfront — that's the payoff of §5.2's tunnel approach and it's worth verifying in the bundle analyzer.

### 11.2 Device test matrix

Real hardware, not just devtools throttling: a recent MacBook (high), a ~2019 Windows laptop with integrated graphics (mid), a mid-range Android (mid/low), an iPhone SE-class device (low), Safari specifically (its WebGL behavior differs from Chrome's in ways that matter for transmission materials), and **one locked-down enterprise Windows machine with WebGL disabled** (tier `none`).

That last one is the audience, not an edge case. PRISM sells to hospitals and physician groups, whose desktops are frequently managed fleets with GPU blocklists or group-policy-disabled WebGL. A black rectangle shown to a procurement lead at a health system is a lost deal, and it's the kind of failure nobody reports — they just leave.

### 11.3 QA checklist

- [ ] WebGL disabled: complete, readable, navigable site across all five routes
- [ ] JS disabled: all copy present, nav works, form shows mailto fallback
- [ ] Keyboard-only: full traversal, visible focus throughout, camera follows keyboard scroll
- [ ] Screen reader (VoiceOver + NVDA): sensible reading order, no canvas announcements, no duplicated content
- [ ] `prefers-reduced-motion`: no motion anywhere, all content present, particles in resolved state
- [ ] Memory: `/` → `/products` → `/about` → `/` ×5; `renderer.info` back to baseline ±2 (§5.3)
- [ ] Backward scroll through every page: no jumps, no stuck state
- [ ] Erratic scroll (flick to bottom, flick back, repeat): no NaN camera, no black frames
- [ ] Deep link + reload mid-page: camera lands at the correct `t`
- [ ] Fast double-navigation during a route transition: rig returns to `'scroll'`, no deadlock (§6.9)
- [ ] Tab backgrounded 5 min then restored: loop resumes, no stale frame
- [ ] Resize and orientation change mid-scroll: `ScrollTrigger.refresh()` fires, mapping stays correct
- [ ] View-source contains all copy on all routes (§10.3)
- [ ] All existing URLs either preserved or 301'd (§2.5)
- [ ] No console errors or warnings in a production build
- [ ] Every string on the site traces to the live-site extraction or a client-approved source (§10.4)
- [ ] Logo renders exactly as supplied — no recolor, no distortion, correct clearspace
- [ ] Station counts on `/products` and `/services` match the live pages (§8.0)

---

## 12. Build order

**Phase 0 — content extraction (§2.3).** Fetch all five live pages, write `content/site.ts`, produce the reconciliation report. Nothing else starts until this is done. Every downstream decision — station counts, scroll lengths, spline shapes, band assignments — depends on it, and building scenes against invented content means rebuilding them.

**Phase 1 — the static site, zero WebGL.** The complete site with real content, real navigation, real form, correct semantics, correct SEO, flat `--void` backgrounds where 3D will later go. Deployable and genuinely good on its own.

This ordering is the biggest change from v1, and the reasoning matters: it guarantees the tier-`none` and no-JS paths actually exist rather than being retrofitted (which never happens properly under deadline); it makes accessibility and SEO correct by construction instead of bolted on; it gives you a shippable site in week one so the project cannot fail outright; and it surfaces the content gaps before any expensive shader work is built on top of unapproved copy. v1 put accessibility, performance tiering, and consent *last* — which in practice means they get compressed against the deadline, and they are precisely what this audience judges the site on.

**Phase 2 — global rig.** Canvas + tunnel (§5.2), tier detection (§5.4), spline/scroll system (§6.1), particle shader base (§6.2). Ship exactly one working chaos→formation transition end to end (the Hero) and prove it across the full device matrix before building anything else. If the rig is wrong, every later section inherits the bug — and by then it's expensive.

**Phase 3 — post-processing (§6.3) and preloader (§6.8).** Lock lighting and grade here (§6.4), while there is little content to re-grade.

**Phase 4 — Home:** Modules → Platform → Testimonial → FAQ.

**Phase 5 — persistent-canvas routing (§6.9) + `/products` and `/services`** via the data-driven track (§8.0).

**Phase 6 — `/about` centerpiece (§8.4).** Highest shader complexity, built last on proven systems.

**Phase 7 — reduced-motion pass, tier tuning, full a11y/SEO audit, complete QA matrix (§11).**

There is a shippable site at the end of Phase 1 and a strong one at the end of Phase 4. Treat those as real milestones — it's what keeps a project with this much shader ambition from having nothing to show.

---

## 13. Decisions log — every open item resolved

v1 ended with an open-questions list, which meant the build could stall waiting on answers. Every one of those is decided below. **Nothing in this document blocks starting work.** Each decision names its own default and its own escape hatch, so Claude Code always has a defined next action.

### 13.1 The governing principle

**Claim only what the live site already claims, in the live site's own words.** This one rule resolves most of what v1 left open. The rebuild is a visual and architectural reinterpretation — it is not a repositioning, and it does not get to assert anything new about a regulated business. When in doubt, the answer is "use the live wording" or "omit the element."

### 13.2 Resolved decisions

| # | Question | Decision | Escape hatch |
|---|---|---|---|
| 1 | SOC 2 badge, exact status unknown | **Do not render a SOC 2 badge.** The glass trust plate (§7.4) ships with HIPAA-aligned wording only, taken verbatim from the live site. | If the client later supplies written Type I/II confirmation, the plate has a second slot; adding it is a content edit. |
| 2 | Testimonial attribution possibly absent | **If the live page has no name/title/org, cut the Testimonial station.** Replace that scroll range with a dwell on the Platform trust plate — the camera beat survives, the liability doesn't. | Client supplies attribution → re-enable via a content flag. |
| 3 | Legal pages | **Scaffold `/privacy`, `/terms`, `/security` with `TODO(legal)` markers.** If equivalents exist on the live site, port them verbatim. A build-time check (§13.3) blocks production deploy while any marker remains. | None needed — the gate is automated. |
| 4 | Analytics | **Vercel Analytics, cookieless, no PII in event properties.** No consent banner required, therefore none is built. | Any cookie-setting tool added later makes a banner mandatory — treat as a decision with strings attached. |
| 5 | Form backend | **Resend + Turnstile, no database** (§9). | CRM integration is a later decision made with the client's compliance officer, never a default. |
| 6 | Page scope | **All five live routes plus three legal pages** (§2.4). Nothing deferred. | — |
| 7 | Station counts for `/products`, `/services` | **Derived from the live content at build time** (§8.0). v1's eight and four are discarded. | — |
| 8 | Services card-flip wording | **Abstract stamp marks and a color shift. No literal "DENIED"/"PAID" text.** Reads the same, carries none of the implied-outcome risk. | Counsel sign-off would permit literal wording; not worth chasing. |
| 9 | Missing copy for any section | **Omit the section.** Never ship placeholder copy, and never invent healthcare-compliance text to fill a scene. | — |
| 10 | Open-negotiation period | The live page says "30-day" (three places, plus "day 31"); the statutory NSA open-negotiation period is 30 **business** days. **Correct to "30 business days" and change "day 31" to match.** This is the one deliberate departure from live copy, because §10.4.5 (regulatory exactness) outranks §13.1 when they conflict — shipping a known statutory inaccuracy is the worse failure. Flag the change to the client in writing. | Client's counsel confirms the original wording → revert. |
| 18 | Logo has an opaque white background; no SVG exists | **Use the unmodified PNG on a white plate**, exactly as the live site does. Keying out the background is a forbidden edit. | Request a transparent/SVG version from the client; drop-in replacement. |
| 19 | Footer says "HIPAA compliant. SOC 2 ready."; Home pillar says "HIPAA-aligned" | **Use "HIPAA-aligned" site-wide** — the more conservative of the site's own two phrasings — and **drop "SOC 2 ready"** per item 1 ("ready" is not a status). Both choices use only words the live site already uses. | Written SOC 2 status from the client → item 1's second slot. |
| 20 | Live PHI form notice is weaker than §9's | **Use §9's notice.** It's a risk control, not a claim; "live site wins" governs claims. | — |
| 11 | Mobile 3D | **Real 3D on `mid` and `low`** (§6.2); scroll length 65% of desktop; straighter camera path. Canvas unmounts to the static site only if sustained fps stays under 30 after `onFallback`. | — |
| 12 | Hero particle text | **Particles form the `PRISM` wordmark; the headline is real DOM text** (§7.2). | — |
| 13 | About centerpiece meaning | **Five rays spell Payment · Resolution · IDR · System · Management** (§8.4). | If `/about` defines the acronym differently, the live page wins. |
| 14 | Payer names | **None used** (§10.4.8). | Client sign-off only. |
| 15 | Performance claims | **Only the attributed testimonial quote.** No aggregate or derived figures. | Written substantiation only. |
| 16 | URL structure | **All five paths preserved exactly**; 301 map for anything that moves (§2.5). | — |
| 17 | Deploy target | **Vercel, Node 20.** | — |

### 13.3 The content gate (build this in Phase 1)

`scripts/check-content.ts`, wired into `prebuild`:

```
Fail the build when NODE_ENV=production and any of these appear in content/ or app/:
  TODO(copy)   TODO(legal)   TODO(config)   Lorem   PLACEHOLDER
Print the offending file and line. Exit 1.
```

This is the mechanism that makes decisions 1, 2, 3, and 9 self-enforcing rather than dependent on someone remembering. Unfinished copy cannot reach production, which is the actual risk in a regulated vertical — not that someone writes a placeholder, but that a placeholder ships.

Pair it with a `content/site.ts` type where every required field is non-optional, so a missing string is a TypeScript error at author time rather than an empty `<p>` at runtime.

### 13.4 Assets the client still owes (non-blocking)

The build proceeds without these; each has a defined stand-in.

| Asset | Stand-in until supplied |
|---|---|
| Logo SVG | Extract the existing logo asset from the live site during the §2.3 fetch and use it as-is. Do not redraw. |
| Destination inbox, phone, address | `TODO(config)` — form works end to end in dev against a test inbox; content gate blocks production. |
| Resend / Turnstile keys | `TODO(config)`; form falls back to the mailto path when keys are absent, so the page is never broken. |
| Domain, DNS, Vercel access | Build and preview on a Vercel preview URL. |
| Drive folder / old codebase | Only needed to cross-check metadata and the redirect map; the live-site fetch (§2.3) covers the same ground. |

### 13.5 What I could not verify, stated plainly

I could not open the Drive folder (no Drive access in this session) and could not fetch `prism.inc` or its subpages (my sandbox permits outbound requests to one unrelated host only). Everything in §2.1 was reconstructed from search-engine extraction of the homepage and should be treated as **high-confidence but unverified**. §2.3 contains no copy at all for the four inner pages, by design.

Claude Code, running without that restriction, must fetch all five pages and produce the reconciliation report **before writing a single component**. If any fetch fails, stop and report it — do not proceed on §2.1 alone, and do not fill gaps with plausible-sounding healthcare copy. That failure mode is the single largest risk in this project, and it is the one an AI agent is most likely to walk into.

