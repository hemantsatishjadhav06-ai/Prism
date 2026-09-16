# PRISM Inc. — website rebuild

The full specification is `docs/PRISM-BUILD-SPEC.md`. Read it before writing code. It is the single source of truth and every open decision in it is already resolved (§13) — you should not need to ask for clarification to proceed.

This file is the short version: the rules that are easy to violate by accident.

## What this project is

A scroll-scrubbed WebGL rebuild of prism.inc — a dark conduit where particle noise resolves into structure at each stage of a medical claim's lifecycle. Five pages: `/`, `/products`, `/services`, `/about`, `/contact`, plus three legal pages.

PRISM sells No Surprises Act / IDR payment-resolution software and consulting to hospitals and physician groups. That context drives most of the rules below — this is a regulated US healthcare vertical, and the audience often browses from locked-down enterprise desktops.

## The five rules that matter most

**1. Content is extracted, never invented.** All copy lives in `content/site.ts`, written from the live site in Phase 0. No component hardcodes a string. If copy for a section is missing, omit the section — never write placeholder or plausible-sounding healthcare copy. Spec §2.3, §13.2 item 9.

**2. Scroll position is the only input to the camera.** `t` is always a pure function of scroll progress. Nothing else writes camera position or `t` — not click handlers, not IntersectionObservers, not hover states. "Move the camera" is always implemented as "move the scroll position." The one sanctioned exception is the route transition, behind an explicit `rigMode` flag. Spec §6.1.

**3. The site must work with WebGL disabled and with JavaScript disabled.** Not degraded — working. Build the static site first (Phase 1), layer 3D on as progressive enhancement. Tier `none` is a real audience segment, not an edge case. Spec §5.4, §11.2.

**4. The visible DOM is the semantic layer.** One copy of the content. No hidden shadow tree. Real `<h1>`–`<h3>`, `<nav>`, `<blockquote>`, `<details>`. `aria-hidden="true"` on the canvas. Every clickable 3D node has an equivalent focusable DOM control. Spec §10.1.

**5. Never assert anything the live site doesn't assert.** The "92% win rate" is a customer quote and appears only inside an attributed `<blockquote>` — never as a badge, counter, or meta description. PRISM *selects* federally-certified IDR entities; PRISM is not one. No SOC 2 badge until status is confirmed in writing. No aggregate performance claims. No real payer names. Spec §10.4.

## Performance rules that are counterintuitive

- The bottleneck is **fragment throughput, not vertex count**. Tier down in this order: device pixel ratio → post-FX passes → bloom resolution → particle count. Desktop runs 40,000 particles; that is not the expensive part. Spec §6.2.
- `three@0.169` uses **physically-correct lighting**. Point-light intensities are ~15x pre-r155 values and `decay={2}` must be set explicitly. Spec §6.4.
- **No shadow maps anywhere.** Nothing in this design needs them.
- Never `setState` in a scroll or frame callback. Write to mutable refs; read them in `useFrame`.
- HUD labels write `transform` and `opacity` only — never `top`/`left`/`width`/`height`.
- `SelectiveBloom`, never global `Bloom`. Structural geometry must be structurally incapable of glowing.
- Dispose every geometry, material, texture, and render target on unmount. The WebGL context never tears down across routes, so leaks accumulate. Spec §5.3.

## Do not

- Install `postprocessing` directly (use `@react-three/postprocessing`), or write custom passes for chromatic aberration, film grain, or vignette — they already exist in the library.
- Use `ScrollTrigger.pin` anywhere. Camera dwell is achieved with spline keyframe density. Spec §6.1.
- Use `display: none` on the canvas. Use `visibility: hidden` + `frameloop="never"`. Spec §6.5.
- Add a state library, a second animation library, a CMS, or a second particle system.
- Add session-recording or heatmap tools (Hotjar, FullStory, Clarity). They capture form input, which may contain PHI. Spec §10.4.7.
- Store form submissions in a database. Email-forward only. Spec §9.
- Redraw, recolor, or restyle the logo. Use the supplied asset exactly as-is.
- Change any of the five existing URLs without adding a 301. Spec §2.5.
- Bump pinned dependency versions during the build. Spec §4.
- Default the site to indexable. Indexing is gated on `NEXT_PUBLIC_INDEXABLE === 'true'` and must fail closed to `noindex` when the variable is absent — the staging deployment is a public copy of a site that already ranks. Spec §10.3.

## Verification before you call anything done

Run the relevant parts of the §11.3 checklist. At minimum, every phase:

- Production build has zero console errors or warnings
- View **source** (not devtools) contains all copy — devtools shows the hydrated DOM and will mislead you here
- Keyboard-only traversal works and the camera follows keyboard scroll
- `prefers-reduced-motion` produces a motionless site with identical content
- Backward scroll and erratic scroll produce no jumps, NaN camera, or black frames
- Every on-screen string traces to `content/site.ts`

The content gate (`scripts/check-content.ts`, §13.3) fails production builds while any `TODO(copy)`, `TODO(legal)`, or `TODO(config)` marker remains. Do not disable or work around it.

## Build order

Phase 0 content extraction → 1 static site → 2 global rig → 3 post-FX + preloader → 4 Home → 5 routing + Products/Services → 6 About centerpiece → 7 a11y/perf/QA. Spec §12.

Do not skip ahead. Phase 0 gates everything downstream because station counts, scroll lengths, and spline shapes are all functions of the real content.
