# OpenPosition Product Strategy

## Executive Summary

OpenPosition should become a trusted academic opportunity discovery network. The product aggregates academic positions and research collaboration requests from fragmented channels such as LinkedIn, X/Twitter, Xiaohongshu, personal pages, and community posts, then turns them into searchable, structured, and actionable opportunities.

The product should not compete as a generic job board. Its wedge is academic specificity: PhD openings, research internships, postdocs, research assistant roles, co-author requests, short-term projects, and long-term collaboration opportunities. The key customer value is not "more listings"; it is reducing the time and uncertainty required to find relevant, real, current academic opportunities.

## Positioning

For researchers, students, and professors who depend on fragmented social media posts to discover academic opportunities, OpenPosition is a trusted academic opportunity index that centralizes, structures, verifies, and keeps opportunities actionable. Unlike generic job boards or raw social feeds, OpenPosition is built around academic workflows, research topics, source transparency, and community trust.

## Product Category

Trusted academic opportunity discovery platform.

This category matters because the product must balance three jobs:

- Discovery: help users find relevant opportunities.
- Trust: help users know whether opportunities are real, current, and worth acting on.
- Action: help users contact, save, apply, share, or submit opportunities.

## Target Users

### Primary User: Opportunity Seeker

Examples:

- prospective PhD applicant
- master's student looking for research internship
- PhD student looking for visiting opportunity or co-author project
- postdoc candidate
- early-career researcher looking for collaborations

Goals:

- find relevant academic opportunities quickly
- understand whether an opportunity is active and credible
- compare opportunities across institutions, locations, deadlines, and research areas
- track opportunities before applying or contacting

Pain points:

- opportunities are scattered across social feeds
- search is noisy and platform-specific
- posts expire silently
- duplicate posts waste time
- source credibility is unclear
- deadlines and requirements are often buried in unstructured text

### Secondary User: Opportunity Poster

Examples:

- professor recruiting PhD students
- lab manager hiring research assistants
- research scientist recruiting interns
- researcher looking for collaborators or co-authors
- student representative reposting an opportunity

Goals:

- reach relevant candidates beyond their own social graph
- publish opportunities with minimal extra work
- keep posts updated or closed
- show credibility and affiliation
- understand whether the post is getting attention

Pain points:

- social posts disappear quickly
- repeated posting is inefficient
- candidates ask the same clarification questions
- no structured way to update status
- no feedback loop on reach or engagement

### Tertiary User: Moderator / Operator

Goals:

- keep content high quality
- prevent spam and fake opportunities
- deduplicate repeated posts
- mark stale opportunities expired
- correct metadata
- keep the platform credible with low operational overhead

Pain points:

- manual review can become expensive
- source verification is inconsistent
- no tooling means moderation happens in the database or code
- bad content can damage trust quickly

## Core Customer Problems

### Problem 1: Fragmented Discovery

Academic opportunities are posted on personal social accounts, lab pages, group chats, newsletters, and community forums. Users must search across platforms, often with incomplete or inconsistent metadata.

### Problem 2: Low Trust and High Verification Cost

Users need to know whether a post is real, active, relevant, and safe to act on. Raw social posts do not consistently expose status, deadline, original source, institution, or verification signals.

### Problem 3: Weak Action Loop

Finding a listing is not the end of the workflow. Users need to save, compare, open source, contact, apply, subscribe, or share. The current product surface does not yet close this loop.

### Problem 4: Content Quality Operations

The product promises moderator review, but the current implementation directly publishes submissions. Without moderation and lifecycle tooling, the platform risks stale, duplicated, or low-quality content.

## Product Principles

### 1. Source Transparency Over Black-Box Aggregation

Every post should show where it came from, who posted it, when it was last checked, and how users can verify it.

### 2. Structured Enough to Search, Flexible Enough to Submit

Academic posts vary widely. The product should capture structured fields for discovery while preserving original text and source context.

### 3. Trust Before Scale

Automated scraping and large volume are less important than a small set of reliable, current, high-signal posts.

### 4. Actionability Is the Product

The user should always know the next action: open source, contact, save, apply, subscribe, report, or share.

### 5. Community Operations Must Be First-Class

Admin and moderator workflows are not internal afterthoughts. They are core product infrastructure.

## Product Metrics

### North Star

Weekly effective opportunity connections.

An opportunity connection is counted when a user takes a meaningful action from a relevant post:

- opens original source
- saves the post
- contacts poster
- shares the post
- subscribes to similar opportunities
- submits a post that passes moderation

### Supply Metrics

- active approved posts
- new approved posts per week
- post approval rate
- duplicate rate
- expired/stale post rate
- median time from submission to approval

### Discovery Metrics

- search-to-click rate
- filter usage rate
- zero-result search rate
- source click-through rate
- detail open rate
- saved post rate

### Trust Metrics

- verified source coverage
- reported post rate
- report resolution time
- stale post reports
- posts with complete metadata

### Retention Metrics

- weekly returning users
- subscription creation rate
- alert email open/click rate
- saved-post revisit rate

## Current Product Gap Summary

| Area | Current State | Gap |
|---|---|---|
| Content | Mock/seed posts and basic list API | No real supply pipeline, review, dedupe, or expiry |
| Trust | Source URL and status fields | No verification, reports, moderation log, or freshness signal |
| Discovery | Search and category tabs | Limited filters, no topic taxonomy, no saved searches |
| Action | Detail modal and original URL exist | Detail click not fully wired; apply/contact not real |
| Submission | Authenticated create API | Direct publish; no review workflow |
| Operations | Admin role exists | No admin dashboard |
| Measurement | No event model | Cannot measure effective connections |

## Strategic Bet

The first durable advantage should be trusted, structured academic opportunity data. Once this exists, the product can expand into alerts, recommendations, newsletters, institution pages, and eventually automated ingestion.

Do not start with broad automation. Start with a trustworthy human-in-the-loop operating loop.
