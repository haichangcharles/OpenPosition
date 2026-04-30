# OpenPosition Product Documentation

This folder is the product source of truth for OpenPosition.

OpenPosition is a trusted academic opportunity discovery platform. It helps researchers, students, professors, and research organizations discover, evaluate, publish, and act on academic positions and collaboration requests that are currently scattered across social platforms.

## Documents

| Document | Purpose |
|---|---|
| [Product Strategy](./product-strategy.md) | Positioning, users, problems, product principles, metrics |
| [Opportunity Solution Tree](./opportunity-solution-tree.md) | Outcome, opportunity areas, solution options, first POC |
| [Roadmap](./roadmap.md) | Now / Next / Later sequencing and prioritization |
| [V0 PRD](./prd-v0-operational-mvp.md) | Engineering-ready requirements for turning the prototype into an operable MVP |
| [Implementation Plan](./implementation-plan.md) | Data model, API, UI, operations, and rollout approach |

## Engineering Handoff

Engineering-facing docs live in [docs/engineering](../engineering/README.md).

Start with:

- [Technical Architecture](../engineering/architecture.md)
- [Development Guide](../engineering/development-guide.md)
- [Task-Level Implementation Plan](../plans/2026-04-29-openposition-v0-operable-mvp.md)

## Current Product Stage

The current codebase is an MVP prototype:

- It has the right product surface: home, positions, collaborators, submit, login, about.
- It has a usable technical foundation: React/Vite frontend, Hono/tRPC API, Drizzle/MySQL schema, auth hooks.
- It does not yet have the operating system needed for a real community platform: moderation, content quality, trust, user actions, notifications, and admin workflows.

## Working Thesis

The first product goal is not to maximize page count or feature breadth. The first goal is to make OpenPosition credible and useful for a small academic community.

The critical loop is:

1. High-quality opportunity appears on OpenPosition.
2. Researcher finds it through search, filters, subscriptions, or sharing.
3. Researcher trusts the post enough to act.
4. Researcher saves, opens source, contacts poster, applies, or shares.
5. Platform learns from that action and improves discovery.
6. Posters and community members submit more useful opportunities.

## North Star

Weekly effective opportunity connections.

An effective opportunity connection happens when a user reaches a relevant opportunity and takes a meaningful action:

- open original source
- save opportunity
- contact poster
- submit application externally
- subscribe to related updates
- share the opportunity

## First Release Bias

Prioritize:

- trust and moderation
- detail/contact action loop
- search and discovery quality
- admin operations
- measurement

Defer:

- fully automated scraping
- personalized recommendations
- complex social features
- in-platform messaging
- monetization
