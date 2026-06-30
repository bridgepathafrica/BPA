# @workspace/db — Database Schema & Migrations

Drizzle ORM schema definitions and migration tooling for the Bridgepath Africa PostgreSQL database.

## Tables

| Schema file | Table | Purpose |
|---|---|---|
| `src/schema/users.ts` | `users` | Core authentication — email, hashed password, role |
| `src/schema/profiles.ts` | `profiles` | Extended user info — name, bio, skills, CV, avatar |
| `src/schema/jobs.ts` | `jobs` | Job postings created by employers |
| `src/schema/applications.ts` | `applications` | Job applications (job ↔ user) |
| `src/schema/contactSubmissions.ts` | `contact_submissions` | Contact form messages |

## Usage

```bash
# Apply schema to database (development / one-off)
pnpm --filter @workspace/db run push

# Generate a timestamped migration file (production-safe)
pnpm --filter @workspace/db run generate

# Apply pending migrations
pnpm --filter @workspace/db run migrate
```

Requires `DATABASE_URL` to be set in the environment.
