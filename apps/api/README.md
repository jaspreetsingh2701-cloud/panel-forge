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

Start the full workspace from the repository root:

```powershell
pnpm dev
```

The API health endpoint is available at:

`http://localhost:4000/api/v1/health`

A successful response includes the PostgreSQL dependency status. The API connects to PostgreSQL during startup, so start the database before starting the API.

## Database commands

Run from the repository root:

| Command | Purpose |
|---|---|
| `docker compose up -d postgres` | Start local PostgreSQL |
| `docker compose stop postgres` | Stop PostgreSQL without deleting data |
| `docker compose down` | Remove the container/network; keep the named volume |
| `pnpm --filter @panelforge/api db:generate` | Generate Prisma Client |
| `pnpm --filter @panelforge/api db:migrate --name <name>` | Create and apply a development migration |
| `pnpm --filter @panelforge/api db:deploy` | Apply committed migrations |
| `pnpm --filter @panelforge/api db:status` | Show migration status |
| `pnpm --filter @panelforge/api db:studio` | Open Prisma Studio |

**Warning:** `docker compose down -v` deletes the local PostgreSQL volume and all data stored in it. Use it only when you intentionally want to reset the local database.

## Initial schema

The first migration establishes only the platform identity and tenancy foundation:

- `User`
- `Tenant`
- `TenantMember`

Applications, resources, dynamic records, permissions and publishing models will be added in their respective implementation phases.

## Environment variables

See `.env.example`. The real `.env` file is ignored by Git and must never be committed.
