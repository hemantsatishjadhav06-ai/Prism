'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { r3f } from '@/lib/tunnel';
import { TIER_BUDGETS, useTier, type ActiveTier } from '@/lib/tier';
import { scrollState } from '@/lib/scroll';
import { BackdropWash } from './BackdropWash';
import { CameraRig } from './CameraRig';

/**
 * SceneCanvas — the single <Canvas>, mounted once in the root layout (§5.2).
 *
 * Only ever mounted when the tier is not `none`; at `none` the site is the
 * Phase 1 static version and no WebGL code runs at all (§5.4).
 *
 * Post-processing and the preloader are Phase 3; this is the bare rig.
 */
export function SceneCanvas() {
  const { tier, reducedMotion, stepDown, stepUp, lock } = useTier();
  const [frameloop, setFrameloop] = useState<'always' | 'never' | 'demand'>(
    reducedMotion ? 'demand' : 'always',
  );
  const [eventSource, setEventSource] = useState<HTMLElement | null>(null);
  const hiddenRef = useRef(false);

  const budget = tier === 'none' ? TIER_BUDGETS.low : TIER_BUDGETS[tier as ActiveTier];

  /**
   * `eventSource` pointed at the DOM root is what lets pointer events reach
   * 3D objects *through* the full-screen DOM overlay. Without it nothing in
   * the scene is clickable the moment the overlay exists — and that failure
   * looks exactly like a raycasting bug, so it costs hours (§5.2).
   *
   * Resolved in an effect because the element does not exist during the
   * first client render.
   */
  useEffect(() => {
    setEventSource(document.getElementById('app-root'));
  }, []);

  /**
   * Tab hidden → stop rendering (§6.5). Non-negotiable for battery, and the
   * browser would throttle us anyway.
   */
  useEffect(() => {
    const onVisibility = () => {
      hiddenRef.current = document.hidden;
      if (document.hidden) {
        setFrameloop('never');
      } else {
        setFrameloop(reducedMotion ? 'demand' : 'always');
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [reducedMotion]);

  useEffect(() => {
    if (!hiddenRef.current) setFrameloop(reducedMotion ? 'demand' : 'always');
  }, [reducedMotion]);

  return (
    <div
      /**
       * Fixed behind the DOM content: canvas at z-index 0, DOM at 10 (§5.2).
       *
       * NEVER `display: none` when hiding this (§6.5). A display:none canvas
       * reports clientWidth/Height of 0; on the next resize R3F computes
       * aspect = 0/0 = NaN, poisons the projection matrix, and the scene
       * renders blank when restored. Use visibility + pointer-events and stop
       * the loop instead.
       */
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        // §10.1: the canvas is genuinely decorative — all copy lives in the
        // DOM overlay, which is the single semantic layer.
        aria-hidden="true"
        eventSource={eventSource ?? undefined}
        eventPrefix="client"
        dpr={budget.dpr}
        frameloop={frameloop}
        camera={{ fov: 50, near: 0.1, far: 200, position: [0, 0, 6] }}
        gl={{
          // Deliberate: the post chain supplies SMAA from Phase 3, and MSAA
          // on top of a post-processing pipeline is wasted bandwidth for no
          // visible gain (§5.2).
          antialias: false,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl, scene, camera }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.setClearColor(new THREE.Color('#05060A'), 1);
          // No shadow maps anywhere (§6.4). Nothing in this design needs cast
          // shadows and they are the most expensive thing we could add.
          gl.shadowMap.enabled = false;
          scene.background = new THREE.Color('#05060A');

          /**
           * Debug surface, off unless NEXT_PUBLIC_DEBUG_3D === 'true'.
           *
           * §5.3 requires a `renderer.info` assertion in the QA checklist —
           * navigate / → /products → /about → / five times and geometries
           * and textures must return to within ±2 of their first-load
           * values. That test needs a handle on the renderer, and with five
           * routes sharing one context it is the most likely cause of a
           * "site gets slow after browsing for a while" report.
           */
          if (process.env.NEXT_PUBLIC_DEBUG_3D === 'true') {
            (window as unknown as Record<string, unknown>).__prism = {
              gl,
              scene,
              camera,
              // The live scroll signal. Reading this is how you tell a dead
              // ScrollTrigger apart from a dead camera rig — they look
              // identical from the outside.
              scrollState,
              info: () => ({
                geometries: gl.info.memory.geometries,
                textures: gl.info.memory.textures,
                programs: gl.info.programs?.length ?? 0,
                calls: gl.info.render.calls,
                points: gl.info.render.points,
              }),
            };
          }
        }}
      >
        <PerformanceMonitor
          bounds={() => [50, 60]}
          flipflops={3}
          onDecline={stepDown}
          onIncline={stepUp}
          // flipflops + onFallback prevents the pathological oscillation
          // where the site repeatedly upgrades and downgrades itself, which
          // looks considerably worse than simply running at low (§6.2).
          onFallback={() => lock('low')}
        />

        <CameraRig reducedMotion={reducedMotion} />

        {/*
          Scroll-driven dark → light-blue backdrop wash
          (docs/DESIGN-hero-light-resolve.md). Lerps scene.background /
          clear colour from `scrollState.resolve`, which only Home's hero
          runway ever drives; on every other route resolve stays 0 and the
          background holds at the void.
        */}
        <BackdropWash />

        {/*
          Lighting re-derived for three r155+ physically-correct lights
          (§6.4). Pre-r155 values would render a near-black scene.
          Phase 2 needs only ambient plus the cyan rim; per-station point
          lights arrive with the stations in Phase 4.
        */}
        <ambientLight intensity={0.15} />
        <directionalLight
          position={[0, 4, 2]}
          intensity={1.2}
          color="#45D6E5"
          castShadow={false}
        />

        <r3f.Out />
      </Canvas>
    </div>
  );
}
