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

### 4.4 Parallax content (CSS transform + opacity)
The hero inner element uses `transform: translateY(var(--hero-shift))` and
`opacity: var(--hero-opacity)`, both scroll-derived, `transform`/`opacity`-only
per §6.5. `--hero-shift` drifts up to −60px across the runway; `--hero-opacity`
releases the copy over resolve `[0.04, 0.24]`. At rest both are inert — 0px
shift, full opacity — so the copy is fully visible in the first frame (§11.2)
and the static/SSR hero is unchanged. **The copy keeps its light colours and
fades rather than re-colouring — see §9 for why this is the AA-safe choice.**

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

---

## 9. As-built amendments (contrast & scope)

Two things changed between this plan and the shipped code, both recorded here
so the doc matches `main`.

### 9.1 The hero copy fades; it does not re-colour

§4.3–§4.4 originally proposed cross-fading the hero text colour dark→light
(via `color-mix`, later JS interpolation) so it would stay legible on the
lightening ground. **Measured contrast proved this is not achievable.** As the
backdrop lerps `#05060A → #E9F1FD`, it passes through mid-grey; any text that
also interpolates light→dark passes through mid-grey at the same scroll point,
and the two collide:

| resolve | backdrop | h1 (linear re-colour) | lead (linear re-colour) |
| --- | --- | --- | --- |
| 0.00 | near-black | 17.6:1 | 6.3:1 |
| 0.25 | dark-grey | 5.2:1 | 2.6:1 ✗ |
| 0.50 | mid-grey | **1.1:1 ✗** | **1.2:1 ✗** |
| 0.75 | light-grey | 4.1:1 | 3.1:1 ✗ |
| 1.00 | light-blue | 15.6:1 | 7.2:1 |

Muted body text can never clear AA against a ground sweeping through its own
luminance, and no crossover timing removes the collision — it only moves it.

**Resolution:** the copy keeps its light `--hero-*` colours and instead
**releases** (opacity 1 → 0 over resolve `[0.04, 0.24]`, `smoothstep`) as it
drifts up. It is therefore always light-on-dark while visible. Measured: while
the copy is clearly visible (opacity ≥ 0.5, resolve ≤ ~0.14) the h1 holds
≥ 12:1 and the lead ≥ 4.5:1. The bright light-blue phase belongs to the
resolved scene and the downstream content, not to small hero body text. This
keeps the approved dark→light wash and the parallax drift; the only behavioural
change from the prototype is that the copy fades out instead of persisting at
full opacity over the light ground.

### 9.2 Scope: hero only

The DOM wash is scoped to the hero (where the canvas shows through), per the
client's "just the animation colouring, don't change the whole output." The
`color-mix` surface/ink retheme of downstream sections in §4.3 is **not**
shipped; those sections keep their existing `void` / `void-2` / `utility`
backgrounds. `--surface-lite` remains defined for future use. Particle colour
still carries `uColorResolved`, but because additive blending only lightens,
the field's *fade* (opacity → 0.05) is what does the real work on the light
ground; the colour shift only reads through the brief mid-transition.
