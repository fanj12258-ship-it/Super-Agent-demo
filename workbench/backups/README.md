# Workbench backups

| File | When | Notes |
|---|---|---|
| `agentos-workbench.LOCKED-2026-10-10.html` | **Locked version** (2026-10-10) | Current shipped state, **single-file (pre css/js split)**; the split version renders pixel-identical. Wash backgrounds (content pages light / Market & AI Ops deeper), hero art, wider notify panel, icon lock. Restore: copy over `../agentos-workbench.html` |
| `agentos-workbench.before-sidebar-polish.html` | Before sidebar polish (section labels, compact CTAs, footer, icon cleanup) | To revert: copy this file over `../agentos-workbench.html` |

```bash
cp workbench/backups/agentos-workbench.before-sidebar-polish.html workbench/agentos-workbench.html
```
