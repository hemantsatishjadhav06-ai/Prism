'use client';

import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { scrollState } from '@/lib/scroll';
import { surfaces } from '@/lib/theme';

/**
 * BackdropWash — the scroll-driven dark → light-blue backdrop
 * (docs/DESIGN-hero-light-resolve.md).
 *
 * Lerps the scene background and the renderer clear colour from the void to
 * the light-blue endpoint by `scrollState.resolve`, which is a pure function
 * of scroll (§6.1). Nothing here reads a click, hover, or timer.
 *
 * PURITY / PERFORMANCE
 * - Reads `scrollState.resolve` in `useFrame`; never calls setState (§6.1).
 * - Reuses two `THREE.Color` instances and lerps in place — no per-frame
 *   allocation.
 * - Retains no geometry, material, texture, or render target, so it adds
 *   nothing to the §5.3 `renderer.info` audit. On unmount it restores the
 *   void so a route change never leaves a half-lit background behind.
 */
export function BackdropWash() {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);

  const from = useMemo(() => new THREE.Color(surfaces.void), []);
  const to = useMemo(() => new THREE.Color(surfaces.voidLight), []);
  // The live background colour we own and mutate. Seeded to the void so the
  // first frame matches the static clear colour set in SceneCanvas.
  const current = useMemo(() => new THREE.Color(surfaces.void), []);

  useEffect(() => {
    scene.background = current;
    return () => {
      // Leave the scene as the static rig expects it (§5.3).
      scene.background = new THREE.Color(surfaces.void);
      gl.setClearColor(new THREE.Color(surfaces.void), 1);
    };
  }, [scene, gl, current]);

  useFrame(() => {
    const r = scrollState.resolve;
    current.copy(from).lerp(to, r);
    gl.setClearColor(current, 1);
  });

  return null;
}

export default BackdropWash;
