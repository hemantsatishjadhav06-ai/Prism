import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

/**
 * robots.txt — spec §10.3.
 *
 * Fails CLOSED. Indexing is permitted only when NEXT_PUBLIC_INDEXABLE is
 * exactly the string 'true'; a missing, empty, misspelled, or differently
 * cased value yields `Disallow: /`.
 *
 * That default is the whole point. The staging deployment is a publicly
 * reachable copy of a site that already ranks, and Vercel's automatic
 * noindex covers non-production preview deployments but NOT the production
 * *.vercel.app alias — which is exactly the URL that gets shared with a
 * client. Flip the variable to 'true' once, scoped to Production, after the
 * real domain resolves and has been verified end to end.
 *
 * The live site has no robots.txt at all (docs/RECONCILIATION.md §3.2).
 */
export default function robots(): MetadataRoute.Robots {
  const indexable = process.env.NEXT_PUBLIC_INDEXABLE === 'true';

  if (!indexable) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${site.origin}/sitemap.xml`,
    host: site.origin,
  };
}
