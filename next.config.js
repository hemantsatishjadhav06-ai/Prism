/**
 * next.config.js
 *
 * Two load-bearing concerns live here:
 *   1. The environment-gated indexing block (spec §10.3). Fails CLOSED.
 *   2. The §2.5 redirect map — one entry, because all five live page URLs
 *      are preserved exactly (see docs/RECONCILIATION.md §7).
 */

/**
 * Indexing is allowed ONLY when NEXT_PUBLIC_INDEXABLE is exactly the string
 * 'true'. Anything else — missing, misspelled, empty, 'TRUE', '1' — blocks
 * indexing. Spec §10.3: "a missing, misspelled, or lost variable has to fail
 * closed to noindex, never to indexable, because the variable will survive a
 * hosting handoff only if it doesn't need to."
 *
 * prism.inc already ranks, and the staging deployment is a public copy of it.
 * Vercel adds noindex to non-production preview deployments automatically but
 * NOT to the production *.vercel.app alias — which is exactly the URL that
 * gets shared with a client.
 *
 * Exported so app/robots.ts and the layout's metadata read the same value and
 * cannot drift.
 */
const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // No remote images. The live site hot-links unlicensed stock photography
  // (RECONCILIATION.md §4.7); the rebuild serves only local assets.
  images: {
    remotePatterns: [],
  },

  /**
   * Load shaders/*.vert|frag as raw strings so the GLSL can live in real
   * .vert/.frag files per §5.1's directory layout instead of being inlined
   * as template literals in TypeScript.
   *
   * `asset/source` is built into webpack 5 — no loader dependency, which
   * matters because §4 pins the dependency set and forbids additions.
   */
  webpack(config) {
    config.module.rules.push({
      test: /\.(vert|frag|glsl)$/,
      type: 'asset/source',
    });
    return config;
  },

  async headers() {
    /** @type {{ key: string, value: string }[]} */
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ];

    if (!INDEXABLE) {
      securityHeaders.push({
        key: 'X-Robots-Tag',
        value: 'noindex, nofollow',
      });
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  async redirects() {
    return [
      // The logo moves from the live site's root to /brand/. This is the
      // complete redirect map: every page URL is preserved at its exact
      // path, so nothing else needs a 301 (spec §2.5, §13.2 item 16).
      {
        source: '/prism-logo.png',
        destination: '/brand/prism-logo.png',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
