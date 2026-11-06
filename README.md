# LSCCC Inventory

Invite-only equipment inventory for the Lagos State Command & Control Centre. Built with Next.js, Tailwind, Prisma ORM, Neon PostgreSQL, and Brevo transactional email; configured for Vercel's Node.js runtime.

## Local setup

Requires Node.js 24 and a Neon database. Use a separate Neon development branch; do not develop against production records.

```powershell
npm ci
Copy-Item .env.example .env.local
```

Fill in `.env.local`:

| Variable                | Purpose                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Neon pooled connection string, with `sslmode=require`                                                          |
| `DATABASE_URL_UNPOOLED` | Optional direct connection for migrations; falls back to `DATABASE_URL`                                        |
| `APP_URL`               | Exact browser origin, e.g. `http://localhost:3000` locally or `https://inventory.example.gov.ng` in production |
| `BREVO_API_KEY`         | Brevo transactional email API key, **not** an SMTP password                                                    |
| `BREVO_SENDER_EMAIL`    | A sender address verified in Brevo                                                                             |
| `BREVO_SENDER_NAME`     | Optional display name; defaults to LSCCC Inventory                                                             |

All variables are server-only. Never prefix these with `NEXT_PUBLIC_`, commit credentials, or put passwords into URLs in documentation. Brevo requires a configured sender/domain before messages can be sent. See [Neon's Node.js connection guide](https://neon.com/docs/guides/node) and [Brevo's transactional email guide](https://developers.brevo.com/docs/send-a-transactional-email).

```powershell
npm run db:migrate
npm run dev
```

The database starts empty. The previous demo records and browser-local inventory are not imported automatically. Equipment, stock and team data now come from the authenticated server.

## Prisma database layer

The models and relations live in `prisma/schema.prisma`. All application reads and writes use the generated Prisma Client through `app/lib/server/db.ts` and the PostgreSQL driver adapter. API route files remain in `app/api/`; business rules remain in `app/lib/server/`.

`prisma.config.ts` loads the same `.env.local` files as Next.js and uses `DATABASE_URL_UNPOOLED` for migration commands, falling back to `DATABASE_URL`. The runtime client uses the pooled `DATABASE_URL`. No database connection is made during client generation or the application build.

```powershell
npm run db:generate                # Regenerate the typed client after schema changes
npm run db:dev -- --name my_change  # Create and apply a development migration
npm run db:migrate                 # Apply committed migrations to the target database
npm run db:studio                  # Inspect the configured database in Prisma Studio
```

Installation and production builds generate Prisma Client automatically. Generated files under `app/generated/prisma/` are ignored by Git, formatting and linting. SQL files under `prisma/migrations/` are database schema migrations; the application does not issue handwritten SQL queries. The initial migration preserves PostgreSQL checks and partial/expression indexes for stock balances, repair stages, case-insensitive equipment names, and one pending invitation per address. Preserve these constraints in future migrations; Prisma's schema syntax cannot describe all of them.

After changing the Prisma schema, apply the migration, run `npm run db:generate`, and restart `npm run dev`. The development server keeps a shared Prisma client alive across hot reloads; restarting makes it load the updated models. An outdated client can reject a valid request with a validation error even when the database migration has succeeded. Server logs include sanitized error types, codes, and unsupported field names for diagnosing failures without exposing credentials or query arguments.

If the previous raw-SQL migration has **already** been applied to a database, verify that it contains the same tables, constraints and indexes as the initial Prisma migration, then baseline that migration without recreating or deleting records:

```powershell
npx prisma migrate resolve --applied 20261106000000_initial
npm run db:migrate
```

Use that baseline command only for an existing matching database. For a new empty database, use `npm run db:migrate` directly. Do not reset a populated database to adopt Prisma. See [Prisma's baselining guide](https://www.prisma.io/docs/orm/prisma-migrate/workflows/baselining).

## First administrator

With the database migrated and email configured, run this **once**, replacing the example with the intended staff address:

```powershell
npm run admin:invite -- administrator@example.gov.ng
```

This sends a 48-hour invitation through Brevo. Open the email, enter your name and a password of 12–128 characters including a letter and number, then sign in. The command refuses to bootstrap once an account exists. A failed initial delivery can be retried by rerunning the command, which replaces the previous invitation. Subsequent staff invitations belong in **Settings → Team access**. There is no public signup endpoint or default password.

## Backend behavior

- **Accounts:** Opaque random sessions, SHA-256 token hashes at rest, HTTP-only cookies (Secure and `__Host-` scoped in production), 12-hour expiry, scrypt password hashes, and database-backed request limits. Sign-out revokes the session. Password resets expire in 30 minutes, are single-use, and revoke every existing session. Recovery responses do not disclose whether an account exists.
- **Permissions:** Every data API rechecks the session and current database role. Administrators manage invitations, roles and account access. Inventory officers record inventory activity and view reports. Disabling an account revokes its sessions and reset links. The last active administrator cannot be removed or demoted.
- **Inventory:** Equipment registration/editing, receipts with actual arrival date/time, issues, faults, and forward repair stages. Custom categories/stores and free-text custody/location are supported. Completed repairs retain the completion date, notes and history. Existing CSV exports include inventory, activity, pending issues and completed fixes.
- **Consistency:** Prisma interactive transactions use Serializable isolation with bounded retries for write conflicts. Updating the singleton workspace through Prisma serializes stock and access writes; database constraints enforce nonnegative balances and valid references. Each stock request carries an idempotency key so retrying an uncertain request cannot add/issue stock twice. Automatic activity records use the signed-in member's name. Separate audit events record inventory, access and account changes.
- **Privacy:** APIs return `private, no-store`. JSON mutations require the configured origin and reject oversized/invalid bodies. Secrets, passwords, tokens and raw database/provider errors are not returned to the browser or logged by application handlers. Account pages use a no-referrer policy to protect link tokens.

The workspace refreshes shared records every 30 seconds and on window focus. Successful writes immediately use the server's returned balances. CSV downloads reflect the records currently loaded in the workspace. This is one LSCCC workspace, not a multi-organization service; the API currently loads its complete inventory history in one response.

## API surface

| Endpoint                      | Methods          | Access                                                |
| ----------------------------- | ---------------- | ----------------------------------------------------- |
| `/api/auth/sign-in`           | POST             | Invited, active accounts                              |
| `/api/auth/sign-out`          | POST             | Current session                                       |
| `/api/auth/forgot-password`   | POST             | Rate-limited public recovery                          |
| `/api/auth/reset-password`    | POST             | Valid reset token                                     |
| `/api/auth/accept-invitation` | POST             | Valid invitation token and matching email             |
| `/api/inventory`              | GET, POST        | Active staff; POST requires UUID v4 `Idempotency-Key` |
| `/api/team`                   | GET, POST, PATCH | Administrators                                        |

Stock POST accepts `{ kind, fields }` for `equipment`, `edit`, `receive`, `issue`, or `fault`; maintenance accepts `{ action: "maintenance", id, status, details? }`. Server-side validation always applies. Team POST invites `{ email, role }`; PATCH accepts `{ target: "member" | "invitation", id, action, role? }`.

Invitations show whether Brevo accepted the message, failed, or is pending. Resend creates a fresh link; cancel revokes it. Brevo acceptance is not a guarantee of inbox delivery. Password-reset send failures are recorded as a generic server event while the recovery response remains identical for all addresses.

## Account emails and administrator controls

Invitation and password-reset messages use the shared LSCCC template in `app/lib/email-template.ts`: the hosted LSCCC emblem, text branding, navy/green colors, responsive table layout, an action button, expiry guidance, a copyable fallback link, and a plain-text version. The wordmark and instructions remain readable when an email client blocks external images. `app/lib/server/mail.ts` supplies the real account URL and sends both versions through Brevo.

Administrators manage access in **Settings → Team access**:

- **Resend invitation** sends a new 48-hour link and invalidates the previous token.
- **Revoke invitation** immediately invalidates the pending invitation.
- **Revoke access** disables an existing account and removes its sessions and password-reset links. **Restore access** allows a fresh sign-in.
- **Delete user** becomes available after access is revoked. A confirmation dialog requires the user's email address. This permanently removes the sign-in account, while equipment, custody, movement history, audit attribution, and stock request replay protection remain. That address can only return through a new invitation and account.

The API checks the administrator's current database role on every team request. Inventory officers cannot invoke these actions directly. Administrators cannot revoke/delete their own account, and the last active administrator cannot be removed or demoted. The account-deletion migration stores actor names on audit events and retains old mutation keys after their account reference is cleared. The migration itself does not remove any users.

Team account deletion uses the existing `PATCH /api/team` endpoint with `{ target: "member", id, action: "delete", confirmEmail }`. Invitation revocation continues to use `action: "cancel"`; the UI calls it Revoke invitation.
