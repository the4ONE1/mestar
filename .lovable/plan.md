# Switch story delivery to Lovable Emails

## The problem

Right now the story delivery email goes through Gmail SMTP (`mestar.orders@gmail.com` + app password). That's why bella's order completed the full pipeline (PDF generated, stored, ready) but you never got the email — Gmail rejected the login with "BadCredentials". Gmail app passwords are fragile: they break any time the Google password changes, 2-Step Verification is toggled, or the app is removed from security settings.

The Shopify order confirmation came through because **Shopify sends that one itself** — it doesn't touch our backend. So "matching" them literally isn't possible (they come from two different companies). But we can switch our delivery email onto Lovable's built-in email system, which is far more reliable than Gmail SMTP and is the same infrastructure used by professional SaaS products. That gets us as close to "both succeed together" as possible.

## What changes

1. **Set up a Lovable email sender domain** on `mestar.pro` (a small subdomain like `notify.mestar.pro` gets delegated for sending — your main site stays untouched).
2. **Set up the email infrastructure** (queue, retry-on-failure, suppression list — all automatic).
3. **Create one branded transactional email template** for story delivery — clean, on-brand, with the child's name, story title, and a big "Download Your Story" button linking to the PDF.
4. **Rewire `send-order-notification`** to use the new Lovable email pipeline instead of Gmail SMTP. Same trigger point (called from `create-storybook` after PDF is built) — just swap the delivery method underneath.
5. **Resend bella's story** as a one-off so you actually receive the order that's already complete in the backend.
6. **Leave the Gmail secret in place but unused** for now — we can delete `GMAIL_APP_PASSWORD` later once we've confirmed the new system works on a couple of real orders.

## What you'll see / need to do

- A one-screen popup will ask you for your sender domain. Just type `mestar.pro` and it walks you through.
- It will show you 2 short DNS records to copy-paste into your domain registrar (where you bought mestar.pro). I'll tell you exactly what to click, one step at a time. Takes ~5 minutes.
- DNS verification can take anywhere from a few minutes to up to 72 hours (usually under an hour). The story pipeline keeps working during this time — emails just queue up and start delivering the moment DNS verifies.
- Once verified, every future order automatically gets a clean branded delivery email with the PDF link.

## Why this is better than Gmail

| | Gmail SMTP (current) | Lovable Emails (proposed) |
|---|---|---|
| Breaks when password changes | Yes | No |
| Auto-retries on failure | No | Yes (5 retries) |
| Tracks bounces/spam complaints | No | Yes |
| Looks like a real business sender | No (`@gmail.com`) | Yes (`@mestar.pro`) |
| Hits inbox vs. spam | Often spam for transactional | Designed for inbox |
| Compliance-ready (unsubscribe, etc.) | No | Yes, automatic |

## SEO/business bonus

Sending from `notify@mestar.pro` (instead of a Gmail address) builds your domain's sender reputation. That means future marketing emails, password resets, and customer replies are all more likely to land in the inbox instead of spam — directly helping conversions.

## Technical details (skip if you want)

- Tools used: `email_domain--check_email_domain_status`, `email_domain--setup_email_infra`, `email_domain--scaffold_transactional_email`, then deploy.
- New template: `story-delivery.tsx` registered in the transactional templates registry.
- `send-order-notification/index.ts` swapped from `nodemailer` → `supabase.functions.invoke('send-transactional-email', ...)` with `templateName: 'story-delivery'` and `templateData: { childName, storyTitle, pdfUrl }`.
- Idempotency key: `story-delivery-${orderId}` so retries never double-send.
- Bella's order: I'll trigger `send-transactional-email` once manually after setup so you receive that PDF.
