'use client';

import { useEffect, useRef } from 'react';
import { use3DActive, useTier } from '@/lib/tier';
import {
  HOME_SECTIONS,
  homeScrollVh,
  mapScrollToResolve,
  scrollState,
} from '@/lib/scroll';

/** Max upward parallax drift of the hero content, in px, across the runway. */
const HERO_PARALLAX_PX = 60;

/**
 * Resolve window over which the hero copy fades out as it drifts up.
 *
 * WHY FADE RATHER THAN RE-COLOUR (docs/DESIGN-hero-light-resolve.md §9).
 * A continuous dark→light re-colour of the copy is NOT accessible: the text
 * and the lightening ground pass through the same mid-grey at the same scroll
 * point, collapsing contrast to ~1:1 mid-transition — and muted body text can
 * never clear AA against a ground sweeping through its own luminance. So the
 * copy instead stays light (high contrast on the still-dark ground) and
 * releases as you scroll, finishing before the ground lightens into the
 * low-contrast zone. Measured: while the copy is clearly visible (opacity
 * ≥ 0.5, i.e. resolve ≤ ~0.14) the lead clears 4.5:1 and the h1 clears 12:1.
 */
const FADE_START = 0.04;
const FADE_END = 0.24;

/** Cubic smoothstep, clamped. */
function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/**
 * HeroStage — the scroll driver for the Hero (spec §6.1).
 *
 * PROGRESSIVE ENHANCEMENT, NOT A LAYOUT FORK
 *
 * When 3D is inactive — tier `none`, JS disabled, or detection still
 * pending — this renders its children in normal document flow and adds
 * nothing. The server-rendered HTML is therefore byte-for-byte the Phase 1
 * hero, which is what keeps the static site genuinely working rather than
 * degraded (§11.2, §12 Phase 1).
 *
 * When 3D is active it adds the hero's scroll runway and pins the hero
 * visually with `position: sticky`.
 *
 * NO `ScrollTrigger.pin` ANYWHERE. A pin injects a spacer element, which
 * changes total document height, which shifts the scroll-to-`t` mapping for
 * every section after it — and re-shifts it on every resize. `sticky` costs
 * nothing and touches no layout the rig depends on (§1.1, §6.1).
 *
 * SCOPE: Phase 2 drives only the Hero row of §6.1's table. The wrapper is
 * sized to the hero's 0–0.14 share of the 700vh Home scroll; Phase 4 extends
 * it to the full length and takes over the remaining rows. Both phases read
 * the same table in lib/scroll.ts, so the mapping cannot drift.
 */
export function HeroStage({ children }: { children: React.ReactNode }) {
  const active = use3DActive();
  const { reducedMotion } = useTier();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !wrapperRef.current) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    // GSAP and ScrollTrigger are imported dynamically so they stay out of
    // the bundle entirely on the static path.
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled || !wrapperRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const [, heroScrollEnd] = HOME_SECTIONS[0].scroll;

      /**
       * Writes to a plain mutable object. MUST NEVER call setState: that
       * re-renders the React tree on every scroll frame and tanks INP.
       * R3F reads this inside useFrame (§6.1).
       *
       * Scaled into the hero's share of the full Home scroll so that
       * mapHomeScrollToT keeps working against §6.1's table unchanged when
       * Phase 4 lengthens the wrapper.
       */
      const root = document.documentElement;

      const write = (progress: number) => {
        scrollState.progress = progress * heroScrollEnd;
        /**
         * `resolve` and the two CSS custom properties are all pure functions
         * of scroll — the §6.1 purity rule, extended to the wash and the
         * parallax. Writing CSS vars is not `setState`: no React re-render,
         * so INP is untouched. The 3D backdrop reads `scrollState.resolve`;
         * the DOM reads `--resolve` (colour) and `--hero-shift` (transform).
         */
        const r = mapScrollToResolve(scrollState.progress);
        scrollState.resolve = r;
        root.style.setProperty('--resolve', r.toFixed(4));
        // transform + opacity only, per the §6.5 HUD rule — never geometry.
        root.style.setProperty('--hero-shift', `${(-progress * HERO_PARALLAX_PX).toFixed(2)}px`);
        // The copy stays light (high contrast on the still-dark ground) and
        // releases as the wash arrives, so it never sits at low contrast.
        root.style.setProperty(
          '--hero-opacity',
          (1 - smoothstep(FADE_START, FADE_END, r)).toFixed(3),
        );
      };

      const trigger = ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => write(self.progress),

        /**
         * The boundary callbacks are not optional.
         *
         * `onUpdate` fires only while the trigger is ACTIVE. Without these,
         * scrolling back above `start` leaves scrollState holding whatever
         * value it had when the trigger last went inactive — the camera
         * parks mid-tunnel with the wordmark already resolved, and the hero
         * never returns to chaos. That reads exactly like a broken rig, and
         * it is the kind of bug that survives to production because the
         * first scroll down always looks right.
         *
         * Backward scroll needing no special handling is the payoff of
         * §6.1's purity rule — but the rule is about who *derives* t, not
         * about the range over which the scroll signal is defined.
         */
        onLeaveBack: () => write(0),
        onLeave: () => write(1),
        // Re-seed after a refresh so a resize mid-scroll cannot desync
        // the mapping (§6.1).
        onRefresh: (self) => write(self.progress),
      });

      // §6.1: refresh on resize and orientation change, debounced ~150ms,
      // or the scroll-to-t mapping drifts after a viewport change.
      let debounce: ReturnType<typeof setTimeout> | null = null;
      const onResize = () => {
        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(() => ScrollTrigger.refresh(), 150);
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);

      // Seed from the current position so a deep link or a reload mid-page
      // lands the camera at the correct t rather than at 0.
      write(trigger.progress);

      cleanup = () => {
        if (debounce) clearTimeout(debounce);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        trigger.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
      scrollState.progress = 0;
      scrollState.t = 0;
      // Leaving Home must not strand the wash: reset resolve and clear the DOM
      // tokens so the CSS :root defaults (dark palette) take back over.
      scrollState.resolve = 0;
      const s = document.documentElement.style;
      s.setProperty('--resolve', '0');
      s.setProperty('--hero-shift', '0px');
      s.setProperty('--hero-opacity', '1');
    };
  }, [active]);

  // Static path: normal flow, no runway, no sticky. Identical to Phase 1.
  if (!active) return <>{children}</>;

  /**
   * Under reduced motion the hero still gets its stage so the layout does
   * not shift, but the runway collapses to a single viewport: content,
   * layout and reading order stay identical, and there is simply no
   * scroll-linked movement to scrub (§10.2).
   */
  const heroShare = HOME_SECTIONS[0].scroll[1];
  const runwayVh = reducedMotion ? 0 : Math.round(homeScrollVh() * heroShare);

  return (
    <div
      ref={wrapperRef}
      style={{ height: `calc(100vh + ${runwayVh}vh)` }}
      className="relative"
    >
      <div className="sticky top-0">{children}</div>
    </div>
  );
}
