# OpenPosition V0 Development Guide

## Purpose

This guide explains how to land the V0 Operable MVP in the current codebase. It is a companion to [Architecture](./architecture.md) and the task-level [Implementation Plan](../plans/2026-04-29-openposition-v0-operable-mvp.md).

## Development Strategy

Build the trusted platform loop in this order:

1. Database lifecycle fields and new tables.
2. Server-side visibility and admin procedures.
3. Automated moderation and auditable review records.
4. Crowd review queue for uncertain posts.
5. Admin review UI for fallback and escalations.
6. Public detail/action tracking.
7. Reporting workflow.
8. Discovery filters and search events.

This order matters because public trust rules must live server-side before UI features depend on them.

## Local Setup

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Run API tests:

```bash
npm run test
```

Run type checks:

```bash
npm run check
```

Database commands require `DATABASE_URL`:

```bash
npm run db:generate
npm run db:migrate
```

For Supabase, set `DATABASE_URL` to the Postgres connection string. In Vercel,
prefer Supabase's pooled connection string because serverless functions can open
many short-lived connections.

## Environment

Required for production-like behavior:

```env
DATABASE_URL=
APP_SECRET=
OWNER_UNION_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
VITE_GOOGLE_CLIENT_ID=
```

For Google-only auth, set `OWNER_UNION_ID` to the stored Google identity format, for example `google_123456789`.

Optional AI moderation:

```env
OPENAI_API_KEY=
OPENAI_MODERATION_MODEL=gpt-5.4-mini
```

## Module Ownership

### Database

Primary file:

- `db/schema.ts`

Supporting files:

- `db/relations.ts`
- `db/seed.ts`
- `drizzle.config.ts`

Production database:

- Supabase Postgres is the target database.
- `postgres` is the runtime driver through `drizzle-orm/postgres-js`.
- Create new migrations with `npm run db:generate`.
- Apply migrations to Supabase with `DATABASE_URL="<supabase pooled postgres url>" npm run db:migrate`.

V0 changes:

- add moderation and visibility fields to posts
- add post reports
- add post events
- optionally add saved posts

### API

Primary files:

- `api/router.ts`
- `api/posts-router.ts`
- `api/middleware.ts`

Recommended new files:

- `api/admin-router.ts`
- `api/admin-posts-router.ts`
- `api/admin-reports-router.ts`
- `api/crowd-review-router.ts`
- `api/moderation/auto-review.ts`
- `api/post-events.ts`
- `api/post-visibility.ts`

Rules:

- public procedures must never return pending, rejected, expired, or hidden posts
- admin procedures must use `adminQuery`
- crowd review procedures must require auth
- client event tracking must be allowlisted
- repeated lifecycle logic should live in small helper files

### Frontend

Primary files:

- `src/App.tsx`
- `src/pages/PositionsPage.tsx`
- `src/pages/CollaboratorsPage.tsx`
- `src/pages/SubmitPage.tsx`
- `src/components/DetailModal.tsx`

Recommended new files:

- `src/pages/AdminPage.tsx`
- `src/pages/CrowdReviewPage.tsx`
- `src/components/admin/AdminPostQueue.tsx`
- `src/components/admin/AdminPostReviewPanel.tsx`
- `src/components/admin/AdminReportsPanel.tsx`
- `src/lib/events.ts`

Rules:

- keep backend as permission source of truth
- use URL params for shareable filter state where practical
- do not block source clicks on analytics failures
- show moderation/freshness metadata in detail view when available

## Data Lifecycle Rules

### Submission

New user-submitted post:

```txt
if high-confidence academic source:
  moderationStatus = approved
  visibilityStatus = active
  verifiedStatus = source_checked
elif obvious spam:
  moderationStatus = rejected
  visibilityStatus = hidden
  verifiedStatus = unverified
else:
  moderationStatus = pending
  visibilityStatus = hidden
  verifiedStatus = unverified
submittedAt = now
postedBy = current user
```

Every submission writes a `moderationReviews` row with the automatic decision, confidence, and reasons.

When `OPENAI_API_KEY` is configured, submission review first calls the OpenAI Responses API with structured JSON output. The returned decision is stored as reviewer type `ai`. If the key is missing or the API request fails, the backend falls back to deterministic heuristic review and stores reviewer type `heuristic`.

### Crowd Consensus

Uncertain posts enter `/review` for signed-in users. A crowd vote creates a `crowdVotes` row and a `crowd_vote_created` event.

Consensus rule:

```txt
minimum total weight = 4
approve threshold = 75%
reject threshold = 75%
```

Approval by crowd:

```txt
moderationStatus = approved
visibilityStatus = active
verifiedStatus = source_checked
approvedAt = now
lastReviewedAt = now
```

Rejection by crowd:

```txt
moderationStatus = rejected
visibilityStatus = hidden
rejectionReason = Crowd consensus rejected
lastReviewedAt = now
```

If consensus is not reached, keep the post pending for more votes or admin fallback.

### Approval

Admin-approved post:

```txt
moderationStatus = approved
visibilityStatus = active
approvedAt = now
approvedBy = admin user id
lastReviewedAt = now
```

### Rejection

Admin-rejected post:

```txt
moderationStatus = rejected
visibilityStatus = hidden
rejectedAt = now
rejectedBy = admin user id
rejectionReason = supplied reason
lastReviewedAt = now
```

### Expiry

Expired post:

```txt
visibilityStatus = expired
lastReviewedAt = now
```

The post can remain `moderationStatus = approved`, because the content was valid but no longer active.

## Public Visibility Contract

Every public post read must enforce:

```txt
moderationStatus = approved
visibilityStatus = active
```

This applies to:

- home page feeds
- positions page
- collaborators page
- detail modal lookup
- future canonical post pages

## Admin Contract

Admin capabilities:

- see pending posts
- see rejected and expired posts
- approve posts
- reject posts with reason
- expire posts
- update normalized metadata
- see reports
- resolve or dismiss reports

Backend enforcement:

- all admin procedures use `adminQuery`

Frontend behavior:

- non-admin users should not see admin navigation
- if a non-admin opens `/admin`, show access denied or redirect

## Event Tracking Contract

Client-trackable events:

- detail_open
- source_click
- contact_click
- report_created
- search_performed
- zero_result_search

Server-only events:

- submit_created
- admin_approved
- admin_rejected
- admin_expired
- crowd_vote_created
- crowd_approved
- crowd_rejected
- report_resolved

Event payload:

```ts
{
  postId?: number;
  eventType: string;
  anonymousId?: string;
  metadata?: Record<string, unknown>;
}
```

Rules:

- reject unsupported event types
- keep metadata small
- never store secrets or full session details
- event capture failure should not break UI actions

## Error Handling

Public API:

- invalid filters return validation errors
- hidden posts return `null` or not found from public `getById`
- report creation returns success without exposing admin internals

Admin API:

- unauthorized users receive `FORBIDDEN`
- invalid transitions return clear errors
- missing posts return not found

Frontend:

- list pages show loading, empty, and error states
- admin actions show pending and failure states
- submit flow says "submitted for review" after success

## Testing Guidance

Start with API tests because they protect core product guarantees.

Recommended test file:

```txt
api/posts-router.test.ts
```

Test categories:

- visibility filtering
- create defaults
- admin transitions
- report lifecycle
- event recording
- auth enforcement

Manual QA checklist:

1. Submit a post as a normal user.
2. Confirm it does not appear publicly.
3. Approve it as admin.
4. Confirm it appears publicly.
5. Open detail from positions and collaborators pages.
6. Click original source.
7. Report stale.
8. Resolve report as admin.
9. Expire post.
10. Confirm expired post disappears from public feed.

## Deployment Readiness Checklist

Before public beta:

- moderation fields exist in production database
- existing posts are backfilled to approved active
- submit flow creates pending hidden posts
- admin can approve/reject/expire
- public list excludes non-public posts
- reports work
- source clicks are tracked
- README and product docs are current

## Known Constraints

- Current Vitest config is API-only.
- Current mock data does not include V0 lifecycle fields.
- Current repository is not initialized as git in this workspace.
- `npm run check` previously failed because `tsc` was unavailable in the workspace, likely due to missing installed dependencies.
