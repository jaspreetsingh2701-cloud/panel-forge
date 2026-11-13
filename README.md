# PanelForge

PanelForge is a multi-tenant SaaS platform for visually building, configuring and publishing dynamic admin applications.

Teams connect data sources, define resources and custom fields, design forms, tables and dashboards, configure access policies, and publish versioned admin experiences.

> **Project status:** Phases 0–3 and the Phase 2.5 engineering-quality baseline are merged. The current focus is Phase 4 — Visual Builder.

## Product direction

PanelForge is a platform for building admin applications, not a prebuilt admin dashboard.

The initial MVP demonstration:
1. A tenant creates an organisation and application.
2. It uses the managed PanelForge PostgreSQL data source.
3. It defines resources and custom fields.
4. It visually builds forms, tables and a dashboard.
5. It configures Admin, Manager and Viewer access.
6. It publishes an application snapshot.
7. Another team member signs in and sees only permitted data and actions.

## Principles

- Documentation-driven development.
- Security and tenant isolation by design.
- Modular monolith first.
- Declarative, validated configuration instead of arbitrary customer code.
- Tests, documentation and CI are part of feature completion.

## Repository layout

```text
panelforge/
├── .github/
│   ├── workflows/
│   └── pull_request_template.md
├── apps/
│   ├── api/
│   └── web/
├── docs/
│   ├── 00-product/
│   ├── 01-architecture/
│   ├── 02-database/
│   ├── 04-features/
│   ├── 05-api/
│   ├── 06-operations/
│   ├── 07-project-management/
│   └── adr/
└── packages/
```

## Start here

- [Documentation index](docs/README.md)
- [Product definition](docs/00-product/product-definition.md)
- [MVP scope](docs/00-product/mvp-scope.md)
- [Visual builder specification](docs/04-features/visual-builder.md)
- [Roadmap](docs/07-project-management/roadmap.md)
- [Project progress](docs/07-project-management/progress.md)
- [Phase 2.5 engineering quality plan](docs/06-operations/phase-2-5-engineering-quality-plan.md)

## Development

Use Node.js 24.x (see `.nvmrc`) and pnpm 11.28.11.

### First-time setup

Run from the repository root:

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
```

Update `apps/api/.env` to use the local Compose database credentials:

```dotenv
DATABASE_URL="postgresql://panelforge:panelforge_dev@localhost:5432/panelforge"
JWT_ACCESS_SECRET="replace-with-a-random-secret-at-least-32-bytes"
```

Start PostgreSQL and apply the committed migrations:

```bash
docker compose up -d postgres
pnpm --filter @panelforge/api db:status
pnpm --filter @panelforge/api db:deploy
```

### Run the applications

Run each app in a separate terminal from the repository root:

```bash
# Terminal 1 — NestJS API (http://localhost:4000)
pnpm --filter @panelforge/api dev

# Terminal 2 — Next.js web app (http://localhost:3000)
pnpm --filter @panelforge/web dev
```

Or start both applications together:

```bash
pnpm dev
```

API health check: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

API Swagger docs (development): [http://localhost:4000/api/v1/docs](http://localhost:4000/api/v1/docs)

### Common commands

Run from the repository root:

| Command | Purpose |
|---|---|
| `pnpm lint` | Run ESLint across the repository |
| `pnpm lint:fix` | Automatically fix supported ESLint issues |
| `pnpm format` | Format repository files with Prettier |
| `pnpm format:check` | Check formatting of the configured root files |
| `pnpm typecheck` | Typecheck workspace packages and apps |
| `pnpm build` | Build all workspace apps and packages |
| `pnpm --filter @panelforge/api test` | Run API unit tests |
| `pnpm --filter @panelforge/api test:integration` | Run API integration tests |
| `pnpm --filter @panelforge/api test:coverage` | Run API tests with coverage |
| `pnpm --filter @panelforge/web test` | Run web unit tests |
| `pnpm --filter @panelforge/web test:coverage` | Run web unit tests with coverage |
| `pnpm --filter @panelforge/web test:e2e` | Run Playwright end-to-end tests |
| `pnpm --filter @panelforge/api db:generate` | Regenerate Prisma Client |
| `pnpm --filter @panelforge/api db:status` | Check local migration status |
| `pnpm --filter @panelforge/api db:deploy` | Apply committed migrations to the configured database |
| `pnpm --filter @panelforge/api db:migrate --name <name>` | Create and apply a new development migration |
| `pnpm --filter @panelforge/api db:studio` | Open Prisma Studio |

### Local database troubleshooting

If an API endpoint returns `500 INTERNAL_SERVER_ERROR`, first check the API terminal for the request ID and underlying Prisma/database error, then run:

```bash
pnpm --filter @panelforge/api db:status
pnpm --filter @panelforge/api db:deploy
```

Do not use `docker compose down -v` unless you intentionally want to delete the local PostgreSQL volume and all its data.

See [API setup](apps/api/README.md) and [web setup](apps/web/README.md) for application-specific details.

## License

No open-source license has been selected. Until one is added, all rights are reserved by the project owner.
