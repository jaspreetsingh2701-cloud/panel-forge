---
title: PanelForge testing strategy
status: Active
version: 0.4
last_updated: 2026-11-13
source_of_truth: true
---

# PanelForge testing strategy

## Test layers

| Layer | Tool | Purpose |
|---|---|---|
| Static | TypeScript, ESLint, Prettier | Type correctness and style |
| Unit | Jest, ts-jest | API service, DTO and helper behaviour |
| API integration | Jest, Prisma, PostgreSQL | Real database and migration semantics |
| Component | Jest, React Testing Library, jsdom | User-observable component behaviour |
| E2E | Playwright | Browser smoke and critical user journeys |
| Contract | Nest Swagger/OpenAPI | API contract discovery |
| Security | Dependency review, Gitleaks, Trivy | Supply-chain, secret and filesystem risks |

## Current test scope

The API suite covers health and service behaviour, DTO validation and PostgreSQL integration. The web suite covers the shared Button, authentication session restoration, builder component registry/configuration validation and stable draft serialization.

Playwright currently includes:
- Login route smoke coverage.
- Runtime route protection for unauthenticated visitors.
- Super Admin documentation route protection for unauthenticated visitors.
- Visible login error handling when the API rejects credentials.

The runtime and platform E2E cases use deterministic network interception. They do not require personal accounts, real credentials or production data. These tests prove the unauthenticated boundary only; they do not claim to prove authenticated tenant isolation or application-level permissions. Add those negative and positive cases with dedicated disposable fixtures as the corresponding backend policies are implemented.

Test only implemented behaviour. Add resource, publishing, RBAC and tenant-isolation cases alongside those features rather than writing placeholder tests for nonexistent endpoints.

Mock Prisma only in unit tests. Integration tests use the checked-in migrations and a disposable PostgreSQL database. Never use a developer's normal database or production data.

## Coverage

Initial per-file gates are 70% for statements, branches, functions and lines, applied to the health controller and shared Button. Expand scope as modules receive meaningful tests. Coverage is a signal, not proof of correctness.

## Local commands

```powershell
pnpm install
pnpm --filter @panelforge/api db:generate
pnpm --filter @panelforge/api db:deploy
pnpm --filter @panelforge/api test:coverage
pnpm --filter @panelforge/api test:integration
pnpm --filter @panelforge/web test:coverage
pnpm --filter @panelforge/api typecheck
pnpm --filter @panelforge/web typecheck
pnpm --filter @panelforge/api build
pnpm --filter @panelforge/web build
pnpm --filter @panelforge/web exec playwright install chromium
pnpm --filter @panelforge/web test:e2e
```

The integration suite requires DATABASE_URL to target a dedicated disposable database. Do not point it at the ordinary development database or production.
