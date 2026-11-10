---
title: PanelForge initial implementation backlog
status: Proposed
version: 0.1
last_updated: 2026-11-10
source_of_truth: true
---

# PanelForge initial implementation backlog

## P0 — Foundation
| ID | Item | Acceptance criteria |
|---|---|---|
| PF-001 | pnpm/Turborepo workspace | Clean install and root tasks work |
| PF-002 | Next.js web skeleton | Local app starts with workspace shell |
| PF-003 | NestJS API skeleton | API starts and health endpoint responds |
| PF-004 | PostgreSQL and Prisma | Local DB starts and migration applies |
| PF-005 | Environment validation | Missing required config fails safely |
| PF-006 | OIDC integration | API validates user identity |
| PF-007 | Tenant membership | User can create/join a tenant |
| PF-008 | Tenant isolation | Cross-tenant tests deny access |
| PF-009 | Application management | Tenant member manages own applications |
| PF-010 | CI baseline | Lint, typecheck, tests and builds run on PR |

## P0 — Metadata and data
| ID | Item | Acceptance criteria |
|---|---|---|
| PF-011 | Resource metadata | Tenant app creates/updates resources |
| PF-012 | Field metadata | Supported types and validation persist |
| PF-013 | JSONB dynamic records | Data stored with tenant/app/resource scope |
| PF-014 | Dynamic CRUD | API validates schema and permissions |
| PF-015 | Typed query grammar | Safe filters, sorting and pagination |
| PF-016 | Permission foundation | Backend checks resource/action grants |

## P0 — Builder and publishing
| ID | Item | Acceptance criteria |
|---|---|---|
| PF-017 | Component registry | Only registered types can be configured |
| PF-018 | Builder canvas | Add/select/arrange/remove components |
| PF-019 | Form builder | Configure and preview dynamic form |
| PF-020 | Table builder | Configure and preview dynamic table |
| PF-021 | Draft save/load | Draft persists and reloads |
| PF-022 | Immutable snapshots | Validated snapshot activates atomically |
| PF-023 | Runtime renderer | Published app renders supported components |
| PF-024 | Runtime RBAC | Data/actions obey current backend policy |
| PF-025 | E2E demonstration | Second user accesses only permitted data |

## P1 — Enhancements
| ID | Item | Acceptance criteria |
|---|---|---|
| PF-026 | Relationships | Supported resource relationships validate |
| PF-027 | Field/record restrictions | Enforced server-side |
| PF-028 | REST connector | Secure connection and supported reads |
| PF-029 | KPI/charts | Dashboard aggregates are authorised |
| PF-030 | Audit events | Important admin/publish events recorded |
| PF-031 | Rollback | Earlier immutable snapshot can be activated |
| PF-032 | Observability | Errors, latency and service health visible |

## Definition of done
Acceptance criteria met; relevant unit/integration/E2E tests; tenant and permission implications tested; Swagger/docs/ADRs updated; CI passes; known limitations recorded.

## Related documents
- [MVP scope](../00-product/mvp-scope.md)
- [Roadmap](roadmap.md)
- [Testing strategy](../06-operations/testing-strategy.md)
