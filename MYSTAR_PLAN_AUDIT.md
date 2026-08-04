# Audit: "MyStar — The Master Family Platform" plan

Reviewed against what actually exists in the two connected repos:
`the4ONE1/mestar` (live at mestar.pro — Vite + React 18 + Shopify Storefront API +
Stripe (embedded) + Supabase/Deno edge functions, with a working
`pending_payment → queued → generating_story → generating_images → assembling_pdf → complete`
order pipeline and an admin payments dashboard) and `the4ONE1/mystarmvp`
(a *second*, separate implementation of the same storybook product — Next.js 15,
originally MongoDB, migrated to a different Supabase project on 2026-07-02, direct
Stripe Checkout, AWS S3 uploads — with no vault, album, print, or merch code anywhere
in it).

## Opinion

The vision is good and the customer-facing story is genuinely strong: one free vault
as the hook, two paid branches (storybook, print) as the upsell, storage as the reward
for using both. The design-system and security instincts (shared tokens, RLS scoped
per family, roles in a separate table) are correct. But the plan's central premise —
"you already have three branded apps, we're just tying them together" — doesn't match
what's actually in this account. Of the two repos in scope, *both* are competing
implementations of the storybook product on incompatible stacks, not complementary
branches. There's no vault ("MyStar Storage") or print ("MyStarSolutions") codebase
visible here to verify. Before committing to Stage 0 (a brand-new Supabase project)
this needs an honest asset inventory and a migration plan for the *existing* live
Stripe/Shopify order pipeline in `mestar` — otherwise "connect three apps" quietly
becomes "rebuild three apps," which is a much bigger and riskier project than the plan
presents.

## Strong points

- **The tree metaphor is a real growth mechanic, not just marketing copy.** Free vault
  as the lead magnet, storage upgrades gated behind using *both* paid branches,
  rewards exactly the cross-sell behavior that increases lifetime value.
- **Design-token discipline.** Reusing the same navy/gold/cream oklch values and
  banning hardcoded colors across sub-apps sets up one real shared design system
  instead of three reskins.
- **Blur-and-lock over hide.** Showing gated features "visible but blurred with a
  gold lock" is a proven SaaS conversion pattern — the catalog sells itself.
- **Correct Supabase security instincts.** RLS on every table scoped by family, and
  roles kept in a separate `user_roles` table rather than on `profiles`, specifically
  avoids the classic privilege-escalation mistake with Supabase RLS. Entitlements
  are (correctly) specified as server-side-only checks.
- **Exit-safety section is unusually mature** for this kind of plan: plain SQL
  migrations only, one internal data-access layer, swappable storage/auth adapters,
  nightly backups, one-click export. Treats vendor lock-in as a first-class design
  constraint instead of an afterthought.
- **Owner keeps their own Supabase account/billing** rather than routing through a
  managed cloud — the right call for a real business with paying customers.
- **Sensible macro-sequencing**: entitlements/UI (Stages 1-4) before real payments
  and fulfillment (Stage 5) — don't wire live money movement until the paywall and
  catalog are real.

## Downfalls and recommended fixes

- **Unverified "three existing apps" premise.** Of the two repos actually connected
  here, both are storybook implementations (`mestar`: Vite/Shopify/Supabase, live in
  production; `mystarmvp`: Next.js/Mongo→Supabase/S3), not complementary vault +
  storybook + print branches. Grepping `mystarmvp` for vault/album/print/merch terms
  turns up nothing but an unrelated shadcn calendar component.
  **Fix:** before Stage 0, do a real inventory — confirm the vault and print
  codebases exist, what stack/state they're in, and produce an explicit plan for
  reconciling the two *existing* storybook builds (which one is canonical, which one
  is retired) instead of treating all three as settled, connectable branches.

- **A fourth stack, not a unification.** The plan proposes TanStack Start (React 19)
  for the new master app, on top of Vite+Shopify (`mestar`) and Next.js+Mongo/Supabase
  (`mystarmvp`). That's stack proliferation, not consolidation.
  **Fix:** pick one frontend stack for the long-lived master app and fold branches in
  as routes/modules of it. Given `mestar` is already live at mestar.pro with a working
  Stripe/Supabase/edge-function order pipeline and an admin dashboard, seriously weigh
  extending it over a from-scratch rewrite.

- **New Supabase project abandons a live production backend with no migration plan.**
  `mestar`'s current Supabase project has real orders, Stripe webhooks, and an admin
  payments dashboard (`payment_events`, `storybook_orders` state machine) in
  production today. The plan's Stage 0 creates a brand-new "MyStar Master" project
  with no mention of migrating or dual-writing this data.
  **Fix:** add an explicit cutover plan (freeze/migrate/verify, or dual-write during
  transition) before touching the existing Supabase project, and decide whether the
  new project *replaces* it or federates with it.

- **Shopify's role is dropped without discussion.** `mestar`'s cart/checkout today
  goes through the Shopify Storefront API (`cartStore.ts`, `lib/shopify.ts`); the new
  plan describes membership/entitlements/checkout purely via Supabase + Stripe.
  **Fix:** explicitly decide whether Shopify stays (arguably a better fit for
  print/merch fulfillment specifically) or is dropped, and document how storybook
  checkout interoperates with the new entitlement paywall either way.

- **No estimates, no acceptance criteria.** "Build 1 delivers Stages 1–4" has no
  time/cost per stage, and an investor-pitch page is embedded inside what's otherwise
  a technical architecture doc.
  **Fix:** break each stage into demo-able milestones with a rough effort estimate
  and a pass/fail acceptance test; keep the investor page as a Stage 1 content
  deliverable, not part of the architecture.

- **Children's-data compliance is a slogan, not a plan.** "Privacy-first, no ads to
  kids" is stated as a value, but combining photo albums (of children) from three
  apps into one shared database raises real COPPA/GDPR-K/retention obligations that
  aren't addressed with any concrete mechanism.
  **Fix:** add a real compliance pass before Stage 2 ships — parental consent flow,
  explicit data retention/deletion SLAs, and moderation for uploaded photos — likely
  with legal review given this stores minors' images.

- **Vague grace-period mechanics for a destructive action.** "Read-only with a clear
  grace period," "repeated warning emails" — neither the period length nor the
  warning cadence is specified, and this gates whether a family's photos become
  inaccessible.
  **Fix:** specify an exact grace-period length and warning-email schedule, and
  guarantee photos are only ever access-locked automatically, never hard-deleted,
  until an explicit user-confirmed deletion step.

- **No mention of the existing test suite surviving the rebuild.** `mestar` already
  has Vitest + Playwright + lint in CI; the plan doesn't say whether a TanStack Start
  rewrite keeps, ports, or drops that coverage.
  **Fix:** make carrying forward (or deliberately replacing) the existing test suite
  an explicit Stage 1 task, so regressions on the live storefront aren't shipped
  silently.

- **The slow-generation background-job convention isn't mentioned.** `mestar`'s edge
  functions fire generation via `EdgeRuntime.waitUntil(...)` specifically to dodge
  Stripe's ~10s webhook timeout (a real incident previously fixed this way per
  `.lovable/plan/`). The new plan's entitlement/server-check architecture doesn't
  say whether this convention is preserved when storybook generation moves under the
  master app.
  **Fix:** explicitly carry this convention forward (or its equivalent in the new
  stack) when folding the generation pipeline into the master app's server checks —
  reintroducing an `await` here is exactly how the original timeout bug came back.
