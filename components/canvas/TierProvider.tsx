'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TierContext,
  canRenderWebGL,
  stepTierDown,
  stepTierUp,
  type Tier,
  type TierState,
} from '@/lib/tier';

/**
 * Runs capability detection once on mount and publishes the result (§5.4).
 *
 * Detection is client-only and asynchronous, so `resolved` stays false until
 * it completes. Nothing 3D mounts on a guess: the server-rendered output is
 * always the Phase 1 static site, and 3D is layered on afterwards. That
 * ordering is what makes the tier-`none` and no-JS paths real rather than
 * retrofitted.
 */
export function TierProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier>('none');
  const [resolved, setResolved] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Reduced motion is orthogonal to tier: it can apply at any tier (§5.4).
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyMotion = () => setReducedMotion(mq.matches);
    applyMotion();
    mq.addEventListener('change', applyMotion);

    async function detect() {
      // Hard capability gate first. detect-gpu tells you how fast a GPU is,
      // not whether you are permitted to use it — a group-policy block or a
      // driver blocklist has to resolve to 'none', not to 'low'.
      if (!canRenderWebGL()) {
        if (!cancelled) {
          setTier('none');
          setResolved(true);
        }
        return;
      }

      let next: Tier = 'mid';
      try {
        // detect-gpu ships a large benchmark JSON, so it is imported
        // dynamically and only after the WebGL probe has already passed.
        // It is the initial guess ONLY; PerformanceMonitor adjusts from
        // there at runtime (§6.2).
        const { getGPUTier } = await import('detect-gpu');

        /**
         * `benchmarksURL` points at our own origin. By default detect-gpu
         * fetches its benchmark JSON from unpkg.com at runtime, which is
         * wrong here on two counts: it is a third-party request in an
         * enterprise security review — the same finding §3.2 self-hosts the
         * fonts to avoid — and on a hospital network with an egress
         * allowlist it simply fails, which would push every locked-down
         * desktop onto the fallback path for no reason.
         *
         * The JSON is copied into public/detect-gpu/ so the lookup stays
         * on-origin. Verified by preview_network showing no unpkg.com request.
         */
        const result = await getGPUTier({ benchmarksURL: '/detect-gpu' });

        if (result.type === 'WEBGL_UNSUPPORTED') {
          next = 'none';
        } else {
          // detect-gpu tier 0 means "below our floor", not "no WebGL".
          next = result.tier >= 3 ? 'high' : result.tier === 2 ? 'mid' : 'low';
        }

        // It misclassifies Apple Silicon and anything behind a
        // privacy-hardened UA, so never let it land below 'low' when the
        // context itself is healthy.
        if (next === 'none') next = 'low';
      } catch {
        // A failed benchmark is not a reason to deny 3D to a working
        // context; start conservative and let the monitor climb.
        next = 'low';
      }

      if (!cancelled) {
        setTier(next);
        setResolved(true);
      }
    }

    void detect();

    return () => {
      cancelled = true;
      mq.removeEventListener('change', applyMotion);
    };
  }, []);

  const stepDown = useCallback(() => {
    setTier((current) => (locked ? current : stepTierDown(current)));
  }, [locked]);

  const stepUp = useCallback(() => {
    setTier((current) => (locked ? current : stepTierUp(current)));
  }, [locked]);

  const lock = useCallback((next: Tier) => {
    setLocked(true);
    setTier(next);
  }, []);

  const value = useMemo<TierState>(
    () => ({ tier, resolved, reducedMotion, stepDown, stepUp, lock }),
    [tier, resolved, reducedMotion, stepDown, stepUp, lock],
  );

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}
