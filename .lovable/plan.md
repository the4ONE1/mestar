
## What's going on

Your project's code was replaced with the Next.js version in a recent commit (`a0c7f22 — Replace Vite/React codebase with Next.js MESTAR application`). Lovable can't run Next.js, so the preview and hosting are effectively broken right now. Before we port SEO improvements, we need to put the working Vite/React app back.

Good news: nothing is lost — the last working Vite/React commit is still in git history (`31fc406`), and the Next.js files are also still here so I can read them for the SEO details before we discard them.

## Plan

### Step 1 — Read the Next.js SEO details worth copying
Before restoring, I'll read (not run) these Next.js files so I know exactly what to port:
- `app/layout.js` — title, description, keywords, og tags
- `components/GoogleAnalytics.jsx`, `GoogleTagManager.jsx`, `MetaPixel.jsx` — tracking snippets + env var names
- `public/sitemap.xml`, `public/robots.txt`, `middleware.js` — sitemap/robots and www redirect
- Any per-page metadata inside `app/**/page.js`

### Step 2 — Restore the Vite/React project
Roll the files back to commit `31fc406` (the last commit before the Next.js swap). This gets your Lovable preview and `mestar.pro` hosting working again exactly as they were.

### Step 3 — Port the SEO wins into the Vite/React app
Applied to the restored codebase:

1. **`index.html` head** — real title, description, keywords, canonical `https://mestar.pro/`, og:title/og:url/og:type, twitter card, Organization + WebSite JSON-LD.
2. **Per-route head** — install `react-helmet-async`, add `<HelmetProvider>` in `src/main.tsx`, then add `<Helmet>` blocks with unique title/description/canonical to each route page (home, create, faq, checkout, about, contact, privacy, terms, refund-policy — whichever exist).
3. **Sitemap generator** — `scripts/generate-sitemap.ts` writing `public/sitemap.xml` from the actual routes in `src/App.tsx`, wired via `predev`/`prebuild` in `package.json`, `BASE_URL = https://mestar.pro`.
4. **`public/robots.txt`** — `User-agent: * / Allow: /` plus `Sitemap: https://mestar.pro/sitemap.xml`.
5. **Analytics + pixels** — port the GA4, GTM, and Meta Pixel snippets into small React components that read `VITE_GA_ID`, `VITE_GTM_ID`, `VITE_META_PIXEL_ID`. I'll ask you for those IDs (or we can skip any you don't have — the components no-op when the ID is missing). Nothing renders until real IDs are set, so no fake pixel fires.
6. **www → apex redirect** — the Next.js `middleware.js` redirected `www.mystarstories.app` → `mystarstories.app`. Lovable's custom-domain UI handles www→apex for `mestar.pro` at the hosting layer, so no code change; I'll confirm the setting is on after we're back on Vite.
7. **Semantic HTML + alt text pass** — quick sweep on landing components to ensure a single `<h1>`, descriptive alt on hero/theme images, and lazy loading on below-the-fold images.

### Step 4 — Verify
- Load the preview to confirm the site is back.
- View page source on `/`, `/create`, `/faq` and confirm the new title/description/canonical are present.
- Fetch `/sitemap.xml` and `/robots.txt` in the browser.
- Run the built-in SEO scan and mark fixed findings.

## What I'll ask you next (only after you approve this plan)
- Do you have a **GA4 measurement ID** (`G-XXXX…`), a **GTM container ID** (`GTM-XXXX…`), and a **Meta Pixel ID**? Any you don't have, we skip.
- Confirm the tagline/description you want for the homepage title + meta description (I'll suggest one based on the Next.js version if you'd rather not write it).

## What this does NOT change
- No backend/database changes.
- No Shopify changes.
- No design changes beyond adding metadata and semantic tweaks.
- The Next.js repo stays on GitHub untouched — this only affects the Lovable copy.
