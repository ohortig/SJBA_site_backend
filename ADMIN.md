# Admin Flow

This document explains how the SJBA admin panel should authenticate admins, call backend admin routes, and rely on Supabase safely. For deeper Supabase setup, policy, and migration details, start with [SUPABASE.md](./SUPABASE.md).

## Core Model

The admin panel is a browser app, so it must never receive `SUPABASE_SECRET_KEY`.

Admins sign in with Supabase Auth using the normal public/publishable Supabase key. The admin panel then sends the Supabase access token to this backend:

```http
Authorization: Bearer <supabase-access-token>
```

The backend verifies that token with Supabase Auth and checks the authenticated user's `app_metadata`. If the user is an admin, the backend performs the privileged database or storage operation with the server-side Supabase secret-key client.

The flow is:

1. Admin opens the admin panel.
2. Admin signs in through Supabase Auth.
3. Supabase returns a session containing an access token.
4. Admin panel calls this backend with `Authorization: Bearer <access_token>`.
5. Backend verifies the token and checks admin status from `app_metadata`.
6. Backend runs the privileged action with `SUPABASE_SECRET_KEY`.
7. Backend returns the result to the admin panel.

## Admin Identity

Admin status is determined only from Supabase `app_metadata`, not `user_metadata`.

The backend currently accepts any of these `app_metadata` shapes:

```json
{ "admin": true }
```

```json
{ "is_admin": true }
```

```json
{ "role": "admin" }
```

```json
{ "roles": ["admin"] }
```

Do not authorize admins from `user_metadata`. In Supabase, user metadata is user-editable and is not safe for authorization decisions.

## Admin Panel Requirements

The admin repo should:

- Use Supabase Auth in the browser with the public/publishable key, not the secret key.
- Store the active Supabase session using the normal Supabase client behavior.
- Send the session `access_token` to backend admin routes as a bearer token.
- Configure its deployed origin in this backend's `ADMIN_URL` so CORS allows the admin panel.
- Treat `401` as missing, invalid, or expired login.
- Treat `403` as a valid login without admin privileges.
- Read the live API contract from `/docs` or `/docs.json`.

The admin panel should not:

- Bundle `SUPABASE_SECRET_KEY`.
- Call Supabase tables directly for privileged writes.
- Call Supabase Storage directly for privileged writes.
- Use `user_metadata` to decide whether to show privileged controls.

## Database Admin Routes

Admin CRUD uses the same resource endpoints as the public API. Public users can read public resources, while authenticated admins unlock write methods on the same resource paths.

Examples:

```http
GET /v1/events
POST /v1/events
PUT /v1/events/{id}
DELETE /v1/events/{id}
```

`GET /v1/events` is public for visible events. If called with a valid admin bearer token, it can return all events, including hidden events. Hidden events should be admin-only everywhere.

Admin write methods are available for:

- `/v1/board-members`
- `/v1/events`
- `/v1/members`
- `/v1/semesters`

Private admin collections are available at:

- `/v1/contact-requests`
- `/v1/newsletter-signups`

Those private collections are not public-readable. Public users can submit contact requests and newsletter signups only through the public submission endpoints.

## Storage Admin Routes

Public users can view files in public buckets, but they cannot upload, replace, move, or delete storage objects.

Admins manage Supabase Storage through backend routes:

```http
GET /v1/storage/buckets
GET /v1/storage/buckets/{bucketId}/objects
POST /v1/storage/buckets/{bucketId}/objects
PUT /v1/storage/buckets/{bucketId}/objects
DELETE /v1/storage/buckets/{bucketId}/objects
```

The storage routes support:

- Full bucket listing for admins.
- Object listing under an optional `prefix`.
- Upload with `path` and `contentBase64`.
- Replace/update with `path` and `contentBase64`.
- Rename/move with `path` and `newPath`.
- Recursive virtual-folder move/delete with `recursive: true`.
- Delete by one `path` or multiple `paths`.

Supabase Storage folders are virtual path prefixes, not standalone empty folder records. The admin panel should create folders by uploading an object under a prefix.

The current backend accepts JSON uploads, so large files are constrained by the backend JSON body limit. If the admin panel needs large media uploads later, add a multipart or signed-upload flow deliberately rather than increasing JSON payload limits casually.

## How Supabase Fits In

Supabase has two separate layers in this project:

- Public access control is enforced by database grants, row-level security policies, and storage policies.
- Admin operations are performed by this backend with the secret-key client after backend admin-token verification.

That means public users can only do what the Supabase policies allow. Admins are not relying on broad browser-side Supabase permissions; they are relying on this backend to verify the admin token and then perform privileged work server-side.

The important security boundary is:

```text
admin browser: Supabase access token only
backend server: SUPABASE_SECRET_KEY
```

## Docs

Project docs:

- [SUPABASE.md](./SUPABASE.md) for the project access model, migrations, and production Supabase workflow.
- [supabase/docs/supabase-local.md](./supabase/docs/supabase-local.md) for local Supabase setup and cloud snapshot workflow.
- [supabase/docs/supabase-migrations.md](./supabase/docs/supabase-migrations.md) for migration and drift workflow.
- [/docs](https://api.nyu-sjba.org/docs) for the live OpenAPI page.
- [/docs.json](https://api.nyu-sjba.org/docs.json) for the live raw OpenAPI contract.

Supabase docs:

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript auth reference](https://supabase.com/docs/reference/javascript/auth-signinwithpassword)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)
