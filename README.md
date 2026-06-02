# Stern Jewish Business Association Backend API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/ohortig/SJBA_site_backend/actions/workflows/ci.yml/badge.svg)](https://github.com/ohortig/SJBA_site_backend/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)](https://api.nyu-sjba.org)
[![Node.js](https://img.shields.io/badge/node-24.x-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A Node.js/Express backend API for the Stern Jewish Business Association website.

**Live API**: [api.nyu-sjba.org](https://api.nyu-sjba.org)
**Live Frontend**: [nyu-sjba.org](https://nyu-sjba.org)
**Status Page**: [status.nyu-sjba.org](https://status.nyu-sjba.org)

## Local Development

Prerequisites:

- Node.js 24.x
- npm, included with Node.js
- Git
- Docker Desktop or another Docker-compatible container runtime
- Supabase CLI, for local Supabase, migrations, and cloud snapshot scripts
- `psql`, for applying cloud snapshot row dumps locally

Production provider accounts/keys for Supabase, Resend, and Mailchimp are not required for ordinary local development. Keep the local safety switches in `.env` enabled unless intentionally testing those integrations.

Setup:

1. Install dependencies with `npm install`.
2. If you use nvm, run `nvm use`.
3. Copy `.env.example` to `.env`.
4. Start local Supabase with `npm run supabase:start`.
5. Copy `Project URL` and `Publishable` from `supabase start` output into `.env`.
6. Reset local Supabase to the repo migrations with `npm run supabase:reset`.
7. Start the API with `npm run dev`.

Useful local URLs:

- API: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/docs`
- Local Supabase API: `http://127.0.0.1:54321`
- Local Supabase Studio: `http://127.0.0.1:54323`

For Supabase workflows, see [SUPABASE.md](./SUPABASE.md). For the full local setup and cloud mirror sequence, go directly to [supabase/docs/supabase-local.md](./supabase/docs/supabase-local.md).

Production Supabase migrations are deployed by GitHub Actions after migration files are merged to `main`; see [supabase/docs/supabase-migrations.md](./supabase/docs/supabase-migrations.md).

## API Documentation

| URL                                                | Description              |
| -------------------------------------------------- | ------------------------ |
| [`/docs`](https://api.nyu-sjba.org/docs)           | Swagger UI               |
| [`/docs.json`](https://api.nyu-sjba.org/docs.json) | Raw JSON spec for agents |

Locally: `http://localhost:3000/docs`

`GET /v1/events` supports explicit event-time sorting via `sort=startTime:asc` or `sort=startTime:desc`. The default is `startTime:asc`; see `/docs` for the full pagination and filtering contract.

## Available Scripts

- `npm run dev` - Start development server with hot reload (tsx watch)
- `npm start` - Start production server
- `npm run build` - Compile TypeScript
- `npm run build:check` - Type-check without emitting
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without writing
- `npm test` - Run Jest tests
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:reset` - Reset local Supabase database to migrations
- `npm run supabase:status` - Show local Supabase service status
- `npm run supabase:cloud:download -- --yes` - Download a gitignored production cloud snapshot
- `npm run supabase:cloud:apply` - Apply the downloaded cloud snapshot to local Supabase

Cloud snapshots replace the old sample seed script. They may contain production rows and media, so `supabase/.cloud-snapshot/` is gitignored and must stay local.

## Environment Notes

- In `NODE_ENV=development`, rate limiting is disabled by default.
- Set `ENABLE_RATE_LIMIT=true` to force rate limiting on locally when you want to test `429` handling.
- Set `SKIP_STARTUP_CONNECTION_TESTS=true` to skip the startup Mailchimp and Supabase connectivity checks.
- Set `DISABLE_EMAIL_SENDING=true` to let contact form flows work locally without sending outbound email.
- Set `DISABLE_MAILCHIMP_SYNC=true` to let newsletter signups work locally without touching Mailchimp.
- Set `LOG_LEVEL=silent` or `LOG_LEVEL=debug` to reduce or increase local logging verbosity.

## Contact

Stern Jewish Business Association

Email: [sjba@stern.nyu.edu](mailto:sjba@stern.nyu.edu)

Feel free to reach out to report bugs, ask questions, or inquire about joining the development team.

## License

This project is licensed under the [MIT License](./LICENSE).
