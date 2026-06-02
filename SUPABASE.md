# Supabase Development

This backend repo owns SJBA Supabase configuration, migrations, local setup, storage buckets, and cloud snapshots. The frontend and admin dashboard should talk to the backend API; they should not own database migrations or privileged Supabase keys.

## Docs

- [Local Supabase setup and cloud mirror](./supabase/docs/supabase-local.md)
- [Supabase migrations and production drift](./supabase/docs/supabase-migrations.md)

## Official References

- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Supabase CLI Getting Started](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Backup and Restore with the CLI](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
