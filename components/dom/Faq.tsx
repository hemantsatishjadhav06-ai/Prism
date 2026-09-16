import type { FaqItem } from '@/content/site';

/**
 * FAQ accordion.
 *
 * Native <details>/<summary>, per spec §7.6. This is not laziness — it buys
 * keyboard support and Chrome's Ctrl+F "find in collapsed content" for free,
 * both of which a custom accordion would have to reimplement, usually badly.
 * It also works with JavaScript disabled, which a Radix accordion does not.
 *
 * The question text is inside <summary> rather than a heading: <summary> is
 * already an interactive, announced element, and wrapping a heading in it
 * produces a confusing double announcement in screen readers.
 */
export function Faq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-[color:var(--utility-line)] border-y border-[color:var(--utility-line)]">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[19px] text-[color:var(--utility-ink)]">
            <span>{item.q}</span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className="shrink-0 transition-transform group-open:rotate-180"
            >
              <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </summary>
          <p className="measure pb-6 text-[color:var(--utility-muted)]">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
