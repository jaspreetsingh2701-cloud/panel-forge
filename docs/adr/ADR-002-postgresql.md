---
title: PostgreSQL as primary managed database
status: Proposed
date: 2026-11-10
---

# ADR-002: PostgreSQL as the primary managed database

## Context
PanelForge needs relational integrity for tenants, memberships, applications, metadata and permissions, alongside flexible user-defined record attributes.

## Proposed decision
Use PostgreSQL as the primary platform database. Use relational tables/constraints for stable platform concepts and JSONB for validated dynamic attributes/configuration where appropriate. Use Prisma for schema and migrations, subject to implementation validation.

## Alternatives
- MongoDB: flexible documents, but relational constraints and joins are central.
- MySQL: viable, but PostgreSQL JSONB fits the proposed model.
- Database per tenant: defer due to provisioning/operational overhead.

## Consequences
Strong integrity, transactions and JSONB flexibility; JSONB indexing and shared-database tenant isolation require care.

## Status
Proposed pending data-model review.

## References
- [Data model](../02-database/data-model-and-storage.md)
- [ERD](../02-database/erd.md)
