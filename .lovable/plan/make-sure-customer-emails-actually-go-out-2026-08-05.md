# Make sure customer emails actually go out

Goal: every future customer gets their story email. Past orders are ignored (they were your own tests).

## Where things stand (already verified)

- The email queue was jammed and is now unjammed — it drained to empty and is sending again.
- Your own alert email delivered successfully through your verified sender.
- The text-message leg bounced (the carrier rejected the email-to-text address). This affects only alerts to you, not customers.

## What this plan does — one change, nothing else

**Add a safety net so an email jam can never go unnoticed again.** The monitor already runs every 10 minutes. Add one check to it: if any email has been sitting unsent for more than 10 minutes, it emails you. Right now nothing watches the email queue, so a jam is completely silent — that is how the last one went unnoticed.

Sending itself is already working again, so this is purely the early-warning piece.

## Deliberately not doing (to save credits)

- No test purchase or test send — the queue already drained and delivered successfully, which is the same proof.
- No repairs to past orders.
- No changes to the story engine or checkout.
- Not fixing the bounced text alerts. Phone alerts need a paid SMS service; email alerts work now.

## Cost

One edit to one file, one deploy, no test runs. This should land well under your 2-credit limit. If anything unexpected turns up, I stop and tell you instead of spending more.

## Technical notes

Extend `order-health-check` (mode=failures) with a query against `email_send_log` for rows still `pending` older than 10 minutes plus any `dlq` rows, routed through the existing owner-alert path. Deploy that one function. No other calls.
