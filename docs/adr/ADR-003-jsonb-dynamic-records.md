---
title: JSONB for managed dynamic record attributes
status: Proposed
date: 2026-11-10
---

# ADR-003: JSONB for managed dynamic record attributes

## Context
Customers define resources and fields at runtime. Physical columns/tables for every user field would require frequent migrations and complicate customisation.

## Proposed decision
Store managed records in a shared tenant-scoped table with relational identity/scope columns and a JSONB payload. Keep field definitions and validation in relational metadata. Validate every write/query against metadata and add targeted indexes based on measured access patterns.

## Alternatives
- Physical table per resource: relational typing but high schema-management overhead.
- EAV: flexible but query-heavy and join-intensive.
- Entire platform model in JSON: unsuitable for core identity/relationships.

## Consequences
Flexible custom fields without per-field migrations; dynamic type enforcement, query performance and field lifecycle require explicit application logic.

## Status
Proposed pending query/data-model review.

## References
- [Data model and storage](../02-database/data-model-and-storage.md)
