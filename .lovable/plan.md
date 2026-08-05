# Supporting Character Flow and Story Rules

## Goal
Make the Supporting Character add-on human-only, collect the second character’s name immediately after their photo, and limit their role to one brief but meaningful helping moment while the child remains the hero.

## Changes

1. **Change the personalization order**
   - Show **Upload their photo** first.
   - After a valid photo is uploaded, reveal a required **First name** field directly beneath it.
   - Keep the add-on unavailable for checkout until both the photo and name are present.
   - Update the guidance so customers understand the second photo must be a sibling, friend, parent, or other person.

2. **Remove pets from the Supporting Character offer**
   - Remove “pet,” animal examples, and pet-specific FAQs from the Preview page, product details, cart offer, supporting-character product page, and local product description.
   - Replace them with clear human-only wording such as “sibling, friend, parent, or loved one.”
   - Add front-end photo guidance stating that animal photos are not accepted for this add-on.

3. **Restrict the supporting character’s story role**
   - Remove animal/pet behavior from the story-generation rules.
   - Require the supplied first name to be used exactly as entered, with no invented or altered names.
   - Require the supporting character to appear in only one brief scene or moment.
   - In that moment, they provide a clue, encouragement, guidance, or a small helpful action that helps the main character find the solution.
   - The main character still understands the clue, makes the final decision, performs the resolving action, and receives the credit.

4. **Lock the supporting character’s image to the uploaded photo**
   - Use the original second uploaded photo as the reference every time the supporting character is rendered.
   - Never use an earlier generated illustration as the reference for a later image.
   - Limit the supporting character to the same single helping scene in illustration and coloring-page prompts; all other scenes feature only the main character.
   - Remove the existing supporting-character-only page so the helper is not over-featured.

5. **Verify the complete flow**
   - Confirm the mobile flow is: select add-on → upload human photo → enter name → continue to checkout.
   - Confirm pet wording is gone from every customer-facing Supporting Character offer.
   - Run a focused generation test and verify the second person appears only briefly, matches the uploaded photo, helps the hero find the solution, and does not solve the problem for them.

## Technical details
- Update the Preview form state/render order and Supporting Character copy across the relevant frontend pages and cart.
- Tighten the Layer 1 supporting-character prompt and fallback-story behavior.
- Update page-reference selection in storybook image generation so only the designated helping scene receives both original photo references.
- Preserve the existing $9.99 Supporting Character price and payment behavior.