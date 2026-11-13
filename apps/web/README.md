# PanelForge Web

Next.js application for the PanelForge workspace, visual builder, preview experience and published application runtime.

## Local development

Run from the repository root after completing the [API and database setup](../api/README.md):

```bash
pnpm --filter @panelforge/web dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation commands

Run from the repository root:

- `pnpm --filter @panelforge/web typecheck` — generate Next.js route types and run TypeScript.
- `pnpm --filter @panelforge/web test` — run Jest and React Testing Library unit tests.
- `pnpm --filter @panelforge/web test:coverage` — run unit tests with coverage.
- `pnpm --filter @panelforge/web test:e2e` — run Playwright end-to-end tests.
- `pnpm --filter @panelforge/web build` — create a production build.

The web app uses the API at the same origin through the configured local development setup. Keep the API and PostgreSQL running when testing sign-in, workspace and application flows.
