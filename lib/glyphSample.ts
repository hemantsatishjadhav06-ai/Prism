/**
 * Text → point cloud (spec §7.2).
 *
 * WHY THE WORDMARK AND NOT THE HEADLINE
 *
 * v1 wanted the full headline "Out-of-network claims, resolved with
 * precision." formed from particles. At 40+ characters, in perspective,
 * rendered as soft additive points, that is an illegible smear at any
 * particle count you can afford — and it buries the single most important
 * string on the site inside a canvas.
 *
 * So the headline is real DOM text and the particles form the wordmark
 * `PRISM`: five large glyphs, unambiguous at any distance. The "noise
 * resolves into signal" idea also lands harder on the logo than on a
 * sentence, because the payoff is the company's own name emerging from chaos.
 *
 * THE FONT GATE
 *
 * Sampling MUST wait for `document.fonts.ready`. If Instrument Serif has not
 * loaded, the canvas rasterises the fallback serif and the particle
 * letterforms come out subtly wrong — a difference that is very hard to
 * diagnose weeks later (§3.2).
 */

export interface GlyphCloud {
  /** Flat xyz triples, length = count * 3. */
  positions: Float32Array;
  count: number;
  /** World-space width the cloud spans, for camera framing. */
  width: number;
  height: number;
}

interface SampleOptions {
  text: string;
  /** Requested point count. The result may be fewer if the mask is sparse. */
  count: number;
  /** World-space width to fit the text into. */
  worldWidth: number;
  /** Depth jitter, in world units, applied on Z. */
  depth?: number;
  /** Rasterisation width in px. ~1200 gives a good mask at low cost. */
  rasterWidth?: number;
  /** Resolved CSS font-family string, e.g. the next/font family name. */
  fontFamily: string;
}

/** Cache: sampling is deterministic per input, and never recomputed on resize. */
const cache = new Map<string, GlyphCloud>();

/**
 * Resolve the actual family name next/font generated for the display face.
 *
 * next/font emits a hashed family name into a CSS custom property; reading
 * the variable is the only reliable way to name the font for canvas, since
 * `ctx.font` needs a real family string and will silently fall back on a
 * miss.
 */
export function resolveDisplayFontFamily(): string {
  if (typeof window === 'undefined') return 'serif';
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-display')
    .trim();
  return value || 'serif';
}

/**
 * Sample `text` into a point cloud.
 *
 * Deliberately CPU-side and run once: the result is cached and reused for the
 * life of the page. Never recompute on resize (§7.2).
 */
export async function sampleGlyphs(options: SampleOptions): Promise<GlyphCloud> {
  const {
    text,
    count,
    worldWidth,
    depth = 0.35,
    rasterWidth = 1200,
    fontFamily,
  } = options;

  const key = `${text}|${count}|${worldWidth}|${depth}|${rasterWidth}|${fontFamily}`;
  const hit = cache.get(key);
  if (hit) return hit;

  // 1. Critical: wait for the real face before rasterising (§3.2).
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // A rejected font promise is not worth failing the hero over; the
      // fallback serif still produces a readable PRISM.
    }
  }

  // 2. Draw the text white-on-black, measuring first so the glyphs fill the
  //    raster rather than sitting in whatever box we guessed.
  const fontSize = Math.round(rasterWidth * 0.38);
  const probe = createCanvas(rasterWidth, Math.round(rasterWidth * 0.5));
  const probeCtx = probe.getContext('2d') as CanvasRenderingContext2D | null;
  if (!probeCtx) return emptyCloud();

  probeCtx.font = `${fontSize}px ${fontFamily}`;
  const metrics = probeCtx.measureText(text);
  const textWidth = Math.max(1, metrics.width);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
  const textHeight = Math.max(1, ascent + descent);

  const pad = Math.round(fontSize * 0.12);
  const w = Math.ceil(textWidth) + pad * 2;
  const h = Math.ceil(textHeight) + pad * 2;

  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | null;
  if (!ctx) return emptyCloud();

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#fff';
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, pad, pad + ascent);

  // 3. Walk pixels with a stride and keep alpha (here: luminance) > 128.
  //    A stride keeps the candidate set to a few tens of thousands rather
  //    than w*h, which matters because this runs on the main thread.
  const { data } = ctx.getImageData(0, 0, w, h);
  const stride = Math.max(1, Math.round(Math.sqrt((w * h) / (count * 6))));

  const candidates: [number, number][] = [];
  for (let y = 0; y < h; y += stride) {
    for (let x = 0; x < w; x += stride) {
      if (data[(y * w + x) * 4]! > 128) candidates.push([x, y]);
    }
  }

  if (candidates.length === 0) return emptyCloud();

  // 4. Rejection-sample `count` points from that set. Sampling with
  //    replacement plus sub-pixel jitter reads better than a strict subset:
  //    it avoids the visible lattice a strided mask would otherwise imprint.
  const n = Math.min(count, Math.max(candidates.length, 1) * 40);
  const positions = new Float32Array(n * 3);

  const worldHeight = (h / w) * worldWidth;
  const scaleX = worldWidth / w;
  const scaleY = worldHeight / h;

  for (let i = 0; i < n; i++) {
    const [px, py] = candidates[(Math.random() * candidates.length) | 0]!;

    // 5. Pixel (x, y) → world (x, y, z + small jitter) for depth.
    //    Y is flipped: canvas grows downward, world grows upward.
    const jx = px + (Math.random() - 0.5) * stride;
    const jy = py + (Math.random() - 0.5) * stride;

    positions[i * 3] = jx * scaleX - worldWidth / 2;
    positions[i * 3 + 1] = worldHeight / 2 - jy * scaleY;
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth;
  }

  const cloud: GlyphCloud = {
    positions,
    count: n,
    width: worldWidth,
    height: worldHeight,
  };

  cache.set(key, cloud);
  return cloud;
}

/**
 * Chaos field: a region-bounded cloud of noise positions near the path.
 *
 * Bounded rather than uniform-in-a-huge-box so the particles read as "this
 * volume is unresolved" instead of as distant stars, and so the additive
 * fragments stay in a predictable screen area — fill rate is the budget
 * that actually matters (§6.2).
 */
export function buildChaosField(
  count: number,
  spread: [number, number, number],
  center: [number, number, number] = [0, 0, 0],
): Float32Array {
  const positions = new Float32Array(count * 3);
  const [sx, sy, sz] = spread;
  const [cx, cy, cz] = center;

  for (let i = 0; i < count; i++) {
    // Biased toward the centre so the cloud has a dense core and a soft edge.
    positions[i * 3] = cx + gaussianish() * sx;
    positions[i * 3 + 1] = cy + gaussianish() * sy;
    positions[i * 3 + 2] = cz + gaussianish() * sz;
  }

  return positions;
}

/** Cheap approximate normal in roughly [-1, 1]. */
function gaussianish(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
}

export function buildSeeds(count: number): Float32Array {
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = Math.random();
  return seeds;
}

function createCanvas(w: number, h: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function emptyCloud(): GlyphCloud {
  return { positions: new Float32Array(0), count: 0, width: 0, height: 0 };
}
