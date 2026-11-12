---
title: PanelForge product implementation batches
status: Active
version: 1.0
last_updated: 2026-11-13
source_of_truth: true
---

# PanelForge product implementation batches

## Delivery rule

Every product pull request delivers a coherent, reviewable vertical slice and includes a visible UI improvement or user workflow. Backend-only work is grouped with the UI that demonstrates it. Keep PRs small enough to review and test. Do not deploy until the product MVP is complete.

## Phase 3 — Workspace and application foundation

| Batch | Pull request scope | Visible outcome |
|---|---|---|
| 3.1 | Applications workspace UI and creation flow | Application library, empty state, create dialog and draft cards |
| 3.2 | Persist applications in PostgreSQL; tenant-scoped API | Included in consolidated Phase 3–4 delivery PR |
| 3.3 | Workspace member management and invitations foundation | Members screen, invitation management and revocation |
| 3.4 | Platform RBAC and policy primitives | Owner-managed workspace roles; server-side manager/owner policies |

## Phase 4 — Custom data model and data engine

| Batch | Pull request scope | Visible outcome |
|---|---|---|
| 4.1 | Resource management | Application-scoped resources list and create-resource flow |
| 4.2 | Custom field schema and field types | Field editor for text, number, date, boolean, select and relation |
| 4.3 | Schema validation and metadata APIs | Server-side field validation and resource field metadata |
| 4.4 | Dynamic records CRUD | JSONB-backed records table and create/edit/delete forms |
| 4.5 | Filters, sorting, pagination and relationships | Search, sorting, pagination and validated relation fields |

## Phase 5 — Visual application builder

| Batch | Pull request scope | Visible outcome |
|---|---|---|
| 5.1 | Builder shell and component registry | Builder route, component palette, canvas and properties panel |
| 5.2 | Drag/drop layout and responsive canvas | Move, resize and arrange registered components |
| 5.3 | Form and table components | Configure forms and tables against resources |
| 5.4 | Charts, metrics and dashboard components | Build dashboard layouts with KPI and chart components |
| 5.5 | Draft configuration persistence | Save and reload builder drafts |

## Phase 6 — Runtime and data binding

| Batch | Pull request scope | Visible outcome |
|---|---|---|
| 6.1 | Published app renderer | Render configured pages and navigation |
| 6.2 | Data binding and query configuration | Bind tables/forms/metrics to authorised resources |
| 6.3 | Actions, validation and feedback | Submit forms, trigger safe actions and show result states |
| 6.4 | Search, filters and user experience polish | Complete operational workflows |

## Phase 7 — Permissions and publishing

| Batch | Pull request scope | Visible outcome |
|---|---|---|
| 7.1 | Application roles and permissions | Custom roles with app/page/resource/action permissions |
| 7.2 | Field and record-level access | Permission-aware forms, tables and record scopes |
| 7.3 | Publish immutable snapshots | Publish confirmation and version history |
| 7.4 | Rollback and audit trail | Restore a prior version and inspect audit events |

## Phase 8 — MVP hardening (before deployment)

| Batch | Pull request scope | Visible outcome |
|---|---|---|
| 8.1 | Security and tenant-isolation E2E | Workspace and application access boundaries verified |
| 8.2 | Accessibility, empty/error/loading states | Accessible and resilient user experience |
| 8.3 | Performance and observability | Operational health and runtime diagnostics |
| 8.4 | Production readiness | Backups, restore test, release/rollback runbook and deployment |

## Definition of done for every batch

- A user-visible improvement is included in the PR.
- Backend and UI are wired together where the workflow depends on persisted data.
- Tenant ownership and permission checks are enforced server-side.
- Unit/integration/E2E tests cover changed behaviour and negative paths.
- Typecheck, lint, tests and build pass in CI.
- Documentation and progress status are updated.
- No deployment is performed before Phase 8.4.


## Phase 3–4 MVP implementation notes

- Workspace invitations are persisted with a seven-day expiry and can be revoked. Outbound email delivery and acceptance-token onboarding are not configured in this delivery.
- Workspace role policy uses the existing OWNER, ADMIN and MEMBER roles. Only the owner can grant administrator privileges or change member roles; owners/admins manage invitations and the data model.
- Dynamic records are stored in PostgreSQL JSONB and validated against typed resource fields. Relationship fields point to records in another resource within the same application.
- The first records query implementation scans at most the 500 most recently updated records, then applies search/filter/sort/pagination. This is an explicit MVP ceiling; database-native JSONB querying and scalable cursor pagination remain hardening work before production-scale use.
- File upload fields, external data-source adapters, custom role definitions, invitation acceptance and email delivery are not part of Phase 3–4.
