'use client';

import { useId, useRef, useState } from 'react';
import { contact, site, ui } from '@/content/site';
import {
  contactSchema,
  flattenErrors,
  MESSAGE_MAX,
  type ContactErrors,
  type ContactInput,
} from '@/lib/contactSchema';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMPTY: ContactInput = {
  name: '',
  email: '',
  company: '',
  phone: '',
  service_interest: '',
  message: '',
  website: '',
  renderedAt: 0,
};

/**
 * Contact form.
 *
 * Accessibility contract (§9):
 *  - a real <label> per field, never a placeholder as the label
 *  - aria-describedby wires hints and errors to their input
 *  - errors announced via role="alert"
 *  - focus moves to the first invalid field on a failed submit
 *  - a <noscript> mailto fallback lives in the page, outside this component
 *
 * The PHI notice renders ABOVE the message field and is not dismissible
 * (§9, §13.2 item 20). The live site's weaker notice sits below the field;
 * a warning that arrives after the typing is done is not a control.
 */
export function ContactForm() {
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const renderedAt = useRef<number>(Date.now());

  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState<string>('');

  const fieldId = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;
  const hintId = (name: string) => `${uid}-${name}-hint`;

  const set = (name: keyof ContactInput) => (value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  const describedBy = (name: keyof ContactInput, hasHint = false) => {
    const ids: string[] = [];
    if (hasHint) ids.push(hintId(name));
    if (errors[name]) ids.push(errorId(name));
    return ids.length ? ids.join(' ') : undefined;
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    const candidate = { ...values, renderedAt: renderedAt.current };
    const parsed = contactSchema.safeParse(candidate);

    if (!parsed.success) {
      const next = flattenErrors(parsed.error);
      setErrors(next);
      setStatus('idle');

      // Move focus to the first invalid field, in DOM order.
      const firstInvalid = Object.keys(next)[0];
      if (firstInvalid) {
        formRef.current
          ?.querySelector<HTMLElement>(`#${CSS.escape(fieldId(firstInvalid))}`)
          ?.focus();
      }
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string; fields?: ContactErrors }
          | null;

        if (body?.fields) setErrors(body.fields);
        setStatus('error');
        setFormError(body?.error ?? contact.form.errorToast);
        return;
      }

      setValues(EMPTY);
      setErrors({});
      setStatus('success');
    } catch {
      setStatus('error');
      setFormError(contact.form.errorToast);
    }
  }

  if (status === 'success') {
    return (
      <div
        className="border border-[color:var(--emerald)]/40 bg-[color:var(--void-2)] p-10 text-center"
        role="status"
      >
        <h2 className="text-display-m text-[color:var(--ink-primary)]">
          {contact.form.success.heading}
        </h2>
        <p className="measure mx-auto mt-4 text-[color:var(--ink-muted)]">
          {contact.form.success.body}
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-8 inline-flex h-11 items-center rounded-md border border-white/20 px-5 text-[15px] text-[color:var(--ink-primary)] transition-colors hover:bg-white/5"
        >
          {contact.form.success.resetLabel}
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="border border-white/10 bg-[color:var(--void-2)] p-6 md:p-10"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field
          id={fieldId('name')}
          label={contact.form.fields[0].labelPlain}
          required
          error={errors.name}
          errorId={errorId('name')}
        >
          <input
            id={fieldId('name')}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => set('name')(e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy('name')}
            className={inputClass(Boolean(errors.name))}
          />
        </Field>

        <Field
          id={fieldId('email')}
          label={contact.form.fields[1].labelPlain}
          required
          error={errors.email}
          errorId={errorId('email')}
        >
          <input
            id={fieldId('email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            onChange={(e) => set('email')(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy('email')}
            className={inputClass(Boolean(errors.email))}
          />
        </Field>

        <Field
          id={fieldId('company')}
          label={contact.form.fields[2].labelPlain}
          error={errors.company}
          errorId={errorId('company')}
        >
          <input
            id={fieldId('company')}
            name="company"
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => set('company')(e.target.value)}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={describedBy('company')}
            className={inputClass(Boolean(errors.company))}
          />
        </Field>

        {/* type="tel" rather than the live site's bare input, for mobile
            keyboards. Recorded in content/site.ts as an a11y improvement. */}
        <Field
          id={fieldId('phone')}
          label={contact.form.fields[3].labelPlain}
          error={errors.phone}
          errorId={errorId('phone')}
        >
          <input
            id={fieldId('phone')}
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set('phone')(e.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy('phone')}
            className={inputClass(Boolean(errors.phone))}
          />
        </Field>
      </div>

      <div className="mt-6">
        <Field
          id={fieldId('service_interest')}
          label={contact.form.fields[4].labelPlain}
          error={errors.service_interest}
          errorId={errorId('service_interest')}
        >
          <select
            id={fieldId('service_interest')}
            name="service_interest"
            value={values.service_interest}
            onChange={(e) => set('service_interest')(e.target.value)}
            aria-describedby={describedBy('service_interest')}
            className={inputClass(false)}
          >
            <option value="">{contact.form.fields[4].placeholder}</option>
            {contact.form.fields[4].options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/*
        §9: visible, non-dismissible PHI notice ABOVE the message field.
        Wired to the textarea via aria-describedby so it is announced as part
        of the field, not skipped past as decoration.
      */}
      <div className="mt-8 border-l-2 border-[color:var(--amber)] bg-[color:var(--amber)]/5 p-4">
        <p id={hintId('message')} className="text-[15px] text-[color:var(--ink-primary)]">
          {contact.form.phiNotice}
        </p>
      </div>

      <div className="mt-4">
        <Field
          id={fieldId('message')}
          label={contact.form.fields[5].labelPlain}
          required
          error={errors.message}
          errorId={errorId('message')}
        >
          <textarea
            id={fieldId('message')}
            name="message"
            rows={6}
            required
            maxLength={MESSAGE_MAX}
            value={values.message}
            onChange={(e) => set('message')(e.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describedBy('message', true)}
            className={inputClass(Boolean(errors.message))}
          />
        </Field>
      </div>

      {/*
        Honeypot. aria-hidden + tabIndex -1 + autoComplete off so that no
        human and no screen reader ever reaches it. Not display:none, because
        some bots skip hidden inputs.
      */}
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
      >
        <label htmlFor={fieldId('website')}>Website</label>
        <input
          id={fieldId('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => set('website')(e.target.value)}
        />
      </div>

      {formError && (
        <div
          role="alert"
          className="mt-6 border border-[color:var(--rose)]/50 bg-[color:var(--rose)]/10 p-4"
        >
          <p className="text-[15px] text-[color:var(--ink-primary)]">{formError}</p>
          {/*
            §9: never let a lead vanish into a generic failure. Surface the
            direct email so the person can still reach PRISM.
          */}
          <p className="mt-2 text-[15px] text-[color:var(--ink-muted)]">
            {ui.formFallbackLead}{' '}
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
            .
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-end border-t border-white/10 pt-6">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex h-11 items-center rounded-md bg-[color:var(--ink-primary)] px-6 font-medium text-[color:var(--void)] transition-colors hover:bg-white disabled:opacity-60"
        >
          {status === 'submitting' ? contact.form.submittingLabel : contact.form.submitLabel}
        </button>
      </div>
    </form>
  );
}

function inputClass(invalid: boolean): string {
  return [
    'mt-2 w-full rounded-md border bg-[color:var(--void)] px-3 py-2.5 text-[15px]',
    'text-[color:var(--ink-primary)] placeholder:text-[color:var(--ink-muted)]',
    invalid ? 'border-[color:var(--rose)]' : 'border-white/15',
  ].join(' ');
}

/**
 * The required marker is a real word, not a bare asterisk: "*" alone is
 * announced inconsistently across screen readers, and the live site's
 * "Full name *" labels rely on the visual convention only.
 */
function Field({
  id,
  label,
  required = false,
  error,
  errorId,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  errorId: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-[15px] font-medium text-[color:var(--ink-primary)]">
        {label}
        {required && (
          <span className="ml-1 text-[color:var(--ink-muted)]">{ui.requiredMarker}</span>
        )}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-label text-[color:var(--rose)]">
          {error}
        </p>
      )}
    </div>
  );
}
