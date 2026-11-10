---
title: PanelForge Phase 0 architecture baseline
status: Active
version: 0.2
last_updated: 2026-11-10
source_of_truth: true
---

# PanelForge Phase 0 architecture baseline

## Purpose
Track the complete documentation baseline required before implementation. The repository is canonical; conversation history is not a substitute for committed project decisions.

## Deliverable status

| Work item | Status | Artifact |
|---|---|---|
| Repository and documentation conventions | Complete | [Documentation index](../README.md) |
| Product definition | Approved | [Product definition](../00-product/product-definition.md) |
| MVP scope | Approved | [MVP scope](../00-product/mvp-scope.md) |
| Technology stack | Proposed | [Technology stack](../01-architecture/technology-stack.md) |
| System architecture | Proposed | [System architecture](../01-architecture/system-architecture.md) |
| Engine contracts | Proposed | [Engine contracts](../01-architecture/engine-contracts.md) |
| Data model and storage | Proposed | [Data model](../02-database/data-model-and-storage.md) |
| Logical ERD | Proposed | [ERD](../02-database/erd.md) |
| Security and tenant isolation | Proposed | [Security](../01-architecture/security-and-tenant-isolation.md) |
| API conventions | Proposed | [API conventions](../05-api/api-conventions.md) |
| Testing strategy | Proposed | [Testing](../06-operations/testing-strategy.md) |
| CI/CD and deployment | Proposed | [Deployment](../06-operations/deployment-and-ci-cd.md) |
| Versioning strategy | Proposed | [Versioning](versioning-strategy.md) |
| ADRs | Proposed | [ADR index](../adr/README.md) |
| Roadmap and backlog | Proposed | [Roadmap](roadmap.md), [backlog](backlog.md) |
| Progress and change log | Active | [Progress](progress.md), [change log](documentation-change-log.md) |

## Proposed architecture baseline
- Modular monolith.
- One Next.js web app for builder, preview and published runtime routes.
- One NestJS API app with domain-oriented modules.
- PostgreSQL for platform data and managed records; Prisma as proposed ORM/migration tool.
- Relational columns for stable platform entities; JSONB for validated dynamic values/configuration.
- Curated typed component registry; no arbitrary customer JavaScript or SQL.
- Backend-enforced tenant isolation, resource/action/field/record permissions.
- Immutable published configuration snapshots with atomic activation and rollback.
- OIDC-compatible identity provider; exact provider and token/session topology remain open.
- Worker process, Redis and separate runtime deployment deferred until justified.

## Decisions still requiring explicit approval

| Decision | Current proposal | Resolve before |
|---|---|---|
| Identity provider and browser/API token flow | Managed OIDC provider; evaluate Cognito and alternatives | Authentication implementation |
| Hosting topology | Containerised web/API, managed PostgreSQL on AWS or suitable platform | Infrastructure deployment |
| Secrets manager | Managed secret store; credentials referenced, never embedded | Connector implementation |
| PostgreSQL RLS | Evaluate as defence in depth | Database security finalisation |
| Role precedence/inheritance | Explicit deny-by-default policy; final precedence documented | RBAC implementation |
| Query grammar and limits | Typed allowlisted filter AST; bounded page/query complexity | Query engine implementation |
| Snapshot compatibility | Versioned immutable config; safe readers/migrations | Publishing implementation |

## Phase 0 exit criteria
- [ ] Review and approve technology stack and system architecture.
- [ ] Choose identity provider and document browser-to-API authentication flow.
- [ ] Review ERD, composite constraints and tenant ownership.
- [ ] Finalise role assignment and permission precedence rules.
- [ ] Review API conventions and first endpoint set.
- [ ] Approve testing, coverage and CI/CD quality gates.
- [ ] Accept ADRs for material decisions.
- [ ] Validate internal links, terminology and document statuses.
- [ ] Confirm no unresolved decision blocks Phase 1.

## Change control
For material changes, identify affected docs/code/tests, create a new ADR, supersede old ADRs rather than rewriting history, update authoritative docs in the same PR, update the change log and validate links.

## Related documents
- [Product definition](../00-product/product-definition.md)
- [MVP scope](../00-product/mvp-scope.md)
- [Technology stack](../01-architecture/technology-stack.md)
- [System architecture](../01-architecture/system-architecture.md)
- [Engine contracts](../01-architecture/engine-contracts.md)
- [Data model](../02-database/data-model-and-storage.md)
- [ERD](../02-database/erd.md)
- [Security](../01-architecture/security-and-tenant-isolation.md)
- [API conventions](../05-api/api-conventions.md)
- [Testing](../06-operations/testing-strategy.md)
- [CI/CD](../06-operations/deployment-and-ci-cd.md)
