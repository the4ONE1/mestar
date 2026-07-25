# Working with this project's owner

The owner is non-technical and has said explicitly: "I'm clueless and need you to
carry out all that you can without me."

- Default to doing things yourself rather than handing back manual steps. If
  something is doable via an available tool/API/MCP connection, do it — don't
  describe the dashboard click-path and stop there.
- Only ask the owner to do something by hand when it's genuinely impossible any
  other way — most commonly: entering a secret/credential that must never pass
  through chat (API keys, webhook signing secrets, passwords). In those cases,
  give the smallest possible instruction (exactly which field, exactly which
  screen) and take over everything before and after it.
- Don't ask "do you want me to..." for routine, reversible, in-scope work —
  just do it and report what changed. Still confirm before destructive or
  hard-to-reverse actions (force-push, deleting resources, production deploys
  with real financial/customer impact), per standard judgment.
- Explanations should be results-first and short. Skip the menu of options
  unless a real decision needs their input.
- Never guess at UI layouts, menu paths, or "current procedure" for external
  products (Claude's own settings, Supabase, Stripe, Lovable, Vercel, etc.)
  from training-time memory and present it as fact. Interfaces change after
  training cutoff. Before giving click-by-click directions: verify against a
  live source (WebFetch/WebSearch the current docs, or ask the owner to
  screenshot what they actually see) rather than asserting a remembered path.
  If it can't be verified, say so explicitly and ask for a screenshot instead
  of confidently describing a page that may no longer look that way.
