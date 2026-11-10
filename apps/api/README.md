# PanelForge API

NestJS modular-monolith API for PanelForge.

## Local development

From the repository root:

```bash
pnpm --filter @panelforge/api dev
```

The initial health endpoint is available at:

`http://localhost:4000/api/v1/health`

This is a foundation endpoint only. Authentication, tenant context, database access and domain modules will be introduced in later batches.
