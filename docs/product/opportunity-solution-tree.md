# Opportunity Solution Tree

## Desired Outcome

Increase weekly effective opportunity connections.

Target definition:

An effective opportunity connection occurs when a user finds a relevant academic opportunity and takes a meaningful action: open original source, save, contact, share, subscribe, apply externally, or submit a high-quality post.

Why this outcome matters:

- It measures user value more directly than raw post count.
- It connects discovery quality, trust, and actionability.
- It creates a useful loop for both seekers and posters.

## Opportunity Map

### Opportunity 1: Users Cannot Reliably Find Relevant Opportunities

Problem:

Opportunity seekers need to search across role type, research topic, institution, location, deadline, funding, and source. Current discovery is mostly keyword search plus a small set of tabs.

Evidence from current product:

- `positions` and `collaborators` pages only expose simple search and tab filters.
- Tags are stored as comma-separated text, which limits structured filtering.
- Header search always routes to positions, even though the placeholder says it searches positions and collaborators.

Potential solutions:

1. Add structured filters for role type, topic, source, institution, location, status, and deadline.
2. Convert tags into normalized topics and aliases.
3. Add saved search and keyword subscriptions.
4. Add institution and topic landing pages for discovery and SEO.

Candidate experiments:

- Prototype advanced filters with current data and measure search-to-detail-open rate.
- Track zero-result searches and use them to refine taxonomy.
- Launch manual weekly digest for 20 users before building automated alerts.

### Opportunity 2: Users Do Not Know Which Posts Are Trustworthy or Current

Problem:

Academic opportunities are high-stakes. Users need to know whether a post is real, fresh, duplicated, expired, or still open.

Evidence from current product:

- About page says moderators review submissions.
- `posts.create` currently publishes directly.
- No review status, verification status, report flow, or moderation log exists.
- Deadlines are stored but not used for automatic expiry or warning.

Potential solutions:

1. Add moderation workflow: pending, approved, rejected, expired.
2. Add verification/freshness metadata: source checked at, verified by, last reviewed at.
3. Add report stale / report duplicate / report suspicious actions.
4. Add duplicate detection based on normalized source URL, title, institution, and text similarity.

Candidate experiments:

- Manually review all new submissions for two weeks and measure time to approve.
- Add "last checked" and "report stale" UI, then monitor stale reports.
- Run a simple duplicate warning in admin before approving posts.

### Opportunity 3: Users Find Posts But Do Not Complete the Next Action

Problem:

The product currently shows opportunities, but it does not strongly support the user's next step: contact, save, apply, track, or share.

Evidence from current product:

- Detail modal exists, but list title click handlers are placeholders in positions and collaborators pages.
- `Apply / Contact` and `Get in Touch` buttons are not wired to a real action.
- No save, tracking, or alert model exists.

Potential solutions:

1. Wire detail opening and source click actions.
2. Add save/bookmark and a saved opportunities page.
3. Add contact/apply action model that opens the source or reveals contact instructions.
4. Add share links and lightweight application tracking states.

Candidate experiments:

- Wire source clicks and measure original-source CTR.
- Add save button and measure saved-post revisit rate.
- Add "I applied/contacted" action and test whether users return to track status.

### Opportunity 4: Posters Need a Better Way to Publish and Maintain Opportunities

Problem:

Posters need reach, clarity, and control. If they cannot claim, edit, close, or share posts, OpenPosition remains a passive aggregator rather than a useful publishing tool.

Evidence from current product:

- Authenticated submission exists.
- Posts have `postedBy`, but there is no owner dashboard or edit flow.
- Status exists in schema, but posters cannot update it.

Potential solutions:

1. Add submitter dashboard: submitted, pending, approved, rejected, expired.
2. Add edit and close actions for post owners.
3. Add claim flow for imported posts.
4. Generate share cards and canonical post URLs.

Candidate experiments:

- Invite 10 professors/researchers to submit posts and observe friction.
- Offer manual claim/edit support before building a self-serve flow.
- Test whether share cards increase inbound traffic from X/LinkedIn/Xiaohongshu.

## Recommended First POC

### POC: Operable Content Trust Loop

Selected opportunity:

Users do not know which posts are trustworthy or current.

Solution:

Build the smallest complete moderation and action loop:

- submitted posts enter `pending`
- admin approves/rejects
- approved posts appear publicly
- users can open detail, open original source, and report stale/duplicate/suspicious posts
- admin can mark posts expired or rejected
- basic events track detail opens and source clicks

Hypothesis:

If OpenPosition ships a visible trust and moderation loop, then users will be more likely to act on opportunities because they can see that posts are reviewed, current, and source-backed.

Success criteria:

- 90% of public posts are approved and have original source URL.
- Median submission-to-approval time is under 24 hours during MVP operations.
- Source click-through rate from detail view exceeds 25%.
- Stale/duplicate reports are resolved within 72 hours.

Why this POC:

- It addresses the biggest platform risk: trust.
- It uses the existing data model and auth foundation.
- It creates a foundation for search, alerts, automation, and growth.
- It is operable manually before building complex automation.

## POC Scope

In scope:

- moderation status
- admin review queue
- detail modal interaction
- source click tracking
- report stale/duplicate/suspicious
- basic admin actions

Out of scope:

- full scraping automation
- in-platform messaging
- recommendation algorithms
- payments
- public user profiles
- complex reputation system

## Next Learning Questions

1. Which source channels produce the highest-quality opportunities?
2. What fields are most important for users before they act?
3. How much moderation effort does each post require?
4. Do users trust a post more when review and freshness are visible?
5. Will posters maintain their posts if given a simple owner dashboard?
