# Supabase Migrations

Use this when changing schema, policies, storage buckets, functions, or production Supabase configuration.

## Rules

- Create migration files only with `supabase migration new <name>`.
- Do not hand-invent timestamped migration filenames.
- Keep dashboard changes from becoming undocumented production drift.
- Review generated SQL before committing it.

## Create A Migration

```bash
supabase migration new <name>
```

Add the SQL to the generated file under `supabase/migrations/`.

Apply pending migrations locally:

```bash
supabase migration up
```

Reset local state from migrations:

```bash
supabase db reset
```

## SQL Snippets

Use `supabase/snippets/` for saved SQL that is useful to run manually but should not become migration history. Good examples include inspection queries, local row edits, cleanup helpers, and draft SQL before it becomes a real migration.

Run a snippet against local Supabase only:

```bash
supabase db query --local --file supabase/snippets/my-query.sql
```

For local `COPY ... FROM stdin` files or other SQL that needs `psql`, use the local database URL:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres --file supabase/snippets/my-query.sql
```

Run a snippet against the linked remote project:

```bash
supabase db query --linked --file supabase/snippets/my-query.sql
```

Snippets can change rows locally or remotely depending on the command you use. Always check for `--local` before tinkering with local-only data, and use migrations for permanent schema, policy, function, or storage-bucket changes.

## Pull Or Diff Cloud Drift

If production changes are made in the dashboard, pull or diff them into migrations promptly:

```bash
supabase db pull
supabase db diff --linked --schema public,storage
```

If the linked remote project already has migration history that is missing locally, fetch it instead of recreating timestamped files by hand:

```bash
supabase migration fetch --linked
supabase migration list
```

The migration list should show the same versions in the local and remote columns before local reset/cloud snapshot workflows are expected to work.

For storage policy drift specifically, include the `storage` schema:

```bash
supabase db pull --schema storage
supabase db diff --linked --schema public,storage
```

## Storage Policy Baseline

Local storage buckets are stored within the Supabase Docker container.
Buckets currently expected by this backend/frontend system:

- `board-headshots`
- `event-flyers`

Both are public-read media buckets. Anonymous writes should not be granted unless the access model changes intentionally.
