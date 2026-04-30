# PRD: V0 Operable MVP

## 1. Executive Summary

We are building the V0 Operable MVP for OpenPosition: a trusted academic opportunity platform where users can discover approved academic positions and collaborator requests, inspect source-backed details, take meaningful next actions, and report quality issues. This release turns the current prototype into an operational system with moderation, trust signals, action tracking, and admin tooling.

## 2. Problem Statement

### Who Has This Problem?

Opportunity seekers:

- prospective PhD applicants
- research interns
- postdoc candidates
- research assistants
- researchers looking for collaborators

Opportunity posters:

- professors
- lab managers
- researchers
- research organizations
- community members reposting opportunities

Operators:

- moderators
- product/admin team

### What Is The Problem?

The current product can display posts, but it does not yet support a trustworthy platform loop.

Specific issues:

- submissions publish directly instead of entering review
- public posts lack review/freshness signals
- detail views are not fully wired from list rows
- apply/contact actions do not create measurable outcomes
- users cannot report stale, duplicate, or suspicious posts
- admins have no UI to review or manage posts
- product cannot measure whether users find value

### Why Is It Painful?

For seekers:

- they waste time checking stale or duplicated posts
- they do not know whether a post is worth acting on
- they cannot easily save, compare, or track opportunities

For posters:

- their posts may not reach relevant users
- they cannot easily update or close postings
- they get repeated low-context inquiries

For operators:

- quality control cannot scale from code or database edits
- content trust will degrade as volume increases
- the team cannot learn from user behavior without event tracking

## 3. Target Users

### Primary Persona: Opportunity Seeker

Job to be done:

When I am looking for a research opportunity, I want to find credible and relevant posts quickly, so I can decide whether to apply, contact, save, or ignore.

### Secondary Persona: Opportunity Poster

Job to be done:

When I have a research position or collaboration request, I want to publish it to a relevant academic audience and keep it updated, so I can reach qualified candidates with less repeated work.

### Internal Persona: Moderator

Job to be done:

When new content enters the platform, I want to review, improve, approve, reject, expire, or merge it quickly, so public feeds stay trustworthy.

## 4. Strategic Context

OpenPosition's first strategic risk is trust, not traffic.

If the product grows before moderation and freshness exist, users may see stale or low-quality content and fail to return. V0 should therefore prioritize a small, trusted operating loop over broad automation.

This release supports the product strategy by creating:

- a public feed of approved posts
- a submission-to-review workflow
- visible source and freshness signals
- measurable user actions
- admin operations

## 5. Solution Overview

V0 introduces a trust-and-action loop.

New submissions will no longer publish directly. They enter a pending review state. Admins review submissions, edit metadata when needed, then approve or reject them. Public users only see approved, non-expired posts. Detail views expose the original source, freshness/review signals, and clear next actions. Users can report stale, duplicate, or suspicious posts. The system records core events such as detail opens and source clicks.

This release is intentionally human-in-the-loop. Automation can assist later, but V0 should make manual operations clean, fast, and measurable.

## 6. Success Metrics

### Primary Metric

Weekly effective opportunity connections.

Initial measurable proxy:

- detail view to source click-through rate

Target:

- source click-through rate from detail view above 25%

### Secondary Metrics

- median submission-to-approval time under 24 hours
- 90% of public posts have original source URL
- 80% of approved posts have complete core metadata
- stale/duplicate reports resolved within 72 hours
- zero-result search rate tracked

### Guardrail Metrics

- public rejected posts: 0
- spam posts approved: 0 known cases
- source URL missing on approved posts: below 10%
- admin review error rate remains low enough for manual operation

## 7. Requirements

### Epic 1: Moderation Workflow

Hypothesis:

We believe that adding a moderation workflow will increase trust and quality because only reviewed posts will appear publicly.

Requirements:

- New submitted posts default to pending.
- Public list endpoints return approved, non-expired posts by default.
- Admin users can view pending posts.
- Admin users can approve, reject, expire, and edit metadata.
- Rejected posts store a reason.
- Approved posts store approval timestamp and approver.

Acceptance criteria:

- A non-admin user submission does not immediately appear in public feeds.
- An admin can approve a pending post and make it appear publicly.
- An admin can reject a pending post and keep it hidden.
- Expired posts do not appear in default public feeds.

### Epic 2: Detail and Action Loop

Hypothesis:

We believe that a complete detail and action experience will increase effective opportunity connections because users can inspect, trust, and act on posts.

Requirements:

- Clicking a post title opens the detail modal or canonical detail page.
- Detail view shows title, source, poster, institution, original text, tags, deadline, status, review/freshness metadata.
- Primary action opens original source or contact/application path.
- Source clicks are tracked.
- Detail opens are tracked.

Acceptance criteria:

- Position and collaborator list rows open detail.
- Detail primary action works for both position and collaborator posts.
- Detail open event is recorded.
- Source click event is recorded.

### Epic 3: Reporting and Freshness

Hypothesis:

We believe that user reporting will keep content fresher because the community can flag stale, duplicate, or suspicious posts.

Requirements:

- Users can report a post as stale, duplicate, suspicious, or other.
- Reports are visible to admins.
- Admins can resolve reports.
- Posts show last reviewed or last checked timestamp.

Acceptance criteria:

- A report creates a record associated with a post.
- Admin can see unresolved reports.
- Admin can mark a report resolved.
- A post can be marked expired based on report review.

### Epic 4: Discovery Foundation

Hypothesis:

We believe that better filtering will increase relevant post discovery because users can narrow feeds by academic workflow criteria.

Requirements:

- Add filters for post type, role type, collaboration domain, source, institution, status, deadline, and topic/tag.
- Header search should support positions and collaborators.
- No-results state should capture the search/filter context.
- Public list should sort by freshness by default.

Acceptance criteria:

- A user can filter positions by role type and source.
- A user can filter collaborators by collaboration domain and source.
- Header search does not falsely imply collaborator search while only routing to positions.
- No-results state is understandable and actionable.

### Epic 5: Measurement Foundation

Hypothesis:

We believe that product event tracking will help prioritize future work because we can see which discovery and action paths create value.

Requirements:

- Track detail_open.
- Track source_click.
- Track report_created.
- Track submit_created.
- Track admin_approved and admin_rejected.
- Track search_performed and zero_result_search.

Acceptance criteria:

- Events include event type, post ID when relevant, user ID when available, anonymous session ID when not, metadata, and timestamp.
- Events can be queried for weekly counts.
- No personally sensitive metadata is required for V0 analytics.

## 8. Out of Scope

Not included in V0:

- fully automated social media scraping
- personalized recommendations
- email alert automation
- in-platform messaging
- payments or monetization
- complex user profiles
- reputation scoring
- mobile app

Reason:

These features depend on trusted content, action tracking, and operational workflows. Building them first would increase complexity before core product risk is reduced.

## 9. Dependencies

Technical dependencies:

- database migration for moderation, reporting, and event tables
- tRPC admin procedures
- authenticated user context
- public list filtering changes
- basic admin route protection

Operational dependencies:

- at least one admin user configured
- moderation policy
- rejection reason taxonomy
- freshness policy for deadlines and stale reports

Product dependencies:

- clear public copy explaining reviewed posts
- clear submission expectations
- consistent post metadata requirements

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Moderation slows supply | Fewer public posts | Start with lightweight review and clear required fields |
| Admin tooling is underbuilt | Ops still edits database | Ship minimal queue before scaling submissions |
| Reports get ignored | Trust declines | Add unresolved reports queue and resolution timestamp |
| Event tracking becomes invasive | Privacy concern | Track product actions only; avoid sensitive content |
| Search quality remains poor | Users fail to find posts | Use logged zero-result searches to improve filters and taxonomy |

## 11. Open Questions

1. Should imported posts and user-submitted posts have separate review paths?
2. Should contact email be public, hidden behind action, or avoided entirely in favor of original source?
3. What is the minimum evidence required to mark a post verified?
4. How long after deadline should a post remain searchable?
5. Should users need login to report content, or should anonymous reports be allowed with rate limits?
