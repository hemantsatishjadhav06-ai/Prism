import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

/**
 * sitemap.xml — spec §10.3: all five routes plus the legal pages.
 *
 * The five content routes keep the exact paths the live site uses, so no
 * ranking signal is lost (§2.5, docs/RECONCILIATION.md §7). The live site has
 * no sitemap at all.
 *
 * Priorities reflect commercial intent rather than being uniform: the legal
 * pages are required and linked but are not what anyone is searching for.
 */
const ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'monthly' as const },
  { path: '/products', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/services', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/about', priority: 0.7, changeFrequency: 'yearly' as const },
  { path: '/contact', priority: 0.8, changeFrequency: 'yearly' as const },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' as const },
  { path: '/security', priority: 0.4, changeFrequency: 'yearly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${site.origin}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
