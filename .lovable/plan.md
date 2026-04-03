

# Plan: Email PDF to mestar.orders@gmail.com After Generation

## What We're Doing

After the storybook PDF is generated and uploaded to storage, we'll send an email notification to **mestar.orders@gmail.com** containing the PDF download link plus customer/order details. This way you can manually forward the PDF to the customer until your email domain DNS is verified.

## How It Works

We'll add a simple email-sending step to the `create-storybook` edge function using the Lovable AI gateway (no external email service needed — we'll use a lightweight approach via a new small edge function that sends via SMTP/Gmail, or more practically, we'll use **Lovable's built-in email infrastructure**).

**However**, since DNS isn't verified yet, Lovable's email system won't send. The simplest interim approach:

### Approach: Store order details so you can see them + use a Gmail SMTP relay

Since we can't use Lovable email yet, the most reliable interim solution is:

1. **Add a `send-order-notification` edge function** that sends an email to `mestar.orders@gmail.com` via Gmail SMTP (using a Gmail App Password)
2. The email includes: customer name, child's name, age, theme, and the **PDF download link**
3. This gets called automatically after the PDF is uploaded in `create-storybook`

### What's Needed From You

To send emails from the edge function to your Gmail, you'll need to create a **Gmail App Password** (a special password just for this, not your regular Gmail password). I'll walk you through it step by step.

### Files Changed

1. **`supabase/functions/send-order-notification/index.ts`** (new) — Small edge function that sends an email to `mestar.orders@gmail.com` with order details + PDF link
2. **`supabase/functions/create-storybook/index.ts`** — Add a call to `send-order-notification` after the PDF is uploaded, passing order details and the PDF URL

### What the Email Will Include

- Subject: "New MESTAR Order — [Child's Name]'s Storybook Ready"
- Body: Customer email, child's name, age, theme, strength, PDF download link
- Sent to: mestar.orders@gmail.com

### Secret Needed

- `GMAIL_APP_PASSWORD` — A Gmail App Password you'll generate from your Google account settings

