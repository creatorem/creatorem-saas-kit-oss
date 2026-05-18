# Repo Map

## Core Shape
Creatorem is a pnpm/Turborepo monorepo backed by Supabase. Expect apps to be Next.js web apps or Expo native apps.

| Path | Meaning | Edit Policy |
| --- | --- | --- |
| `apps/*` | Runtime products: web dashboards, websites, API app, Expo apps, docs | App-specific composition, routes, screens, config |
| `examples/*` | Optional reference implementations | Read if present; never assume it exists in production |
| `kit/*` | Internal reusable kit packages | Source of truth for kit behavior; avoid project customization |
| `kit/ui/*` | Shared UI packages for web/native | Customizable; merge carefully |
| `packages/*` | Project-owned packages | Preferred home for customer/application business logic |
| `packages/shared` | Default shared app package | TRPC router, shared config, typed app API |
| `supabase/*` | Supabase schemas, generated app schemas, migrations, tests | SQL-first database workflow |
| `tooling/*` | Development tooling | Tooling and scripts only |
| `cli/*` | Creatorem CLI | Project generation and SQL generation commands |

## Source Precedence
1. `kit/*` code and exports.
2. Docs pages and generated agent contract.
3. `examples/*` integration patterns.

If these disagree, follow code first and report the conflict.

## App-Vs-Kit Decision
- Reusable platform capability belongs in `kit/*` when maintaining the kit.
- Project-specific reusable capability belongs in `packages/*`.
- Runtime wiring belongs in `apps/*`.
- UI customization usually belongs in `kit/ui/*` or project UI packages, not deep feature packages.

## Optional Example Rule
The default kit repository ships examples to teach integration patterns. A production project may delete `apps/*`, `examples/*`, and sample `packages/*` content when starting clean. Missing examples are normal and should not block feature work.
