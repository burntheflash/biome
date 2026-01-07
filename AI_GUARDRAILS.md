# AI Guardrails — Mandatory Rules

This project contains working, production-grade code.
Breaking existing behavior is considered a failure.

## Absolute Rules (Non-Negotiable)
- Do NOT refactor existing code.
- Do NOT rename variables, functions, files, folders, routes, or exports.
- Do NOT reformat code or "clean up" style.
- Do NOT change dependencies, lockfiles, or build configurations.
- Do NOT modify environment files (.env) or secrets.
- Do NOT introduce new libraries unless explicitly requested.

## Protected Areas
- Any folder named `/core`, `/config`, or `/infra`
- Any file marked as:
  `🔒 PROTECTED FILE`

If a change requires touching protected areas, STOP and ask for approval.

## Allowed Strategy
- Apply minimal, localized, patch-style changes only.
- Fix one issue at a time.
- Prefer wrappers, adapters, or extensions over editing stable logic.
- Avoid touching unrelated files.

## Output Rules
- Return ONLY the full updated file(s) that were changed.
- Do NOT include partial snippets unless explicitly requested.
- Always end with a section called:
  `## Changes made`

## Terminal & Safety
- Never execute terminal commands without explicit approval.
- Never access files outside the project workspace.
- Never access ignored files or credentials.

Failure to follow these rules is considered an incorrect solution.

## Modification Policy
- Existing logic must not be edited.
- New behavior must be implemented using wrappers or adapters.
- If wrapping is not possible, ask before editing.

## Antigravity Specific Protocol
- Before executing any code changes, use the "Plan" feature to outline steps.
- Wait for my confirmation on the Plan if it involves deleting any existing lines of code.

## Auto-Lock Protocol (MANDATORY)
Upon successfully fixing a bug or implementing a feature in a file:
1. You MUST insert the following comment at the very first line of the file:
   `// 🔒 PROTECTED FILE - Solved and Verified. DO NOT CHANGE.`
   (Use `` for HTML files).
2. This acts as a seal of quality. Do not apply this tag if the code is experimental.

## Override Protocol (Emergency Access)
If a modification is absolutely necessary in a file marked as `🔒 PROTECTED FILE`:

1. **STOP immediately.** Do NOT generate the code yet.
2. **Justify:** Explain briefly why the change cannot be done via a wrapper or extension.
3. **Request Permission:** Ask explicitly:
   > "This file is protected. Do you want to unlock it for this edit? (Reply 'UNLOCK' to proceed)."
4. **Wait:** Only proceed after receiving the explicit "UNLOCK" command.


## Ckeck for new archives

Always check @PROJECT_STRUCTURE.md before creating new files to ensure you are using the correct directory paths (e.g., inside /src).