---
name: creatorem-assets
description: Handle all website assets for apps/creatorem using external asset hosting (assets.creatorem.com), the assetUrl helper, video slug mapping, and the FTP migration workflow.
---

# Creatorem Assets Workflow

## When To Use
Use this skill for any task that touches images/videos rendered by `apps/creatorem`.

Examples:
- Changing any `Image src` in `apps/creatorem` components/pages.
- Adding or replacing screenshots, logos, mockups, or marketing visuals.
- Updating the `ClientVideo` source mapping.
- Migrating local media to hosted storage.

## Source Of Truth
- Local source files live in `apps/creatorem/public/images`.
- Runtime URLs must come from hosted storage via `NEXT_PUBLIC_ASSETS_BASE_URL`.
- Do not use Vercel Blob URLs in app runtime code.

## Mandatory Rules
1. Never hardcode `"/images/..."` in UI runtime code.
2. Always use `assetUrl('/images/...')` for hosted images.
3. Always use `assetUrl('/videos/...')` for hosted mp4 files.
4. Keep `NEXT_PUBLIC_ASSETS_BASE_URL` configured in env files used by the app.
5. Keep local image files in repo as source/rollback unless explicitly asked to delete.

## Required Paths
- URL helper: `apps/creatorem/lib/asset-url.ts`
- Env schema: `apps/creatorem/envs.ts`
- Next image allowlist: `apps/creatorem/next.config.ts`
- Video mapping: `apps/creatorem/components/client-video.tsx`
- Migration script: `apps/creatorem/scripts/migrate-assets-to-ftp.mts`

## Image And Video Patterns
- Images:
  - Good: `src={assetUrl('/images/app-screenshots/dashboard/home-light.png')}`
  - Bad: `src="/images/app-screenshots/dashboard/home-light.png"`
- Videos:
  - Use `videoSlug` with `ClientVideo`.
  - Keep slug-to-filename mapping in `client-video.tsx`.
  - Hosted video files live under `/videos`.

## Migration Workflow (FTP)
From `apps/creatorem`:

```bash
pnpm assets:migrate
```

What it does:
- Uploads `public/images` recursively to FTP `/images`.
- Downloads legacy video files and uploads them to FTP `/videos`.
- Prints JSON report with `uploaded`, `failed`, `uploadedAssets`, `failedAssets`.

Required envs:
- `ASSETS_FTP_HOST`
- `ASSETS_FTP_PORT` (default `21`)
- `ASSETS_FTP_USER`
- `ASSETS_FTP_PASSWORD`
- `NEXT_PUBLIC_ASSETS_BASE_URL`
- `LEGACY_BLOB_BASE_URL` (optional override for legacy download base)

## Validation Checklist
Run after any asset-related change:

```bash
rg -n "blob\\.vercel-storage\\.com" apps/creatorem
rg -nP "(?<!assetUrl\\()['\"]/images/" apps/creatorem
```

Expected:
- No Blob URL matches in runtime code.
- No raw `/images/...` runtime references outside `assetUrl(...)` usage.

After migration, verify both FTP and public HTTP:
- FTP: file exists at `/images/...` and `/videos/...`.
- Public URL: `https://assets.creatorem.com/images/...` and `https://assets.creatorem.com/videos/...`.

If FTP has files but public URLs return `404`, subdomain docroot mapping is wrong on the host and must be fixed server-side.
