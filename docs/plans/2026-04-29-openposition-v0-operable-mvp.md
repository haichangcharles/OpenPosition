# OpenPosition V0 Operable MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the V0 trusted-content loop: submitted posts enter review, public feeds show only approved active posts, admins can moderate content, users can act on and report posts, and core events are tracked.

**Architecture:** Add explicit post lifecycle fields and new report/event tables in Drizzle. Enforce visibility in tRPC routers, add admin-only procedures through the existing `adminQuery` middleware, then wire React pages to the new API. Keep V0 human-in-the-loop and avoid automated ingestion until moderation is stable.

**Tech Stack:** React, TypeScript, Vite, React Router, React Query, tRPC, Hono, Drizzle ORM, MySQL, Vitest.

## Preflight

### Task 0: Install and Verify Tooling

**Files:**
- Read: `package.json`
- Read: `.env.example`

**Step 1: Install dependencies**

Run:

```bash
npm install
```

Expected:

- dependencies install successfully
- `node_modules/.bin/tsc` exists

**Step 2: Run current checks**

Run:

```bash
npm run check
npm run test
```

Expected:

- typecheck either passes or reports existing issues
- tests run with Vitest

**Step 3: Record baseline**

If checks fail before code changes, record the failure in `progress.md` before implementation.

## Phase 1: Data Model Foundation

### Task 1: Add Post Lifecycle Fields

**Files:**
- Modify: `db/schema.ts`
- Modify: `src/types/index.ts`
- Modify: `src/data/mockData.ts`

**Step 1: Add enums and fields to `posts`**

Add imports if needed:

```ts
import { index } from "drizzle-orm/mysql-core";
```

Add fields to `posts`:

```ts
moderationStatus: mysqlEnum("moderationStatus", [
  "pending",
  "approved",
  "rejected",
]).default("pending").notNull(),
visibilityStatus: mysqlEnum("visibilityStatus", [
  "active",
  "expired",
  "hidden",
]).default("hidden").notNull(),
verifiedStatus: mysqlEnum("verifiedStatus", [
  "unverified",
  "source_checked",
  "poster_verified",
]).default("unverified").notNull(),
submittedAt: timestamp("submittedAt").defaultNow().notNull(),
approvedAt: timestamp("approvedAt"),
approvedBy: bigint("approvedBy", { mode: "number", unsigned: true }),
rejectedAt: timestamp("rejectedAt"),
rejectedBy: bigint("rejectedBy", { mode: "number", unsigned: true }),
rejectionReason: text("rejectionReason"),
lastReviewedAt: timestamp("lastReviewedAt"),
lastSourceCheckedAt: timestamp("lastSourceCheckedAt"),
sourceHash: varchar("sourceHash", { length: 128 }),
```

**Step 2: Update frontend `Post` type**

Add the new fields to `src/types/index.ts`, using nullable types where matching the schema.

**Step 3: Update mock posts**

For every mock post in `src/data/mockData.ts`, set:

```ts
moderationStatus: "approved",
visibilityStatus: "active",
verifiedStatus: "source_checked",
submittedAt: new Date("2026-04-26"),
approvedAt: new Date("2026-04-26"),
approvedBy: null,
rejectedAt: null,
rejectedBy: null,
rejectionReason: null,
lastReviewedAt: new Date("2026-04-26"),
lastSourceCheckedAt: new Date("2026-04-26"),
sourceHash: null,
```

Use each post's existing `createdAt` date when practical.

**Step 4: Generate migration**

Run:

```bash
npm run db:generate
```

Expected:

- Drizzle creates a migration under `db/migrations`

**Step 5: Typecheck**

Run:

```bash
npm run check
```

Expected:

- no type errors from new fields

### Task 2: Add Reports and Events Tables

**Files:**
- Modify: `db/schema.ts`
- Modify: `db/relations.ts`
- Modify: `src/types/index.ts`

**Step 1: Add `postReports` table**

Add:

```ts
export const postReports = mysqlTable("postReports", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  reporterUserId: bigint("reporterUserId", { mode: "number", unsigned: true }),
  type: mysqlEnum("type", [
    "stale",
    "duplicate",
    "suspicious",
    "wrong_metadata",
    "other",
  ]).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["open", "resolved", "dismissed"])
    .default("open")
    .notNull(),
  resolvedBy: bigint("resolvedBy", { mode: "number", unsigned: true }),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});
```

**Step 2: Add `postEvents` table**

Add:

```ts
export const postEvents = mysqlTable("postEvents", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  anonymousId: varchar("anonymousId", { length: 128 }),
  eventType: mysqlEnum("eventType", [
    "detail_open",
    "source_click",
    "contact_click",
    "report_created",
    "submit_created",
    "admin_approved",
    "admin_rejected",
    "admin_expired",
    "report_resolved",
    "search_performed",
    "zero_result_search",
  ]).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
```

**Step 3: Export inferred types**

Add:

```ts
export type PostReport = typeof postReports.$inferSelect;
export type InsertPostReport = typeof postReports.$inferInsert;
export type PostEvent = typeof postEvents.$inferSelect;
export type InsertPostEvent = typeof postEvents.$inferInsert;
```

**Step 4: Generate migration**

Run:

```bash
npm run db:generate
```

Expected:

- migration includes new report and event tables

## Phase 2: API Foundation

### Task 3: Add Visibility and Event Helpers

**Files:**
- Create: `api/post-visibility.ts`
- Create: `api/post-events.ts`

**Step 1: Create visibility helper**

Create `api/post-visibility.ts`:

```ts
import { and, eq } from "drizzle-orm";
import { posts } from "@db/schema";

export function publicPostFilters() {
  return and(
    eq(posts.moderationStatus, "approved"),
    eq(posts.visibilityStatus, "active"),
  );
}
```

**Step 2: Create event helper**

Create `api/post-events.ts`:

```ts
import { postEvents } from "@db/schema";
import { getDb } from "./queries/connection";

type RecordPostEventInput = {
  postId?: number;
  userId?: number;
  anonymousId?: string;
  eventType: typeof postEvents.$inferInsert.eventType;
  metadata?: Record<string, unknown>;
};

export async function recordPostEvent(input: RecordPostEventInput) {
  await getDb().insert(postEvents).values({
    postId: input.postId,
    userId: input.userId,
    anonymousId: input.anonymousId,
    eventType: input.eventType,
    metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
  });
}
```

**Step 3: Typecheck**

Run:

```bash
npm run check
```

Expected:

- helpers compile

### Task 4: Update Public Post APIs

**Files:**
- Modify: `api/posts-router.ts`
- Test: `api/posts-router.test.ts`

**Step 1: Write visibility tests**

Create tests for:

- pending post is excluded from `posts.list`
- rejected post is excluded from `posts.list`
- expired post is excluded from `posts.list`
- approved active post is included

**Step 2: Run tests to verify failure**

Run:

```bash
npm run test -- api/posts-router.test.ts
```

Expected:

- tests fail because visibility filtering is not implemented

**Step 3: Apply public visibility filter**

In `posts.list`, combine existing filters with `publicPostFilters()`.

In `posts.getById`, require both ID and public visibility.

**Step 4: Update `create` defaults**

In `posts.create`, set:

```ts
moderationStatus: "pending",
visibilityStatus: "hidden",
verifiedStatus: "unverified",
submittedAt: new Date(),
postedBy: ctx.user.id,
```

Record `submit_created` event after insert.

**Step 5: Run tests**

Run:

```bash
npm run test -- api/posts-router.test.ts
npm run check
```

Expected:

- visibility tests pass
- typecheck passes

### Task 5: Add Report and Client Event APIs

**Files:**
- Modify: `api/posts-router.ts`
- Test: `api/posts-router.test.ts`

**Step 1: Add `report` mutation**

Input:

```ts
z.object({
  postId: z.number(),
  type: z.enum(["stale", "duplicate", "suspicious", "wrong_metadata", "other"]),
  message: z.string().max(1000).optional(),
})
```

Behavior:

- verify post exists and is public
- insert open report
- record `report_created`

**Step 2: Add `trackEvent` mutation**

Allow only:

- detail_open
- source_click
- contact_click
- search_performed
- zero_result_search

**Step 3: Add tests**

Test:

- report creates open report
- unsupported event type is rejected
- source click event is recorded

**Step 4: Run tests**

Run:

```bash
npm run test -- api/posts-router.test.ts
```

Expected:

- report and event tests pass

### Task 6: Add Admin Routers

**Files:**
- Create: `api/admin-router.ts`
- Create: `api/admin-posts-router.ts`
- Create: `api/admin-reports-router.ts`
- Modify: `api/router.ts`
- Test: `api/admin-router.test.ts`

**Step 1: Create admin posts procedures**

Procedures:

- `list`
- `approve`
- `reject`
- `expire`
- `updateMetadata`

All procedures use `adminQuery`.

**Step 2: Create admin reports procedures**

Procedures:

- `list`
- `resolve`
- `dismiss`

**Step 3: Register admin router**

In `api/router.ts`:

```ts
import { adminRouter } from "./admin-router";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  posts: postsRouter,
  admin: adminRouter,
});
```

**Step 4: Add auth tests**

Test:

- non-admin cannot approve
- admin can approve
- approve sets approved active and `approvedAt`
- reject sets rejected hidden and reason
- expire sets expired

**Step 5: Run tests**

Run:

```bash
npm run test -- api/admin-router.test.ts
npm run check
```

Expected:

- admin tests pass
- typecheck passes

## Phase 3: Frontend Foundation

### Task 7: Add Client Event Helper

**Files:**
- Create: `src/lib/events.ts`

**Step 1: Create anonymous ID helper**

Use local storage key:

```ts
openposition_anonymous_id
```

**Step 2: Create fire-and-forget event helper**

Expose:

```ts
trackPostEvent(event: {
  eventType: "detail_open" | "source_click" | "contact_click" | "search_performed" | "zero_result_search";
  postId?: number;
  metadata?: Record<string, unknown>;
}): void
```

**Step 3: Do not block UI**

Catch errors and avoid throwing from the helper.

### Task 8: Wire Detail Modal and Source Actions

**Files:**
- Modify: `src/pages/PositionsPage.tsx`
- Modify: `src/pages/CollaboratorsPage.tsx`
- Modify: `src/components/DetailModal.tsx`

**Step 1: Add selected post state**

Replace placeholder list title handlers with:

```tsx
const [selectedPost, setSelectedPost] = useState<Post | null>(selectedFromUrl);
```

**Step 2: Open detail on title click**

On click:

- set selected post
- track `detail_open`

**Step 3: Wire close**

Pass:

```tsx
<DetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
```

**Step 4: Wire source/contact CTA**

In `DetailModal`, when user clicks source or primary CTA:

- track `source_click` or `contact_click`
- open original URL

**Step 5: Manual QA**

Run:

```bash
npm run dev
```

Expected:

- clicking a position opens modal
- clicking a collaborator opens modal
- primary CTA opens original URL

### Task 9: Add Admin Page

**Files:**
- Create: `src/pages/AdminPage.tsx`
- Create: `src/components/admin/AdminPostQueue.tsx`
- Create: `src/components/admin/AdminPostReviewPanel.tsx`
- Create: `src/components/admin/AdminReportsPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Header.tsx`

**Step 1: Add route**

In `src/App.tsx`:

```tsx
<Route path="/admin" element={<AdminPage />} />
```

**Step 2: Add admin guard**

Use `useAuth()` and check:

```ts
user?.role === "admin"
```

**Step 3: Build pending queue**

Use:

```ts
trpc.admin.posts.list.useQuery({ moderationStatus: "pending" })
```

**Step 4: Build review panel**

Actions:

- approve
- reject with reason
- expire
- edit metadata if included in scope

**Step 5: Add admin nav**

Show `Admin` link in header only for admins.

**Step 6: Manual QA**

Expected:

- non-admin cannot use admin page
- admin can see pending posts
- approve/reject updates queue

### Task 10: Update Submit Copy and Behavior

**Files:**
- Modify: `src/pages/SubmitPage.tsx`

**Step 1: Update success copy**

Change "published" language to "submitted for review".

**Step 2: Make source URL required**

Keep `originalUrl` required in UI to match trust strategy.

**Step 3: Fix contact/affiliation naming**

Avoid using `authorAffiliation` as contact email. Either:

- relabel it as affiliation, or
- add a future `contactEmail` field in a later schema change.

For V0, prefer relabeling to avoid schema expansion.

**Step 4: Manual QA**

Expected:

- submit success states review, not publication
- missing URL blocks submit

## Phase 4: Reporting and Discovery

### Task 11: Add Report UI

**Files:**
- Modify: `src/components/DetailModal.tsx`

**Step 1: Add report action**

Add a small report control in the modal footer or secondary area.

**Step 2: Add report options**

Options:

- stale
- duplicate
- suspicious
- wrong metadata
- other

**Step 3: Call mutation**

Use:

```ts
trpc.posts.report.useMutation()
```

**Step 4: Show success state**

After report submission, show a small confirmation.

### Task 12: Add Discovery Filters

**Files:**
- Modify: `src/pages/PositionsPage.tsx`
- Modify: `src/pages/CollaboratorsPage.tsx`
- Optional create: `src/components/PostFilters.tsx`

**Step 1: Add source filter**

Support:

- LinkedIn
- X
- RedBook
- Other

**Step 2: Add deadline and tag filters**

Use query params for filter state.

**Step 3: Track search events**

When search/filter is executed:

- record `search_performed`
- if results length is zero, record `zero_result_search`

**Step 4: Manual QA**

Expected:

- filters change list results
- query params preserve state
- zero result state is clear

## Phase 5: Verification

### Task 13: Full Verification

**Files:**
- Review all changed files

**Step 1: Run checks**

Run:

```bash
npm run check
npm run test
npm run build
```

Expected:

- all pass

**Step 2: Manual QA flow**

Run:

```bash
npm run dev
```

Verify:

1. Submit post as normal user.
2. Confirm it is pending and not public.
3. Approve as admin.
4. Confirm it appears in public feed.
5. Open detail.
6. Click source.
7. Report stale.
8. Resolve report as admin.
9. Expire post.
10. Confirm it disappears from public feed.

**Step 3: Update docs if implementation differs**

Update:

- `docs/engineering/architecture.md`
- `docs/engineering/development-guide.md`
- `docs/product/implementation-plan.md`

**Step 4: Commit if repository is initialized**

Run:

```bash
git status --short
git add .
git commit -m "feat: build trusted content MVP foundation"
```

If this workspace is still not a git repository, skip commit and report changed files.

## Notes

- Do not build automated scraping in this plan.
- Do not build recommendations in this plan.
- Do not expose pending/rejected content through public procedures.
- Keep event tracking non-blocking.
- Keep admin permission checks server-side.
