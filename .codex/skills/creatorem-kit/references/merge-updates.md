# Merge Updates

## Mental Model
Separate upstream changes into three buckets:

1. Core kit internals: merge them.
2. Local project code: keep local decisions.
3. Optional examples/showcase code: ignore if the project deleted that surface.

## Merge Rules
- `kit/*`: accept upstream kit changes unless local project customization exists.
- `kit/ui/*`: inspect carefully; projects commonly customize UI, so reconcile upstream fixes with local design.
- `apps/*`: only reintroduce deleted apps if the project wants those apps back.
- `examples/*`: optional. If absent locally, do not restore just because upstream changed examples.
- `packages/*`: preserve project packages. Do not restore sample packages that only powered deleted examples.
- `packages/pco-shared`: usually example support; ignore if the examples are gone.
- `supabase/schemas`: merge core kit SQL changes.
- `apps/<app>/.creatorem/schemas`: preserve app-specific SQL logic.

## Conflict Checklist
1. Classify each conflicted path as kit, customizable UI, app, package, example, or generated artifact.
2. For kit internals, prefer upstream and adjust local imports only when needed.
3. For `kit/ui/*`, read both sides and preserve local brand/design behavior while keeping upstream fixes.
4. For generated migrations, regenerate from schema sources instead of hand-merging when possible.
5. For deleted optional examples/apps/packages, keep deletion unless explicitly asked to restore.

## Red Flags
- Reintroducing `examples/*` into a production project without user intent.
- Treating example code as authoritative over `kit/*`.
- Manually resolving generated SQL without checking source schema files.
- Dropping local `kit/ui/*` customization while accepting upstream changes.
