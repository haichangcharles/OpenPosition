# Implementation Plan

## Goal

Turn the current OpenPosition prototype into the V0 Operable MVP described in [PRD: V0 Operable MVP](./prd-v0-operational-mvp.md).

This plan is written for engineering execution. It assumes the current stack:

- React + Vite + TypeScript
- Hono server
- tRPC
- Drizzle ORM
- MySQL
- Google auth and session cookies

## Implementation Principles

1. Keep V0 human-in-the-loop.
2. Add durable data model primitives before UI polish.
3. Public feeds should default to safe content: approved and non-expired.
4. Separate opportunity status from moderation status.
5. Measure core actions before building recommendations or alerts.
6. Avoid large refactors while stabilizing the product loop.

## Current Architecture Snapshot

Relevant existing files:

- `src/App.tsx`: route registration
- `src/pages/HomePage.tsx`: home feed
- `src/pages/PositionsPage.tsx`: position list
- `src/pages/CollaboratorsPage.tsx`: collaborator list
- `src/pages/SubmitPage.tsx`: submission form
- `src/components/DetailModal.tsx`: detail experience
- `api/posts-router.ts`: post list/create/delete procedures
- `api/auth-router.ts`: auth state and logout
- `api/middleware.ts`: public, authed, admin procedure helpers
- `db/schema.ts`: users and posts schema
- `src/data/mockData.ts`: fallback mock data

## Phase 1: Data Model Foundation

### Posts Table Changes

Add fields that separate moderation from opportunity lifecycle.

Recommended additions:

```ts
moderationStatus: enum("pending", "approved", "rejected")
visibilityStatus: enum("active", "expired", "hidden")
verifiedStatus: enum("unverified", "source_checked", "poster_verified")
submittedAt: timestamp
approvedAt: timestamp nullable
approvedBy: bigint nullable
rejectedAt: timestamp nullable
rejectedBy: bigint nullable
rejectionReason: text nullable
lastReviewedAt: timestamp nullable
lastSourceCheckedAt: timestamp nullable
canonicalUrl: varchar nullable
sourceHash: varchar nullable
```

Why:

- Current `status` mixes opportunity state with project state.
- Moderation needs its own field.
- Public visibility needs its own field.
- Freshness and verification need explicit timestamps.

### New Table: Post Reports

Purpose:

Capture community quality signals.

Fields:

```ts
id
postId
reporterUserId nullable
type enum("stale", "duplicate", "suspicious", "wrong_metadata", "other")
message text nullable
status enum("open", "resolved", "dismissed")
resolvedBy nullable
resolvedAt nullable
createdAt
updatedAt
```

### New Table: Post Events

Purpose:

Measure effective opportunity connections.

Fields:

```ts
id
postId nullable
userId nullable
anonymousId nullable
eventType enum(
  "detail_open",
  "source_click",
  "contact_click",
  "save",
  "unsave",
  "report_created",
  "submit_created",
  "admin_approved",
  "admin_rejected",
  "search_performed",
  "zero_result_search"
)
metadata json nullable
createdAt
```

### New Table: Saved Posts

Can be Phase 2 if needed, but the schema is straightforward.

Fields:

```ts
id
userId
postId
createdAt
unique(userId, postId)
```

### Optional Later Tables

Do not block V0 on these:

- `topics`
- `post_topics`
- `sources`
- `post_claims`
- `saved_searches`
- `email_subscriptions`

## Phase 2: API Foundation

### Public Posts API

Update `posts.list`:

- return only `moderationStatus = approved`
- return only `visibilityStatus = active`
- support filters:
  - `type`
  - `positionType`
  - `domain`
  - `source`
  - `institution`
  - `status`
  - `deadlineBefore`
  - `deadlineAfter`
  - `search`
  - `tag`

Update `posts.getById`:

- public users can only fetch approved active posts
- admins can fetch any post through admin procedure

### Authenticated Posts API

Update `posts.create`:

- default to `moderationStatus = pending`
- default to `visibilityStatus = hidden` or equivalent
- set `submittedAt`
- set `postedBy`
- record `submit_created` event

Add:

- `posts.report`
- `posts.trackEvent`
- `posts.save`
- `posts.unsave`

Save can be deferred if V0 scope needs to stay smaller.

### Admin API

Create an `adminPostsRouter` or admin procedures inside `postsRouter`.

Recommended procedures:

- `admin.posts.listPending`
- `admin.posts.listReports`
- `admin.posts.getById`
- `admin.posts.approve`
- `admin.posts.reject`
- `admin.posts.expire`
- `admin.posts.restore`
- `admin.posts.updateMetadata`
- `admin.posts.resolveReport`

Acceptance:

- all admin procedures use `adminQuery`
- owner/admin role is enforced server-side
- public procedures never leak pending/rejected content

## Phase 3: UI Foundation

### Detail and Action Loop

Files:

- `src/pages/PositionsPage.tsx`
- `src/pages/CollaboratorsPage.tsx`
- `src/components/DetailModal.tsx`

Changes:

- replace placeholder `onClick={() => { /* open modal */ }}` with selected post state
- close modal by clearing selected post and URL param if used
- track detail open when a post is opened
- track source click when original source is clicked
- make primary action explicit:
  - positions: "Open Application Source"
  - collaborators: "Open Contact Source"
- show review/freshness metadata:
  - approved date
  - last reviewed
  - source checked
  - deadline

### Submit Flow

Files:

- `src/pages/SubmitPage.tsx`
- `api/posts-router.ts`

Changes:

- success copy should say "submitted for review" instead of "published"
- show pending state after submit
- prevent source URL from being optional if public post quality depends on it
- distinguish contact email from affiliation; current form maps `authorAffiliation` to contact email in one section, which conflicts with schema naming

### Admin UI

Add route:

- `/admin`

Add pages/components:

- `src/pages/AdminPage.tsx`
- `src/components/admin/AdminPostReviewPanel.tsx`
- `src/components/admin/AdminReportsPanel.tsx`

Initial admin screen:

- tabs: Pending Posts, Reports, Expired/Rejected
- list pending posts
- detail pane with original text and metadata
- actions: approve, reject, edit metadata, mark duplicate, expire

Route protection:

- frontend hides route for non-admin users
- backend remains source of truth through `adminQuery`

### Discovery Filters

Files:

- `src/pages/PositionsPage.tsx`
- `src/pages/CollaboratorsPage.tsx`
- existing or new filter component

Changes:

- preserve filters in URL query params
- add source filter
- add deadline filter
- add institution filter
- add topic/tag filter
- ensure header search supports both positions and collaborators or label it honestly

## Phase 4: Measurement

### Event Capture

Create a lightweight client helper:

- `src/lib/events.ts`

Behavior:

- calls `trpc.posts.trackEvent`
- includes anonymous ID from local storage when unauthenticated
- fails silently for analytics events so user actions are not blocked

Track:

- detail open
- original source click
- contact/apply click
- search performed
- zero-result search
- report created

Admin events should be recorded server-side:

- approve
- reject
- expire
- resolve report

### Initial Product Dashboard

V0 can start with API-level query or admin-only table. A full chart dashboard is not required.

Minimum queries:

- events per week by type
- source clicks by post
- approval time by post
- open reports count
- zero-result searches

## Phase 5: Content Operations

### Moderation Policy

Document and implement a simple decision framework:

Approve if:

- opportunity is academic/research related
- original source URL exists
- title and summary are understandable
- source is not obviously spam
- required metadata is sufficiently complete

Reject if:

- spam
- non-academic job
- missing source
- unsafe or misleading content
- duplicate of existing approved post

Expire if:

- deadline passed and no evidence of continued availability
- source indicates position is closed
- poster requests closure
- repeated stale reports are confirmed

### Source Quality

V0 source quality levels:

- original social/source post
- lab/institution page
- repost with credible source
- unverified community submission

Only show "verified" when source is checked or poster is verified. Do not imply verified status for all approved posts.

## Suggested Build Order

### Slice 1: Moderation Data and API

1. Add schema fields and migration.
2. Update create/list behavior.
3. Add admin approve/reject/expire procedures.
4. Update seed/mock data to approved active.
5. Add router tests for visibility rules.

### Slice 2: Admin Review UI

1. Add `/admin` route.
2. Build pending queue.
3. Build approve/reject actions.
4. Add basic metadata edit.
5. Add loading/error states.

### Slice 3: Detail and Events

1. Fix list row click to open detail.
2. Track detail open.
3. Track source click.
4. Update CTA labels.
5. Show freshness/review metadata.

### Slice 4: Reporting

1. Add reports table.
2. Add report procedure.
3. Add report UI in detail modal.
4. Add admin reports tab.
5. Add resolve/dismiss actions.

### Slice 5: Discovery

1. Add source and status filters.
2. Add deadline filter.
3. Add tag/topic filtering.
4. Log zero-result searches.
5. Improve no-results state.

## Testing Strategy

### API Tests

Add tests for:

- submitted post defaults to pending
- public list excludes pending/rejected/expired posts
- admin list includes pending posts
- approve makes post public
- reject keeps post hidden
- report creates open report
- unauthorized user cannot call admin procedures

### UI Tests

Add tests for:

- positions list opens detail
- collaborators list opens detail
- source click CTA renders correct href
- submit success says pending review
- non-admin user cannot access admin page

### Manual QA

Run through:

1. Login.
2. Submit a position.
3. Confirm it is not public.
4. Login as admin.
5. Approve the post.
6. Confirm it appears publicly.
7. Open detail.
8. Click original source.
9. Report stale.
10. Resolve report as admin.

## Rollout Plan

### Internal Alpha

Audience:

- project owner
- 2-3 trusted academic users

Goal:

- validate submission and moderation workflow
- seed 20-50 high-quality posts manually

### Community Beta

Audience:

- one focused academic community, such as AI/ML PhD and research internship seekers

Goal:

- measure search, detail opens, source clicks, and reports
- learn which metadata matters most

### Public MVP

Audience:

- broader academic users

Prerequisites:

- moderation queue stable
- stale report workflow stable
- at least 100 approved active posts
- source click tracking works
- privacy and terms copy exists

## Future Implementation Notes

### Automated Ingestion

Do not scrape directly into public feeds.

Preferred pipeline:

1. source candidate collected
2. candidate normalized
3. duplicate check
4. admin review
5. approved public post

### Recommendations

Do not build recommendations until enough event data exists.

Minimum signal needed:

- source clicks
- saves
- searches
- topics
- institutions
- user subscriptions

### Search Architecture

Start with MySQL filters and text search. Move to dedicated search only after:

- post count grows
- topic taxonomy stabilizes
- search latency or relevance becomes a real issue

Potential later choices:

- Meilisearch
- Typesense
- OpenSearch
- hosted search provider

## Definition of Done for V0

V0 is done when:

- public feeds only show approved active posts
- new submissions require review
- admin can approve/reject/expire without database edits
- detail view opens correctly from lists
- source/contact action works
- detail opens and source clicks are tracked
- users can report stale/duplicate/suspicious posts
- admin can resolve reports
- product docs explain strategy, roadmap, PRD, and implementation plan
