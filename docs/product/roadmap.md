# OpenPosition Roadmap

## Roadmap Principle

OpenPosition should sequence work by product risk, not by feature excitement.

The biggest risks are:

1. Can we maintain high-quality academic opportunity supply?
2. Can users trust and act on posts?
3. Can operators keep the platform clean without unsustainable manual effort?
4. Can users return through alerts, saved searches, and recurring discovery?

## Now / Next / Later

### Now: Operable Trusted MVP

Goal:

Turn the current prototype into a small but real platform that can accept, review, publish, and measure academic opportunity posts.

Primary outcome:

Users can find a post, trust it enough to act, and the platform can measure that action.

Epics:

| Epic | Why It Matters | Success Signal |
|---|---|---|
| Wire detail and action loop | Users must be able to inspect and act on posts | Detail open and source click events exist |
| Moderation workflow | Public content needs trust and spam control | New submissions start pending and require approval |
| Admin review queue | Operators need tooling, not database edits | Admin can approve, reject, expire, edit metadata |
| Freshness and reporting | Stale posts damage trust | Users can report stale/duplicate/suspicious posts |
| Basic discovery upgrade | Current search is too shallow | Filters by type, source, topic, status, deadline |
| Measurement foundation | Product needs learning loops | Event model tracks core actions |
| Product documentation | Team needs shared source of truth | Docs under `docs/product/` stay current |

Recommended release name:

V0 Operable MVP.

### Next: Retention and Community Growth

Goal:

Make OpenPosition useful enough for recurring use and community sharing.

Primary outcome:

Users return because OpenPosition helps them monitor opportunities, not just browse once.

Epics:

| Epic | Why It Matters | Success Signal |
|---|---|---|
| Save/bookmark opportunities | Users need to track opportunities over time | Saved post rate and revisit rate increase |
| Saved searches and keyword alerts | Discovery is recurring | Users create subscriptions and click alerts |
| Public post pages | Posts need canonical URLs for sharing and SEO | Inbound traffic to post pages grows |
| Institution/topic pages | Academic discovery is naturally clustered | Search traffic and internal discovery improve |
| Poster dashboard | Posters should update and close their own posts | Post owners update status without admin help |
| Share cards | Social distribution is core to the market | Shares and referral traffic increase |
| Manual digest/newsletter | Validate alert value before automation | Digest click rate exceeds baseline |

### Later: Scalable Supply and Intelligence

Goal:

Increase supply and relevance without sacrificing trust.

Primary outcome:

The platform scales beyond manual curation while preserving quality.

Epics:

| Epic | Why It Matters | Success Signal |
|---|---|---|
| Semi-automated source ingestion | Manual sourcing will not scale forever | Imported candidates enter review queue |
| Duplicate detection | Aggregated content repeats across channels | Duplicate approval rate decreases |
| Topic normalization and aliases | Academic keywords are inconsistent | Better search recall and filter quality |
| Personalized recommendations | Users should see relevant opportunities earlier | Recommendation click-through beats generic feed |
| Claim imported post | Posters should control imported listings | Claimed posts get updated more often |
| Reputation and verified posters | Trust should become visible | Verified posts get higher action rates |
| API/RSS integrations | Researchers and communities use external tools | External integrations generate usage |

## Prioritization

### Highest Priority

1. Moderation status and admin review queue.
2. Detail/contact/source action loop.
3. Reporting and stale/expired workflow.
4. Measurement events.

Reason:

These four items create the minimum trusted marketplace loop. Without them, more traffic or more posts will amplify trust problems.

### Medium Priority

1. Advanced filters.
2. Save/bookmark.
3. Canonical public post pages.
4. Poster dashboard.

Reason:

These improve utility and retention, but they depend on public posts being reliable.

### Lower Priority for V0

1. Fully automated scraping.
2. Personal recommendations.
3. In-platform messaging.
4. Complex community profiles.

Reason:

These add complexity before the platform has enough verified supply and behavioral data.

## Release Slices

### Release 0.1: Trust Foundation

Scope:

- add moderation fields to post model
- create admin review APIs
- make submitted posts pending by default
- show only approved posts publicly
- add basic admin page
- wire approve/reject/expire

Ship criteria:

- admin can publish a submitted post without editing the database
- rejected posts do not appear publicly
- public list only shows approved non-expired posts

### Release 0.2: Action Foundation

Scope:

- fix detail modal opening from list rows
- wire source click and contact/apply action
- add post event tracking
- add report stale/duplicate/suspicious
- add freshness indicators in detail view

Ship criteria:

- source click-through rate can be measured
- reports reach admin queue
- users can understand when a post was last reviewed

### Release 0.3: Discovery Foundation

Scope:

- add filters for role, source, topic, deadline, institution, status
- improve header search across positions and collaborators
- add no-results feedback
- add topic normalization plan

Ship criteria:

- users can narrow a feed without changing URLs manually
- zero-result searches are logged
- common topics can be filtered consistently

### Release 0.4: Retention Foundation

Scope:

- save/bookmark posts
- saved posts page
- saved searches
- manual or simple email alerts

Ship criteria:

- users can return to saved opportunities
- users can subscribe to a topic or keyword
- alert clicks can be measured

## Product Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Content supply is too thin | Users do not return | Start with one domain/community, manually seed quality posts |
| Moderation load is too high | Ops becomes bottleneck | Build admin tools before scale; automate only repeated decisions |
| Posts become stale | Trust declines | Deadline expiry, stale reports, last checked timestamp |
| Search is noisy | Users fail to find value | Structured filters and topic taxonomy |
| Posters do not maintain posts | Status becomes unreliable | Owner dashboard and close/update nudges |

## What Not To Do Yet

- Do not build recommendations before action tracking exists.
- Do not automate large-scale scraping before moderation exists.
- Do not build messaging before the platform proves source-click and contact value.
- Do not optimize visual polish before the core loop works.
- Do not treat post count as the primary success metric.
