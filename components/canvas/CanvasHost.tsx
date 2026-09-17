'use client';

import dynamic from 'next/dynamic';
import { use3DActive } from '@/lib/tier';

/**
 * Gate between the DOM site and the 3D layer.
 *
 * `ssr: false` keeps three.js out of the server bundle entirely, so it never
 * blocks first paint and the DOM content paints before any 3D code is even
 * parsed (§11.1). The LCP element must be the hero <h1>, never the canvas.
 *
 * `use3DActive()` is false until detection resolves and stays false forever
 * at tier `none`, so on a locked-down enterprise desktop the canvas is never
 * mounted and the three.js chunk is never fetched (§5.4).
 */
const SceneCanvas = dynamic(
  () => import('./SceneCanvas').then((m) => m.SceneCanvas),
  { ssr: false },
);

export function CanvasHost() {
  const active = use3DActive();
  if (!active) return null;
  return <SceneCanvas />;
}
