---
name: creatorem-kit
description: Use when working in the Creatorem SaaS Kit Turbo monorepo, including app-vs-kit ownership, capability/doc retrieval, Supabase schema generation, shared TRPC routers, examples cleanup, upstream kit merges, or Next.js/Expo integration decisions.
---

# Creatorem Kit

## Overview
Work capability-first, then code-first. The kit source is the implementation truth; docs explain intended usage; examples are optional wiring references and may be absent in production projects.

This repo-local skill is authoritative for Creatorem kit work. Use it with the generated agent rules in `AGENTS.md`; do not edit generated agent rule files by hand.

## Required Workflow
1. Resolve the smallest relevant capability IDs from `apps/creatorem/content/.generated/mcp-index.json`.
2. Read the matching docs page sections: `What It Does`, `How To Use`, `MCP Context`, and `Agent Recipe`.
3. Map docs entrypoints to real files before editing.
4. Prefer existing `@kit/*` APIs and filters over app-local duplication.
5. Keep reusable custom project code in `packages/*`, normally `packages/shared` for app-shared TRPC/config.
6. Validate the touched scope and report exact commands.

Core capability IDs to consider first:

| Task | Capability IDs |
| --- | --- |
| Repo navigation and ownership | `repo_navigation`, `app_configuration` |
| Agent contract and docs retrieval | `agent_rules_contract`, `mcp_doc_index`, `docs_platform` |
| Supabase or SQL changes | `database_workflow`, `project_generation_and_refactor`, `repo_task_execution` |
| Filters/settings/i18n | `filter_api_architecture`, `settings_api_fullstack`, `i18n_web_setup`, `i18n_mobile_setup` |

## Ownership Rules
- `kit/*`: internal reusable kit packages. Treat as source of truth. Do not customize except when you are developing the kit itself.
- `kit/ui/*`: the main customizable kit area. Merge upstream changes carefully against local design needs.
- `packages/*`: customer/project packages. Put custom shared business logic here.
- `packages/shared`: default shared package for TRPC router, client provider, shared config, and typed app API.
- `apps/*`: runtime apps only. Keep them focused on routes, screens, providers, config, and composition.
- `examples/*`: optional examples. Use only as integration references. They can be deleted without meaning the kit is broken.
- `supabase/schemas`: core kit SQL sources.
- `supabase/app-schemas` and `apps/*/.creatorem/schemas`: app/project SQL sources and generated app schema material.

Read `references/repo-map.md` before broad refactors or app-vs-kit decisions.

## Platform Rules
- For mobile UI work, **REQUIRED SUB-SKILL:** use `mobile-ui` from this repo before designing or editing Expo/native screens.
- For web UI work, follow existing app conventions and shared `@kit/ui/www` APIs before adding new components.
- For server/client data access shared by web and native, use the TRPC pattern in `packages/shared`; read `references/trpc-shared-package.md`.

## Database Workflow
Use SQL source files, not manual migration edits. For schema/setup changes:

```bash
pnpm run supabase:start
pnpm exec creatorem generate-sql <optional-app-setup-json>
pnpm run db:reset
pnpm run db:types
```

Run the exact project command when the root script already pins a setup file. Read `references/database-workflow.md` before changing schemas, setup files, migrations, or generated database types.

## Merge/Update Policy
When merging upstream Creatorem kit changes:

- Always merge real kit internals from `kit/*` unless there is a concrete conflict.
- If local production removed `examples/*`, deleted example apps, or sample packages, do not reintroduce them just because upstream changed them.
- Ignore `packages/pco-shared` when it only supports deleted examples.
- Treat `kit/ui/*` as the only routinely tricky merge area because projects often customize it.

Read `references/merge-updates.md` before resolving upstream conflicts or kit upgrades.

## Quick Checks
Before final output, verify:

- Capability IDs used are named in the response.
- Chosen files trace back to docs entrypoints or kit exports.
- No reusable feature was duplicated inside `apps/*` when a kit/package boundary exists.
- Database changes followed generation/reset/types order or blockers are explicit.
- Mobile work invoked `mobile-ui`.

## Common Mistakes
| Mistake | Correct approach |
| --- | --- |
| Editing generated `AGENTS.md` directly | Edit the contract/source docs, then regenerate adapters |
| Treating `examples/*` as required | Use examples only if present and useful |
| Adding raw Supabase reads for settings | Use `@kit/settings` schemas, helpers, forms, and filters |
| Manually editing generated migrations | Edit schema/setup sources and run generation |
| Building mobile UI without the repo skill | Use `mobile-ui` first |
