import { z } from 'zod';

/**
 * One schema, imported by both the client form and the route handler, so
 * client and server validation cannot drift (spec §9).
 *
 * Field set follows the LIVE site, not §9's reconstruction: the live form
 * asks for name, email, company, phone, service_interest and message, where
 * §9 listed name/work email/organization/role/message. The live set is what
 * the business actually asks for, and the service select doubles as useful
 * routing. Recorded in docs/RECONCILIATION.md §5.4 / CLIENT-QUESTIONS.md.
 *
 * Nothing here is stored. The handler forwards and forgets (§9, §13.2 item 5)
 * precisely because any free-text field on this site is a channel through
 * which someone may paste PHI.
 */

/** Must match `contact.form.fields[4].options` in content/site.ts. */
export const SERVICE_OPTIONS = [
  'IDR Software Platform',
  'White-Glove IDR Consulting',
  'Open Negotiation Management',
  'Federal IDR Representation',
  'Appeals & Underpayment Recovery',
  'Training & Advisory',
  'Other / Not Sure',
] as const;

/** §9: message capped at 2000 characters. */
export const MESSAGE_MAX = 2000;

/** §9: minimum time-to-submit, in milliseconds. */
export const MIN_SUBMIT_MS = 3000;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your full name.')
    .max(120, 'Name is too long.'),

  email: z
    .string()
    .trim()
    .min(1, 'Enter your work email.')
    .email('Enter a valid email address.')
    .max(200, 'Email is too long.'),

  company: z.string().trim().max(160, 'Company name is too long.').default(''),

  phone: z.string().trim().max(40, 'Phone number is too long.').default(''),

  service_interest: z
    .union([z.enum(SERVICE_OPTIONS), z.literal('')])
    .default(''),

  message: z
    .string()
    .trim()
    .min(1, 'Tell us how we can help.')
    .max(MESSAGE_MAX, `Please keep this under ${MESSAGE_MAX} characters.`),

  /**
   * Honeypot (§9). Named plausibly enough that a naive bot fills it in, and
   * hidden from humans and assistive tech alike.
   *
   * Deliberately NOT constrained to empty here. A schema-level `.max(0)`
   * rejects with a 400 naming this field, which tells a bot exactly which
   * input tripped it. The route handler checks it separately and answers a
   * plain 200, so a bot learns nothing from the response.
   */
  website: z.string().max(200).default(''),

  /**
   * Client timestamp of first render, used for the minimum time-to-submit
   * check. Validated server-side; a bot that posts instantly fails it.
   */
  renderedAt: z.coerce.number().int().nonnegative().default(0),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Field-keyed errors, shaped for rendering next to each input. */
export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export function flattenErrors(error: z.ZodError<ContactInput>): ContactErrors {
  const out: ContactErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ContactInput | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
