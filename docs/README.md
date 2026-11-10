# PanelForge documentation

This directory is the source of truth for PanelForge product requirements, architecture, data design, engineering practices and project progress.

## Documentation map

| Section | Purpose | Planned documents |
|---|---|---|
| `00-product/` | Product definition and boundaries | Product requirements, MVP scope, glossary |
| `01-architecture/` | System-level technical design | System architecture, technology stack, multi-tenancy, security |
| `02-database/` | Persistence and schema design | Database design, ERD, metadata schema, migrations |
| `03-engines/` | Core platform engines | Metadata, rendering, query, component registry, data-source engine |
| `04-features/` | User-facing platform capabilities | Visual builder, forms, tables, RBAC, page builder, workflows |
| `05-api/` | PanelForge API contracts | API conventions and generated API reference |
| `06-operations/` | Quality and production operations | Testing, deployment, monitoring, backup and recovery |
| `07-project-management/` | Delivery and change tracking | Roadmap, progress, backlog, known issues, documentation change log |
| `adr/` | Architecture decisions | Numbered Architecture Decision Records |

Documents will be added as the relevant design decisions are reviewed. We will not create empty documents simply to fill the folder structure.

## Source-of-truth rules

1. This repository, not chat history, is the canonical project record.
2. A document must identify whether it is a proposal, approved decision, or superseded record.
3. Architecture changes that materially affect the system must have an ADR.
4. Update affected documentation in the same pull request as the related code or decision.
5. Do not silently rewrite historical decisions. Supersede them with a new ADR.
6. When two documents disagree, resolve the conflict and record the correction; do not leave competing definitions in place.

## Suggested reading order

1. Product requirements and MVP scope.
2. System architecture and technology stack.
3. Multi-tenancy and security architecture.
4. Database and metadata schema.
5. Core engines and feature specifications.
6. API and operations documentation.
7. Roadmap and progress tracker.

## Status definitions

- **Proposed:** under discussion; not yet approved.
- **Approved:** reviewed and accepted as the current direction.
- **Implemented:** reflected in code and verified.
- **Superseded:** replaced by a later decision or document.
