# SUPER AGENT

Two product layers, kept in separate folders:

| Folder | What it is | Open this to review |
|---|---|---|
| [`workbench/`](workbench/) | **Outer shell** — project spaces, asset catalogs, account / notifications | `workbench/agentos-workbench.html` |
| [`superagent/`](superagent/) | **Inner workshop** — craft / chat / scenario build after entering from workbench | `superagent/superagent.html` |

Legacy experiments live in [`_archive/`](_archive/) (not part of the current demos).

## Review Workbench first (before Superagent)

1. Open `workbench/agentos-workbench.html` in a browser.
2. Skim styles + interaction notes in `workbench/tokens/agentos-ui.md`.
3. When OK, we align Superagent to those tokens.

Cursor rule (same content, for the agent): `.cursor/rules/agentos-ui.mdc`.

## HTML application deployment

Run `npm run build` from the repository root. No dependencies are required for
the HTML build. The output in `dist/` includes Workbench, both Workshop pages,
and their scripts, styles, and assets. React, archived experiments, backups,
and design documents are excluded from deployment.

Import this GitHub repository into Vercel with the repository root as the Root
Directory. The committed `vercel.json` sets the build command and output
directory. The application URL opens Workbench, with the existing Workshop
navigation preserved. Connect the repository to enable deployments on push.
