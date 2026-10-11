---
name: resend
description: Use when a Node.js backend uses Resend for transactional or marketing email delivery.
---

# Resend Adapter

## Purpose

Translate the framework-neutral email-delivery contract onto Resend, which provides an HTTP API for transactional email with idempotency, webhooks for delivery status, and React Email templates.

## Activate when

- Detect `resend` in dependencies.
- See `RESEND_API_KEY` in env.

## Repository inspection

1. `package.json` — `resend` version. Breaking changes between major.
2. Env — `RESEND_API_KEY`. Confirm never logged.
3. Client init — `new Resend(apiKey)`. Find the singleton.
4. Send call — `resend.emails.send({ from, to, subject, html, text, attachments, headers, tags })`.
5. Webhook — `resend.notifications.webhooks`. Find `RESEND_WEBHOOK_SECRET` and the signature verification.
6. Domain — `RESEND_FROM_DOMAIN` configured in dashboard; verify DNS records (SPF, DKIM, DMARC).

## Decision rules

| Concern | Rule |
|---|---|
| From | Use a verified domain. `onboarding@resend.dev` for dev only. |
| Idempotency | Pass `Idempotency-Key` header. Resend dedupes for 24h. Use the user action ID + scope. |
| Rate limit | Resend enforces per-domain. Bound your send queue. Backoff on 429. |
| Webhook | Verify signature with `RESEND_WEBHOOK_SECRET` and a constant-time compare. Never trust the payload without verification. |
| Bounces/complaints | Handle `email.bounced`, `email.complained`, `email.delivered` webhooks. Mark recipients as suppressed. |
| Template | Use `react-email` for templates. Render on server, pass `html` to Resend. |
| Attachments | Bound size (10MB per email, 50MB total). Stream from object storage; do not load into memory. |
| Tags | `tags: [{ name, value }]` for analytics. Low cardinality only. |
| Retry | Resend retries for 24h on soft failures. Do not retry on 4xx (validation). |
| Suppression | Resend auto-suppresses after bounce/complaint. Do not try to re-send to a suppressed address. |

## Implementation procedure

1. Detect the `resend` version. Confirm `RESEND_API_KEY` is server-only and never logged.
2. Construct the singleton client in the composition root.
3. For each send: pass `Idempotency-Key`, `from`, `to`, `subject`, `html` (rendered from `react-email` template), `tags`.
4. Register webhooks for `email.delivered`, `email.bounced`, `email.complained`. Verify signature.
5. On bounce/complaint, mark the recipient as suppressed in your DB.
6. For attachments: stream from object storage; pass `{ filename, content }` as a Buffer or Readable.

## Failure modes

- No Idempotency-Key → retry double-sends.
- Webhook signature not verified → attacker can forge delivery status.
- Send to suppressed address → 422, no email delivered, silent in app.
- Inline HTML string → broken in clients, no template versioning.
- Attachment loaded into memory → OOM on large files.
- From domain not verified → 403 in production.
- Backoff not implemented → 429 storm on bulk send.

## Verification

- Send a test email via the dev sandbox.
- Trigger a webhook with a forged signature; confirm rejection.
- Trigger `email.bounced`; confirm recipient marked suppressed.
- Send a bulk batch; confirm backoff on 429.
- Inspect `tags` in the Resend dashboard.
- Confirm DNS (SPF, DKIM, DMARC) via `dig`.
- Source references: https://resend.com/docs, https://resend.com/docs/dashboard/webhooks, https://resend.com/docs/api-reference/emails/send-email, https://react.email/, https://resend.com/docs/domains.
