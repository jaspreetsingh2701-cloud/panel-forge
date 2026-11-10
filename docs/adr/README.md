# Architecture Decision Records (ADRs)

ADRs capture material technical decisions, context, alternatives, consequences and lifecycle status.

## When to create an ADR
Create one for decisions that materially affect architecture, technology, data/tenancy, authentication/security, metadata/rendering/query execution, API compatibility, publishing/versioning or operations.

## Naming
Use sequential, never-reused numbers:
`ADR-001-short-decision-title.md`.

## Lifecycle
1. Draft from [ADR-TEMPLATE.md](ADR-TEMPLATE.md).
2. Review context, alternatives and consequences.
3. Mark Accepted only after explicit review.
4. Link accepted ADRs from affected authoritative documents.
5. If replaced, mark the prior ADR Superseded and link its replacement.
6. Do not delete or silently rewrite accepted ADRs.

## Current decision records

| ADR | Subject | Status |
|---|---|---|
| [ADR-001](ADR-001-modular-monolith.md) | Modular monolith | Proposed |
| [ADR-002](ADR-002-postgresql.md) | PostgreSQL as primary database | Proposed |
| [ADR-003](ADR-003-jsonb-dynamic-records.md) | JSONB for dynamic records | Proposed |
| [ADR-004](ADR-004-component-registry.md) | Curated component registry | Proposed |
| [ADR-005](ADR-005-immutable-publishing.md) | Immutable published snapshots | Proposed |
| [ADR-006](ADR-006-backend-authorisation.md) | Backend permission enforcement | Proposed |

These ADRs document the current recommendations. They are not accepted decisions until reviewed and approved.
