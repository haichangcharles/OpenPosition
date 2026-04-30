# OpenPosition Engineering Docs

This folder translates the product strategy into engineering architecture and execution guidance.

## Documents

| Document | Purpose |
|---|---|
| [Architecture](./architecture.md) | System boundaries, data model, flows, module ownership |
| [Development Guide](./development-guide.md) | How to build the V0 Operable MVP in this codebase |
| [Source Ingestion Strategy](./ingestion-strategy.md) | How to move from fake data to compliant source collection |
| [Implementation Plan](../plans/2026-04-29-openposition-v0-operable-mvp.md) | Task-by-task execution plan |

## Product Inputs

Read these first:

- [Product Strategy](../product/product-strategy.md)
- [V0 PRD](../product/prd-v0-operational-mvp.md)
- [Product Implementation Plan](../product/implementation-plan.md)

## Engineering North Star

Make the platform operable before making it large.

The V0 system should guarantee:

1. Public feeds show only approved, active posts.
2. New submissions require review.
3. Admins can approve, reject, expire, and resolve reports without database edits.
4. Users can open details, click source/contact actions, and report quality issues.
5. Core product actions are measured.
