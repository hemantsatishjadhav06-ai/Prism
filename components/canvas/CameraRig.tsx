'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { buildHomePath } from '@/lib/curves';
import { damp, fovForT, isTouchDevice, mapHomeScrollToT, scrollState } from '@/lib/scroll';

/**
 * CameraRig — spline + scroll driver (spec §6.1).
 *
 * Reads `scrollState` (a mutable module object) inside useFrame. It never
 * reads React state and never writes scroll position; scroll is the only
 * input and `t` is a pure function of it.
 *
 * HERO HOLD: the camera holds at t=0 for 1.5s after first paint before
 * scroll-scrub engages. Combined with `scrollRestoration = 'manual'`, this
 * stops an accidental instant fly-through when someone lands on a restored
 * scroll position (§7.2).
 */
export function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const { path, look, dispose } = useMemo(() => buildHomePath(isTouchDevice()), []);

  /**
   * Scratch objects, allocated once. Allocating a Vector3 per frame at 144fps
   * is how you hand the GC a sawtooth.
   *
   * CORRECTION TO §6.1's SNIPPET — this one is load-bearing.
   *
   * The spec builds the target orientation with a plain Object3D:
   *
   *     tmpObj.position.copy(camera.position)
   *     tmpObj.lookAt(look.getPointAt(t + 0.02))
   *     camera.quaternion.slerp(tmpObj.quaternion, ...)
   *
   * `Object3D.lookAt` is ASYMMETRIC in three.js. For a Camera or a Light it
   * orients so that −Z faces the target; for any other Object3D it orients
   * so that +Z faces the target. Copying a plain Object3D's quaternion onto
   * a camera therefore points the camera 180° the wrong way — it flies
   * backwards down the tunnel with the entire scene behind it.
   *
   * The symptom is brutal to diagnose: the scene graph is correct, the
   * shader compiles, `renderer.info` reports 40,000 points drawn every
   * frame, and there is no GL error. You just get an empty screen, because
   * every point projects to NDC z > 1.
   *
   * So the quaternion is built from `Matrix4.lookAt(eye, target, up)`
   * directly, which is unambiguously camera-convention, and there is no
   * intermediate object whose type changes the meaning.
   */
  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
      lookAt: new THREE.Vector3(),
    }),
    [],
  );

  /** Camera-convention orientation: −Z faces `target`. */
  const orientTo = (target: THREE.Vector3) => {
    scratch.matrix.lookAt(camera.position, target, camera.up);
    scratch.quat.setFromRotationMatrix(scratch.matrix);
    return scratch.quat;
  };

  const engaged = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // §6.1: restore scroll position ourselves, or a reload mid-page lands the
    // camera at the wrong t.
    const previous = history.scrollRestoration;
    history.scrollRestoration = 'manual';

    if (reducedMotion) {
      // §10.2: no hero hold theatre — the camera simply sits at its resolved
      // position from the first frame.
      engaged.current = true;
    } else {
      holdTimer.current = setTimeout(() => {
        engaged.current = true;
      }, 1500);
    }

    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
      history.scrollRestoration = previous;
      dispose();
    };
  }, [dispose, reducedMotion]);

  useEffect(() => {
    // Snap to the path start so the very first frame is never at the origin.
    camera.position.copy(path.getPointAt(0));
    camera.quaternion.copy(orientTo(look.getPointAt(0.02)));
    camera.fov = 50;
    camera.updateProjectionMatrix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, path, look]);

  useFrame((_, rawDelta) => {
    // Clamp delta: a backgrounded tab can hand back a multi-second delta,
    // which would make the damping term overshoot on the first frame back.
    const dt = Math.min(rawDelta, 1 / 20);

    const t = engaged.current ? mapHomeScrollToT(scrollState.progress) : 0;
    scrollState.t = t;

    // Position is assigned directly from the curve — no smoothing. The scrub
    // smoothing lives in ScrollTrigger (scrub: 0.6), so smoothing here too
    // would compound into mush.
    camera.position.copy(path.getPointAt(t));

    // The +0.02 lookahead produces natural head-turning into corners rather
    // than a rigid forward stare (§6.1).
    const targetQuat = orientTo(look.getPointAt(Math.min(t + 0.02, 1)));

    if (reducedMotion) {
      // Camera holds at the section's resolved orientation; no scroll-linked
      // rotation, and no damping to animate (§10.2).
      camera.quaternion.copy(targetQuat);
      return;
    }

    // slerp toward the target quaternion with frame-rate-independent damping.
    // A naive per-frame camera.lookAt() snaps and introduces roll twitch at
    // curve inflections; this is what removes it (§6.1).
    camera.quaternion.slerp(targetQuat, damp(0.001, dt));

    // Guard updateProjectionMatrix so the frustum cache is not invalidated
    // every single frame (§6.1).
    const targetFov = fovForT(t);
    if (Math.abs(camera.fov - targetFov) > 0.01) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, damp(0.01, dt));
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
