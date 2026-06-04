## Fix: Sticky Mobile Bar Direction Text

**Problem:** On the Product Detail page, the sticky mobile add-to-cart bar at the bottom displays "Personalize below ↓" when the form is incomplete. However, the personalization input fields (name, photo, gender, age, theme, email) are actually **above** the sticky bar in the page scroll — the arrow points the wrong way.

**Fix:** Change the button text in the sticky mobile bar from:
- `"Personalize below ↓"` → `"Personalize above ↑"`

**File to edit:** `src/pages/ProductDetail.tsx` (line 583)

**No other changes needed.**