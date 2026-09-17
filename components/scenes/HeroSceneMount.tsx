'use client';

import dynamic from 'next/dynamic';
import { r3f } from '@/lib/tunnel';
import { use3DActive } from '@/lib/tier';

/**
 * Portals the Hero scene into the persistent canvas (§5.2).
 *
 * The page renders this; the layout's canvas renders `<r3f.Out />`. That is
 * what keeps each page's scene independently code-split instead of pulling
 * every scene into the root layout bundle.
 *
 * `ssr: false` so three.js stays out of the server bundle, and the gate means
 * the chunk is never fetched at tier `none`.
 */
const HeroScene = dynamic(() => import('./HeroScene').then((m) => m.HeroScene), {
  ssr: false,
});

export function HeroSceneMount() {
  const active = use3DActive();
  if (!active) return null;

  return (
    <r3f.In>
      <HeroScene />
    </r3f.In>
  );
}
