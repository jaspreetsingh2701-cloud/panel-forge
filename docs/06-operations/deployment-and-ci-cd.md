---
title: PanelForge deployment and CI/CD
status: Active
version: 0.3
last_updated: 2026-11-13
source_of_truth: true
---

# PanelForge deployment and CI/CD

## Environments

- Local: pnpm workspace and Docker Compose dependencies.
- CI: disposable PostgreSQL 17 service, migrations, tests, builds and security scans.
- Staging: protected environment for integrated acceptance and smoke tests.
- Production: not enabled in this MVP phase.

## MVP hosting

The selected evaluation topology is Cloudflare Workers for Next.js (subject to adapter validation), Render free web service for NestJS, Neon free PostgreSQL and GitHub Actions. See [ADR-0001](../01-architecture/decisions/0001-free-tier-mvp-hosting.md). Free tiers are managed services, not an all-open-source hosting stack.

## Pull request gates

1. Frozen lockfile install, formatting and lint.
2. API unit and web component tests with per-file coverage.
3. PostgreSQL integration test after Prisma migrations.
4. API/web typechecks and production builds.
5. Playwright Chromium login-route smoke.
6. Dependency review, Gitleaks and Trivy filesystem scan.

## Staging smoke verification

The manually triggered `.github/workflows/staging-smoke.yml` uses the protected GitHub Environment named `staging`. Configure `STAGING_WEB_URL` and `STAGING_API_URL` as environment secrets. It verifies the web origin and `/api/v1/health`.

This is a post-deployment verification gate, not a deployment mechanism. Actual deployment remains pending provider provisioning, provider credentials and a validated Cloudflare Next.js adapter deployment. Never commit secret values.

## Release and rollback checklist

Before staging release:
- [ ] Confirm required CI/security checks pass and review the release commit.
- [ ] Confirm TLS, CORS, health checks, connection pooling and provider quotas.
- [ ] Apply backward-compatible Prisma migrations before dependent application code.
- [ ] Deploy immutable web/API artifacts and retain previous known-good versions.
- [ ] Run the protected staging smoke workflow and verify authentication manually.
- [ ] Record release commit, migration version and deployment timestamps.

If application health checks fail:
- [ ] Roll back web/API artifacts to the previous known-good versions.
- [ ] Re-run health and authentication smoke tests.
- [ ] Do not automatically reverse database migrations; assess compatibility and restore only under an approved recovery plan.
- [ ] Record the incident and corrective action before retrying.

Production deployment is not enabled in this phase.
