import Image from 'next/image';
import { site } from '@/content/site';

/**
 * The supplied logo is a 480×270 PNG with an OPAQUE WHITE background — there
 * is no transparent or SVG variant (docs/RECONCILIATION.md §8.1). On this
 * site's near-black surfaces it therefore sits on a white plate, which is
 * exactly what the live site's navy footer already does.
 *
 * Do not key out the white, recolor the wordmark, or crop it. Spec §13.2
 * item 18 and CLAUDE.md both forbid editing the asset; a transparent variant
 * is an open client request (CLIENT-QUESTIONS.md B11) and will be a drop-in
 * replacement when it arrives.
 *
 * Height is capped at 135px because the source is 270px tall and §2.1 allows
 * 2x without upscaling.
 */
export function Logo({ height = 44 }: { height?: number }) {
  const capped = Math.min(height, site.logo.maxRenderedHeight);
  const width = Math.round(capped * (site.logo.width / site.logo.height));

  return (
    <span className="logo-plate">
      <Image
        src={site.logo.src}
        alt={site.logo.alt}
        width={width}
        height={capped}
        priority
        sizes={`${width}px`}
      />
    </span>
  );
}
