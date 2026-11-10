---
title: PanelForge Phase 0 architecture baseline
status: Proposed
version: 0.1
last_updated: 2026-11-10
owner: Project maintainers
source_of_truth: true
related_adrs: []
---

# PanelForge Phase 0 architecture baseline

## 1. Purpose

This document tracks the architecture and documentation baseline required before implementation begins. The repository is the source of truth; conversation history is not a substitute for committed project decisions.

## 2. Current progress

| Work item | Status | Artifact |
|---|---|---|
| Repository and documentation foundation | Complete | Root README and documentation conventions |
| Product definition | Approved | [Product definition](../00-product/product-definition.md) |
| MVP scope | Approved | [MVP scope](../00-product/mvp-scope.md) |
| Technology stack | Proposed | [Technology stack](../01-architecture/technology-stack.md) |
| System architecture | Proposed | [System architecture](../01-architecture/system-architecture.md) |
| Engine contracts | Proposed | [Engine contracts](../01-architecture/engine-contracts.md) |
| Logical data model and storage | Proposed | [Data model and storage](../02-database/data-model-and-storage.md) |
| Security and tenant isolation | Proposed | [Security and tenant isolation](../01-architecture/security-and-tenant-isolation.md) |
| Detailed ERD and constraints | Pending | To be produced after logical model review |
| ADRs for material architecture decisions | Pending | To be created when decisions are accepted |
| API conventions and initial OpenAPI plan | Pending | Before API implementation |
| Testing and CI/CD baseline | Pending | Before implementation gates |
| Roadmap, backlog and change log | Pending | To be completed in Phase 0 |

## 3. Architecture decisions proposed so far

- Start with a modular monolith.
- Use one Next.js web application for builder, preview and published runtime routes.
- Use one NestJS API application.
- Use PostgreSQL for platform metadata and managed records.
- Use relational columns for stable platform entities and JSONB for validated dynamic record values/configuration.
- Use a curated component registry; never execute arbitrary customer JavaScript.
- Enforce tenant isolation and permissions in backend code.
- Store published application configuration as immutable snapshots.
- Defer a separate worker and runtime deployment until operational needs justify them.
- Use an OIDC-compatible identity provider; provider selection remains open.

These remain proposed until reviewed and accepted through the project's decision process.

## 4. Decisions still open

| Decision | Current direction | Required before |
|---|---|---|
| Identity provider | OIDC provider; evaluate AWS Cognito and alternatives | Authentication implementation |
| AWS hosting topology | Web, API, PostgreSQL and supporting services | Infrastructure implementation |
| Secrets manager | Managed secrets service or equivalent | Connector credential implementation |
| PostgreSQL RLS | Defence-in-depth option | Database security finalisation |
| Role precedence/inheritance | Explicit policy model required | RBAC implementation |
| Query filter grammar and limits | Typed allowlisted filter AST | Query engine implementation |
| Snapshot format and compatibility | Versioned immutable configuration | Publishing implementation |

## 5. Phase 0 exit criteria

- [ ] Product definition and MVP scope are approved.
- [ ] Technology stack and system architecture are approved.
- [ ] Core engine responsibilities and contracts are reviewed.
- [ ] Logical data model and ERD are reviewed.
- [ ] Tenant isolation and RBAC invariants are documented.
- [ ] API conventions and initial endpoint boundaries are documented.
- [ ] Testing strategy and CI/CD quality gates are documented.
- [ ] ADRs exist for accepted material architectural decisions.
- [ ] Roadmap and initial implementation backlog are actionable.
- [ ] Cross-document links and terminology are consistent.
- [ ] No unresolved decision blocks the first implementation milestone.

## 6. Change control

When an architecture decision changes:
1. Identify the affected documents, code and tests.
2. Create a new ADR for a material decision change.
3. Mark the previous ADR as superseded; preserve its history.
4. Update authoritative documents in the same pull request.
5. Update this tracker and the documentation change log.
6. Verify internal links and examples.

Do not rewrite history to make an old decision appear as though it never existed.

## 7. Related documents

- [Product definition](../00-product/product-definition.md)
- [MVP scope](../00-product/mvp-scope.md)
- [Technology stack](../01-architecture/technology-stack.md)
- [System architecture](../01-architecture/system-architecture.md)
- [Engine contracts](../01-architecture/engine-contracts.md)
- [Data model and storage](../02-database/data-model-and-storage.md)
- [Security and tenant isolation](../01-architecture/security-and-tenant-isolation.md)

---

## Change history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-10 | Initial Phase 0 architecture baseline tracker |
