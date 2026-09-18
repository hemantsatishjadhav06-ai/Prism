# Design addendum — Hero light resolve & parallax content

**Date:** 2026-09-18
**Status:** Proposed (awaiting approval)
**Scope:** Home hero + downstream section theming. Progressive enhancement only.
**Relationship to spec:** This is an *addendum* to `docs/PRISM-BUILD-SPEC.md`. Where
this document is silent, the build spec and `CLAUDE.md` govern. This addendum
does not relax any rule in either.

---

## 1. Goal

Turn the scroll-scrubbed hero into a **dark → light-blue "resolve"**: as the
scattered particle field forms the PRISM wordmark, the backdrop washes from the
`#05060A` void to an Apple-style light-blue/white, and the hero copy **drifts
with the scroll (parallax)** rather than sitting still. Downstream content then
reads on the light ground.

Decisions locked with the client (via the `PRISM Hero Lab` prototype):

| Decision | Choice |
| --- | --- |
| Colour direction | Scroll transition, dark → light-blue (not a full re-theme) |
| Content motion | **Parallax** (copy stays legible, drifts at its own rate) |
| Light endpoint | `#E8F1FE → #FBFDFF` gradient (Apple-ish light-blue → near-white) |
| Timing | Resolve completes over the hero's scroll share; light persists after |
| Content structure | **Safe re-layout of existing copy only** — no invented text |

Explicit non-goals: no full light re-theme of the static site, no new copy, no
new particle system, no dependency changes, no change to the five URLs.

---

## 2. Hard constraints this must not break

Carried verbatim from `CLAUDE.md` / spec; each has an acceptance check in §7.

1. **Scroll is the only input to the camera and to `t` (§6.1).** The new
   `resolve` value is *also* a pure function of scroll. Nothing new writes
   camera position or `t`.
2. **Works with JS disabled and WebGL disabled — not degraded (§5.4, §11.2).**
   The wash is progressive enhancement. Tier `none` / no-JS keeps today's dark
   palette, which is already AA-verified.
3. **The visible DOM is the one semantic layer (§10.1).** No copy moves into the
   canvas; parallax is `transform` on the existing DOM.
4. **Content is extracted, never invented (rule 1).** The re-layout only
   reorders / regroups / restyles strings already in `content/site.ts`.
5. **No `setState` in scroll/frame callbacks (§6.1).** New per-frame work writes
   to refs (three.js) and to a CSS custom property (DOM), never React state.
6. **HUD/content motion writes `transform` and `opacity` only (§6.5).**
7. **No dependency bumps or additions (§4).** `color-mix()` is native CSS; the
   backdrop lerp is plain three.js.
8. **One definition per token (§3.1).** New light-endpoint colours are defined
   once in `app/globals.css` and mirrored as hex in `lib/theme.ts` for three.js.
9. **Dispose on unmount (§5.3).** The backdrop component restores
   `scene.background` to the void on unmount and creates no retained GPU objects.

---

## 3. The single scroll-derived signal

Add to `scrollState` (in `lib/scroll.ts`) one value:

```
resolve: number   // 0 = dark/scattered, 1 = fully resolved/light. Derived from
                  // scroll like t and heroFormation — never set imperatively.
```

`resolve` is written in the same `ScrollTrigger.onUpdate` that already sets
`scrollState.progress`, via a pure mapping `mapScrollToResolve(progress)`:

- Rises from 0 → 1 across the hero's scroll share (`HOME_SECTIONS[0]`, i.e.
  scroll 0.0 → ~0.14 today; a dedicated `RESOLVE_SCROLL_END` constant so the
  ramp can be tuned without touching the camera table).
- Holds at 1 afterwards, so the page stays light through the content.
- Boundary callbacks (`onLeaveBack → 0`, `onLeave → 1`, `onRefresh`) mirror the
  existing hero writes so backward/erratic scroll and resize can't desync it.

Everything downstream (backdrop, particles, DOM tokens, parallax) reads
`resolve`. One writer, many readers — the same discipline as `t`.

---

## 4. Rendered pieces

### 4.1 Backdrop wash (three.js)
New component `components/canvas/BackdropWash.tsx`, mounted inside `<Canvas>`
(sibling of `CameraRig`). In `useFrame` it lerps `scene.background` and the
renderer clear colour from `theme.surfaces.void` → the light endpoint by
`scrollState.resolve`, writing into a reused `THREE.Color` (no per-frame
allocation). On unmount it resets `scene.background` to the void so route
changes and `renderer.info` audits stay clean. This replaces the *static*
`scene.background` assignment currently in `SceneCanvas.onCreated` (the clear
colour there stays as the initial value).

### 4.2 Particle colour (shader)
`shaders/particles.frag`: add `uniform vec3 uColorResolved;` and mix
`uColor → uColorResolved` by the existing `vProgress` varying, so formed
particles land on the brand blue (`#2F7FD1`) and stay visible against the light
ground. `ParticleField.tsx` gains an optional `colorResolved` prop and the
matching uniform, synced in the existing uniforms `useEffect` (no new per-frame
CPU work, no material rebuild — the §6.2 "uniforms change, materials don't"
rule holds).

### 4.3 DOM surface tokens (CSS)
`app/globals.css`: define the light endpoint tokens once, and derive live
surface/ink tokens from a runtime `--resolve` (0–1) using `color-mix()`:

```
--surface: color-mix(in srgb, var(--void), var(--surface-lite) calc(var(--resolve) * 100%));
--ink:     color-mix(in srgb, var(--ink-primary), var(--ink-dark) calc(var(--resolve) * 100%));
```

`--resolve` is written on `:root` from the same `onUpdate` (a CSS var write, not
`setState`). `body` and the re-laid-out sections reference `--surface` / `--ink`.
Fallback: `@supports not (color-mix(...))` and the no-JS / `:root` default both
resolve to today's dark values, so nothing breaks where `color-mix` or JS is
absent.

### 4.4 Parallax content (CSS transform)
The hero inner element uses `transform: translateY(var(--hero-shift, 0))`.
`--hero-shift` is written in `onUpdate` as a function of scroll (drift range
±~120px, eased), `transform`-only per §6.5. No opacity gate at rest — the copy
is fully visible in the first frame (§ artifact/first-frame rule and §11.2).

---

## 5. Content re-layout (existing copy only)

Home section order, all strings already in `content/site.ts`:

1. **Hero** — `home.hero.*` (over the resolve).
2. **Value props** — `home.valueProps.*` (QPA Validation, IDR Strategy,
   Compliance Shield, Recovery Analytics) as a light card grid.
3. **Lifecycle / process** — existing lifecycle copy, presented as an ordered
   sequence (numbering is legitimate here — it is a real process).
4. **Testimonial** — the "92% win rate" quote stays inside an attributed
   `<blockquote>` (§10.4 — never a badge/counter/meta).
5. **CTA → Contact.**

No new headings, taglines, or sentences. If new sections are wanted later, the
source copy must come from the live prism.inc site and be extracted verbatim.

---

## 6. Behaviour matrix

| Environment | Backdrop | Particles | Parallax | Palette at rest |
| --- | --- | --- | --- | --- |
| Full 3D (tier low→high) | Lerp void→light on scroll | Colour resolves on scroll | Active | n/a (scroll-driven) |
| `prefers-reduced-motion` | No animated wash; single resting palette | Formed, static | Off | Dark (today's) |
| Tier `none` / WebGL off | No canvas | No canvas | Off | Dark (today's) |
| JS disabled | No canvas, no wash | — | Off | Dark (today's) |

The wash and parallax exist only where scroll animation already exists. This is
what "just the animation colouring, don't change the whole output" means in
practice.

---

## 7. Acceptance checks (subset of §11.3, plus this feature's own)

- [ ] Production build: zero console errors or warnings.
- [ ] **View-source** (not devtools) contains all hero + section copy.
- [ ] Keyboard-only scroll (Space/PageDown/Home/End) drives the wash and
      parallax; camera still follows.
- [ ] `prefers-reduced-motion`: motionless, dark resting palette, identical copy.
- [ ] **Contrast stays AA at resolve = 0, 0.25, 0.5, 0.75, 1.0** — text vs the
      interpolated `--surface`/`scene.background` at every step. (The mid-
      transition is the real risk; if any step dips below 4.5:1, the ink
      crossover is re-timed so it never does.)
- [ ] Backward and erratic scroll: no jumps, no NaN camera, no black frame,
      `resolve` never leaves [0,1].
- [ ] `renderer.info` geometries/textures return to ±2 of first-load after
      / → /products → /about → / ×5 (BackdropWash retains nothing).
- [ ] Every on-screen string traces to `content/site.ts`.
- [ ] `NEXT_PUBLIC_INDEXABLE` unset still yields `noindex` (unchanged).

---

## 8. Files touched (estimate)

| File | Change |
| --- | --- |
| `lib/scroll.ts` | Add `resolve` to `scrollState` + `mapScrollToResolve` + `RESOLVE_SCROLL_END` |
| `lib/theme.ts` | Add light-endpoint + resolved-particle hexes (mirror of CSS) |
| `app/globals.css` | Light tokens, `--resolve`/`--hero-shift` vars, `color-mix` surfaces, fallbacks |
| `components/canvas/BackdropWash.tsx` | New — per-frame `scene.background` lerp |
| `components/canvas/SceneCanvas.tsx` | Mount `BackdropWash`; keep clear colour as initial only |
| `components/canvas/ParticleField.tsx` | `colorResolved` prop + uniform |
| `shaders/particles.frag` | `uColorResolved` + mix by `vProgress` |
| `components/dom/HeroStage.tsx` | Write `--resolve` + `--hero-shift` in `onUpdate` |
| Home page + `components/dom/Section.tsx` | Reference `--surface`/`--ink`; re-layout order |

Every change is additive or a token swap; none alters the five URLs, the copy,
or the dependency set.
