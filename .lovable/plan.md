## Switch to Stripe — step-by-step

### What I do (you just approve)

**1. Rescue order #1014 (Jacob)**

- Pull his order from Shopify via API
- Create his database row
- Run story pipeline → PDF → email
- Status: done in ~3 min

**2. Enable Stripe payments**

- Run Lovable's built-in Stripe (test mode active immediately, no account needed yet)
- Creates `create-checkout` and `verify-payment` edge functions automatically

**3. Create your product in Stripe**

- One product: "Personalized Storybook" — $19.99 (you confirm price)
- Add-ons as separate line items if you want them priced separately

**4. Rewire the checkout flow**

- Personalization form → "Pay & Generate" button → Stripe Checkout (hosted page) → redirects back to `/order-complete?session_id=xxx`
- `verify-payment` confirms payment → triggers existing `generate-story` → `create-storybook` → `send-order-notification` (already works)
- Order row created BEFORE payment with `pending_payment` status (already exists in your DB)

**5. Rip out Shopify**

- Delete `shopify-order-webhook` edge function
- Delete `src/lib/shopify.ts`
- Delete `CartDrawer.tsx` and cart sync logic
- Update `Navbar` (remove cart icon)
- Update `ProductDetail.tsx` to use new Stripe flow
- Remove Shopify secrets

**6. Test in test mode**

- I run a fake card (`4242 4242 4242 4242`) end-to-end
- Confirm: payment → row created → story generated → PDF in inbox
- Show you the receipt + PDF before going live

### What you do (3 things only)

**A. Approve this plan** → I execute steps 1–6

**B. After step 6 passes test**: claim Stripe live mode

- I'll show you a single "Activate Stripe" button in your app
- 5–10 min: business name, address, bank account for payouts
- Stripe verifies → live payments on

**C. Place one $1 real test order** to confirm live mode works → refund yourself

### After it's live → marketing focus

I stop here. Once Stripe is working, next conversation we tackle marketing:

- Email capture on landing page
- Stripe Payment Links for Instagram/Tik-Tok bio
- Simple analytics (visitors → buyers funnel)
- Abandoned form recovery email

### Order of operations

```text
Step 1  → Rescue Jacob (3 min)
Step 2  → Enable Stripe (1 min)
Step 3  → Create product (2 min)
Step 4  → Build new checkout flow (10 min)
Step 5  → Remove Shopify (5 min)
Step 6  → Test mode end-to-end test (5 min)
─── you claim Stripe live (5–10 min) ───
Step 7  → Your $1 live test
Step 8  → Marketing setup (next session)
```

**Total my-side work: ~30 min. Your work: approve, claim Stripe, place 1 test order.**

Reply "go" and I start with step 1.