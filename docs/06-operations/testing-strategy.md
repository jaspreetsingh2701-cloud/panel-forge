---
title: PanelForge testing strategy
status: Active
version: 0.2
last_updated: 2026-11-13
source_of_truth: true
---

# PanelForge testing strategy

## Principles

Testing is part of feature delivery. A feature is not complete until implementation, meaningful tests, documentation and CI checks are complete. Prioritise observable behaviour, tenant isolation, authorisation and data integrity over coverage percentages alone.

## Test layers

| Layer | Tool | Purpose |
|---|---|---|
| Static | TypeScript, ESLint, Prettier | Type correctness and style |
| Unit | Jest | Domain rules, validators, policies and service behaviour |
| API integration | Jest, Nest testing utilities, PostgreSQL | Modules, repositories, transactions and database constraints |
| Component | Jest, React Testing Library, jsdom | User-observable component behaviour |
| E2E | Playwright | Critical browser journeys |
| Contract | Nest Swagger/OpenAPI and validation | API contract generation and drift detection |
| Security | Negative tests, dependency/secret/container scans | Tenant, permission and supply-chain risks |

Use a real PostgreSQL service for tests relying on database semantics. Use deterministic fixtures and at least two tenants in security tests when tenant-scoped application resources exist.

## Current test scope

Test only behaviour that exists. The current application has authentication/workspace foundations and a health endpoint; future resource, field, record, publishing and RBAC journeys must be added with their implementation rather than represented by placeholder tests.

For API unit tests, mock Prisma at the service boundary. For integration tests, use an isolated PostgreSQL database and the checked-in Prisma migrations. Never describe mocked Prisma tests as database integration tests.

## Required MVP journeys

1. Create organisation and application.
2. Verify tenant membership and workspace access.
3. Reject cross-tenant application and record access, including guessed UUIDs.
4. Define resources/fields and create records through dynamic forms.
5. Filter, sort and paginate a table.
6. Configure Admin, Manager and Viewer.
7. Reject Viewer mutations even through direct API calls.
8. Enforce field and record restrictions server-side.
9. Publish valid configuration and load it as another authorised user.
10. Apply permission revocation without republishing.
11. Reject invalid configuration without changing active snapshot.
12. Roll back to an earlier immutable snapshot.

These are product acceptance journeys, not claims that the current MVP already implements them.

## Security test matrix

| Area | Positive case | Negative case |
|---|---|---|
| Tenant | Member accesses own tenant | Cross-tenant ID substitution denied |
| Membership | Active member enters | Suspended/removed member denied |
| Actions | Granted action succeeds | Ungranted action denied |
| Fields | Permitted fields returned | Restricted read/write rejected |
| Records | In-scope rows returned | Out-of-scope rows never returned |
| Queries | Valid typed filter works | Unknown fields/operators and injection rejected |
| Publishing | Valid snapshot activates | Failed publish preserves active snapshot |
| Secrets | Server-side connector works | Secret absent from browser/logs |

## Coverage thresholds

Initial gates: statements 70%, branches 60%, functions 70%, lines 70%. Longer-term target: 85%, 80%, 85%, 85% respectively. Core tenant isolation, permission evaluation, query execution and publishing need stronger focused tests. Coverage is a signal, not proof of correctness. Do not lower thresholds simply to pass CI.

Coverage thresholds should be introduced alongside meaningful test suites. Avoid applying a global threshold to untouched generated files or configuration-only modules; document exclusions narrowly.

## Pull request gates

Formatting/lint, typecheck, unit tests, coverage, relevant PostgreSQL integration tests, OpenAPI validation, production builds, documentation checks and applicable security scans must pass. Changes to tenancy, RBAC, query execution, publishing or secrets require explicit negative/security tests.

## Local PostgreSQL integration tests

Use the repository's Docker Compose PostgreSQL service and a dedicated test database/schema. Apply Prisma migrations before running integration tests. Never point test commands at a developer's normal database or a production database. Test configuration must fail fast when the dedicated test database URL is absent.

## Definition of test completion

Each feature PR records changed behaviours, tests added, security cases considered, affected E2E journeys and known untested risks.

## Related documents

- [API conventions](../05-api/api-conventions.md)
- [Security](../01-architecture/security-and-tenant-isolation.md)
- [Deployment and CI/CD](deployment-and-ci-cd.md)
- [Phase 2.5 plan](phase-2-5-engineering-quality-plan.md)

## Change history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial testing strategy |
| 0.2 | 2026-11-13 | Clarified current test scope, PostgreSQL integration requirements and coverage policy |
