'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ParticleField } from '@/components/canvas/ParticleField';
import { TIER_BUDGETS, useTier, type ActiveTier } from '@/lib/tier';
import { buildChaosField, resolveDisplayFontFamily, sampleGlyphs } from '@/lib/glyphSample';
import { clamp01, scrollState } from '@/lib/scroll';
import { site } from '@/content/site';
import { surfaces } from '@/lib/theme';
import { useFrame } from '@react-three/fiber';

/**
 * Hero scene — the one chaos→formation transition Phase 2 ships (§12).
 *
 * A chaos particle field surrounding the camera resolves into the `PRISM`
 * wordmark as you scroll. The headline itself stays real DOM text: forming a
 * 40-character sentence from soft additive points is an illegible smear at
 * any affordable particle count, and it would bury the most important string
 * on the site inside a canvas (§7.2).
 *
 * The wordmark sits behind and slightly below the <h1>, per §7.2.
 */
export function HeroScene() {
  const { tier, reducedMotion } = useTier();
  const budget = TIER_BUDGETS[(tier === 'none' ? 'low' : tier) as ActiveTier];

  const [target, setTarget] = useState<Float32Array | null>(null);

  /**
   * CHAOS SURROUNDS THE CAMERA; THE WORDMARK SITS DEEPER DOWN THE TUNNEL.
   *
   * These two states are deliberately NOT co-located. The camera starts at
   * z = +6 and travels to about z = -5 across the hero's t range of 0–0.12,
   * so:
   *
   *   • chaos is centred at z = +2 with a ±5 spread, which puts the camera
   *     inside the cloud — §7.2's "chaos particle field surrounding the
   *     camera" — rather than looking at it from outside like distant stars.
   *
   *   • the wordmark target sits at z = -5, ahead of the camera for the whole
   *     hero. It reads at ~43% of frame width on arrival and grows to fill
   *     the frame as you approach, so the motion is "moving toward the
   *     resolved name" rather than "watching it assemble in place".
   *
   * Co-locating them at z ≈ 0 was the first attempt and it fails twice: the
   * chaos reads as a distant wall, and by the time the formation completes
   * the camera is close enough that a 7-unit-wide wordmark overflows the
   * frame horizontally.
   *
   * Region-bounded rather than spread through a huge box, so the additive
   * fragments stay in a predictable screen area — fill rate is the budget
   * that actually matters (§6.2).
   */
  const chaos = useMemo(
    // Wide spread on purpose. The same 40,000 points across a larger volume
    // is lower screen density, and screen density is what decides whether
    // the field reads as drifting dust or as an opaque white sheet over the
    // headline. z spans ±8 around the origin, so the camera at z = +6 sits
    // inside the cloud rather than in front of it.
    () => buildChaosField(budget.particles, [10, 6, 8], [0, 0, 0]),
    [budget.particles],
  );

  /** World-space anchor of the formed wordmark. */
  const TARGET_CENTER: [number, number, number] = [0, -0.6, -5];

  /**
   * Sample the wordmark once. `sampleGlyphs` awaits document.fonts.ready
   * internally — without that gate it rasterises the fallback serif and the
   * letterforms come out subtly wrong (§3.2, §7.2).
   *
   * The result is cached in the sampler and never recomputed on resize.
   */
  useEffect(() => {
    let cancelled = false;

    void sampleGlyphs({
      text: site.wordmark,
      count: budget.particles,
      worldWidth: 7.0,
      depth: 0.4,
      fontFamily: resolveDisplayFontFamily(),
    }).then((cloud) => {
      if (cancelled || cloud.count === 0) return;

      // The glyph mask yields its own point count; pad or trim to match the
      // chaos buffer exactly, since the shader mixes the two per-vertex and
      // a length mismatch would silently drop particles.
      const needed = budget.particles * 3;
      const out = new Float32Array(needed);
      const [ox, oy, oz] = TARGET_CENTER;
      for (let i = 0; i < needed; i += 3) {
        const src = (i / 3) % cloud.count;
        out[i] = cloud.positions[src * 3]! + ox;
        out[i + 1] = cloud.positions[src * 3 + 1]! + oy;
        out[i + 2] = cloud.positions[src * 3 + 2]! + oz;
      }
      setTarget(out);
    });

    return () => {
      cancelled = true;
    };
  }, [budget.particles]);

  /**
   * Formation progress, as a ref. Never React state — this is read every
   * frame and a setState here would re-render the tree on every scroll
   * frame and tank INP (§6.1, §6.2).
   *
   * Under reduced motion it starts at 1: particles freeze in their TARGET
   * state, the signal rather than the noise. That is a nice property of the
   * concept — the reduced-motion version is the *resolved* version (§10.2).
   */
  const progressRef = useRef(reducedMotion ? 1 : 0);

  /**
   * Light-resolve for the particle field, as a ref (never state — read every
   * frame, §6.1). Mirrors `scrollState.resolve`, which HeroStage derives from
   * scroll. Held at 0 under reduced motion: the reduced-motion hero is the
   * resolved *wordmark* on the resting dark palette, with no wash (§10.2,
   * docs/DESIGN-hero-light-resolve.md).
   */
  const resolveRef = useRef(0);

  useFrame(() => {
    if (reducedMotion) {
      progressRef.current = 1;
      scrollState.heroFormation = 1;
      resolveRef.current = 0;
      return;
    }

    resolveRef.current = scrollState.resolve;

    /**
     * Formation is driven by scroll and nothing else (§6.1's purity rule).
     *
     * The hero owns scroll 0–0.14, but the formation completes by 0.05 —
     * roughly the first third of the hero's runway. That is deliberate
     * framing, not an arbitrary constant: across the hero's t range of
     * 0–0.12 the camera covers ~11 world units, from z=+6 to z≈-5. Complete
     * the formation any later and the camera has already flown past the
     * wordmark when it resolves, so the payoff happens behind your head.
     *
     * Resolving early means the name assembles while you are still
     * approaching it, and the remaining hero scroll carries you through it
     * into the tunnel — which is the transition Phase 4's modules pick up.
     */
    const p = clamp01(scrollState.progress / 0.05);
    progressRef.current = p;
    scrollState.heroFormation = p;
  });

  if (!target) return null;

  return (
    /**
     * No group offset: both states carry their own world-space anchors so
     * they can sit in different places (see the chaos/target note above).
     */
    <group>
      <ParticleField
        chaos={chaos}
        target={target}
        progressRef={progressRef}
        color={surfaces.inkPrimary}
        /**
         * As the backdrop washes to light-blue the additive field would stack
         * into a haze over the bright ground (additive can only lighten), so it
         * fades almost out — the resolved name is carried by the DOM <h1>, not
         * the particles. The cooler brand blue only reads through the brief
         * mid-transition. See docs/DESIGN-hero-light-resolve.md.
         */
        colorResolved={surfaces.particleResolved}
        opacityResolved={0.05}
        resolveRef={resolveRef}
        size={budget.pointSize}
        /**
         * §7.2 calls for `--ink-primary` at LOW opacity, and it means it.
         * At 0.9 the additive field stacks into a white wall that buries the
         * <h1>; the headline has to stay the most legible thing on screen
         * because it is both the LCP element (§11.1) and the page's primary
         * message. 0.3 keeps the particles present without competing.
         */
        opacity={0.3}
        driftScale={reducedMotion ? 0 : 1}
      />
    </group>
  );
}

export default HeroScene;
