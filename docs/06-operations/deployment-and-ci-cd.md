---
title: PanelForge deployment and CI/CD
status: Active
version: 0.2
last_updated: 2026-11-13
source_of_truth: true
---

# PanelForge deployment and CI/CD

## Environments

- Local: pnpm workspace and Docker Compose dependencies.
- CI: isolated test/build environment with disposable PostgreSQL.
- Staging: integrated acceptance and smoke tests.
- Production: customer-facing, protected by approval; outside the current MVP hosting setup.

Keep secrets and data separate. Never copy production customer data into local or CI environments.

## MVP hosting selection

The selected initial topology is:

| Component | MVP selection | Reason and constraint |
|---|---|---|
| Web | Cloudflare Workers using a supported Next.js adapter | Free-tier entry point; validate Next.js 16.4.2 compatibility, runtime APIs and CPU limits before relying on SSR |
| API | Render free web service | Simple NestJS container/service hosting; sleeps after inactivity and has cold starts |
| PostgreSQL | Neon free plan | Managed PostgreSQL; free-tier compute/storage/network limits apply |
| Source and CI | GitHub + GitHub Actions | Existing repository workflow; usage allowances depend on repository visibility and account plan |

This is a free-tier managed-services selection, not an all-open-source hosting stack. The application, database engine and test tooling remain based on open-source technologies. Free-tier quotas and provider terms can change; verify them before launch.

Do not use Render's free PostgreSQL for durable MVP data because its free database has a limited lifetime. Neon is the selected managed PostgreSQL service. Do not assume Cloudflare Workers will run the existing Next.js app unchanged: the adapter, Node compatibility, middleware and CPU budget must be tested against the actual app.

See [ADR-0001 — Free-tier MVP hosting](../01-architecture/decisions/0001-free-tier-mvp-hosting.md) for rationale, limitations and migration path.

## Pull request quality gates

1. Install dependencies from lockfile.
2. Prettier check and ESLint.
3. TypeScript checks.
4. Unit tests and coverage thresholds.
5. PostgreSQL-backed integration tests for affected modules.
6. OpenAPI generation and validation.
7. Web/API production builds.
8. Dependency and secret scanning.
9. Container build and scan when relevant.
10. Playwright smoke/E2E tests for changed critical journeys.

A failed required check blocks merge. CI must use least-privilege permissions and non-production-only secrets.

## GitHub Actions layout

```
.github/
  workflows/
    ci.yml
    security-scan.yml
    deploy-staging.yml
  pull_request_template.md
```

Avoid duplicated workflow logic; use reusable workflows/composite actions where useful. Pin third-party Actions to reviewed versions or commit SHAs before production use.

## Staging deployment

Staging deployment is gated on provisioning the selected providers and configuring a protected GitHub Environment. Required secrets must be documented by name only and configured by the repository owner; never commit their values.

Build immutable artifacts; apply backward-compatible migrations; deploy API and web; run health checks and smoke tests; verify tenant/auth/runtime journeys; retain previous application artifacts for rollback. Do not claim staging is deployed until the workflow has been run against a provisioned environment.

## Production deployment

Production deployment is not enabled by this MVP phase. When introduced, require an approved release and environment approval. Confirm backups and migration readiness. Apply safe migrations, deploy immutable artifacts, run smoke tests and monitor. Roll back application artifacts if health checks fail; database rollback requires a separately reviewed migration strategy. Prefer expand-and-contract migrations.

## Supply-chain controls

- Dependabot updates.
- GitHub secret scanning/push protection where available.
- Dependency audit with documented severity triage.
- Trivy or equivalent container scanning when a deployable container exists.
- Least-privilege Actions permissions.
- Pin third-party Actions to reviewed versions or commit SHAs.
- Store deployment secrets in protected environments or cloud secret manager.
- Never print secrets in logs.
- SonarCloud/SonarQube is optional pending value/maintenance assessment.

## Production readiness

Health/readiness endpoints; correlation IDs and safe logs; metrics/error tracking; tested backups/restoration; migration plan; rate/query limits; security review; incident ownership and runbooks.

## Related documents

- [Testing strategy](testing-strategy.md)
- [Versioning strategy](../07-project-management/versioning-strategy.md)
- [Security](../01-architecture/security-and-tenant-isolation.md)
- [Hosting decision](../01-architecture/decisions/0001-free-tier-mvp-hosting.md)

## Change history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial deployment and CI/CD strategy |
| 0.2 | 2026-11-13 | Recorded MVP hosting selection and staging/production boundaries |
