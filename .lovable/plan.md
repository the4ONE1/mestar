## Recommendation on the image model

You said "AWS-3" but I want to be honest — there is no image model called that. The three real options I could map it to:

1. **Stable Diffusion 3 via AWS Bedrock** — requires you to open an AWS account, request Bedrock model access, and manage a second API key. Extra bill, extra setup, no character-consistency advantage for kids' books.
2. **Amazon Nova Canvas** — same AWS friction, weaker at stylized children's illustration.
3. **Google Gemini 3 Pro Image (a.k.a. "Nano Banana Pro")** — **my recommendation.** It's already available through Lovable's built-in AI Gateway (no extra account, no extra key), it's currently the top-rated model for character consistency across multiple illustrations (critical so the child looks like the same kid on every page), and billing rolls into your existing Lovable credits.

Going with **Gemini 3 Pro Image** unless you tell me otherwise.

## What changes

### 1. Story generation → `google/gemini-2.5-flash`
File: `supabase/functions/generate-story/index.ts`
- Swap the current chat model call to `google/gemini-2.5-flash` through the Lovable AI Gateway.
- Keep the existing prompt, age-group logic, supporting-character rules, and JSON structure — only the model id and request shape change.
- Keep the existing retry/rate-limit handler (`callChatWithRetry`).

### 2. Illustrations + coloring pages → `google/gemini-3-pro-image`
File: `supabase/functions/create-storybook/index.ts`
- Replace the current image-generation call with the Gateway `/v1/images/generations` endpoint using the Gemini chat-shape body (`messages` + `modalities: ["image","text"]`).
- Apply to **both** the story illustrations (one per scene) and the scene-derived coloring pages. Same model, different prompts (coloring pages get the "black-and-white line art, no shading" instruction already in the code).
- Keep the age-based coloring-page count logic already in place.
- Keep the retry-on-failure loop already in place.

### 3. Confirm the webhook pipeline (no code change, just verification)
Already correct — documenting so you know:
- `stripe-webhook` → `generate-story` → `create-storybook`
- `create-storybook` internally generates: **illustrations → coloring pages → audiobook** (audiobook only if that add-on was purchased).
- One paid checkout fires the entire pipeline. No extra wiring needed.

### 4. Nothing else touched
- No Stripe changes.
- No UI changes.
- No database changes.
- Audiobook stays on ElevenLabs (that's a separate voice model, not an image/text one).

## How you'll test after I build it

1. Go to `/admin/payments` → click **Run Sandbox Test Checkout**.
2. Use test card `4242 4242 4242 4242`, any future date, any CVC.
3. Within ~60 seconds the order status should move: `pending_payment` → `generating_story` → `generating_images` → `complete`.
4. Open the library link for that order — you should see: story text, a same-looking child on every illustration, and the scene-matched coloring pages.

## Technical notes (for my own reference)

- Gemini 2.5 Flash uses `/v1/chat/completions` with standard `messages`; existing JSON-output prompt stays.
- Gemini 3 Pro Image uses `/v1/images/generations` with `messages` + `modalities: ["image","text"]`, `stream: false` (server-side, no UI streaming needed), returns `data[0].b64_json`.
- All calls stay server-side in edge functions using `LOVABLE_API_KEY` — no client exposure.
