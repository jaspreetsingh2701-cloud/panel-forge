# PanelForge API

NestJS modular-monolith API for PanelForge.

## Prerequisites

- Node.js 24.x
- pnpm 11.28.11
- Docker Desktop with Docker Compose

## Local database setup

Run these commands from the repository root.

1. Create the local API environment file:

   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   ```

2. Start PostgreSQL:

   ```powershell
   docker compose up -d postgres
   ```

3. Check that PostgreSQL is healthy:

   ```powershell
   docker compose ps
   ```

4. Install workspace dependencies and generate the lockfile if this is the first install:

   ```powershell
   pnpm install
   ```

5. Check and apply all committed migrations:

   ```powershell
   pnpm --filter @panelforge/api db:status
   pnpm --filter @panelforge/api db:deploy
   ```

Set `DATABASE_URL` in `apps/api/.env` to match the credentials in `compose.yaml`, for example:
`postgresql://panelforge:panelforge_dev@localhost:5432/panelforge`.

The example file contains local-only credentials; do not use them outside local development.

## Run the API

From the repository root, run the API in its own terminal:

```bash
pnpm --filter @panelforge/api dev
```

The web application runs separately:

```bash
pnpm --filter @panelforge/web dev
```

Or start all configured development apps together with `pnpm dev`.

The API health endpoint is available at [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health). Development Swagger documentation is available at [http://localhost:4000/api/v1/docs](http://localhost:4000/api/v1/docs).

The API connects to PostgreSQL during startup, so start the database before starting the API.

## API commands

Run from the repository root:

| Command | Purpose |
|---|---|
| `pnpm --filter @panelforge/api dev` | Start NestJS in watch mode |
| `pnpm --filter @panelforge/api build` | Build the API |
| `pnpm --filter @panelforge/api start` | Run the compiled API |
| `pnpm --filter @panelforge/api typecheck` | Run API TypeScript checks |
| `pnpm --filter @panelforge/api test` | Run API unit tests |
| `pnpm --filter @panelforge/api test:integration` | Run API integration tests |
| `pnpm --filter @panelforge/api test:coverage` | Run API tests with coverage |
| `pnpm --filter @panelforge/api db:generate` | Regenerate Prisma Client |
| `pnpm --filter @panelforge/api db:status` | Check applied/pending migrations |
| `pnpm --filter @panelforge/api db:migrate --name add_applications` | Create and apply a development migration |
| `pnpm --filter @panelforge/api db:deploy` | Apply committed migrations |
| `pnpm --filter @panelforge/api db:studio` | Open Prisma Studio |

**Migration workflow**

1. Edit `apps/api/prisma/schema.prisma`.
2. Create a named migration during development, for example:

   ```bash
   pnpm --filter @panelforge/api db:migrate --name add_applications
   ```

3. Commit the updated Prisma schema and generated migration directory.
4. On another local database or deployment environment, check and apply committed migrations:

   ```bash
   pnpm --filter @panelforge/api db:status
   pnpm --filter @panelforge/api db:deploy
   ```

Use `db:migrate` to create a migration during development; use `db:deploy` to apply migrations that already exist. Do not edit generated migration SQL after it has been applied to a shared environment.

## Inspect the local database with pgAdmin

These steps are useful when Prisma reports that a table is missing even though `db:status` says all migrations are applied.

### Open pgAdmin 4 on Windows

1. Press the Windows key, search for **pgAdmin 4**, and open it. pgAdmin may open in a browser window.
2. If prompted, enter the pgAdmin master password. This unlocks the saved server connections; it is not necessarily the PostgreSQL user's password.
3. In the left **Browser** tree, expand **Servers** and select your local PostgreSQL server.
4. Expand **Databases** and select **panelforge_test** (use the database name shown by `db:status`).
5. Right-click that database and choose **Query Tool**.
6. Paste the SQL checks below and click **Execute** (the ▶ button).

If no local server is registered, right-click **Servers → Register → Server**:
- **General → Name:** `PanelForge local` (any descriptive name is fine).
- **Connection → Host name/address:** `localhost`.
- **Port:** `5432`.
- **Maintenance database:** `panelforge_test`.
- **Username/password:** use the PostgreSQL credentials from the API's `DATABASE_URL` in `apps/api/.env`. Do not paste the full connection URL into the password field.

If pgAdmin 4 is not installed, install it from [the official pgAdmin download page](https://www.pgadmin.org/download/), or use another PostgreSQL client.

### Check the database and migration history

Run these statements in Query Tool:

```sql
-- 1. Confirm which database, schema and user this connection is using.
SELECT current_database(), current_schema(), current_user;

-- 2. Check whether the applications table exists in any schema.
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'applications'
ORDER BY table_schema;

-- 3. Inspect Prisma's migration history.
SELECT
    migration_name,
    started_at,
    finished_at,
    rolled_back_at,
    applied_steps_count
FROM public."_prisma_migrations"
ORDER BY started_at;
```

Compare the first query's database with the database reported by `pnpm --filter @panelforge/api db:status`. A migration row with a non-null `finished_at` means Prisma recorded that migration as applied; if its expected table is missing, investigate schema drift or a database/connection mismatch before changing anything.

**Do not** delete `_prisma_migrations`, run `prisma migrate reset`, manually create tables, or run `prisma db push` as a first response. These actions can hide the underlying problem or risk local data. Share the query results and the matching API request ID when asking for help.

## Debugging API errors

Every API error response includes an `error.requestId` and the response header `X-Request-Id`. For unexpected server errors, search the API terminal output for that ID. The structured JSON log includes:

- `timestamp`, `level`, `event`
- `requestId`, `method`, `path`, `statusCode`
- `error.name`, `error.message`, `error.stacktrace`
- Prisma `error.code` and `error.clientVersion` when available

The browser receives a safe error message and request ID, not the internal stack trace. Query parameters, cookies and authorization headers are intentionally excluded from the request log.

## Environment variables

See `.env.example`. The real `.env` file is ignored by Git and must never be committed.
