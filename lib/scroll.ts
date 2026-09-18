/**
 * Scroll → camera mapping (spec §6.1).
 *
 * THE SINGLE-SOURCE-OF-TRUTH RULE
 *
 * Scroll position is the ONLY input to camera position. `t` is always
 * f(scrollProgress). Nothing else may write camera position or `t` — not
 * click handlers, not IntersectionObservers, not hover states. Every "move
 * the camera" feature is implemented as "move the scroll position."
 *
 * Violating this is what broke spec v1: it tweened `t` directly *and* set
 * scroll position, giving one value two writers. ScrollTrigger recomputes `t`
 * from window.scrollY every tick and immediately clobbers the tween,
 * producing a visible snap-back.
 *
 * Obeying it is what makes backward scroll, deep links, keyboard scrolling
 * (Space / PageDown / Home / End) and scroll restoration all work for free.
 * The one sanctioned exception is the route transition, behind an explicit
 * `rigMode` flag — that arrives in Phase 5 (§6.9).
 */

/**
 * Mutable scroll state.
 *
 * A plain module-level object, read inside useFrame. ScrollTrigger's
 * onUpdate writes here and MUST NEVER call setState — that re-renders the
 * React tree on every scroll frame and tanks INP.
 */
export const scrollState = {
  /** Normalised progress through the Home scroll wrapper, 0–1. */
  progress: 0,
  /** Camera parameter along the spline, 0–1. Always derived from progress. */
  t: 0,
  /**
   * Hero formation progress, 0 = chaos, 1 = formed.
   * Derived from scroll like everything else — never set imperatively.
   */
  heroFormation: 0,
  /**
   * Light-resolve progress, 0 = dark void, 1 = fully resolved light-blue.
   * Drives the backdrop wash, the particle fade, and the DOM `--resolve`
   * token. Derived from scroll (see `mapScrollToResolve`) exactly like `t`
   * and `heroFormation` — never written imperatively from a click or hover.
   * See docs/DESIGN-hero-light-resolve.md.
   */
  resolve: 0,
};

/**
 * Scroll fraction at which the light resolve completes (1.0).
 *
 * The wordmark formation finishes early — by scroll 0.05 (HeroScene) — so the
 * name assembles while the scene is still dark; the backdrop then keeps
 * washing to light and settles a touch later, at this fraction, so "resolved"
 * reads as an arrival into clarity rather than a simultaneous flash. Kept
 * separate from the camera table (§6.1) so the wash can be re-timed without
 * touching camera motion.
 */
export const RESOLVE_SCROLL_END = 0.1;

/**
 * Map Home scroll progress (0–1 over the whole Home runway) to light-resolve
 * progress (0–1). Pure function of scroll — the §6.1 purity rule applies to
 * `resolve` exactly as it does to `t`.
 */
export function mapScrollToResolve(progress: number): number {
  return clamp01(progress / RESOLVE_SCROLL_END);
}

/**
 * Home section table — spec §6.1, verbatim.
 *
 * Total scroll height is 700vh on desktop. The Testimonial consumes 10% of
 * scroll but only 4% of path length: that *is* the dwell, produced by
 * keyframe density in lib/curves.ts rather than by pinning.
 *
 * Phase 2 wires only the Hero row; Phase 4 extends the wrapper to the full
 * 700vh and takes over the rest. The table lives here now so that both
 * phases read one definition and the later rows cannot drift.
 */
export const HOME_SECTIONS = [
  { name: 'hero', scroll: [0.0, 0.14], t: [0.0, 0.12] },
  { name: 'modules', scroll: [0.14, 0.64], t: [0.12, 0.62] },
  { name: 'platform', scroll: [0.64, 0.82], t: [0.62, 0.8] },
  { name: 'testimonial', scroll: [0.82, 0.92], t: [0.8, 0.84] },
  { name: 'faq', scroll: [0.92, 1.0], t: [0.84, 0.84] },
] as const;

/** Module checkpoint arrivals (§6.1). Used from Phase 4. */
export const MODULE_CHECKPOINTS = [0.18, 0.31, 0.44, 0.57] as const;

/** Total Home scroll height in vh (§6.1). */
export const HOME_SCROLL_VH = 700;

/**
 * Touch devices get ~65% of the desktop scroll length (§6.2, §13.2 item 11).
 * Thumb-scrolling 700vh is exhausting.
 */
export const TOUCH_SCROLL_FACTOR = 0.65;

/** The Hero's `t` range — the only range Phase 2 drives. */
export const HERO_T_RANGE = HOME_SECTIONS[0].t;

/**
 * Map Home scroll progress to spline `t` using the §6.1 table.
 *
 * Piecewise-linear between rows, so the Testimonial's 10%-scroll-to-4%-path
 * compression falls out of the table rather than being special-cased.
 */
export function mapHomeScrollToT(progress: number): number {
  const p = clamp01(progress);

  for (const section of HOME_SECTIONS) {
    const [s0, s1] = section.scroll;
    if (p >= s0 && p <= s1) {
      const [t0, t1] = section.t;
      const span = s1 - s0;
      const local = span === 0 ? 0 : (p - s0) / span;
      return t0 + (t1 - t0) * local;
    }
  }

  return HOME_SECTIONS[HOME_SECTIONS.length - 1]!.t[1];
}

/**
 * FOV target for a given `t` (§6.1): 50° base, easing to 42° across the
 * Platform chamber (t 0.62–0.80), back to 50° after.
 */
export function fovForT(t: number): number {
  const [enter, exit] = [0.62, 0.8];
  if (t < enter || t > exit) return 50;
  const local = (t - enter) / (exit - enter);
  // Ease in and back out so the narrowing is felt rather than noticed.
  const eased = Math.sin(local * Math.PI);
  return 50 - 8 * eased;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/**
 * Frame-rate-independent damping factor.
 *
 * `1 - pow(k, dt)` keeps the feel identical at 30fps and 144fps. A plain
 * `lerp(x, 0.1)` is frame-rate dependent and feels different on every device
 * — subtly wrong in a way that is very hard to attribute later.
 */
export function damp(k: number, dt: number): number {
  return 1 - Math.pow(k, dt);
}

/** True when the device is primarily touch-driven (§6.2). */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

/** Total Home wrapper height in vh for this device. */
export function homeScrollVh(): number {
  return isTouchDevice()
    ? Math.round(HOME_SCROLL_VH * TOUCH_SCROLL_FACTOR)
    : HOME_SCROLL_VH;
}
