# Planoby Strapi Backend Parity Plan

Last updated: 2026-03-04

## 1) Scope and Sources

This plan inventories backend logic from legacy Strapi and compares it with current implementation in `creatorem-saas-kit-cm-app`.

Target naming/identifier conventions for this refactor:
- Use `organization` naming in target APIs (legacy `company` references are source-history terms only).
- Do not use Strapi `documentId` in target routers; use canonical `id` (UUID).

### Legacy sources (reference)

- `planoby/apps/strapi/config/*`
- `planoby/apps/strapi/src/api/**/{routes,controllers,services,content-types/*/lifecycle*.ts}`
- `planoby/apps/strapi/src/middlewares/*`
- `planoby/apps/strapi/src/extensions/users-permissions/strapi-server.ts`
- `planoby/apps/strapi/helpers/**/*` (used by lifecycle/cron logic)

### Target sources (implementation)

- `creatorem-saas-kit-cm-app/supabase/app-schemas/*`
- `creatorem-saas-kit-cm-app/supabase/schemas/*`
- `creatorem-saas-kit-cm-app/apps/planoby-dashboard/.creatorem/setup.json`
- `creatorem-saas-kit-cm-app/apps/planoby-dashboard/.creatorem/schemas/*`
- `creatorem-saas-kit-cm-app/packages/planoby/shared/src/server/*`
- `creatorem-saas-kit-cm-app/kit/{organization,settings,notification,content-type}/src/router/*`
- `creatorem-saas-kit-cm-app/apps/planoby-dashboard/app/slots/findForCheckout/[organizationId]/route.ts`
- `creatorem-saas-kit-cm-app/apps/planoby-dashboard/app/api/db/webhook/route.ts`
- `creatorem-saas-kit-cm-app/apps/planoby-dashboard/app/api/db/cron/notification-worker/route.ts`

## 2) Legacy Strapi Logic Inventory (What must be accounted for)

## 2.1 Global / Infra

- `config/cron-tasks.ts`:
  - runs `notificationsWorker` hourly.
- `helpers/reminder/*`:
  - reminder stack persistence (`variables/reminder-stack.json`)
  - SMS reminder scheduler logic
  - immediate-vs-delayed SMS send decision.
- `src/middlewares/*`:
  - `hasPlanAccess`, `hasCompanyPermission`, `notificationMiddleware`.
- `src/extensions/users-permissions/strapi-server.ts`:
  - custom `/users/upload` and `/users/deleteFile/:fileDocID`.

## 2.2 Domain Logic by Strapi API

| Domain | Controllers / Routes | Service logic | Lifecycle logic |
|---|---|---|---|
| `booking` | `findByCompany`, `findOnConfirmation`, `sendRecapEmail`, `bulkDelete`, core CRUD | `sendRecapBookingEmail`, `sendAdminEmail` | `beforeCreate` validation + `relative_id`, `afterCreate` email + reminder registration, `beforeUpdate` state-transition side effects, `beforeDelete` cleanup |
| `slot` | `findByCompany`, `createRequestedSlot`, `findForAgenda`, `findForCheckout`, `mergeSlots`, `move`, `unlink`, custom `update`, core CRUD | `extractDays`, `findSlotsAccordingDays`, `assignBookingsToSlots` | weekly-frequency conformity check, excluded-days booking guard, booking day shift on slot date move, reminder time updates |
| `service` | `findByCompany`, core CRUD | core | `beforeCreate` set `relative_id` |
| `participant-data-schema` | `findByCompany`, core CRUD | core | slug generation on create/update |
| `checkout` | `findByCompany`, core CRUD | core | slug + `relative_id` on create, slug refresh on update |
| `date-memo` | `findForAgenda`, core CRUD | day extraction + day-scoped query helper | none |
| `company` | `register`, `upload`, `deleteFile`, core update/delete | core | slug generation, reminder cleanup on company delete |
| `company-role` | `findByCompany`, `mine`, `acceptInvitation`, `declineInvitation`, core CRUD | core | `beforeCreate` set `relative_id` |
| `company-setting` | `findByCompany`, overridden `find`/`findOne`, `updateBulk`, `syncStripe`, `verifyEmailProvider`, core CRUD | core | none |
| `user-setting` | overridden `find`/`findOne`, `updateBulk`, core update/delete | core | none |
| `notification` | `hasBeenRead`, `countUnread`, core CRUD | core | none |
| `event-analytic` | `findByCompany`, core CRUD | core | none |
| `session-analytic` | `findByCompany`, core CRUD | core | none |

## 3) Current Target Coverage Snapshot

## 3.1 Implemented server surface

- `packages/planoby/shared/src/server`:
  - `router.booking.ts`: `archiveBookings`, `singleBooking`, `createBooking`, `updateBooking`, `paymentConnectGetStatus`, `paymentConnectCreateOnboardingLink`, `paymentConnectSyncAccount`, `bookingChargeSavedMethod`, `bookingFindByOrganization`, `bookingFindOnConfirmation`, `bookingSendRecapEmail`, `bookingBulkDelete`
  - `router.checkout.ts`: `archiveCheckouts`, `singleCheckout`, `createCheckout`, `updateCheckout`, `checkoutFindByOrganization`
  - `router.service.ts`: `archiveServices`, `singleService`, `createService`, `updateService`, `serviceFindByOrganization`
  - `router.agenda.ts`: `agendaInit`, `agendaFindForDays`, `findForCheckout`, `agendaFindDateMemos`, slot/date-memo CRUD helpers, merge/unlink/move
  - `router.slot.ts`: `slotFindByOrganization`, `slotCreateWithBooking`, `slotUpdate`
  - `router.date-memo.ts`: `dateMemoFindForAgenda`
  - `router.participant-data-schema.ts`: `participantDataSchemaFindByOrganization`, `participantDataSchemaCreate`, `participantDataSchemaUpdate`, `participantDataSchemaDelete`
  - `router.supabase-webhook.ts`: `handleSupabaseWebhook` (booking/slot DB events → email/SMS side effects)
  - `router.supabase-cron.ts`: `handleSupabaseCronNotificationWorker` (hourly SMS reminder dispatch)
- Next.js route handlers:
  - `/slots/findForCheckout/[organizationId]` maps old checkout query style to `findForCheckoutSlots`.
  - `/api/db/webhook` receives Supabase DB webhook events (booking insert/update, slot reschedule).
  - `/api/db/cron/notification-worker` processes due SMS reminders from `booking_sms_reminder` queue.
- Kit routers included in `appRouter`:
  - `organizationRouter` (organization/role/member/invitation management)
  - `notificationRouter` (`getNotifications`, `setAsReadNotifications`, `hasUnreadNotifications`)
  - `getSettingsRouter(settingsSchemas)` (`getSettingsValues`, `updateSettingsForm`)
  - `contentTypeRouter` (generic select/search/analytics/bulk-delete by table).

## 3.2 Implemented data model

- Planoby domain tables exist in Supabase:
  - `service`, `participant_data_schema`, `slot`, `slot_occurrence`, `booking`, `checkout`, `date_memo`
- Mapping-aligned core tables exist:
  - `public.user`, `public.organization`, `public.organization_role`, `public.organization_setting`, `public.notification`, `public.user_setting`
- Agenda performance artifacts exist:
  - composite indexes + `agenda_slot_day` view (`100-planoby-agenda-performance.sql`)

## 3.3 Implemented DB triggers

- `updated_at` reset triggers exist on planoby tables.
- Lifecycle parity trigger layer implemented in `110-planoby-lifecycle-sync-and-webhooks.sql`:
  - booking write guards + slot/occurrence denormalized sync
  - booking state side-effect unlink (`canceled`, `confirmation_failed`)
  - slot weekly conformity + excluded-day guard
  - slot date/time propagation to linked bookings
  - slot_occurrence `booking_count` sync trigger
- Supabase webhook triggers now fire for:
  - booking insert
  - booking state transition updates
  - slot reschedule updates (`date`/`start`/`end`)
- Supabase cron parity (`120-planoby-reminder-cron.sql`):
  - `booking_sms_reminder` queue table (DB-backed replacement for legacy `reminder-stack.json`)
  - hourly `cron.schedule` job (`0 * * * *`) invoking `/api/db/cron/notification-worker`

## 4) Parity Assessment

Status legend:
- `Implemented`: effectively ported
- `Partial`: partially ported or different behavior requiring follow-up
- `Missing`: no equivalent implementation found in target

| Domain | Status | Notes |
|---|---|---|
| Booking archive/create/update/read (dashboard) | Implemented | Via `router.booking.ts` |
| Booking public confirmation fetch (`find-on-confirmation`) | Implemented | `bookingFindOnConfirmation` in `router.booking.ts` |
| Booking Stripe Connect and later debit | Implemented | Connect onboarding/status and manual debit are handled by `paymentConnect*` + `bookingChargeSavedMethod` in `router.booking.ts`; public booking payment orchestration uses `/api/planoby-billing/public/*` and `/api/planoby-billing/webhook` |
| Booking recap email endpoint | Implemented | `bookingSendRecapEmail` in `router.booking.ts` |
| Booking bulk delete endpoint | Implemented | `bookingBulkDelete` in `router.booking.ts` with organization-scoped guard |
| Booking lifecycle rules (validation, reminders, state transition emails) | Partial | SQL trigger guards + webhook notifications + cron reminder worker implemented; SMS localization/placeholder parity vs legacy translator still simplified |
| Slot agenda read / checkout read | Implemented | `agendaFindForDays`, `findForCheckout`, plus compatibility route for checkout |
| Slot create/move/update/delete/merge/unlink | Implemented | `router.slot.ts` (`slotCreateWithBooking`, `slotUpdate`) + `router.agenda.ts` (merge/unlink/move) |
| Slot requested creation (`/slots/requested/:organizationId`) | Implemented | `slotCreateWithBooking` in `router.slot.ts` covers requested slot + booking pair creation |
| Slot lifecycle invariants (weekly date conformity, excluded day booking guard, booking day propagation) | Partial | Implemented in SQL trigger layer (`110-planoby-lifecycle-sync-and-webhooks.sql`); reminder re-scheduling on slot move not yet ported |
| Service CRUD (dashboard) | Partial | Create/read/update present; dedicated delete parity endpoint not present |
| Service public listing for checkout legacy call | Missing | Checkout still references `/services?...` Strapi-style filter URL |
| Participant data schema management endpoints | Implemented | Dedicated `participantDataSchema*` router procedures are now available in tRPC |
| Checkout CRUD (dashboard) | Partial | Create/read/update present; delete parity endpoint absent |
| Date memo agenda + CRUD | Implemented | `dateMemoFindForAgenda` + create/update/delete procedures |
| Organization creation (legacy: company register) | Implemented | `organizationRouter.createOrganization` |
| Organization upload/delete file endpoints (legacy: company upload/deleteFile) | Partial | Supabase storage media management exists (client-side), but legacy endpoint parity not exposed |
| Organization update/delete parity (legacy: company update/delete) | Partial | Update mostly via settings/organization attributes; delete endpoint parity not exposed |
| Organization role + invitation flow (legacy: company-role) | Implemented | Covered by `organizationRouter` (members/roles/invitations/accept/decline) |
| Organization setting bulk read/update (legacy: company-setting) | Implemented | `getSettingsValues` + `updateSettingsForm` with `settingsSchemas` |
| Organization setting `syncStripe` (legacy: company-setting) | Missing | No parity endpoint |
| Organization setting `verifyEmailProvider` (legacy: company-setting) | Missing | No parity endpoint |
| User setting bulk/update/find visibility logic | Partial | Settings framework covers storage/update; visibility semantics differ from Strapi implementation |
| Notification read/list/unread indicator | Partial | `setAsRead` + `getNotifications` + `hasUnread` (boolean vs Strapi count number) |
| Event analytic API/table | Missing | No table/router parity |
| Session analytic API/table | Missing | No table/router parity |
| Reminder cron worker (SMS) | Partial | Supabase cron + DB queue (`booking_sms_reminder`) + `/api/db/cron/notification-worker` implemented; SMS localization/dynamic placeholder parity vs legacy translator remains limited |

## 5) Concrete Missing-Feature Backlog (for next implementation wave)

## P0 - Public checkout + payment parity blockers

1. Public service listing endpoint parity for checkout flow (checkout still references `/services?...` Strapi-style filter URL).

## P0 - Data coherency gaps (partially addressed)

- Booking creation invariants (slot/organization consistency, day/participants checks, time-before-booking cutoff): not yet enforced in tRPC layer; SQL trigger layer handles cross-org guard.
- Reminder re-scheduling on slot date/time move: trigger layer propagates booking fields but does not update `booking_sms_reminder` rows for rescheduled slots.

## P1 - Domain parity gaps

1. Organization setting `syncStripe` (legacy: company-setting `syncStripe`).
2. Organization setting `verifyEmailProvider` (legacy: company-setting `verifyEmailProvider`).
3. Domain-specific delete endpoints for `service`, `checkout` (if required for API contract parity).
4. Notification unread count numeric parity (if UI/contract still expects count).
5. Organization upload/delete file endpoint exposure (legacy: company `upload`/`deleteFile`).

## P1 - Missing analytic domains

1. `session-analytic` table + API parity.
2. `event-analytic` table + API parity.

## P2 - Legacy endpoint compatibility cleanup

1. Remove or migrate remaining checkout calls still using Strapi-style URLs:
   - `/services?...` style filter endpoint
2. Keep temporary compatibility routes only where migration requires phased rollout.

## 6) Migration Destination Rules (enforced for implementation)

- Controller business logic: `packages/planoby/shared/src/server/*.ts` (tRPC procedures) or dedicated Next route handlers for public unauthenticated checkout endpoints.
- Data coherency logic: `supabase/app-schemas/*.sql` + `.creatorem/schemas/*.sql` using SQL triggers/functions.
- Side effects (email/SMS/third-party webhooks): Supabase DB webhooks (`supabase_functions.http_request`) to Next handlers.
- Cron behavior: Supabase scheduled jobs (`pg_cron`) and/or queue worker pattern.

## 7) DB Change Discipline Template (apply on each upcoming DB change)

Every DB change for this parity work must include:

1. Why this change is needed:
   - parity, performance, integrity.
2. Migration/backfill plan:
   - SQL migration steps + backfill strategy.
3. Read/write path impact:
   - affected tRPC routes, route handlers, dashboard/checkout consumers.
4. Compatibility and rollout order:
   - deploy sequence, temporary compatibility routes, cutover criteria.

And must be reflected in:

- `apps/planoby-dashboard/.creatorem/setup.json`
- `apps/planoby-dashboard/.creatorem/schemas/*.sql`
- `supabase/app-schemas/*.sql` (source of truth)

## 8) 2026-03-04 Lifecycle + Webhook Implementation Notes

### 8.1 Why this DB change is needed

1. Feature parity:
   - Port core Strapi lifecycle rules into DB-level guarantees so writes are consistent regardless of caller.
   - Replace Strapi lifecycle side effects with Supabase DB webhook dispatch to Next handler for email/SMS.
2. Data integrity:
   - Prevent cross-organization booking/slot linkage.
   - Enforce weekly slot conformity and excluded-day mutation guard.
   - Keep booking denormalized fields (`slot_id`, `service_id`, `company_member_id`, `day`, `start_at`, `end_at`) synchronized.
3. Performance/read correctness:
   - Keep `slot_occurrence.booking_count` synchronized for agenda reads without runtime recounts.

### 8.2 Migration/backfill plan

1. Deploy SQL:
   - `apps/planoby-dashboard/.creatorem/schemas/110-planoby-lifecycle-sync-and-webhooks.sql`
   - mirrored in `supabase/app-schemas/110-planoby-lifecycle-sync-and-webhooks.sql`
2. Backfill after deploy (one-time):
   - Recompute `slot_occurrence.booking_count` from existing `booking` rows.
   - Normalize legacy booking rows missing denormalized fields via a one-off update query (slot/occurrence join).
3. Validation checks:
   - Verify no booking rows violate org/slot coherence.
   - Verify webhook route receives booking insert/update + slot reschedule events.

### 8.3 Read/write path impact

1. Write paths affected:
   - `booking` insert/update/delete now pass through lifecycle trigger checks and sync logic.
   - `slot` insert/update now pass weekly/excluded-day guards and propagate date/time updates.
2. Read paths affected:
   - Agenda/booking reads consume fresher denormalized booking fields and synced `booking_count`.
3. API/route impact:
   - Added `apps/planoby-dashboard/app/api/db/webhook/route.ts`.
   - Added handler `packages/planoby/shared/src/server/router.supabase-webhook.ts` for booking/slot events (email/SMS side effects).

### 8.4 Compatibility notes and rollout order

1. Rollout order:
   - Deploy API webhook route first.
   - Deploy SQL functions/triggers second.
   - Run one-time backfill/validation third.
2. Compatibility behavior:
   - Webhook signatures use `PLANOBY_DB_WEBHOOK_SECRET` or `DB_WEBHOOK_SECRET` (fallback `WEBHOOKSECRET` for local dev).
   - SQL webhook URLs target `http://host.docker.internal:3000/api/db/webhook` for local/docker development.
3. Known remaining gap:
   - Reminder worker is ported to Supabase cron, but SMS message localization/dynamic placeholder parity is still simplified versus legacy translator-driven rendering.

### 8.5 Supabase cron implementation (legacy `cron-tasks.ts` parity)

1. DB objects:
   - `public.booking_sms_reminder` queue table stores one pending reminder per booking.
   - booking triggers keep queue rows synchronized on insert/update/delete.
2. Scheduling:
   - `120-planoby-reminder-cron.sql` creates an hourly Supabase `pg_cron` job named `planoby-notification-worker-hourly`.
   - Job invokes `net.http_post` to `/api/db/cron/notification-worker`.
3. Security/config:
   - Cron route validates `X-Supabase-Cron-Signature`.
   - Secret resolution order in app: `PLANOBY_CRON_WEBHOOK_SECRET` -> `PLANOBY_DB_WEBHOOK_SECRET` -> `DB_WEBHOOK_SECRET` -> local fallback.
   - SQL uses Vault secret names `planoby_dashboard_url` and `planoby_cron_secret` when available, otherwise local defaults.
