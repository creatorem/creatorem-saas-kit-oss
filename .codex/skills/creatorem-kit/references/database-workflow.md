# Database Workflow

## Sources
Creatorem uses SQL source files and generated artifacts:

| Path | Role |
| --- | --- |
| `supabase/schemas` | Core kit SQL sources |
| `apps/<app>/.creatorem/schemas` | App/project SQL sources |
| `apps/<app>/.creatorem/setup.json` | App setup input for SQL generation |
| `supabase/app-schemas` | Generated app schema SQL |
| `supabase/migrations` | Generated merged migration bundle |
| `supabase/tests` and `apps/<app>/.creatorem/tests` | SQL tests |

## Rules
- Edit schema/setup sources, not generated migration bundles.
- Preserve schema file ordering; filenames define merge order.
- For project-specific tables/functions/policies, prefer the app `.creatorem/schemas` source.
- For core reusable kit database behavior, use `supabase/schemas`.
- Confirm local Supabase/Docker is running before reset/types.

## Standard Sequence
Use the root project scripts when available:

```bash
pnpm run supabase:start
pnpm exec creatorem generate-sql <optional-app-setup-json>
pnpm run db:reset
pnpm run db:types
```

In this repository, `pnpm run db:reset` already runs:

```bash
pnpm exec creatorem generate-sql apps/planoby-dashboard/.creatorem/setup.json
```

So do not add a second generation step unless you intentionally target a different setup file.

## Validation
- For schema changes, run SQL generation, reset, and type refresh in order.
- Run relevant SQL tests when touching policies, functions, or security-sensitive behavior.
- If Supabase or Docker is unavailable, stop and report the blocker rather than claiming validation.
