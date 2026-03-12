# Slot Occurrence Agenda Read Model

## Why

`public.slot_occurrence` is now the authoritative read model for agenda and checkout slot loading.

This change was needed for:

- agenda range reads without runtime recurrence expansion in the API
- direct filtering on `organization_id`, `date`, `service_id`, and `company_member_id`
- consistent booking linkage through `booking.slot_occurrence_id`
- keeping the dashboard and public checkout on the same occurrence-backed source of truth

## Migration And Backfill

Schema rollout:

- `100-planoby-agenda-performance.sql`
  - adds `uq_slot_occurrence_slot_date`
  - enriches `public.agenda_slot_day` booking payloads with `relative_id` and `customer_note`
- `111-planoby-slot-occurrence-source-of-truth.sql`
  - adds occurrence generation helpers
  - backfills `slot_occurrence` for the rolling agenda horizon
  - backfills missing `booking.slot_occurrence_id` links from `(slot_id, day)`
  - refreshes cached `slot_occurrence.booking_count`

Backfill behavior:

- all slots are synchronized into `slot_occurrence` for the rolling window `current_date - 18 months` to `current_date + 24 months`
- booked days outside that window are synchronized explicitly so existing bookings still receive an occurrence row
- bookings with `slot_id + day` are relinked to the matching occurrence and receive occurrence timestamps

## Read And Write Impact

Read path:

- `packages/planoby/shared/src/server/router.agenda.ts`
  - `findForAgendaSlots`
  - `findForCheckoutSlots`
- both endpoints now load slot/day membership from `public.slot_occurrence`
- the API still returns template-slot payloads grouped by `slot.id`, but each payload now carries `occurrence_days`

Write path:

- booking writes resolve `slot_occurrence_id` from `(slot_id, day)` in the DB trigger
- slot inserts generate occurrences immediately
- slot updates resynchronize occurrences, relink booked days, and refresh occurrence booking counts

Consumer impact:

- dashboard agenda day rendering now uses `occurrence_days` when present
- public checkout day rendering now uses `occurrence_days` when present
- existing slot editing and mutation APIs keep the same template-slot contract

## Compatibility And Rollout

Recommended rollout order:

1. Apply `100-planoby-agenda-performance.sql`
2. Apply `111-planoby-slot-occurrence-source-of-truth.sql`
3. Deploy the API/router changes
4. Deploy the dashboard/public checkout consumer changes

Compatibility notes:

- the API still returns slot templates keyed by `slot.id`, so drag/edit/delete flows continue to target template slots
- old clients that ignore `occurrence_days` still receive the previous fields, but they may miss occurrence-only edge cases after recurrence edits
- the new read path assumes the new lifecycle schema has been applied before application rollout
