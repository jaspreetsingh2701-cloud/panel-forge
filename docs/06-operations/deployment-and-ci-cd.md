---
title: PanelForge deployment and CI/CD
status: Proposed
version: 0.1
last_updated: 2026-11-10
source_of_truth: true
---

# PanelForge deployment and CI/CD

## Environments
- Local: pnpm workspace and Docker Compose dependencies.
- CI: isolated test/build environment.
- Staging: integrated acceptance and smoke tests.
- Production: customer-facing, protected by approval.

Keep secrets and data separate. Never copy production customer data into local or CI environments.

## Pull request quality gates
1. Install dependencies from lockfile.
2. Prettier check and ESLint.
3. TypeScript checks.
4. Markdown lint and link validation.
5. Unit tests and coverage thresholds.
6. PostgreSQL-backed integration tests for affected modules.
7. OpenAPI generation and validation.
8. Web/API production builds.
9. Dependency and secret scanning.
10. Container build and scan when relevant.

A failed required check blocks merge.

## GitHub Actions layout
```
.github/
  workflows/
    ci.yml
    deploy-staging.yml
    deploy-production.yml
    security-scan.yml
  pull_request_template.md
```
Avoid duplicated workflow logic; use reusable workflows/composite actions where useful.

## Branching and release
Use short-lived feature branches and PRs. Protect main with required checks and review. For a solo MVP, main plus short-lived feature branches is sufficient; a long-lived develop branch is optional only if it solves a real coordination problem.

## Staging deployment
Build immutable artifacts; apply backward-compatible migrations; deploy web/API; run health checks and smoke tests; verify tenant/auth/runtime journeys; retain previous artifacts for rollback.

## Production deployment
Require approved release and environment approval. Confirm backups and migration readiness. Apply safe migrations, deploy immutable artifacts, run smoke tests and monitor. Roll back application artifacts if health checks fail; database rollback requires a separately reviewed migration strategy. Prefer expand-and-contract migrations.

## Supply-chain controls
- Dependabot updates.
- GitHub secret scanning/push protection where available.
- Dependency audit.
- Trivy or equivalent container scanning.
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

## Change history
| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial deployment and CI/CD strategy |
