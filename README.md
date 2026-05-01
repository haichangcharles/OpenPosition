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
- Supabase Postgres
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

Run database migrations against Supabase:

```bash
DATABASE_URL="<supabase pooled postgres url>" npm run db:migrate
```

## Agent Ingestion API

OpenPosition exposes a protected HTTP endpoint for agents or external collectors to submit academic opportunity candidates. Agents should call this API instead of writing directly to Supabase.

Set a shared secret in local and production environments:

```env
INGESTION_ADMIN_SECRET=<long random secret>
```

Do not commit the real secret to README or other tracked files. Put it in `.env`
locally and in your deployment provider's environment variables.

Submit a candidate:

```bash
curl -X POST "https://your-domain.example/api/ingestion/posts" \
  -H "Authorization: Bearer $INGESTION_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "X",
    "externalId": "tweet_or_page_id",
    "originalUrl": "https://x.com/example/status/123",
    "originalText": "I am recruiting a PhD student and research intern for LLM systems research.",
    "title": "Recruiting PhD student and research intern for LLM systems",
    "authorName": "Prof. Example",
    "authorAffiliation": "Example University",
    "institution": "Example University",
    "location": "Remote",
    "type": "position",
    "positionType": "Research Intern",
    "deadline": "2026-06-01",
    "tags": ["LLM", "PhD", "Research Intern"]
  }'
```

Supported values:

- `source`: `X`, `LinkedIn`, `RedBook`, or `Other`
- `type`: `position` or `collaborator`
- `positionType`: `PhD Student`, `Research Intern`, `PostDoc`, or `Research Assistant`
- `domain`: for collaborator posts, `Long-term Research`, `Short-term Project`, or `Co-author Needed`

The API validates the payload, deduplicates by `originalUrl` and `source + externalId`, runs the existing moderation path, inserts a moderation review record, and returns:

```json
{
  "status": "created",
  "postId": 123,
  "moderationStatus": "approved",
  "visibilityStatus": "active"
}
```

Duplicates return `status: "duplicate"` with the existing `postId`.

Collectors should only submit public, source-linked opportunities and should keep platform credentials outside OpenPosition. The API owns validation, moderation, dedupe, and database writes.

## Product Direction

The first release should focus on:

- moderation workflow
- admin review queue
- reliable detail/contact/source actions
- post freshness and reporting
- search and filtering improvements
- product event tracking

Do not prioritize automated scraping, recommendations, or complex social features before the trusted content loop works.
