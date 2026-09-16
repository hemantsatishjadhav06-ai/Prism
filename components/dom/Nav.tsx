'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { nav, ui } from '@/content/site';
import { Logo } from './Logo';

/**
 * Site navigation.
 *
 * Client component only because the mobile disclosure and the active-route
 * highlight need the current pathname. All of its copy is server-rendered
 * into the HTML either way — the links exist in view-source (§10.3), which
 * is the property that matters.
 *
 * The nav CTA uses `Request consultation` (sentence case) rather than the
 * live site's Title Case `Request Consultation`: the live site is internally
 * inconsistent between its nav and its hero, and §3.2 mandates sentence case.
 * Both live strings are recorded in content/site.ts.
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--void)]/90 backdrop-blur-md">
      <div className="container-prism flex h-20 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label={ui.homeLinkLabel}
        >
          <Logo height={40} />
        </Link>

        <nav aria-label={ui.navLandmarkLabel} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.links.map((link) => (
              <li key={link.path}>
                <Link
                  href={link.path}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                  className={`relative px-4 py-2 text-[15px] transition-colors ${
                    isActive(link.path)
                      ? 'text-[color:var(--ink-primary)]'
                      : 'text-[color:var(--ink-muted)] hover:text-[color:var(--ink-primary)]'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-4 -bottom-px h-px bg-[color:var(--violet)]"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Link
            href={nav.cta.href}
            className="inline-flex h-10 items-center rounded-md bg-[color:var(--ink-primary)] px-5 text-[15px] font-medium text-[color:var(--void)] transition-colors hover:bg-white"
          >
            {nav.cta.label}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={nav.mobileToggleAriaLabel}
          className="p-2 text-[color:var(--ink-primary)] lg:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.5" />
            )}
          </svg>
        </button>
      </div>

      {/*
        Rendered in the HTML at all times and hidden with `hidden` rather than
        conditionally mounted, so the links are present for crawlers and are
        never a JS-only affordance.
      */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-white/10 bg-[color:var(--void-2)] lg:hidden"
      >
        <ul className="container-prism flex flex-col py-2">
          {nav.links.map((link) => (
            <li key={link.path}>
              <Link
                href={link.path}
                onClick={() => setOpen(false)}
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`block border-b border-white/5 px-1 py-3 ${
                  isActive(link.path)
                    ? 'text-[color:var(--ink-primary)]'
                    : 'text-[color:var(--ink-muted)]'
                }`}
              >
                {link.name}
              </Link>
            </li>
          ))}
          <li className="pt-4 pb-2">
            <Link
              href={nav.cta.href}
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[color:var(--ink-primary)] px-5 font-medium text-[color:var(--void)]"
            >
              {nav.cta.label}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
