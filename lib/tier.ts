'use client';

import { createContext, useContext } from 'react';

/**
 * Capability tiers (spec §5.4).
 *
 * `'none'` is not an error state and not an edge case — it is a real audience
 * segment. PRISM sells to hospitals, physician groups and revenue-cycle
 * departments, whose desktops are frequently managed Windows fleets with GPU
 * blocklists, group-policy-disabled WebGL, or aggressive enterprise proxies.
 * A black rectangle shown to a procurement lead at a health system is a lost
 * deal, and it is the kind of failure nobody reports — they just leave.
 *
 * At `'none'` the canvas is NEVER MOUNTED and the site renders as the
 * Phase 1 static version.
 */
export type Tier = 'none' | 'low' | 'mid' | 'high';

/** The tiers that actually render 3D. */
export type ActiveTier = Exclude<Tier, 'none'>;

export interface TierState {
  tier: Tier;
  /** False until detection has run, so nothing renders on a guess. */
  resolved: boolean;
  /** `prefers-reduced-motion: reduce`. Orthogonal to tier (§5.4, §10.2). */
  reducedMotion: boolean;
  /** Runtime downgrade from drei's PerformanceMonitor (§6.2). */
  stepDown: () => void;
  stepUp: () => void;
  /** Hard lock after pathological flip-flopping (§6.2 onFallback). */
  lock: (tier: Tier) => void;
}

/**
 * Per-tier budgets (spec §6.2).
 *
 * Tiering order is DPR → post-FX passes → bloom resolution → and only last,
 * particle count. The bottleneck is fragment throughput, not vertex count:
 * 15,000 points is nothing, while a multi-pass bloom chain at 3x device pixel
 * ratio on a phone can cost 8–10ms by itself. Desktop particle count goes
 * *up* 2.7x versus the v1 spec while mobile gets faster, because DPR and the
 * post chain are where the milliseconds actually live.
 */
export interface TierBudget {
  dpr: [number, number];
  /** Main particle field. */
  particles: number;
  /** Accent ring particles (used from Phase 4). */
  accentParticles: number;
  /** Base point size in px, fed to the shader's uSize. */
  pointSize: number;
  bloom: boolean;
  bloomResolution: number;
  chromaticAberration: boolean;
  filmGrain: boolean;
  depthOfField: boolean;
  smaa: boolean;
}

export const TIER_BUDGETS: Record<ActiveTier, TierBudget> = {
  high: {
    dpr: [1, 2],
    particles: 40_000,
    accentParticles: 800,
    pointSize: 3.0,
    bloom: true,
    bloomResolution: 512,
    chromaticAberration: true,
    filmGrain: true,
    depthOfField: true,
    smaa: true,
  },
  mid: {
    dpr: [1, 1.5],
    particles: 15_000,
    accentParticles: 500,
    pointSize: 2.5,
    bloom: true,
    bloomResolution: 256,
    chromaticAberration: false,
    filmGrain: true,
    depthOfField: false,
    smaa: true,
  },
  low: {
    dpr: [1, 1],
    particles: 6_000,
    accentParticles: 250,
    pointSize: 2.0,
    bloom: true,
    bloomResolution: 256,
    chromaticAberration: false,
    filmGrain: false,
    depthOfField: false,
    smaa: false,
  },
};

export const TierContext = createContext<TierState>({
  tier: 'none',
  resolved: false,
  reducedMotion: false,
  stepDown: () => {},
  stepUp: () => {},
  lock: () => {},
});

export function useTier(): TierState {
  return useContext(TierContext);
}

/** Budget for the current tier, or `null` at tier `none`. */
export function useTierBudget(): TierBudget | null {
  const { tier } = useTier();
  return tier === 'none' ? null : TIER_BUDGETS[tier];
}

/**
 * Whether 3D should render at all: a resolved active tier.
 *
 * Reduced motion does NOT gate this — under `prefers-reduced-motion` the
 * scene still renders, with particles frozen in their *target* state and the
 * loop on demand (§10.2). That is a nice property of the concept: the
 * reduced-motion version is the *resolved* version.
 */
export function use3DActive(): boolean {
  const { tier, resolved } = useTier();
  return resolved && tier !== 'none';
}

const TIER_ORDER: ActiveTier[] = ['low', 'mid', 'high'];

export function stepTierDown(current: Tier): Tier {
  if (current === 'none') return 'none';
  const i = TIER_ORDER.indexOf(current);
  return i <= 0 ? 'low' : TIER_ORDER[i - 1]!;
}

export function stepTierUp(current: Tier): Tier {
  if (current === 'none') return 'none';
  const i = TIER_ORDER.indexOf(current);
  return i >= TIER_ORDER.length - 1 ? 'high' : TIER_ORDER[i + 1]!;
}

/**
 * WebGL2 capability probe.
 *
 * Runs before `detect-gpu` because detect-gpu's benchmark tells you how fast
 * a GPU is, not whether you are allowed to use it. A group-policy block, a
 * driver blocklist, or a hardened browser profile all present as a context
 * that simply refuses to be created — and that has to resolve to `'none'`,
 * not to `'low'`.
 *
 * The probe context is explicitly destroyed: browsers cap simultaneous WebGL
 * contexts (often ~16) and leaking probe contexts across navigations would
 * eventually starve the real canvas.
 */
export function canRenderWebGL(): boolean {
  if (typeof window === 'undefined') return false;

  // §5.4: a single-core machine is treated as tier none regardless of GPU.
  const cores = navigator.hardwareConcurrency;
  if (typeof cores === 'number' && cores < 2) return false;

  let canvas: HTMLCanvasElement | null = null;
  let gl: WebGL2RenderingContext | null = null;

  try {
    canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: false,
      powerPreference: 'default',
    }) as WebGL2RenderingContext | null;

    if (!gl) return false;

    // A context that exists but cannot compile a trivial shader is a
    // software fallback we do not want to drive 40,000 additive points with.
    const shader = gl.createShader(gl.VERTEX_SHADER);
    if (!shader) return false;
    gl.shaderSource(shader, 'void main(){gl_Position=vec4(0.0);}');
    gl.compileShader(shader);
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS) === true;
    gl.deleteShader(shader);

    return compiled;
  } catch {
    return false;
  } finally {
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    canvas?.remove();
  }
}
