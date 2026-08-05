How It Works Page

Goal: Add a dedicated "How It Works" page that explains the 4-step process in plain language, is crawlable by Google, and is a clean landing page for Google Ads.

The URL to use in Google Ads (after this is published):

https://mystarstories.app/how-it-works

What the page will contain:
- Headline explaining that you get a personalized digital storybook in minutes.
- Four numbered steps: 1) Upload your child's photo, 2) Pick their name, age and theme, 3) We create the story and illustrations, 4) Download the PDF instantly (coloring pages included).
- Short note about the optional add-ons (supporting character, bonus coloring book) with current prices pulled from the existing product config.
- Clear statement that it's a digital PDF download — no shipping, no waiting.
- A "Create Their Story" call-to-action button going to the personalization funnel.
- FAQ-style short answers about delivery time and what's included, marked up so Google can show them as rich results.

SEO setup:
- Title, meta description, and canonical URL via the existing SEO component.
- HowTo + FAQPage structured data so Google understands the steps.
- Page added to the prerender list so crawlers see full HTML instantly (not a blank page).
- Page added to the sitemap and linked from the site navigation and footer so Google finds it.

Technical notes:
- New file: src/pages/HowItWorks.tsx
- Route /how-it-works registered in src/App.tsx and src/entry-server.tsx
- Added to the ROUTES array in scripts/prerender.mjs, to public/sitemap.xml, and to public/llms.txt
- Nav link in src/components/Navbar.tsx and footer link in src/components/Footer.tsx
- No backend, database, payment, or generation changes. No tests run, no content generated, no credits spent beyond building the page.

Note: the Ads URL above only works after the site is published. Say the word and I'll publish it once the page is built.
