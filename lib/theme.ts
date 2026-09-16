/**
 * lib/theme.ts — design tokens as plain hex strings.
 *
 * three.js cannot read CSS custom properties, so the spectrum bands are
 * mirrored here (spec §3.1). app/globals.css is the definition for the DOM;
 * this file must stay in step with it. Phase 1 uses only the surface colors
 * and the gradient sampler; the bands come into play from Phase 2 on.
 */

export const surfaces = {
  /** Base background of every 3D scene. */
  void: '#05060A',
  /** Secondary dark surface — cards, panels, footer. */
  void2: '#0B0D12',
  /**
   * Unlit structural geometry: tunnel ribs, frames.
   * 2.6:1 on --void. NEVER use for text. Geometry only.
   */
  structure: '#4A4F5C',
  inkPrimary: '#EDEFF2',
  inkMuted: '#8990A0',
  utilityBg: '#F1F1EE',
  utilityInk: '#14161A',
  utilityMuted: '#5B5F68',
} as const;

/**
 * The five spectrum bands, in gradient order.
 *
 * Home assigns the first four to the four service pillars; Rose is reserved
 * for the About `M` and the Testimonial accent (§3.1, §7.3). Inner-page
 * station colors are never hand-assigned — they are sampled from this ramp
 * at `i / (n - 1)` so any station count produces a coherent violet→rose
 * progression, which is what makes the progress thread and the station
 * colors mathematically the same object (§3.1).
 */
export const bands = [
  { name: 'violet', hex: '#7C6CFF', letter: 'P', word: 'Payment' },
  { name: 'cyan', hex: '#45D6E5', letter: 'R', word: 'Resolution' },
  { name: 'emerald', hex: '#6FE39A', letter: 'I', word: 'IDR' },
  { name: 'amber', hex: '#FFB454', letter: 'S', word: 'System' },
  { name: 'rose', hex: '#FF6F91', letter: 'M', word: 'Management' },
] as const;

/** Gradient stops from §3.1, as [position, hex]. */
const GRADIENT_STOPS: readonly [number, string][] = [
  [0.0, '#7C6CFF'],
  [0.35, '#45D6E5'],
  [0.6, '#6FE39A'],
  [0.8, '#FFB454'],
  [1.0, '#FF6F91'],
];

export const progressGradientCss =
  'linear-gradient(180deg, #7C6CFF 0%, #45D6E5 35%, #6FE39A 60%, #FFB454 80%, #FF6F91 100%)';

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/**
 * Sample the five-band spectrum at `t` in [0, 1].
 *
 * Used to derive station colors from content array length so that adding or
 * removing a station is a content edit rather than a code change (§3.1, §8.0).
 */
export function sampleSpectrum(t: number): string {
  const x = Math.min(1, Math.max(0, t));
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    const [p0, c0] = GRADIENT_STOPS[i];
    const [p1, c1] = GRADIENT_STOPS[i + 1];
    if (x >= p0 && x <= p1) {
      const local = p1 === p0 ? 0 : (x - p0) / (p1 - p0);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      return rgbToHex(
        a[0] + (b[0] - a[0]) * local,
        a[1] + (b[1] - a[1]) * local,
        a[2] + (b[2] - a[2]) * local,
      );
    }
  }
  return GRADIENT_STOPS[GRADIENT_STOPS.length - 1][1];
}

/**
 * Evenly spaced spectrum colors for `n` stations.
 * `n = 1` returns the violet end rather than dividing by zero.
 */
export function spectrumForCount(n: number): string[] {
  if (n <= 1) return [GRADIENT_STOPS[0][1]];
  return Array.from({ length: n }, (_, i) => sampleSpectrum(i / (n - 1)));
}
