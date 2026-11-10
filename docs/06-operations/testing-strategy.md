---
title: PanelForge testing strategy
status: Proposed
version: 0.1
last_updated: 2026-11-10
source_of_truth: true
---

# PanelForge testing strategy

## Principles
Testing is part of feature delivery. A feature is not complete until implementation, meaningful tests, documentation and CI checks are complete. Prioritise observable behaviour, tenant isolation, authorisation and data integrity over coverage percentages alone.

## Test layers
| Layer | Tool | Purpose |
|---|---|---|
| Static | TypeScript, ESLint, Prettier | Type correctness and style |
| Unit | Jest | Domain rules, validators, policies |
| API integration | Jest, Nest testing utilities, PostgreSQL | Modules, repositories, transactions |
| Component | React Testing Library | User-observable component behaviour |
| E2E | Playwright | Critical browser journeys |
| Contract | OpenAPI validation, adapter contract tests | API and connector compatibility |
| Security | Negative tests, dependency/container scans | Tenant, permission and supply-chain risks |

Use a real PostgreSQL service for tests relying on database semantics. Use deterministic fixtures and at least two tenants in security tests.

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

## Pull request gates
Formatting/lint, typecheck, unit tests, coverage, relevant integration tests, OpenAPI validation, production builds, documentation checks and applicable security scans must pass. Changes to tenancy, RBAC, query execution, publishing or secrets require explicit negative/security tests.

## Definition of test completion
Each feature PR records changed behaviours, tests added, security cases considered, affected E2E journeys and known untested risks.

## Related documents
- [API conventions](../05-api/api-conventions.md)
- [Security](../01-architecture/security-and-tenant-isolation.md)
- [Deployment and CI/CD](deployment-and-ci-cd.md)

## Change history
| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial testing strategy |
