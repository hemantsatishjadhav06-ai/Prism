/**
 * scripts/check-content.ts — the content gate (spec §13.3).
 *
 * Wired into `prebuild`, so it runs on every `npm run build`.
 *
 * Fails the build when any of these appear in content/ or app/:
 *   TODO(copy)   TODO(legal)   TODO(config)   Lorem   PLACEHOLDER
 *
 * The real risk in a regulated vertical is not that someone writes a
 * placeholder — it is that a placeholder ships. This makes §13.2 decisions
 * 1, 2, 3 and 9 self-enforcing rather than dependent on someone remembering.
 *
 * ── One deliberate deviation from the literal §13.3 wording ──
 *
 * §13.3 says "fail the build when NODE_ENV=production". Taken literally that
 * is unusable: `next build` sets NODE_ENV=production for every build,
 * including local ones, so the project would be unbuildable for the whole of
 * Phase 1 — while §13.2 item 3 simultaneously expects the legal-page markers
 * to persist through Phase 1 and to block "production deploy".
 *
 * So the gate keys on whether this build is actually going to be published:
 *
 *   STRICT (exit 1)  — VERCEL_ENV=production, or NEXT_PUBLIC_INDEXABLE=true,
 *                      or CONTENT_GATE=strict
 *   WARN   (exit 0)  — everything else: prints the same report, loudly, and
 *                      lets the build continue
 *
 * Nothing is hidden in either mode; the only difference is the exit code.
 * Tying strictness to NEXT_PUBLIC_INDEXABLE has a useful property: a
 * deployment cannot be crawlable and incomplete at the same time.
 *
 * Run strict locally with:  CONTENT_GATE=strict npm run check:content
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['content', 'app'];
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css', '.md', '.json'];

/**
 * The forbidden markers. Matched case-sensitively and literally, exactly as
 * §13.3 lists them — a case-insensitive match on "lorem" would flag the word
 * inside unrelated prose, and false positives are how a gate gets disabled.
 */
const MARKERS = ['TODO(copy)', 'TODO(legal)', 'TODO(config)', 'Lorem', 'PLACEHOLDER'] as const;

/**
 * Lines carrying this marker are exempt. It exists for the one legitimate
 * case: source that must *name* a marker without *being* one — this file's
 * own MARKERS array, and the gate's own documentation.
 *
 * Deliberately verbose so it cannot be typed by accident, and so that
 * `grep`-ing for it reveals every exemption in the codebase at once.
 */
const EXEMPT = 'content-gate-allow-marker';

interface Finding {
  file: string;
  line: number;
  marker: string;
  text: string;
}

function isStrict(): boolean {
  return (
    process.env.VERCEL_ENV === 'production' ||
    process.env.NEXT_PUBLIC_INDEXABLE === 'true' ||
    process.env.CONTENT_GATE === 'strict'
  );
}

function walk(dir: string, acc: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return acc; // Directory absent is not an error; nothing to scan.
  }

  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, acc);
    } else if (SCAN_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      acc.push(full);
    }
  }
  return acc;
}

function scan(): Finding[] {
  const findings: Finding[] = [];

  for (const dirName of SCAN_DIRS) {
    for (const file of walk(join(ROOT, dirName))) {
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);

      lines.forEach((text, i) => {
        if (text.includes(EXEMPT)) return;

        for (const marker of MARKERS) {
          if (text.includes(marker)) {
            findings.push({
              file: relative(ROOT, file).split(sep).join('/'),
              line: i + 1,
              marker,
              text: text.trim(),
            });
          }
        }
      });
    }
  }

  return findings;
}

function main(): void {
  const strict = isStrict();
  const findings = scan();
  const mode = strict ? 'STRICT' : 'WARN';

  if (findings.length === 0) {
    console.log(`✓ Content gate (${mode}): no unresolved markers in ${SCAN_DIRS.join('/, ')}/.`);
    return;
  }

  const header = strict
    ? 'Content gate FAILED — unresolved markers cannot reach production'
    : 'Content gate: unresolved markers (build continues — not a production deploy)';

  console.log('');
  console.log('─'.repeat(72));
  console.log(header);
  console.log('─'.repeat(72));

  // Group by marker so the reader sees categories, not a flat wall.
  const byMarker = new Map<string, Finding[]>();
  for (const f of findings) {
    const list = byMarker.get(f.marker) ?? [];
    list.push(f);
    byMarker.set(f.marker, list);
  }

  for (const [marker, list] of byMarker) {
    console.log('');
    console.log(`  ${marker}  (${list.length})`);
    for (const f of list) {
      const snippet = f.text.length > 90 ? `${f.text.slice(0, 87)}...` : f.text;
      console.log(`    ${f.file}:${f.line}`);
      console.log(`      ${snippet}`);
    }
  }

  console.log('');
  console.log('─'.repeat(72));
  console.log(`  ${findings.length} marker${findings.length === 1 ? '' : 's'} total.`);

  if (strict) {
    console.log('');
    console.log('  Resolve every marker, or unset NEXT_PUBLIC_INDEXABLE / VERCEL_ENV');
    console.log('  to build a non-production preview.');
    console.log('  Outstanding client items are tracked in docs/CLIENT-QUESTIONS.md.');
    console.log('─'.repeat(72));
    console.log('');
    process.exit(1);
  }

  console.log('  These block a production deploy. See docs/CLIENT-QUESTIONS.md.');
  console.log('─'.repeat(72));
  console.log('');
}

main();
