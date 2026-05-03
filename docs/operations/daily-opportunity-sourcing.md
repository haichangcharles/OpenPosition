# Daily Opportunity Sourcing Handoff

This document is for future agents that need to find new research opportunities and add them to OpenPosition.

## Goal

Every sourcing run should add credible, source-linked opportunities for researchers and students. Prioritize opportunities that are useful to applicants and hard to discover because they are scattered across lab pages, university job boards, company internship pages, professor announcements, and academic job aggregators.

## What To Look For

Target these opportunity types:

- PhD positions and fully funded doctoral openings
- Research internships, especially PhD-level or research-lab internships
- Research Assistant / Research Associate roles
- Postdoc / postdoctoral fellow / postdoctoral researcher roles
- Lab or professor recruiting pages that explicitly mention PhD students, RAs, interns, postdocs, visiting researchers, or collaborators
- Collaboration calls for research projects, papers, grants, datasets, benchmarks, or open-source research tooling

Preferred topics:

- AI, machine learning, LLMs, NLP, computer vision, robotics, HCI, data science
- Computational biology, bioinformatics, healthcare AI, scientific ML
- AI safety, AI governance, trustworthy AI, privacy/security
- Human-centered AI, social computing, education AI
- AI for science, quantum AI, energy systems, climate/environmental modeling

## Freshness Rules

Current date matters. Check the current date before each run.

- Prefer opportunities posted or updated within the last 30 days.
- Accept opportunities with future deadlines even if the page is older.
- Accept "open until filled", "rolling", and standing lab recruitment pages if they look active.
- Do not add opportunities with clearly expired deadlines.
- If a deadline is today or within 1-2 days, only add it if it is unusually valuable.
- If deadline is unclear, set `deadline` to `Open inquiry`, `Rolling`, or `Open until filled`.

## Source Quality Rules

Use public sources only:

- Official university job pages
- Official lab/professor homepages
- Official company career pages
- Reputable academic job boards such as Academic Positions, jobs.ac.uk, EURAXESS, Nature Careers, MathJobs, FindAPhD, FindAPostdoc
- Public LinkedIn pages only if visible without login

Avoid:

- Login-only pages
- Unofficial reposts when an official page is available
- Pages without an original URL
- Scraping behind authentication
- Claims from snippets that cannot be backed by a source URL
- Duplicate postings already in OpenPosition

## Minimum Fields

Each inserted post should have:

- `title`
- `type`: `position` or `collaborator`
- `positionType`: `PhD Student`, `Research Intern`, `PostDoc`, or `Research Assistant` when `type=position`
- `domain`: `Long-term Research`, `Short-term Project`, or `Co-author Needed` when `type=collaborator`
- `source`: usually `Other`; use `LinkedIn`, `X`, or `RedBook` only for those source URLs
- `institution`
- `location` when available
- `authorName`
- `authorAffiliation`
- `summary`
- `originalText`
- `tags`
- `originalUrl`
- `deadline`

## Writing Style

Keep summaries factual and compact:

- Say what the role is.
- Mention topic, institution/company, and applicant profile.
- Do not invent salary, funding, eligibility, or visa details.
- Do not overstate that a role is still open if the page is ambiguous.
- Preserve the original source URL.

## Ingestion Path

Preferred path for future automation:

```http
POST /api/ingestion/posts
Authorization: Bearer <INGESTION_ADMIN_SECRET>
Content-Type: application/json
```

Example payload:

```json
{
  "source": "Other",
  "externalId": "optional-source-id",
  "originalUrl": "https://example.edu/lab/openings",
  "originalText": "We are recruiting PhD students and research assistants in AI systems.",
  "title": "Recruiting PhD Students and Research Assistants in AI Systems",
  "authorName": "Prof. Example",
  "authorAffiliation": "Example University",
  "institution": "Example University",
  "location": "Remote / City, Country",
  "type": "position",
  "positionType": "PhD Student",
  "deadline": "2026-06-01",
  "tags": ["PhD", "Research Assistant", "AI Systems"]
}
```

For manual database seeding in this local workspace, direct Supabase insert is acceptable only for trusted operator work. Never give `DATABASE_URL` to external contributors.

## Lifecycle Defaults

For curated seed data, use:

- `moderationStatus=approved`
- `visibilityStatus=active`
- `verifiedStatus=source_checked`

For automated agent submissions, let the ingestion API run moderation. High-confidence posts may become public; uncertain posts should remain `pending + hidden`.

## Deduping Rules

Before inserting:

1. Check exact `originalUrl`.
2. Check `sourceHash` if available.
3. Check same title + institution.
4. If the same opportunity appears on multiple aggregators, prefer the official source.

## Daily Run Checklist

1. Confirm current date.
2. Review existing count and recent posts in Supabase.
3. Search multiple source families: university jobs, Academic Positions, EURAXESS, company careers, lab homepages.
4. Select at least the requested number of non-duplicate opportunities.
5. Insert or submit via API.
6. Verify public counts by `positionType`.
7. Record sources and counts in `progress.md` or this document if the run changes policy.
