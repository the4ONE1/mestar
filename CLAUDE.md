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
