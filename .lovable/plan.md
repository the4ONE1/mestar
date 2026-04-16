

The user has approved the previous plan and refined the pricing structure. Let me restate the final plan with the new pricing and confirm the build approach.

## Final Pricing Structure

| Tier / Add-on | Price |
|---|---|
| **Base story** (text + 5 illustrations, PDF) | $9.99 |
| **+ Coloring pages** (5 B&W pages) | +$4.99 |
| **+ Supporting character** (sibling/friend/pet) | +$4.99 |
| **+ Full interactive audiobook** (page-flip reader, narration, word highlighting, sound-it-out) | +$19.99 |
| **🌟 Everything Bundle** (story + illustrations + coloring + 1 character + audiobook) | $29.99 (saves ~$10) |

## What Gets Built (4 phases)

**Phase 1 — Illustrations Engine**
- Add Layer 3 (`ILLUSTRATION_ENGINE`) to `generate-story` for full-color whimsical scene art prompts
- Update `create-storybook` to generate 5 color illustrations and embed them above story text in the PDF
- Add `illustration_prompts` column to `storybook_orders`

**Phase 2 — Pricing Tiers & Add-on Logic**
- Replace Shopify product fetching in `ProductDetail.tsx` with local product config + checkbox add-ons + bundle option
- Cart store tracks `selected_addons` per item
- `generate-story` and `create-storybook` conditionally skip layers based on add-ons
- Add `selected_addons` (JSONB) column to `storybook_orders`

**Phase 3 — Interactive Audiobook Reader** (only for audiobook/bundle buyers)
- New page `src/pages/StoryReader.tsx` at route `/read/:orderId`
- Real page-flip animation (swipe left/right on mobile, click on desktop)
- ElevenLabs narration with karaoke-style word highlighting synced to audio
- Tap-any-word → "sound-it-out" mode (slow phonetic playback)
- New edge functions: `narrate-story` (TTS + word timestamps), `sound-it-out` (single word slow playback)
- New table `storybook_audio` (audio file paths + word timing JSON per page)
- Requires **ElevenLabs API key** (free tier available — I'll walk you through getting one)

**Phase 4 — Site Integration**
- Update `StoryPreview` carousel with real illustrated samples
- Update `OrderComplete` to show "📖 Read Your Story" button (when audiobook purchased) alongside PDF download
- Add `/read/:orderId` route in `App.tsx`
- Update "How It Works" to mention audiobook option

## Build Order
1. Illustrations engine + PDF integration
2. Pricing tiers UI + conditional generation logic
3. Database migrations (add columns + audio table)
4. Page-flip reader UI (without audio first, so you can see it work)
5. ElevenLabs narration + word highlighting (after you add the API key)
6. Sound-it-out feature
7. Homepage + OrderComplete updates

## What I'll Need From You Mid-Build
- An **ElevenLabs API key** when we hit Phase 3 audio (I'll show you exactly where to get one — takes 2 minutes, free to start)

Pricing looks reasonable — the $29.99 bundle gives a clear ~$10 discount vs buying everything à la carte ($39.96), which is a strong upsell anchor.

