# Make sure customer emails actually go out

Goal: every future customer gets their story email. Past orders are ignored (they were your own tests).

## Where things stand (already verified)

- The email queue was jammed and is now unjammed — it drained to empty and is sending again.
- Your own alert email delivered successfully through your verified sender.
- The text-message leg bounced (the carrier rejected the email-to-text address). This affects only alerts to you, not customers.

## What this plan does

One small, cheap change plus one check.

1. **A safety net so a jam can never go unnoticed again.** Add a check to the monitor that already runs every 10 minutes: if any email has been sitting unsent for more than 10 minutes, email you. Today nothing watches the email queue itself, so a jam is silent.

2. **One live confirmation.** Send a single real story-delivery email to your inbox and confirm it arrives, so we know the customer path works end to end.

That is it. No changes to the story engine, checkout, or past orders.

## Deliberately not doing

- Not repairing or re-sending any past order.
- Not fixing the bounced text messages. If you want phone alerts later, the reliable route is a real SMS service, which costs a little money. Email alerts work now, so this is optional.

## Technical notes

- Extend `order-health-check` (mode=failures) with a query against `email_send_log` for rows still `pending` older than 10 minutes, plus any `dlq` rows, and route them through the existing owner-alert path.
- Deploy that one function, then trigger one `send-transactional-email` call to your address to confirm delivery.
