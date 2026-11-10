---
title: PostgreSQL as primary managed database
status: Proposed
date: 2026-11-10
---

# ADR-002: PostgreSQL as the primary managed database

## Context

PanelForge needs relational integrity for tenants, memberships, applications, metadata and permissions, alongside flexible user-defined record attributes.

## Proposed decision

Use PostgreSQL as the primary platform database. Use relational tables/constraints for stable platform concepts and JSONB for validated dynamic attributes/configuration where appropriate.

Use Prisma ORM for schema modelling, type-safe access and migrations. The initial implementation targets Prisma ORM 7.10.1 with the `prisma-client` generator and PostgreSQL's `pg` driver through `@prisma/adapter-pg`. Keep Prisma CLI and client packages on major version 7; do not adopt Prisma 8 release candidates for this foundation.

Use PostgreSQL 17 for local development through Docker Compose. Production hosting remains a separate decision.

## Alternatives

- MongoDB: flexible documents, but relational constraints and joins are central.
- MySQL: viable, but PostgreSQL JSONB fits the proposed model.
- Database per tenant: defer due to provisioning/operational overhead.
- Prisma ORM 8 release candidate: not selected while the release line is pre-GA and subject to breaking changes.

## Consequences

Strong integrity, transactions and JSONB flexibility; JSONB indexing and shared-database tenant isolation require care. Prisma 7 requires an explicit generated-client output path and a PostgreSQL driver adapter in the API.

## Status

Proposed pending data-model review and local migration validation.

## References

- [Data model](../02-database/data-model-and-storage.md)
- [ERD](../02-database/erd.md)
- [Technology stack](../01-architecture/technology-stack.md)
