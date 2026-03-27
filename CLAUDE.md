# Creatorem Agent Rules (Claude Adapter)

Generated file. Source of truth: `docs/agent-rules/creatorem-agent-rules.contract.v1.json`.
Do not edit manually; regenerate via `pnpm --filter creatorem docs:agents:generate`.

## Contract Metadata
- contractId: `creatorem-agent-rules-v1`
- contractVersion: `1`
- language: `en`
- scope: `generic_creatorem_kit`

## Objective
Enable AI coding agents to implement features in Creatorem SaaS Kit with predictable quality by combining docs capability discovery, kit-first implementation, and example-driven integration patterns.

## Retrieval Protocol
- Resolve user intent to one or more capability IDs from mcp-index metadata before proposing implementation details.
- Read the primary docs page and its Agent Recipe for each selected capability.
- Locate concrete implementation entrypoints in kit/* for each capability.
- Use examples/* only to map integration composition and app wiring patterns.
- If docs and code conflict, follow source precedence and report the conflict with impacted files.

## Source Precedence
| Rank | Source | Meaning |
| --- | --- | --- |
| 1 | kit_code | kit/* source code and exported APIs are the implementation truth. |
| 2 | docs_contract | apps/creatorem/content/docs and MCP Context/Agent Recipe define intended usage and integration rules. |
| 3 | examples | examples/* provide real integration templates and composition references. |

## Implementation Workflow
- Start with capability discovery and select minimal capability set.
- Implement in shared kit package first when behavior belongs to reusable module.
- Prefer filter-based composition (client/server/cross-env) over app-local hardcoded integration when filter extension points exist.
- Wire app-level composition with filters/config/routes after shared changes.
- Use examples to mirror integration structure for dashboard/mobile scenarios.
- Keep naming and architecture consistent with existing kit conventions.

## Validation Workflow
- Run docs contract and quality checks when docs/MCP contract content is changed.
- Run typecheck/lint/tests scoped to changed packages or apps.
- For database-affecting changes, run SQL generation/reset/types sequence in documented order.
- Report executed commands and unresolved validation blockers in final output.

## Anti-Patterns
- Reimplementing behavior directly in apps/* when @kit/* already provides the feature.
- Bypassing filter extension points with app-local hardcoded integration when filter hooks exist.
- Bypassing settings APIs with direct DB reads/writes for keys supported by @kit/settings.
- Treating examples/* as API authority when kit exports or docs contract disagree.
- Skipping capability discovery and editing files from guesswork only.
- Returning changes without explicit validation status and command evidence.

## Output Expectations
- List changed files and summarize behavior-level impact.
- State which capability IDs were used for retrieval.
- State which @kit/* APIs were reused instead of app-local duplication.
- List validation commands executed and any blockers.
- If assumptions were required, enumerate them explicitly.

## Workflow Contracts
### WF-SETTINGS-01 — Settings Fullstack Workflow

**Required Actions**

- Enqueue schema via server_get_settings_schema in app server filters before reads.
- Use getServerSettings for server reads and getClientSettings/useClientSettings for client reads.
- Use SettingsPages/updateSettingsForm or SettingServerModel.updateSettings for writes.
- Preserve typed schema-driven behavior through parseSchemaSettingConfig and parseUISettingConfig usage.

**Capability Refs**

- `settings_architecture`
- `settings_api_fullstack`

**Path Refs**

- `kit/settings/src/shared/server/get-server-settings.ts`
- `kit/settings/src/shared/client/get-client-settings.ts`
- `kit/settings/src/shared/client/use-client-settings.ts`
- `examples/pco-dashboard/lib/init-server-filters.ts`
- `examples/pco-dashboard/app/dashboard/[slug]/settings/[[...settings]]/page-client.tsx`
- `examples/pco-mobile/app/(app)/screens/settings/[...settings]/index.tsx`

### WF-I18N-01 — Cross-Env Translation Workflow

**Required Actions**

- Initialize cross-env filters in app i18n bootstrap.
- Use applyCrossEnvAsyncFilter for package translations resolver.
- Use applyCrossEnvFilter to compose namespaces.
- Fallback to app-local locale JSON only when no package translation is returned.

**Capability Refs**

- `i18n_web_setup`
- `i18n_usage_patterns`
- `i18n_mobile_setup`

**Path Refs**

- `examples/pco-dashboard/lib/init-cross-env-filters.ts`
- `examples/pco-dashboard/config/i18n.config.ts`
- `kit/i18n/src`

### WF-FILTERS-01 — Filter-First Modularity Workflow

**Required Actions**

- Identify the target filter namespace first (client/server/cross-env).
- Verify slug signature in FilterList before implementing changes.
- Register filters in package modules and initialize them in app entrypoints.
- Document filter parameters in feature docs when filter-backed behavior is changed.

**Capability Refs**

- `filter_api_architecture`
- `app_configuration`
- `repo_navigation`

**Path Refs**

- `kit/utils/src/filters/list.ts`
- `kit/utils/src/filters/filter-engine.ts`
- `apps/dashboard/hooks/use-filters.ts`
- `apps/dashboard/lib/init-server-filters.ts`
- `apps/dashboard/lib/init-cross-env-filters.ts`
- `apps/mobile/hooks/use-filters.ts`
- `apps/mobile/config/i18n.config.ts`
- `apps/creatorem/content/docs/(common)/filters-api.mdx`

### WF-DB-01 — Database Generation Workflow

**Required Actions**

- Run SQL generation before reset/type refresh when schema/setup changed.
- Use documented order: creatorem generate-sql -> pnpm run db:reset -> pnpm run db:types.
- Do not manually edit generated migration bundles.
- Confirm local Supabase is running before reset/types operations.

**Capability Refs**

- `database_workflow`
- `repo_task_execution`
- `project_generation_and_refactor`

**Path Refs**

- `supabase/schemas`
- `supabase/app-schemas`
- `supabase/migrations`
- `apps/creatorem/content/docs/(common)/database.mdx`
- `apps/creatorem/content/docs/(common)/scripts.mdx`

## Rule Checklist
### AR-001 (P0)

**Trigger**: Any feature request, bugfix, or refactor

**Required Actions**

- Resolve target capabilities before selecting implementation files.
- Read docs page What It Does, How To Use, MCP Context, and Agent Recipe sections.
- Map capability entrypoints to concrete code paths before editing.

**Forbidden Actions**

- Start implementation from guessed files without capability mapping.
- Ignore MCP Context entrypoints when they exist.

**Validation Expectations**

- At least one capability ID is referenced in task notes/output.
- Selected files are traceable to capability entrypoints.

**Capability Refs**

- `mcp_doc_index`
- `docs_platform`
- `repo_navigation`

**Path Refs**

- `apps/creatorem/content/.generated/mcp-index.json`
- `apps/creatorem/content/docs/web/(root)/mcp-capabilities.mdx`
- `apps/creatorem/content/docs/(common)/structure.mdx`

**Example Refs**

- `examples/pco-dashboard`
- `examples/pco-mobile`

### AR-002 (P0)

**Trigger**: When implementing or changing reusable behavior

**Required Actions**

- Implement shared behavior in @kit/* first when ownership is reusable.
- Keep app-level code focused on composition/configuration/filter wiring.
- Reference kit exports and existing routers/hooks/components before creating new ones.

**Forbidden Actions**

- Copy-paste reusable logic into apps/* as first option.
- Create duplicate APIs that mirror existing kit capabilities.

**Validation Expectations**

- Output explains why kit reuse was chosen or why app-local scope is necessary.
- Changed app code shows composition around existing kit APIs.

**Capability Refs**

- `repo_navigation`
- `app_configuration`

**Path Refs**

- `kit`
- `apps`
- `apps/creatorem/content/docs/(common)/structure.mdx`

**Example Refs**

- `examples/pco-dashboard/config`
- `examples/pco-mobile/config`

### AR-003 (P0)

**Trigger**: When docs, kit code, and examples diverge

**Required Actions**

- Apply source precedence strictly: kit code > docs > examples.
- Document detected conflicts and selected resolution path.
- Prefer updating docs/adapters when code truth changed.

**Forbidden Actions**

- Treat example implementations as authoritative over kit exports.
- Silently choose one source without conflict note.

**Validation Expectations**

- Conflict note includes impacted files and precedence decision.
- Follow-up docs updates are planned or implemented when needed.

**Capability Refs**

- `docs_platform`
- `mcp_server_integration`

**Path Refs**

- `apps/creatorem/content/docs`
- `kit`
- `examples`

**Example Refs**

- `examples/pco-dashboard/lib/init-server-filters.ts`

### AR-004 (P0)

**Trigger**: Settings-related feature implementation

**Required Actions**

- Follow WF-SETTINGS-01 without bypassing @kit/settings APIs.
- Ensure schema/filter wiring exists before any settings read/write path.
- Prefer typed getters/hooks over manual inference or raw settings DB access.

**Forbidden Actions**

- Direct raw drizzle access for settings values already modeled in @kit/settings.
- Skipping server_get_settings_schema enqueue step.

**Validation Expectations**

- Server/client settings reads use sanctioned helpers.
- Required schema keys are discoverable from configured schema map.

**Capability Refs**

- `settings_architecture`
- `settings_api_fullstack`
- `settings_mobile_ui`

**Path Refs**

- `kit/settings/src/shared/server/get-server-settings.ts`
- `kit/settings/src/shared/client/get-client-settings.ts`
- `kit/settings/src/shared/client/use-client-settings.ts`
- `examples/pco-dashboard/lib/init-server-filters.ts`
- `examples/pco-mobile/config/settings.ui.config.tsx`

**Example Refs**

- `examples/pco-dashboard/app/dashboard/[slug]/settings/[[...settings]]/page-client.tsx`
- `examples/pco-mobile/app/(app)/screens/settings/[...settings]/index.tsx`

### AR-005 (P1)

**Trigger**: Translation/i18n changes

**Required Actions**

- Follow WF-I18N-01 and keep package namespaces resolvable through cross-env filters.
- Use i18next flow documented in docs and app config patterns.
- Verify namespace registration includes package-level namespaces when required.

**Forbidden Actions**

- Hardcode translation strings where namespace-based resolution exists.
- Drop cross-env namespace resolution for package content.

**Validation Expectations**

- i18n config shows namespace composition and resolver fallback behavior.
- Package translations remain accessible for target languages.

**Capability Refs**

- `i18n_web_setup`
- `i18n_usage_patterns`
- `i18n_mobile_setup`

**Path Refs**

- `examples/pco-dashboard/config/i18n.config.ts`
- `examples/pco-dashboard/lib/init-cross-env-filters.ts`
- `kit/i18n/src`

**Example Refs**

- `examples/pco-mobile/config/i18n.config.ts`

### AR-006 (P1)

**Trigger**: Database schema/setup/migration changes

**Required Actions**

- Follow WF-DB-01 command order.
- Treat generated migration files as generated artifacts, not hand-authored sources.
- Refresh types after reset to maintain DB/type alignment.

**Forbidden Actions**

- Edit generated migration bundle manually.
- Run db:types before reset when schema changed.

**Validation Expectations**

- Command log demonstrates SQL generation/reset/types sequence.
- Output states if database-affecting validations could not be run and why.

**Capability Refs**

- `database_workflow`
- `repo_task_execution`

**Path Refs**

- `supabase/schemas`
- `supabase/app-schemas`
- `supabase/migrations`
- `package.json`

**Example Refs**

- `examples/pco-dashboard/.creatorem/schemas`
- `examples/pco-mobile/.creatorem/schemas`

### AR-007 (P0)

**Trigger**: When implementing or updating filter-backed features

**Required Actions**

- Follow WF-FILTERS-01 before editing app integration code.
- Verify filter slug parameters and return type from FilterList.
- Wire/verify app initialization files for the selected namespace.
- Update feature docs Filter API table with filter parameters and init paths.

**Forbidden Actions**

- Implement app-local behavior that duplicates existing filter extension points.
- Change filter behavior without verifying typed filter contract.
- Ship filter-backed feature updates without docs section updates.

**Validation Expectations**

- Output identifies namespace and init files used.
- Changed docs include Filter API section updates for impacted feature pages.
- Filter registration and apply points are traceable in changed files.

**Capability Refs**

- `filter_api_architecture`
- `settings_api_fullstack`
- `i18n_web_setup`
- `i18n_mobile_setup`

**Path Refs**

- `kit/utils/src/filters/list.ts`
- `apps/dashboard/hooks/use-filters.ts`
- `apps/dashboard/lib/init-server-filters.ts`
- `apps/dashboard/lib/init-cross-env-filters.ts`
- `apps/mobile/hooks/use-filters.ts`
- `apps/mobile/config/i18n.config.ts`
- `apps/creatorem/content/docs/(common)/filters-api.mdx`

**Example Refs**

- `examples/pco-dashboard/hooks/use-filters.ts`
- `examples/pco-dashboard/lib/init-server-filters.ts`
- `examples/pco-dashboard/lib/init-cross-env-filters.ts`
- `examples/pco-mobile/hooks/use-filters.ts`
- `examples/pco-mobile/config/i18n.config.ts`

### AR-008 (P0)

**Trigger**: Before finalizing any implementation response

**Required Actions**

- Run relevant validation commands for touched scope (docs/contracts, typecheck, lint, tests).
- Summarize changed paths and behavior impact.
- Report exactly which commands were executed and which failed/skipped.

**Forbidden Actions**

- Claim success without command evidence.
- Omit known blockers affecting correctness.

**Validation Expectations**

- Final output includes command results and residual risk statement.
- Validation scope matches changed files/features.

**Capability Refs**

- `repo_task_execution`

**Path Refs**

- `apps/creatorem/package.json`
- `package.json`

**Example Refs**

- `examples/pco-dashboard`
- `examples/pco-mobile`
