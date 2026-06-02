
# Audiobook Edition v1 — Karaoke Read-Along

A brand-new product line that turns each personalized MESTAR story into an **interactive audiobook**: a professional AI narrator reads aloud while each word glows in sync — designed to help kids learn to read on iPads, tablets, and Kindle Fire. Customer also gets a clean MP3 download with step-by-step instructions for loading onto Yoto or Tonies devices.

---

## What the customer experiences

1. On the homepage they see **two products side-by-side**:
   - The classic **Personalized Storybook PDF** (existing)
   - The new **Audiobook Edition** (PDF + interactive read-along + MP3 download)
2. On the Audiobook product page they fill in the same personalization form, *plus* pick a **narrator voice** (4 options: warm female US, warm male US, gentle British female, friendly British male — using top ElevenLabs voices).
3. After checkout, the story is generated, illustrated, **and narrated** with word-level timestamps.
4. They receive an email with a link to their private "Reader" page where:
   - The illustration fills the top of the screen
   - The story text appears below
   - Tap ▶ Play — narrator reads aloud, each word glows gold the instant it's spoken
   - Tap any word to jump there, or replay a sentence
   - Big touch targets, large legible font (sized for iPad/Kindle Fire/tablet first)
5. Bonus tab: **"Listen Anywhere"** — download MP3 + visual step-by-step guides for loading onto a Yoto Make-Your-Own card or a Creative Tonie.

---

## What I'll build

### 1. Backend (edge function: `generate-audiobook`)
- After story PDF is generated, call ElevenLabs `text-to-speech-with-timestamps` endpoint per page
- Returns audio (MP3) + character-level timestamps which we convert to word timings
- Store MP3 in `storybooks` bucket; save `audio_storage_path` + `word_timings` JSON in the existing `storybook_audio` table (already in your DB ✅)
- Concatenate all page MP3s into a single full-book MP3 for download/Yoto/Tonies

### 2. New product flow
- New product handle `audiobook-edition` (I'll scaffold the frontend; you'll create the Shopify product with your chosen price)
- Voice selection dropdown added to the personalization form (only shows on audiobook product)
- `selected_addons.audiobook = true` already exists in your schema ✅ — just wire it up

### 3. New Reader page: `/read/:orderId?token=...`
- Token-gated (signed URL emailed to customer) so non-buyers can't access
- Karaoke player component:
  - Audio element + `timeupdate` listener
  - Tokenized text → each word wrapped in a `<span>` with start/end timestamps
  - CSS glow animation on the active word (uses existing gold `--primary` token)
  - Big touch-friendly Play / Pause / Page Back / Page Forward / Replay Sentence buttons
  - Auto-scroll keeps the active word centered
  - "Slower" / "Normal" / "Faster" playback speed toggle (great for early readers)

### 4. "Listen Anywhere" tab
- Download Full Book MP3 button
- Two clear visual guides:
  - **Yoto**: Open Yoto app → My Cards → Make Your Own → Upload audio → tap the blank card
  - **Tonies**: Open my.tonies app → pick a Creative Tonie → Upload audio file
- Honest note: "Yoto and Tonies require a blank card / Creative figurine you already own — we can't ship one to you."

### 5. Order-complete & email updates
- Order-complete page shows "Your audiobook is being narrated…" while audio generates
- Story-delivery email includes the Reader link + MP3 download link

---

## What I need from you

- **One secret**: your **ElevenLabs API key** (free tier gives ~10 min of audio/month; Starter plan is $5/month and covers ~30 min — enough for a few books while you test). I'll show you exactly where to get it once you approve this plan.
- After build is live, you'll create the **"Audiobook Edition" Shopify product** (I'll tell you exact title/description/price suggestions — likely $9.99 vs $4.99 for the PDF-only, a +$5 upgrade).

---

## What this does NOT include (deliberately — v1 scope)

- ❌ Child-reads-aloud / voice listening mode (deferred to v2)
- ❌ Auto-push to Yoto/Tonies (their APIs don't allow this for resellers — customer uploads themselves)
- ❌ Parent-records-their-own-voice (could be a future $$ upgrade)

---

## Estimated cost per audiobook sold

- ElevenLabs narration: **~$0.20–0.35** per book (200-500 words × 4 voice option choice)
- Storage: negligible
- At a +$5 upsell over the PDF, **gross margin ≈ 93%**

---

## Technical details (for reference)

- Voices: `EXAVITQu4vr4xnSDxMaL` (Sarah), `JBFqnCBsd6RMkjVDRZzb` (George), `Xb7hH8MSUJpSbSDYk0k2` (Alice), `bIHbv24MWmeRgasZH58o` (Will)
- Model: `eleven_turbo_v2_5` for speed + cost; word-level alignment via `/v1/text-to-speech/{voice_id}/with-timestamps`
- New table column: add `voice_id` to `storybook_orders` (text, nullable)
- Public download token: store in `storybook_orders.audio_download_token` (uuid)
- Reader page is unauthenticated but requires matching `order_id + token` checked via edge function

---

After you approve, I'll request the ElevenLabs API key, then build it end-to-end and you'll just need to add the Shopify product.
