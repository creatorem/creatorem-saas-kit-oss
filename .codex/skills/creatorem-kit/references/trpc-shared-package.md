# TRPC Shared Package

## Purpose
`packages/shared` is the default shared application package. It exposes the typed TRPC router and client wiring used by both Next.js web apps and Expo native apps.

Use it when an action or query should be reachable from more than one runtime app.

## Main Files
| Path | Role |
| --- | --- |
| `packages/shared/src/server/router.ts` | Root app router composition |
| `packages/shared/src/server/router.ctx.ts` | Request context and authenticated database client |
| `packages/shared/src/server/get-db-client.ts` | Supabase/Postgres database client source |
| `packages/shared/src/types/router.ts` | Exported `AppRouter` type |
| `packages/shared/src/trpc-client-provider.tsx` | Typed client provider and headers |
| `packages/shared/src/config/*` | Shared routes, languages, settings schema |

## Pattern
- Compose existing kit routers first: `@kit/auth/router`, `@kit/settings/router`, `@kit/organization/router`, and other enabled kit routers.
- Add project routers in `packages/shared/src/server/*` or a project package under `packages/*`.
- Keep app routes/screens thin: call the typed TRPC client instead of duplicating server logic.
- Keep auth and DB access in router context or server helpers, not client components.

## When To Avoid It
- Single-screen local UI state does not need TRPC.
- Pure kit behavior should stay in `kit/*`.
- One-off app-only route handlers can stay in `apps/*` if they are not shared and do not duplicate kit APIs.
