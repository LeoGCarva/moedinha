# Moedinha

A personal finance web app for tracking income, spending, and investments across your pay cycle. This repository is named `porquinho`; Moedinha is the app's current name. The interface is in Brazilian Portuguese and amounts are in Brazilian reais (BRL).

## Features

- **Money tracking:** record expenses, investments, and extra income, and delete entries you no longer need.
- **Pay cycle summary:** see how much of your available money was invested, spent, or left over, based on your monthly income and payday.
- **Calendar view:** browse months and open any day with entries to see its details.
- **Cycle history:** review statements from previous pay cycles.
- **"Quanto custa" ("How much does it cost"):** convert a price into the hours of work it would take to pay for it.
- **Accounts:** sign in with email and password or Google, and edit your name, income, and payday in your profile.

## Tech stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript
- Tailwind CSS v4
- PostgreSQL on Neon, with Drizzle ORM
- Neon Auth (managed Better Auth)
- Zod for validation

## Getting started

You need Node.js 24, pnpm, and a [Neon](https://neon.tech) project with Neon Auth enabled.

1. Install the dependencies:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env.local`, then fill in these values:

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | Pooled connection string, used by the app |
   | `DATABASE_URL_UNPOOLED` | Direct connection string, used for migrations |
   | `NEON_BRANCH` | Neon branch name |
   | `NEON_AUTH_BASE_URL` | Neon Auth base URL |
   | `NEON_AUTH_JWKS_URL` | Neon Auth JWKS URL |
   | `NEON_AUTH_COOKIE_SECRET` | Cookie secret, generated with `openssl rand -base64 32` |

   The Neon CLI can provide all of these except the cookie secret, through `neon deploy` or `neon env pull`.

3. Apply the database migrations and start the app:

   ```bash
   pnpm db:migrate
   pnpm dev
   ```

4. Open <http://localhost:3000> and create an account.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate a migration from the schema |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Open Drizzle Studio |

## Project structure

```text
src/
  app/          Pages, Server Actions, and the auth route
  components/   Calendar, summary, forms, and other UI
  db/           Database connection and Drizzle schema
  lib/          Auth helpers, money and pay cycle logic, validation
  proxy.ts      Route protection
drizzle/        Database migrations
neon.ts         Neon service configuration
```

[`CONTEXT.md`](CONTEXT.md) records the project's decisions, design, and history in detail (in Portuguese).
