import tunnel from 'tunnel-rat';

/**
 * The r3f tunnel (spec §5.2).
 *
 * A <Canvas> in app/layout.tsx does persist across App Router navigations,
 * but route content lives in `children` — outside the canvas's React
 * reconciler — so a page cannot declare scene content from there.
 *
 * Swapping an `sceneId` in context would mean the root layout imports and
 * switches on every page's scene, putting all four scenes in the layout
 * bundle and killing code-splitting. Instead each page renders its scene
 * into `<r3f.In>` and the layout's canvas renders `<r3f.Out />`, so pages
 * stay independently code-split.
 */
export const r3f = tunnel();
