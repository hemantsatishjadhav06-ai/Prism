'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '@/shaders/particles.vert';
import fragmentShader from '@/shaders/particles.frag';

/**
 * ParticleField — THE one particle system (spec §6.2).
 *
 * Reused everywhere with different targets. Do not write a second one: v1
 * implied several and they would diverge.
 *
 * Two vec3 attributes per particle (aChaos, aTarget) plus aSeed. The vertex
 * shader mixes them by a uProgress uniform. No per-frame CPU position writes,
 * ever — the CPU sets one float per frame and the GPU moves 40,000 points.
 */
export interface ParticleFieldProps {
  /** Noise-field positions, flat xyz. */
  chaos: Float32Array;
  /** Formation positions, flat xyz. Must be the same length as `chaos`. */
  target: Float32Array;
  /** Read every frame; 0 = chaos, 1 = formed. A ref, never React state. */
  progressRef: React.MutableRefObject<number>;
  color: string;
  /** Base point size in px, from the tier budget. */
  size: number;
  opacity?: number;
  /** 0 freezes the idle drift, for prefers-reduced-motion (§10.2). */
  driftScale?: number;
  position?: [number, number, number];
}

export function ParticleField({
  chaos,
  target,
  progressRef,
  color,
  size,
  opacity = 1,
  driftScale = 1,
  position = [0, 0, 0],
}: ParticleFieldProps) {
  const count = Math.min(chaos.length, target.length) / 3;

  const seeds = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) s[i] = Math.random();
    return s;
  }, [count]);

  /**
   * Geometry, rebuilt only when the buffers themselves change — which in
   * practice means a tier change altering the particle count.
   */
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = count * 3;
    g.setAttribute('position', new THREE.BufferAttribute(chaos.slice(0, n), 3));
    g.setAttribute('aChaos', new THREE.BufferAttribute(chaos.slice(0, n), 3));
    g.setAttribute('aTarget', new THREE.BufferAttribute(target.slice(0, n), 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    // Points are positioned entirely in the shader, so an auto-computed
    // bounding sphere from the chaos positions would be wrong and could
    // frustum-cull the formation. One generous sphere, set once.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 40);
    return g;
  }, [chaos, target, seeds, count]);

  /**
   * Material created ONCE. The GLSL is a build-time constant, and everything
   * that varies at runtime — size, colour, opacity, drift — is a uniform,
   * synced by the effect below.
   *
   * This is deliberate and load-bearing. Keying the material on `size` meant
   * that a single PerformanceMonitor tier change recreated it, which re-ran
   * the disposal effect and tore down buffers that were still in use. The
   * scene rendered 40,000 points into nothing and `renderer.info` happily
   * reported success. Uniforms change; materials should not.
   */
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uSize: { value: size },
        uDriftScale: { value: driftScale },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      // Without depthWrite:false additive points z-fight and punch visible
      // holes in each other (§6.2). This is not a tuning knob.
      depthWrite: false,
      depthTest: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep uniforms in step with the tier without rebuilding anything (§6.2).
  useEffect(() => {
    material.uniforms.uSize!.value = size;
    material.uniforms.uDriftScale!.value = driftScale;
    material.uniforms.uOpacity!.value = opacity;
    (material.uniforms.uColor!.value as THREE.Color).set(color);
  }, [material, size, driftScale, opacity, color]);

  /**
   * Mandatory disposal (§5.3). The WebGL context never tears down across
   * routes, so nothing is freed for us. With five routes sharing one context
   * this is the most likely cause of a "site gets slow after browsing for a
   * while" report.
   *
   * Each cleanup touches ONLY the object its own render captured. Reading a
   * ref here would mean disposing whatever is current when the cleanup runs,
   * which is a different object — and that is precisely the bug described
   * above the material memo.
   */
  useEffect(() => {
    return () => {
      // Shader materials holding large attribute buffers must null their
      // attribute arrays on unmount, not merely dispose the geometry.
      for (const name of ['position', 'aChaos', 'aTarget', 'aSeed']) {
        const attr = geometry.getAttribute(name) as THREE.BufferAttribute | undefined;
        if (attr) {
          (attr as unknown as { array: Float32Array | null }).array = null;
          geometry.deleteAttribute(name);
        }
      }
      geometry.dispose();
    };
  }, [geometry]);

  useEffect(() => {
    return () => material.dispose();
  }, [material]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    material.uniforms.uProgress!.value = progressRef.current;
    // Advance from delta rather than clock.elapsedTime so that a paused
    // frameloop (frameloop="never" over flat sections, §6.5) does not make
    // the field jump when it resumes.
    material.uniforms.uTime!.value += delta;
  });

  if (count === 0) return null;

  return (
    <points
      ref={pointsRef}
      position={position}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}
