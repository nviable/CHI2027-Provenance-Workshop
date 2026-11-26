import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { z } from 'zod';

// Opt out of static prerendering so this endpoint runs dynamically on Cloudflare Workers.
export const prerender = false;

const contactPayloadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Please provide a valid email address').max(180),
  affiliation: z.string().trim().max(160).optional().default(''),
  topic: z.string().trim().min(1).max(120).optional().default('General inquiry'),
  subject: z.string().trim().max(180).optional().default(''),
  message: z.string().trim().min(5, 'Message is too short').max(5000),
  website: z.string().optional().default(''), // Honeypot field
});

interface WorkerContactEnv {
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_RECIPIENTS?: string;
  CONTACT_SUBJECT_PREFIX?: string;
  CONTACT_WEBHOOK_URL?: string;
  CONTACT_DRY_RUN?: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function parseRecipients(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;\n]+/)
    .map((email) => email.trim())
    .filter((email) => email.includes('@'));
}

export const POST: APIRoute = async ({ request }) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON request body.' }, 400);
  }

  const parsed = contactPayloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? 'Invalid form submission.';
    return jsonResponse({ ok: false, error: firstIssue }, 400);
  }

  const data = parsed.data;

  // Silently accept honeypot-triggered bot submissions without forwarding email.
  if (data.website.trim().length > 0) {
    return jsonResponse({
      ok: true,
      message: 'Thank you! Your message has been received.',
    });
  }

  const runtimeEnv = env as unknown as WorkerContactEnv;
  const subjectPrefix = runtimeEnv.CONTACT_SUBJECT_PREFIX || '[CHI 2027 Provenance Workshop]';
  const emailSubject = `${subjectPrefix} ${data.topic}${data.subject ? ` — ${data.subject}` : ''}`;

  const plainTextBody = [
    `New workshop contact form message`,
    `==================================`,
    `From:        ${data.name} <${data.email}>`,
    `Affiliation: ${data.affiliation || 'Not provided'}`,
    `Topic:       ${data.topic}`,
    `Subject:     ${data.subject || '(none)'}`,
    ``,
    `Message:`,
    data.message,
  ].join('\n');

  const recipients = parseRecipients(runtimeEnv.CONTACT_RECIPIENTS);
  const hasResend = Boolean(runtimeEnv.RESEND_API_KEY && runtimeEnv.CONTACT_FROM_EMAIL && recipients.length > 0);
  const hasWebhook = Boolean(runtimeEnv.CONTACT_WEBHOOK_URL);
  const dryRun = runtimeEnv.CONTACT_DRY_RUN === 'true';

  if (!hasResend && !hasWebhook) {
    if (dryRun) {
      console.log('[contact dry-run]', {
        subject: emailSubject,
        from: `${data.name} <${data.email}>`,
        affiliation: data.affiliation,
        messageLength: data.message.length,
      });
      return jsonResponse({
        ok: true,
        dryRun: true,
        message: 'Dry-run succeeded! Message logged to the Worker console.',
      });
    }

    return jsonResponse(
      {
        ok: false,
        error:
          'Contact forwarding is not configured yet on this Worker. Please email the lead organizer directly.',
      },
      503,
    );
  }

  const deliveryErrors: string[] = [];

  if (hasResend) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${runtimeEnv.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: runtimeEnv.CONTACT_FROM_EMAIL,
          to: recipients,
          reply_to: data.email,
          subject: emailSubject,
          text: plainTextBody,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text().catch(() => '');
        console.error('Resend API error:', resendRes.status, errText);
        deliveryErrors.push('email');
      }
    } catch (err) {
      console.error('Resend fetch failed:', err);
      deliveryErrors.push('email');
    }
  }

  if (hasWebhook && runtimeEnv.CONTACT_WEBHOOK_URL) {
    try {
      const webhookRes = await fetch(runtimeEnv.CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${emailSubject}\nFrom: ${data.name} (${data.email}${data.affiliation ? `, ${data.affiliation}` : ''})\n\n${data.message}`,
          payload: {
            name: data.name,
            email: data.email,
            affiliation: data.affiliation,
            topic: data.topic,
            subject: data.subject,
            message: data.message,
          },
        }),
      });
      if (!webhookRes.ok) {
        console.error('Webhook delivery error:', webhookRes.status);
        deliveryErrors.push('webhook');
      }
    } catch (err) {
      console.error('Webhook fetch failed:', err);
      deliveryErrors.push('webhook');
    }
  }

  const attemptedCount = (hasResend ? 1 : 0) + (hasWebhook ? 1 : 0);
  if (deliveryErrors.length >= attemptedCount) {
    return jsonResponse(
      {
        ok: false,
        error:
          'We encountered a temporary error forwarding your message. Please email the lead organizer directly.',
      },
      502,
    );
  }

  return jsonResponse({
    ok: true,
    message:
      'Thank you! Your message has been forwarded to the workshop organizing committee.',
  });
};

export const GET: APIRoute = async () =>
  jsonResponse({
    ok: true,
    endpoint: '/api/contact',
    methods: ['POST'],
  });
