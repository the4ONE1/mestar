

# Audit: Order of Operations & Consistency

After reviewing every page, here are the inconsistencies found and what needs to be fixed:

---

## Issues Found

### 1. ProductDetail still says "Beautifully illustrated" (line 333)
The About page was already fixed to remove "illustrated," but the ProductDetail features list still says **"📖 Beautifully illustrated digital PDF storybook"**. These stories are not illustrated — this needs to match.

**Fix**: Change to "📖 Personalized digital PDF storybook"

### 2. FAQ personalization description is incomplete
The FAQ says: *"upload a clear photo of your child, enter their name and age, and pick a story theme"* — but doesn't mention selecting boy/girl, which is a required step in the actual form.

**Fix**: Update to mention boy/girl selection so it matches the real form.

### 3. Supporting character has no $9.99 price shown
You said the added character costs an extra $9.99, but the OrderComplete page doesn't mention any price for the supporting character option. There's no indication it's a paid add-on.

**Fix**: Add "$9.99" price text to the supporting character section on the OrderComplete page.

### 4. Footer is missing links
The Navbar has About, FAQ, Reviews, and Why Read links, but the Footer only has About and FAQ. Should be consistent.

**Fix**: Add Reviews and Why Read links to the Footer.

### 5. "How It Works" steps are correct ✅
Homepage steps (Personalize → Place Order → Download) match the actual flow.

### 6. ProductDetail form order is correct ✅
Photo → Name → Boy/Girl → Age → Email → Theme → Strength — matches your requested order.

### 7. CTA buttons all go to product page ✅
All CTA buttons correctly link to the product detail page (photo upload / personalization start).

---

## Summary of Changes

| File | What Changes |
|------|-------------|
| `src/pages/ProductDetail.tsx` | Remove "Beautifully illustrated" from features list |
| `src/pages/FAQ.tsx` | Update personalization answer to include boy/girl step |
| `src/pages/OrderComplete.tsx` | Add $9.99 price to supporting character section |
| `src/components/Footer.tsx` | Add Reviews and Why Read links |

4 small text/link fixes across 4 files. No layout or logic changes needed.

