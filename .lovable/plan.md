

## Plan: Make "Surprise Me" a true one-click order

### What it does today
Clicking **Surprise Me** randomizes Gender, Age, Theme, Strength and turns on the Everything Bundle — but the user still has to type a **name**, an **email**, and **upload a photo** before "Add to Cart" unlocks. That's not really "skip the personalization."

### What you want
One click → everything filled → Add to Cart immediately enabled, using a default kid (Leo, the boy from the promo commercial / sample storybook) so the system generates a generic story without the customer providing anything.

### Changes (one file: `src/pages/ProductDetail.tsx`)

The `surpriseMe()` function will be expanded to also set:

1. **Child's name** → randomly picked from a small pool of friendly default names (Leo, Mia, Sam, Ava, Max, Zoe). Leo is weighted as default since he's the boy featured in the promo video and sample pages.
2. **Child's photo** → auto-loaded from the existing sample storybook image (`/images/sample-page-1.jpg`, which is Leo from the commercial). It will be fetched, converted to a data URL, and dropped into `photoPreview` + `photoFile` exactly like a real upload — so all downstream logic (cart, story generation, image generation) treats it as a normal photo with no special branching.
3. **Customer email** → left BLANK on purpose, with a small helper note appearing under the Surprise Me button: *"Just add your email to receive the PDF →"*. Reason: we cannot guess the customer's email, and orders/PDF delivery require a real one. Everything else is auto-filled so this is the only field they touch.
4. **Toast copy update** → "Surprise picks loaded — just add your email and you're set!"

### Why keep email manual
The order webhook, Shopify checkout, and PDF email delivery all require a valid customer email — auto-filling a fake one would break order completion and PDF delivery. One field is the minimum viable "skip personalization" experience.

### Result
Click **Surprise Me** → name, gender, age, theme, strength, photo, and bundle are all set. Type email → click **Add to Cart**. Two interactions instead of seven. The story engine receives a complete payload and generates a generic Leo-style adventure using the commercial boy's photo.

### What I will NOT touch
- The story-generation edge function (it already handles whatever inputs it gets)
- Cart, checkout, Shopify, or webhook logic
- Layout, copy elsewhere, or the form fields themselves
- The Surprise Me button styling

