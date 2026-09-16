import { NextResponse } from 'next/server';
import { contactSchema, flattenErrors, MIN_SUBMIT_MS } from '@/lib/contactSchema';
import { site } from '@/content/site';

/**
 * POST /api/contact — spec §9.
 *
 * Forward and forget. Nothing is written to a database, by design: PRISM
 * markets HIPAA alignment and operates on claims data, so any inbound
 * free-text field is a channel through which someone may paste PHI. The
 * moment that lands in a store we control, it brings a BAA requirement,
 * breach-notification exposure and a retention policy. Storing marketing
 * leads is not worth acquiring that (§9, §13.2 item 5).
 *
 * Degradation contract: when RESEND_API_KEY is absent the route returns 503
 * with the direct email address rather than pretending to succeed. The page
 * surfaces that, so the form is never silently broken and a lead never
 * vanishes (§9, §13.4).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Rate limit: 5 per IP per hour (§9).
 *
 * In-memory LRU, which is the §9-sanctioned fallback when Vercel KV is not
 * provisioned. Caveat worth stating plainly: on serverless this is per
 * instance, so it throttles a single attacker hitting a warm instance but is
 * not a global limit. Swap in KV when it is provisioned.
 */
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_TRACKED_IPS = 5000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Bound the map so a spray of unique IPs cannot grow it without limit.
  if (hits.size > MAX_TRACKED_IPS) {
    for (const key of hits.keys()) {
      hits.delete(key);
      if (hits.size <= MAX_TRACKED_IPS) break;
    }
  }

  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** All control characters, including CR and LF. */
const CONTROL_CHARS = new RegExp('[\u0000-\u001F\u007F]', 'g');
/** All control characters except LF, for fields that may span lines. */
const CONTROL_CHARS_KEEP_LF = new RegExp('[\u0000-\u0009\u000B-\u001F\u007F]', 'g');

/**
 * Single-line fields. Strips control characters — which also removes the
 * CR/LF that could otherwise be injected into the subject or Reply-To
 * header — and neutralises angle brackets. No HTML pass-through (§9).
 */
function sanitize(value: string): string {
  return value
    .replace(CONTROL_CHARS, ' ')
    .replace(/</g, '‹')
    .replace(/>/g, '›')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The message field keeps its line breaks; everything else is still stripped. */
function sanitizeMultiline(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_CHARS_KEEP_LF, ' ')
    .replace(/</g, '‹')
    .replace(/>/g, '›')
    .trim();
}

/**
 * Cloudflare Turnstile verification (§9).
 * Absent secret ⇒ skipped, so the form works end to end in dev.
 */
async function turnstileOk(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Fail closed: a verification outage must not become an open relay.
    return false;
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: `Too many submissions from this network. Please email ${site.email} directly.` },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', fields: flattenErrors(parsed.error) },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Honeypot. Answer 200 so a bot learns nothing from the response.
  if (data.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Minimum time-to-submit (§9). Same silent-success treatment.
  if (data.renderedAt > 0 && Date.now() - data.renderedAt < MIN_SUBMIT_MS) {
    return NextResponse.json({ ok: true });
  }

  const token = (payload as { turnstileToken?: string } | null)?.turnstileToken;
  if (!(await turnstileOk(token, ip))) {
    return NextResponse.json(
      { error: 'Could not verify that you are human. Please try again.' },
      { status: 400 },
    );
  }

  const destination = process.env.CONTACT_DESTINATION_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;

  if (!apiKey || !destination || !from) {
    // §9 / §13.4: no keys yet. Never claim success; hand back the mailto path.
    return NextResponse.json(
      {
        error: `Our contact form isn't connected yet. Please email ${site.email} directly and we'll respond within one business day.`,
      },
      { status: 503 },
    );
  }

  const body = [
    'New inquiry from prism.inc',
    '',
    `Name:      ${sanitize(data.name)}`,
    `Email:     ${sanitize(data.email)}`,
    `Company:   ${sanitize(data.company) || '—'}`,
    `Phone:     ${sanitize(data.phone) || '—'}`,
    `Interest:  ${sanitize(data.service_interest) || '—'}`,
    '',
    'Message:',
    sanitizeMultiline(data.message),
    '',
    '---',
    'Sent from the prism.inc contact form. Not stored in any database.',
  ].join('\n');

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from,
      to: [destination],
      replyTo: sanitize(data.email),
      subject: `PRISM inquiry — ${sanitize(data.name)}`,
      text: body,
    });

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        error: `We couldn't send your message. Please email ${site.email} directly and we'll respond within one business day.`,
      },
      { status: 502 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed.' }, { status: 405 });
}
