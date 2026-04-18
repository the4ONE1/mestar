

The user wants to securely paste the Shopify webhook signing secret without exposing it in chat. The right approach is to trigger the secure secret-storage popup so they can paste it into a hidden input field rather than typing it into the chat.

## Plan: Securely store the Shopify webhook secret

When you approve this plan, a secure popup will appear in your chat with a password-style input field. You paste the `shpss_...` secret there, click Approve, and it gets stored encrypted — never visible in chat history, never visible in the codebase, never visible to me.

### What happens when you approve

1. A popup titled **"Add secret: SHOPIFY_WEBHOOK_SECRET"** appears
2. It has a hidden password field (dots, not letters)
3. You paste the secret → click **Approve**
4. Secret is stored encrypted in Lovable Cloud, accessible only to your edge functions

### What I build immediately after

Once the secret is stored, I'll build the full webhook pipeline in one go:

1. **`shopify-order-webhook` edge function** — receives Shopify's `orders/paid` event, verifies the signature using your secret, then triggers story generation server-side
2. **`CartDrawer` update** — saves a "pending" order row to the database before sending the customer to Shopify checkout, attaches the order ID as a Shopify cart attribute so the webhook can match payment back to the personalization details
3. **`create-storybook` update** — reuses the pending order row instead of creating a new one, so everything stays linked
4. **`send-order-notification` update** — emails the PDF link to BOTH you (admin) AND the customer who paid
5. **`/order-complete` page rewrite** — polls the database for the order, shows progress ("Creating illustrations...", "Assembling PDF..."), then auto-opens the PDF in a new tab when ready

### End result for your customer

```text
1. Customer fills personalization form → clicks Add to Cart
2. Clicks Checkout → goes to Shopify, pays
3. Shopify redirects to /order-complete
4. Page shows live progress for ~60 seconds
5. PDF auto-opens + email arrives in their inbox
6. You also get the admin notification email
```

### What you need to do

Just click **Approve** on the popup that appears after this plan. Then paste the `shpss_...` secret into the password field and click Approve again.

