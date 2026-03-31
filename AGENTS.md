# AGENTS.md

## Project Overview

- TypeScript/Express backend for the Stern Jewish Business Association site
- It serves the public API and publishes a hand-maintained OpenAPI spec
- The backend integrates with Supabase, Resend, and Mailchimp
- A fair amount of behavior is defined centrally in `server.ts`, middleware, and config modules rather than inside individual route files, so changes in one place often need matching updates elsewhere
- This backend is deployed using Vercel serverless functions: `https://api.nyu-sjba.org`
- The frontend is deployed using vercel: `https://nyu-sjba.org`

## API Contract

- The OpenAPI spec is maintained by hand in `config/swagger.ts`.
- If you change route behavior, middleware behavior, request or response shapes, or status codes, update the spec in the same change.
- Shared `/v1` behavior lives in `server.ts` and middleware. In particular, referer validation and rate limiting apply broadly, so endpoint docs should reflect shared `403` and `429` responses when relevant.
- Do not document in-progress or placeholder endpoints in the public spec unless they are intended to be part of the public API contract.

## Docs And Developer Setup

- If you add, rename, or change environment variables, update `.env.example`.
- If you change setup steps, local development behavior, scripts, or notable runtime behavior, update `README.md`.
- Prefer keeping local-development affordances discoverable. If you add a dev flag or bypass, document it in both `.env.example` and `README.md`.

## Architecture Notes

- Route handlers live under `routes/`, but external-service setup and shared behavior are spread across `config/`, `middleware/`, `models/`, and `server.ts`.
- Before changing endpoint docs, check whether the behavior actually comes from shared middleware or a central integration module.

## Before finishing

- Run `npm run build:check`.
- Review the diff for docs/config drift, especially `README.md`, `.env.example`, and `config/swagger.ts`.
