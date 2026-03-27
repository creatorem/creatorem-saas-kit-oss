# Creatorem Cross-Agent Rules

This folder is the canonical source for AI coding-agent behavior in `creatorem-saas-kit-cm-app`.

## Canonical contract

- `creatorem-agent-rules.contract.v1.json`

This contract defines:

- stable rule IDs and priorities
- capability-first retrieval protocol
- source precedence (`kit/*` > docs > examples)
- workflow-specific constraints (settings, i18n, database)
- required validation/reporting behavior

## Generated adapters

Adapters are generated from the canonical contract and must not be edited manually:

- `AGENTS.md` (Codex-compatible)
- `CLAUDE.md` (Claude-compatible)
- `.cursor/rules/creatorem-agent-rules.mdc` (Cursor)
- `.windsurfrules` (Windsurf)
- `docs/agent-rules/adapters/generic-agent-rules.md` (fallback)

## Maintenance commands

Run from repo root:

```bash
pnpm --filter creatorem docs:agents:generate
pnpm --filter creatorem docs:agents:check
```

`docs:agents:check` validates:

- contract structure
- referenced file paths in `kit/*`, docs, and `examples/*`
- capability IDs against `apps/creatorem/content/.generated/mcp-index.json`
- adapter drift against generated outputs
