---
title: Phase 2.5 engineering quality plan
status: Active
version: 0.3
last_updated: 2026-11-13
source_of_truth: true
---

# Phase 2.5 — Engineering quality foundation

## Delivery status

| Batch | Scope | Status |
|---|---|---|
| 2.5.1 | CI baseline | Complete — PR #15 |
| 2.5.2 | Lint, formatting and commit quality | Complete — PR #16 |
| 2.5.3 | Jest API tests, React Testing Library, PostgreSQL integration and coverage | Implemented in PR #17; lockfile and validation pending |
| 2.5.4 | Playwright smoke, Swagger/OpenAPI and security scans | Implemented in PR #17; validation pending; container scan deferred until a deployable image exists |
| 2.5.5 | Protected staging smoke and release/rollback checklist | Smoke workflow added; actual deployment remains pending provider provisioning |

## 2.5.3 — Tests

API unit tests use Jest/ts-jest and test the existing health controller, including propagation of database failures. Web component tests use Jest, jsdom and React Testing Library against the shared Button. PostgreSQL integration tests use the Prisma PostgreSQL adapter against a disposable PostgreSQL database after checked-in migrations are applied.

Initial coverage gates (70% statements, branches, functions and lines) are scoped to the tested health controller and Button. Expand coverage as application modules gain meaningful tests; do not mask untested code with fake placeholder tests.

## 2.5.4 — E2E, API contract and security

Playwright runs a Chromium smoke test against the existing login route. Nest Swagger is enabled outside production at `/api/v1/docs`; the OpenAPI JSON is served at `/api/v1/openapi.json`. GitHub Actions runs dependency review, Gitleaks and Trivy filesystem scans for high/critical findings. Container scanning is deferred until a deployable image is checked in.

## 2.5.5 — Staging

The manually triggered staging smoke workflow uses a protected GitHub Environment and requires `STAGING_WEB_URL` and `STAGING_API_URL` environment secrets. It verifies an already-deployed web app and API health endpoint; it does not provision providers or deploy artifacts. Actual staging deployment remains pending Cloudflare/Render/Neon provisioning, credentials and validation of the Next.js adapter.

Before release, review migrations, TLS, CORS, connection pooling and provider quotas; deploy immutable artifacts; retain previous versions; run smoke checks. On application failure, roll back web/API artifacts first. Do not automatically reverse database migrations; use a reviewed recovery/restore plan.

## Definition of done

Phase 2.5 is not complete until the updated lockfile is committed, local and CI checks pass, staging is actually provisioned and smoke-verified, and release/rollback instructions are reviewed. A workflow file alone is not proof of deployment.
