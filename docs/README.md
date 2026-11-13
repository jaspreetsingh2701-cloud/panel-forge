# PanelForge documentation

This directory is the canonical source of truth for product, architecture, data, API, engineering quality and delivery decisions.

## Documentation map

| Section | Purpose | Key documents |
|---|---|---|
| `00-product/` | Product direction and scope | Product definition, MVP scope |
| `01-architecture/` | System design and security | Technology stack, system architecture, engine contracts, [authorization and role model](01-architecture/authorization-and-role-model.md), security and tenant isolation |
| `02-database/` | Persistence and data integrity | Data model and storage, logical ERD |
| `03-engines/` | Detailed engine specifications | To be added with implementation design |
| `04-features/` | User-facing feature specifications and reusable help | [Visual builder](04-features/visual-builder.md), [Builder help and tutorials](04-features/builder-help.md) |
| `05-api/` | API contract conventions | API conventions |
| `06-operations/` | Quality and production operations | Testing strategy, deployment and CI/CD |
| `07-project-management/` | Delivery and change tracking | Phase 0 baseline, roadmap, backlog, progress, documentation change log, versioning |
| `adr/` | Architecture decisions | ADR-001 through ADR-006 and template |

## Suggested reading order
1. [Product definition](00-product/product-definition.md) and [MVP scope](00-product/mvp-scope.md).
2. [Technology stack](01-architecture/technology-stack.md) and [system architecture](01-architecture/system-architecture.md).
3. [Engine contracts](01-architecture/engine-contracts.md) and [security model](01-architecture/security-and-tenant-isolation.md).
4. [Data model](02-database/data-model-and-storage.md) and [logical ERD](02-database/erd.md).
5. [API conventions](05-api/api-conventions.md).
6. [Testing](06-operations/testing-strategy.md), [CI/CD](06-operations/deployment-and-ci-cd.md) and [versioning](07-project-management/versioning-strategy.md).
7. [Roadmap](07-project-management/roadmap.md), [backlog](07-project-management/backlog.md) and [progress](07-project-management/progress.md).

## Source-of-truth and change rules
1. This repository, not chat history, is the canonical project record.
2. Every authoritative document states whether it is Proposed, Approved, Implemented or Superseded.
3. Material architectural changes require a numbered ADR.
4. Update impacted documentation in the same pull request as the related code/decision.
5. Never erase accepted decision history; supersede it with a new ADR.
6. Resolve contradictions rather than allowing competing definitions to persist.

## Status definitions
- **Proposed:** documented for review; not yet accepted.
- **Approved:** reviewed and accepted as current direction.
- **Implemented:** reflected in code and verified.
- **Superseded:** replaced by a later decision or document.
