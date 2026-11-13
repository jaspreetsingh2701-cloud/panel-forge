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
| `pnpm --filter @panelforge/api lint` | Not configured; use root `pnpm lint` |
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

## Debugging API errors

Every API error response includes an `error.requestId` and the response header `X-Request-Id`. For unexpected server errors, search the API terminal output for that ID. The structured JSON log includes:

- `timestamp`, `level`, `event`
- `requestId`, `method`, `path`, `statusCode`
- `error.name`, `error.message`, `error.stacktrace`
- Prisma `error.code` and `error.clientVersion` when available

The browser receives a safe error message and request ID, not the internal stack trace. Query parameters, cookies and authorization headers are intentionally excluded from the request log.

## Environment variables

See `.env.example`. The real `.env` file is ignored by Git and must never be committed.
