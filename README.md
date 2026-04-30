# OpenPosition

OpenPosition is a trusted academic opportunity discovery platform. It helps researchers, students, professors, and research organizations discover, evaluate, publish, and act on academic positions and collaboration requests that are otherwise scattered across social platforms.

## Product Documentation

The product source of truth lives in [docs/product](./docs/product/README.md).

Key documents:

- [Product Strategy](./docs/product/product-strategy.md)
- [Opportunity Solution Tree](./docs/product/opportunity-solution-tree.md)
- [Roadmap](./docs/product/roadmap.md)
- [V0 PRD](./docs/product/prd-v0-operational-mvp.md)
- [Implementation Plan](./docs/product/implementation-plan.md)

## Engineering Documentation

The engineering source of truth lives in [docs/engineering](./docs/engineering/README.md).

Key documents:

- [Technical Architecture](./docs/engineering/architecture.md)
- [Development Guide](./docs/engineering/development-guide.md)
- [Source Ingestion Strategy](./docs/engineering/ingestion-strategy.md)
- [Task-Level Implementation Plan](./docs/plans/2026-04-29-openposition-v0-operable-mvp.md)

## Current Product Stage

This codebase is an MVP prototype. It has the basic product surface for browsing, submitting, and viewing academic positions and collaboration requests, but still needs the trust, moderation, action, and measurement loops required for production operation.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Hono API server
- tRPC
- Drizzle ORM
- MySQL
- Google auth and session cookies

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run type checks:

```bash
npm run check
```

Run tests:

```bash
npm run test
```

Build:

```bash
npm run build
```

## Product Direction

The first release should focus on:

- moderation workflow
- admin review queue
- reliable detail/contact/source actions
- post freshness and reporting
- search and filtering improvements
- product event tracking

Do not prioritize automated scraping, recommendations, or complex social features before the trusted content loop works.
